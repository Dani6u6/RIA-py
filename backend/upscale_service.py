"""
Servicio de reescalado usando Real-ESRGAN con Vulkan
Maneja el procesamiento de imágenes a través del binario de Real-ESRGAN
"""

import subprocess
import platform
import logging
from pathlib import Path
from typing import Optional, Tuple
import uuid
from PIL import Image

from config import (
    BINARIES_DIR,
    MODELS_DIR,
    TEMP_DIR,
    OUTPUT_DIR,
    MODELS,
    REALESRGAN_EXECUTABLE,
    PROCESSING_TIMEOUT,
    MAX_IMAGE_SIZE,
    VULKAN_DEVICE_ID
)

logger = logging.getLogger(__name__)


class RealESRGANService:
    """Servicio para procesar imágenes con Real-ESRGAN"""
    
    def __init__(self):
        self.system = self._detect_system()
        self.executable = self._get_executable_path()
        self._verify_setup()
    
    def _detect_system(self) -> str:
        """Detecta el sistema operativo"""
        system = platform.system().lower()
        if system == "windows":
            return "windows"
        elif system == "darwin":
            return "macos"
        else:
            return "linux"
    
    def _get_executable_path(self) -> Path:
        """Obtiene la ruta al ejecutable de Real-ESRGAN"""
        exe_name = REALESRGAN_EXECUTABLE[self.system]
        exe_path = BINARIES_DIR / exe_name
        return exe_path
    
    def _verify_setup(self):
        """Verifica que el ejecutable y modelos estén disponibles"""
        if not self.executable.exists():
            raise FileNotFoundError(
                f"Ejecutable de Real-ESRGAN no encontrado en: {self.executable}\n"
                f"Ejecuta setup.py para descargar el binario."
            )
        
        # Verificar que al menos un modelo esté disponible
        model_found = False
        for model_info in MODELS.values():
            model_path = MODELS_DIR / model_info["filename"]
            if model_path.exists():
                model_found = True
                break
        
        if not model_found:
            logger.warning(
                "No se encontraron modelos descargados. "
                "Ejecuta setup.py para descargar los modelos."
            )
    
    def _validate_image(self, image_path: Path) -> Tuple[int, int]:
        """
        Valida que la imagen sea procesable
        
        Returns:
            Tuple[int, int]: (width, height) de la imagen
        """
        try:
            with Image.open(image_path) as img:
                width, height = img.size
                
                if width > MAX_IMAGE_SIZE or height > MAX_IMAGE_SIZE:
                    raise ValueError(
                        f"Imagen demasiado grande: {width}x{height}. "
                        f"Máximo permitido: {MAX_IMAGE_SIZE}px por lado"
                    )
                
                return width, height
        except Exception as e:
            raise ValueError(f"Error al validar imagen: {str(e)}")
    
    def upscale(
        self,
        input_path: Path,
        scale: int = 2,
        model: str = "general",
        denoise_strength: float = 0.5,
        tile_size: int = 0,
        face_enhance: bool = False
    ) -> Path:
        """
        Reescala una imagen usando Real-ESRGAN
        
        Args:
            input_path: Ruta a la imagen de entrada
            scale: Factor de escala (2, 3, o 4)
            model: Modelo a usar ('general', 'anime', 'photo')
            denoise_strength: Fuerza de denoise (0.0 a 1.0, -1 para desactivar)
            tile_size: Tamaño de tile para procesamiento (0 para automático)
            face_enhance: Habilitar mejora de rostros (requiere GFPGAN)
        
        Returns:
            Path: Ruta al archivo de salida
        """
        try:
            # Validar imagen de entrada
            original_width, original_height = self._validate_image(input_path)
            logger.info(f"Procesando imagen: {original_width}x{original_height}")
            
            # Verificar que el modelo existe
            if model not in MODELS:
                raise ValueError(f"Modelo '{model}' no disponible")
            
            model_info = MODELS[model]
            model_name = model_info["name"]
            
            # Generar nombre único para el archivo de salida
            output_filename = f"{uuid.uuid4()}.png"
            output_path = OUTPUT_DIR / output_filename
            
            # Construir comando para Real-ESRGAN
            cmd = [
                str(self.executable),
                "-i", str(input_path),
                "-o", str(output_path),
                "-n", model_name,
                "-s", str(scale),
                "-g", str(VULKAN_DEVICE_ID),  # GPU ID
                "-f", "png"  # Formato de salida
            ]
            
            # Añadir parámetros opcionales
            if tile_size > 0:
                cmd.extend(["-t", str(tile_size)])
            
            # Denoise strength (solo para algunos modelos)
            if denoise_strength >= 0 and model == "general":
                # Convertir de 0-1 a -1-1 como espera Real-ESRGAN
                dn_value = denoise_strength * 2 - 1
                cmd.extend(["-d", str(int(dn_value))])
            
            logger.info(f"Ejecutando comando: {' '.join(cmd)}")
            
            # Ejecutar Real-ESRGAN
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=PROCESSING_TIMEOUT,
                check=False
            )
            
            # Verificar resultado
            if result.returncode != 0:
                logger.error(f"Error de Real-ESRGAN: {result.stderr}")
                raise RuntimeError(f"Real-ESRGAN falló: {result.stderr}")
            
            # Verificar que el archivo de salida existe
            if not output_path.exists():
                raise RuntimeError("Archivo de salida no generado")
            
            logger.info(f"Upscale exitoso: {output_path}")
            return output_path
            
        except subprocess.TimeoutExpired:
            logger.error("Timeout al procesar imagen")
            raise RuntimeError(f"Procesamiento excedió {PROCESSING_TIMEOUT}s")
        except Exception as e:
            logger.error(f"Error en upscale: {str(e)}")
            raise
    
    def cleanup_temp_files(self, max_age_hours: int = 24):
        """
        Limpia archivos temporales antiguos
        
        Args:
            max_age_hours: Edad máxima en horas antes de eliminar
        """
        import time
        current_time = time.time()
        max_age_seconds = max_age_hours * 3600
        
        for directory in [TEMP_DIR, OUTPUT_DIR]:
            for file_path in directory.glob("*"):
                if file_path.is_file():
                    file_age = current_time - file_path.stat().st_mtime
                    if file_age > max_age_seconds:
                        try:
                            file_path.unlink()
                            logger.info(f"Archivo temporal eliminado: {file_path}")
                        except Exception as e:
                            logger.warning(f"No se pudo eliminar {file_path}: {e}")
    
    def get_available_models(self) -> list:
        """
        Retorna lista de modelos disponibles (descargados)
        
        Returns:
            list: Lista de modelos disponibles con su información
        """
        available = []
        
        for model_id, model_info in MODELS.items():
            model_path = MODELS_DIR / model_info["filename"]
            param_path = MODELS_DIR / model_info["param_filename"]
            
            if model_path.exists() and param_path.exists():
                available.append({
                    "id": model_id,
                    "name": model_info["name"],
                    "description": model_info["description"],
                    "scale": model_info["scale"]
                })
        
        return available


# Instancia global del servicio
_service_instance: Optional[RealESRGANService] = None


def get_upscale_service() -> RealESRGANService:
    """Obtiene la instancia del servicio de upscale (singleton)"""
    global _service_instance
    if _service_instance is None:
        _service_instance = RealESRGANService()
    return _service_instance
