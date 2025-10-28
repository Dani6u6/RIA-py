"""
Backend de rIA usando FastAPI y Real-ESRGAN con Vulkan
API para reescalado de imágenes con IA
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import Optional
import base64
from io import BytesIO
from PIL import Image
import logging
from pathlib import Path
import uuid

from config import (
    API_HOST,
    API_PORT,
    API_RELOAD,
    TEMP_DIR,
    OUTPUT_DIR,
    SUPPORTED_FORMATS,
    MAX_IMAGE_SIZE
)
from upscale_service import get_upscale_service

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="rIA Backend API",
    version="1.0.0",
    description="API de reescalado de imágenes con Real-ESRGAN"
)

# Configurar CORS para permitir peticiones desde Electron
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar el origen exacto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UpscaleRequest(BaseModel):
    """Modelo de solicitud para upscale"""
    image: str = Field(..., description="Imagen en base64")
    scale: int = Field(2, ge=1, le=4, description="Factor de escala (1-4)")
    model: str = Field("general", description="Modelo a usar (general, anime, photo)")
    denoise_strength: int = Field(50, ge=0, le=100, description="Fuerza de denoise (0-100)")
    upscale_type: str = Field("AI Enhanced", description="Tipo de reescalado")
    tile_size: int = Field(0, ge=0, description="Tamaño de tile (0 para automático)")


class UpscaleResponse(BaseModel):
    """Modelo de respuesta para upscale"""
    success: bool
    image: Optional[str] = None
    message: str
    width: int
    height: int
    processing_time: Optional[float] = None


class ModelInfo(BaseModel):
    """Información de un modelo"""
    id: str
    name: str
    description: str
    scale: int


@app.on_event("startup")
async def startup_event():
    """Evento de inicio de la aplicación"""
    logger.info("Iniciando rIA Backend API...")
    
    try:
        # Inicializar servicio de upscale
        service = get_upscale_service()
        logger.info("Servicio de upscale inicializado correctamente")
        
        # Limpiar archivos temporales antiguos
        service.cleanup_temp_files(max_age_hours=24)
        logger.info("Archivos temporales limpiados")
        
    except Exception as e:
        logger.error(f"Error durante el inicio: {str(e)}")
        logger.warning("La API se iniciará pero puede no funcionar correctamente")


@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "status": "ok",
        "message": "rIA Backend API está funcionando",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Verificar estado del servidor"""
    try:
        service = get_upscale_service()
        models = service.get_available_models()
        
        return {
            "status": "healthy",
            "version": "1.0.0",
            "models_available": len(models),
            "models": [m["id"] for m in models]
        }
    except Exception as e:
        logger.error(f"Error en health check: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )


@app.get("/api/models", response_model=list[ModelInfo])
async def get_available_models():
    """Retorna los modelos de IA disponibles"""
    try:
        service = get_upscale_service()
        models = service.get_available_models()
        
        if not models:
            logger.warning("No hay modelos disponibles")
            return []
        
        return models
    except Exception as e:
        logger.error(f"Error obteniendo modelos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upscale", response_model=UpscaleResponse)
async def upscale_image(
    request: UpscaleRequest,
    background_tasks: BackgroundTasks
):
    """
    Endpoint principal para reescalar imágenes usando Real-ESRGAN
    """
    import time
    start_time = time.time()
    
    temp_input_path = None
    output_path = None
    
    try:
        logger.info(
            f"Recibida solicitud de upscale: "
            f"scale={request.scale}, model={request.model}"
        )
        
        # Decodificar la imagen base64
        if request.image.startswith('data:image'):
            # Remover el prefijo data:image/...;base64,
            image_data = request.image.split(',')[1]
        else:
            image_data = request.image
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        
        logger.info(f"Imagen recibida: {image.size}")
        
        # Validar tamaño de imagen
        if image.width > MAX_IMAGE_SIZE or image.height > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Imagen demasiado grande. Máximo: {MAX_IMAGE_SIZE}px por lado"
            )
        
        # Guardar imagen temporal
        temp_filename = f"{uuid.uuid4()}.png"
        temp_input_path = TEMP_DIR / temp_filename
        image.save(temp_input_path, "PNG")
        
        logger.info(f"Imagen guardada temporalmente en: {temp_input_path}")
        
        # Obtener servicio de upscale
        service = get_upscale_service()
        
        # Convertir denoise_strength de 0-100 a 0-1
        denoise = request.denoise_strength / 100.0
        
        # Procesar imagen con Real-ESRGAN
        output_path = service.upscale(
            input_path=temp_input_path,
            scale=request.scale,
            model=request.model,
            denoise_strength=denoise,
            tile_size=request.tile_size
        )
        
        logger.info(f"Upscale completado: {output_path}")
        
        # Leer imagen resultante
        with Image.open(output_path) as result_img:
            new_width, new_height = result_img.size
            
            # Convertir a base64
            buffered = BytesIO()
            result_img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
        
        processing_time = time.time() - start_time
        logger.info(f"Procesamiento completado en {processing_time:.2f}s")
        
        # Programar limpieza de archivos temporales
        background_tasks.add_task(cleanup_files, temp_input_path, output_path)
        
        return UpscaleResponse(
            success=True,
            image=f"data:image/png;base64,{img_str}",
            message="Imagen reescalada exitosamente",
            width=new_width,
            height=new_height,
            processing_time=processing_time
        )
        
    except HTTPException:
        # Re-lanzar HTTPExceptions
        raise
    except Exception as e:
        logger.error(f"Error en upscale: {str(e)}", exc_info=True)
        
        # Limpiar archivos en caso de error
        if temp_input_path and temp_input_path.exists():
            temp_input_path.unlink()
        if output_path and output_path.exists():
            output_path.unlink()
        
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upscale/file")
async def upscale_file(
    file: UploadFile = File(...),
    scale: int = 2,
    model: str = "general",
    denoise_strength: int = 50,
    background_tasks: BackgroundTasks = None
):
    """
    Endpoint alternativo que acepta archivos directamente
    """
    temp_input_path = None
    output_path = None
    
    try:
        # Validar formato
        file_ext = file.filename.split('.')[-1].lower()
        if file_ext not in SUPPORTED_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"Formato no soportado. Usa: {', '.join(SUPPORTED_FORMATS)}"
            )
        
        # Guardar archivo temporal
        temp_filename = f"{uuid.uuid4()}.{file_ext}"
        temp_input_path = TEMP_DIR / temp_filename
        
        with open(temp_input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"Archivo recibido: {file.filename}")
        
        # Obtener servicio y procesar
        service = get_upscale_service()
        denoise = denoise_strength / 100.0
        
        output_path = service.upscale(
            input_path=temp_input_path,
            scale=scale,
            model=model,
            denoise_strength=denoise
        )
        
        # Programar limpieza
        if background_tasks:
            background_tasks.add_task(cleanup_files, temp_input_path, output_path)
        
        # Retornar archivo
        return FileResponse(
            output_path,
            media_type="image/png",
            filename=f"upscaled_{file.filename}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en upscale: {str(e)}")
        
        # Limpiar archivos en caso de error
        if temp_input_path and temp_input_path.exists():
            temp_input_path.unlink()
        if output_path and output_path.exists():
            output_path.unlink()
        
        raise HTTPException(status_code=500, detail=str(e))


def cleanup_files(*file_paths: Path):
    """Limpia archivos temporales de forma asíncrona"""
    for file_path in file_paths:
        try:
            if file_path and file_path.exists():
                file_path.unlink()
                logger.debug(f"Archivo limpiado: {file_path}")
        except Exception as e:
            logger.warning(f"No se pudo eliminar {file_path}: {e}")


if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Iniciando servidor en {API_HOST}:{API_PORT}")
    uvicorn.run(
        "main:app",
        host=API_HOST,
        port=API_PORT,
        reload=API_RELOAD,
        log_level="info"
    )
