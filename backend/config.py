"""
Configuración del backend de rIA
Maneja configuraciones de Real-ESRGAN, rutas y parámetros
"""

import os
from pathlib import Path

# Directorio base del backend
BASE_DIR = Path(__file__).resolve().parent

# Directorios de trabajo
TEMP_DIR = BASE_DIR / "temp"
MODELS_DIR = BASE_DIR / "models"
BINARIES_DIR = BASE_DIR / "binaries"
OUTPUT_DIR = BASE_DIR / "output"

# Crear directorios si no existen
TEMP_DIR.mkdir(exist_ok=True)
MODELS_DIR.mkdir(exist_ok=True)
BINARIES_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Configuración de Real-ESRGAN
# URLs de descarga para los binarios
REALESRGAN_RELEASES = {
    "windows": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-windows.zip",
    "linux": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-ubuntu.zip",
    "macos": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-macos.zip"
}

# Nombres de ejecutables según el sistema operativo
REALESRGAN_EXECUTABLE = {
    "windows": "realesrgan-ncnn-vulkan.exe",
    "linux": "realesrgan-ncnn-vulkan",
    "macos": "realesrgan-ncnn-vulkan"
}

# Modelos disponibles de Real-ESRGAN
MODELS = {
    "general": {
        "name": "RealESRGAN_x4plus",
        "filename": "RealESRGAN_x4plus.bin",
        "param_filename": "RealESRGAN_x4plus.param",
        "scale": 4,
        "description": "Modelo general para todo tipo de imágenes"
    },
    "anime": {
        "name": "RealESRGAN_x4plus_anime_6B",
        "filename": "RealESRGAN_x4plus_anime_6B.bin",
        "param_filename": "RealESRGAN_x4plus_anime_6B.param",
        "scale": 4,
        "description": "Optimizado para anime e ilustraciones"
    },
    "photo": {
        "name": "RealESRNet_x4plus",
        "filename": "RealESRNet_x4plus.bin",
        "param_filename": "RealESRNet_x4plus.param",
        "scale": 4,
        "description": "Optimizado para fotografías realistas"
    }
}

# Configuración de API
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", 8000))
API_RELOAD = os.getenv("API_RELOAD", "true").lower() == "true"

# Configuración de procesamiento
MAX_IMAGE_SIZE = 4096  # Tamaño máximo en píxeles por lado
SUPPORTED_FORMATS = ["png", "jpg", "jpeg", "webp", "bmp"]

# Tiempo máximo de procesamiento (segundos)
PROCESSING_TIMEOUT = 300

# Configuración de Vulkan
VULKAN_DEVICE_ID = int(os.getenv("VULKAN_DEVICE_ID", 0))  # ID de GPU a usar
