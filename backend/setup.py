"""
Script de configuración para descargar binarios y modelos de Real-ESRGAN
Ejecuta este script después de instalar las dependencias
"""

import platform
import urllib.request
import zipfile
import os
from pathlib import Path
import logging

from config import (
    BINARIES_DIR,
    MODELS_DIR,
    REALESRGAN_RELEASES,
    REALESRGAN_EXECUTABLE,
    MODELS
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# URLs de modelos
MODEL_URLS = {
    "RealESRGAN_x4plus": {
        "bin": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/RealESRGAN_x4plus.pth",
        "param": None  # Los .bin y .param se generan desde .pth en ncnn-vulkan
    }
}


def detect_system():
    """Detecta el sistema operativo"""
    system = platform.system().lower()
    if system == "windows":
        return "windows"
    elif system == "darwin":
        return "macos"
    else:
        return "linux"


def download_file(url: str, destination: Path, description: str = "archivo"):
    """
    Descarga un archivo con barra de progreso
    """
    logger.info(f"Descargando {description}...")
    logger.info(f"URL: {url}")
    logger.info(f"Destino: {destination}")
    
    try:
        def report_progress(block_num, block_size, total_size):
            downloaded = block_num * block_size
            percent = min(downloaded * 100 / total_size, 100)
            
            if block_num % 100 == 0 or downloaded >= total_size:
                print(f"\rProgreso: {percent:.1f}%", end="", flush=True)
        
        urllib.request.urlretrieve(url, destination, reporthook=report_progress)
        print()  # Nueva línea después de la barra de progreso
        logger.info(f"✓ {description} descargado exitosamente")
        return True
    except Exception as e:
        logger.error(f"✗ Error descargando {description}: {str(e)}")
        return False


def extract_zip(zip_path: Path, extract_to: Path):
    """Extrae un archivo ZIP"""
    logger.info(f"Extrayendo {zip_path.name}...")
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        logger.info(f"✓ Extraído exitosamente a {extract_to}")
        return True
    except Exception as e:
        logger.error(f"✗ Error extrayendo archivo: {str(e)}")
        return False


def download_binary():
    """Descarga el binario de Real-ESRGAN para el sistema actual"""
    system = detect_system()
    logger.info(f"\n{'='*60}")
    logger.info(f"Descargando binario de Real-ESRGAN para {system}")
    logger.info(f"{'='*60}\n")
    
    if system not in REALESRGAN_RELEASES:
        logger.error(f"Sistema no soportado: {system}")
        return False
    
    url = REALESRGAN_RELEASES[system]
    zip_filename = url.split('/')[-1]
    zip_path = BINARIES_DIR / zip_filename
    
    # Descargar ZIP
    if not download_file(url, zip_path, f"binario de Real-ESRGAN ({system})"):
        return False
    
    # Extraer
    if not extract_zip(zip_path, BINARIES_DIR):
        return False
    
    # Hacer ejecutable en Linux/Mac
    if system in ["linux", "macos"]:
        exe_name = REALESRGAN_EXECUTABLE[system]
        exe_path = BINARIES_DIR / exe_name
        
        if exe_path.exists():
            os.chmod(exe_path, 0o755)
            logger.info(f"✓ Permisos de ejecución configurados para {exe_name}")
    
    # Limpiar ZIP
    try:
        zip_path.unlink()
        logger.info("✓ Archivo ZIP eliminado")
    except Exception as e:
        logger.warning(f"No se pudo eliminar el ZIP: {e}")
    
    return True


def download_models():
    """
    Descarga los modelos de Real-ESRGAN
    Nota: Real-ESRGAN ncnn-vulkan incluye los modelos en el ZIP descargado
    """
    logger.info(f"\n{'='*60}")
    logger.info("Verificando modelos de Real-ESRGAN")
    logger.info(f"{'='*60}\n")
    
    # Los binarios de ncnn-vulkan ya incluyen los modelos .bin y .param
    # Solo necesitamos verificar que existan
    
    system = detect_system()
    
    # Buscar modelos en el directorio de binarios
    models_found = []
    
    # Los modelos están en BINARIES_DIR/models/ después de extraer
    models_subdir = BINARIES_DIR / "models"
    
    if models_subdir.exists():
        logger.info(f"Directorio de modelos encontrado: {models_subdir}")
        
        # Copiar modelos al directorio MODELS_DIR si no están ahí
        for model_id, model_info in MODELS.items():
            bin_name = model_info["filename"]
            param_name = model_info["param_filename"]
            
            src_bin = models_subdir / bin_name
            src_param = models_subdir / param_name
            
            dst_bin = MODELS_DIR / bin_name
            dst_param = MODELS_DIR / param_name
            
            # Copiar .bin
            if src_bin.exists() and not dst_bin.exists():
                import shutil
                shutil.copy2(src_bin, dst_bin)
                logger.info(f"✓ Modelo copiado: {bin_name}")
            elif dst_bin.exists():
                logger.info(f"✓ Modelo ya existe: {bin_name}")
            
            # Copiar .param
            if src_param.exists() and not dst_param.exists():
                import shutil
                shutil.copy2(src_param, dst_param)
                logger.info(f"✓ Parámetros copiados: {param_name}")
            elif dst_param.exists():
                logger.info(f"✓ Parámetros ya existen: {param_name}")
            
            if dst_bin.exists() and dst_param.exists():
                models_found.append(model_id)
    
    if models_found:
        logger.info(f"\n✓ Modelos disponibles: {', '.join(models_found)}")
        return True
    else:
        logger.warning(
            "\n⚠ No se encontraron modelos. "
            "Verifica que el binario se haya descargado correctamente."
        )
        return False


def verify_installation():
    """Verifica que todo esté instalado correctamente"""
    logger.info(f"\n{'='*60}")
    logger.info("Verificando instalación")
    logger.info(f"{'='*60}\n")
    
    system = detect_system()
    exe_name = REALESRGAN_EXECUTABLE[system]
    exe_path = BINARIES_DIR / exe_name
    
    # Verificar ejecutable
    if exe_path.exists():
        logger.info(f"✓ Ejecutable encontrado: {exe_path}")
        
        # Verificar que sea ejecutable en Linux/Mac
        if system in ["linux", "macos"]:
            if os.access(exe_path, os.X_OK):
                logger.info("✓ Permisos de ejecución correctos")
            else:
                logger.warning("⚠ El archivo no tiene permisos de ejecución")
    else:
        logger.error(f"✗ Ejecutable no encontrado: {exe_path}")
        return False
    
    # Verificar modelos
    models_ok = []
    models_missing = []
    
    for model_id, model_info in MODELS.items():
        bin_path = MODELS_DIR / model_info["filename"]
        param_path = MODELS_DIR / model_info["param_filename"]
        
        if bin_path.exists() and param_path.exists():
            models_ok.append(model_id)
            logger.info(f"✓ Modelo '{model_id}' disponible")
        else:
            models_missing.append(model_id)
            logger.warning(f"⚠ Modelo '{model_id}' no encontrado")
    
    logger.info(f"\n{'='*60}")
    logger.info("Resumen de instalación")
    logger.info(f"{'='*60}")
    logger.info(f"Sistema: {system}")
    logger.info(f"Ejecutable: {'OK' if exe_path.exists() else 'FALTA'}")
    logger.info(f"Modelos disponibles: {len(models_ok)}/{len(MODELS)}")
    
    if models_ok:
        logger.info(f"  - {', '.join(models_ok)}")
    
    if models_missing:
        logger.warning(f"Modelos faltantes: {', '.join(models_missing)}")
    
    logger.info(f"{'='*60}\n")
    
    return len(models_ok) > 0


def main():
    """Función principal de setup"""
    logger.info(f"\n{'#'*60}")
    logger.info("# Setup de Real-ESRGAN para rIA")
    logger.info(f"{'#'*60}\n")
    
    # Paso 1: Descargar binario
    if not download_binary():
        logger.error("Fallo al descargar el binario. Abortando setup.")
        return False
    
    # Paso 2: Verificar/copiar modelos
    if not download_models():
        logger.warning("Algunos modelos pueden no estar disponibles.")
    
    # Paso 3: Verificar instalación
    if verify_installation():
        logger.info("\n✓✓✓ Setup completado exitosamente ✓✓✓")
        logger.info("\nPuedes iniciar el servidor con:")
        logger.info("  python main.py")
        logger.info("\nO con uvicorn:")
        logger.info("  uvicorn main:app --reload\n")
        return True
    else:
        logger.error("\n✗✗✗ Setup incompleto ✗✗✗")
        logger.error("Revisa los mensajes de error anteriores.\n")
        return False


if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
