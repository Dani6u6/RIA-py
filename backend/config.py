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
# Estos nombres corresponden a los modelos incluidos en el binario ncnn-vulkan
MODELS = {
    "general": {
        "name": "realesrgan-x4plus",
        "filename": "realesrgan-x4plus.bin",
        "param_filename": "realesrgan-x4plus.param",
        "scale": 4,
        "description": "Modelo general para todo tipo de imágenes"
    },
    "anime": {
        "name": "realesrgan-x4plus-anime",
        "filename": "realesrgan-x4plus-anime.bin",
        "param_filename": "realesrgan-x4plus-anime.param",
        "scale": 4,
        "description": "Optimizado para anime e ilustraciones"
    },
    "anime-video-2x": {
        "name": "realesr-animevideov3",
        "filename": "realesr-animevideov3-x2.bin",
        "param_filename": "realesr-animevideov3-x2.param",
        "scale": 2,
        "description": "Optimizado para anime y video 2x"
    },
    "anime-video-3x": {
        "name": "realesr-animevideov3",
        "filename": "realesr-animevideov3-x3.bin",
        "param_filename": "realesr-animevideov3-x3.param",
        "scale": 3,
        "description": "Optimizado para anime y video 3x"
    },
    "anime-video-4x": {
        "name": "realesr-animevideov3",
        "filename": "realesr-animevideov3-x4.bin",
        "param_filename": "realesr-animevideov3-x4.param",
        "scale": 4,
        "description": "Optimizado para anime y video 4x"
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
