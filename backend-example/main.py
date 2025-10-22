"""
Backend de ejemplo para rIA usando FastAPI
Este es un ejemplo de cómo implementar el backend con Python y FastAPI
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import base64
from io import BytesIO
from PIL import Image
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="rIA Backend API", version="1.0.0")

# Configurar CORS para permitir peticiones desde Electron
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar el origen exacto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UpscaleRequest(BaseModel):
    image: str  # Base64 encoded image
    scale: int = 2
    model: str = "general"
    denoise_strength: int = 50
    upscale_type: str = "AI Enhanced"


class UpscaleResponse(BaseModel):
    success: bool
    image: Optional[str] = None  # Base64 encoded result
    message: str
    width: int
    height: int


@app.get("/")
async def root():
    """Endpoint de salud"""
    return {"status": "ok", "message": "rIA Backend API está funcionando"}


@app.get("/health")
async def health_check():
    """Verificar estado del servidor"""
    return {"status": "healthy", "version": "1.0.0"}


@app.post("/api/upscale", response_model=UpscaleResponse)
async def upscale_image(request: UpscaleRequest):
    """
    Endpoint principal para reescalar imágenes
    
    En producción, aquí se integraría un modelo de IA real como:
    - Real-ESRGAN
    - ESRGAN
    - SwinIR
    - etc.
    """
    try:
        logger.info(f"Recibida solicitud de upscale: scale={request.scale}, model={request.model}")
        
        # Decodificar la imagen base64
        if request.image.startswith('data:image'):
            # Remover el prefijo data:image/...;base64,
            image_data = request.image.split(',')[1]
        else:
            image_data = request.image
            
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        
        logger.info(f"Imagen recibida: {image.size}")
        
        # AQUÍ IRÍA LA LÓGICA DE IA REAL
        # Por ahora, simulamos con un resize simple
        # En producción, reemplazar con modelo de IA real
        
        new_width = image.width * request.scale
        new_height = image.height * request.scale
        
        # Ejemplo simple con Pillow (reemplazar con IA real)
        upscaled = image.resize((new_width, new_height), Image.LANCZOS)
        
        # Aplicar ajustes basados en denoise_strength
        # (esto es solo un ejemplo, el modelo de IA haría esto automáticamente)
        
        # Convertir resultado a base64
        buffered = BytesIO()
        upscaled.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        logger.info(f"Upscale completado: {upscaled.size}")
        
        return UpscaleResponse(
            success=True,
            image=f"data:image/png;base64,{img_str}",
            message="Imagen reescalada exitosamente",
            width=new_width,
            height=new_height
        )
        
    except Exception as e:
        logger.error(f"Error en upscale: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/models")
async def get_available_models():
    """Retorna los modelos de IA disponibles"""
    return {
        "models": [
            {
                "id": "general",
                "name": "General Purpose",
                "description": "Modelo general para todo tipo de imágenes"
            },
            {
                "id": "photo",
                "name": "Fotografía",
                "description": "Optimizado para fotografías realistas"
            },
            {
                "id": "anime",
                "name": "Anime & Arte",
                "description": "Especializado en ilustraciones y anime"
            },
            {
                "id": "face",
                "name": "Mejora de Rostros",
                "description": "Enfocado en mejorar rostros y detalles faciales"
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
