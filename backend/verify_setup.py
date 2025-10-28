"""
Script de verificación completa del setup del backend
Verifica binarios, modelos, dependencias y configuración
"""

import sys
import platform
import logging
from pathlib import Path

# Intentar importar config
try:
    from config import (
        BINARIES_DIR,
        MODELS_DIR,
        TEMP_DIR,
        OUTPUT_DIR,
        REALESRGAN_EXECUTABLE,
        MODELS
    )
    config_ok = True
except Exception as e:
    print(f"❌ Error importando config.py: {e}")
    config_ok = False
    sys.exit(1)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def check_python_version():
    """Verifica la versión de Python"""
    print("\n" + "="*70)
    print("  VERIFICACIÓN DE PYTHON")
    print("="*70)
    
    version = sys.version_info
    print(f"✓ Python {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("⚠️  ADVERTENCIA: Se recomienda Python 3.8 o superior")
        return False
    else:
        print("✓ Versión de Python adecuada")
        return True


def check_dependencies():
    """Verifica que las dependencias estén instaladas"""
    print("\n" + "="*70)
    print("  VERIFICACIÓN DE DEPENDENCIAS")
    print("="*70)
    
    required = {
        'fastapi': 'FastAPI',
        'uvicorn': 'Uvicorn',
        'PIL': 'Pillow',
        'pydantic': 'Pydantic'
    }
    
    all_ok = True
    
    for module, name in required.items():
        try:
            __import__(module)
            print(f"✓ {name} instalado")
        except ImportError:
            print(f"✗ {name} NO instalado")
            all_ok = False
    
    if not all_ok:
        print("\n⚠️  Faltan dependencias. Ejecuta:")
        print("   pip install -r requirements.txt")
    
    return all_ok


def check_directories():
    """Verifica que los directorios necesarios existan"""
    print("\n" + "="*70)
    print("  VERIFICACIÓN DE DIRECTORIOS")
    print("="*70)
    
    directories = {
        'Binarios': BINARIES_DIR,
        'Modelos': MODELS_DIR,
        'Temporales': TEMP_DIR,
        'Salida': OUTPUT_DIR
    }
    
    all_ok = True
    
    for name, path in directories.items():
        if path.exists():
            print(f"✓ {name}: {path}")
        else:
            print(f"✗ {name}: {path} (no existe)")
            all_ok = False
    
    return all_ok


def check_executable():
    """Verifica que el ejecutable de Real-ESRGAN exista"""
    print("\n" + "="*70)
    print("  VERIFICACIÓN DE EJECUTABLE")
    print("="*70)
    
    system = platform.system().lower()
    if system == "darwin":
        system = "macos"
    elif system == "windows":
        system = "windows"
    else:
        system = "linux"
    
    print(f"Sistema operativo detectado: {system}")
    
    exe_name = REALESRGAN_EXECUTABLE.get(system)
    if not exe_name:
        print(f"✗ Sistema no soportado: {system}")
        return False
    
    exe_path = BINARIES_DIR / exe_name
    
    if exe_path.exists():
        print(f"✓ Ejecutable encontrado: {exe_path}")
        
        # Verificar permisos en Linux/Mac
        if system in ["linux", "macos"]:
            import os
            if os.access(exe_path, os.X_OK):
                print("✓ Permisos de ejecución correctos")
            else:
                print("⚠️  Archivo sin permisos de ejecución")
                print("   Ejecuta: chmod +x " + str(exe_path))
                return False
        
        return True
    else:
        print(f"✗ Ejecutable no encontrado: {exe_path}")
        print("\n⚠️  Ejecuta setup.py para descargar el binario:")
        print("   python setup.py")
        return False


def check_models():
    """Verifica modelos disponibles"""
    print("\n" + "="*70)
    print("  VERIFICACIÓN DE MODELOS")
    print("="*70)
    
    available = 0
    total = len(MODELS)
    
    for model_id, model_info in MODELS.items():
        bin_path = MODELS_DIR / model_info["filename"]
        param_path = MODELS_DIR / model_info["param_filename"]
        
        if bin_path.exists() and param_path.exists():
            print(f"✓ Modelo '{model_id}' ({model_info['scale']}x)")
            available += 1
        else:
            print(f"✗ Modelo '{model_id}' no disponible")
    
    print(f"\nTotal: {available}/{total} modelos disponibles")
    
    if available == 0:
        print("\n⚠️  NO HAY MODELOS DISPONIBLES")
        print("   1. Verifica qué archivos tienes: python check_models.py")
        print("   2. Ejecuta setup.py para copiar modelos: python setup.py")
        return False
    elif available < total:
        print("\n⚠️  Algunos modelos no están disponibles")
        print("   Ejecuta: python check_models.py")
        print("   Para ver detalles de los archivos disponibles")
    else:
        print("\n✓ Todos los modelos configurados están disponibles")
    
    return available > 0


def check_vulkan():
    """Verifica (intenta) si Vulkan está disponible"""
    print("\n" + "="*70)
    print("  VERIFICACIÓN DE VULKAN (OPCIONAL)")
    print("="*70)
    
    print("ℹ️  Vulkan es necesario para aceleración por GPU")
    print("   Si no tienes GPU, el procesamiento usará CPU (más lento)")
    
    # No podemos verificar Vulkan directamente sin ejecutar el binario
    print("\n✓ La verificación de Vulkan se hará al ejecutar el primer upscale")
    
    return True


def main():
    """Función principal de verificación"""
    print("\n" + "#"*70)
    print("#  VERIFICACIÓN COMPLETA DEL BACKEND rIA")
    print("#"*70)
    
    checks = [
        ("Python", check_python_version()),
        ("Dependencias", check_dependencies()),
        ("Directorios", check_directories()),
        ("Ejecutable", check_executable()),
        ("Modelos", check_models()),
        ("Vulkan", check_vulkan())
    ]
    
    print("\n" + "="*70)
    print("  RESUMEN")
    print("="*70 + "\n")
    
    all_ok = True
    required_ok = True
    
    for name, result in checks:
        status = "✓ OK" if result else "✗ FALLO"
        print(f"{name:.<30} {status}")
        
        if not result:
            all_ok = False
            # Solo el ejecutable y modelos son requeridos
            if name in ["Ejecutable", "Modelos"]:
                required_ok = False
    
    print("\n" + "="*70)
    
    if required_ok:
        print("\n✅ BACKEND LISTO PARA USAR")
        print("\nPuedes iniciar el servidor con:")
        print("  python main.py")
        print("\nO con uvicorn:")
        print("  uvicorn main:app --reload")
        print("\nDocumentación interactiva:")
        print("  http://localhost:8000/docs")
        print()
        return 0
    else:
        print("\n❌ SETUP INCOMPLETO")
        print("\nPasos para completar el setup:")
        
        if not checks[3][1]:  # Ejecutable
            print("  1. Ejecuta: python setup.py")
        
        if not checks[4][1]:  # Modelos
            print("  2. Verifica modelos: python check_models.py")
            print("  3. Si están en binaries/models/, ejecuta: python setup.py")
        
        print()
        return 1


if __name__ == "__main__":
    sys.exit(main())
