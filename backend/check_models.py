"""
Script de utilidad para verificar qué modelos están disponibles
"""

import logging
from pathlib import Path
from config import BINARIES_DIR, MODELS_DIR, MODELS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def check_models():
    """Verifica qué modelos están disponibles"""
    
    print("\n" + "="*70)
    print("  VERIFICACIÓN DE MODELOS REAL-ESRGAN")
    print("="*70 + "\n")
    
    # Verificar directorio binaries/models
    models_subdir = BINARIES_DIR / "models"
    
    print(f"📁 Directorio de binarios: {BINARIES_DIR}")
    print(f"📁 Directorio de modelos (binarios): {models_subdir}")
    print(f"📁 Directorio de modelos (app): {MODELS_DIR}\n")
    
    # Listar archivos en binaries/models
    print("-" * 70)
    print("ARCHIVOS EN binaries/models/:")
    print("-" * 70)
    
    if models_subdir.exists():
        files = sorted([f for f in models_subdir.glob("*") if f.is_file()])
        if files:
            for file_path in files:
                size_mb = file_path.stat().st_size / (1024 * 1024)
                print(f"  ✓ {file_path.name:<40} ({size_mb:.2f} MB)")
        else:
            print("  ⚠ No hay archivos en este directorio")
    else:
        print(f"  ✗ El directorio no existe: {models_subdir}")
    
    print()
    
    # Listar archivos en models/
    print("-" * 70)
    print("ARCHIVOS EN models/:")
    print("-" * 70)
    
    if MODELS_DIR.exists():
        files = sorted([f for f in MODELS_DIR.glob("*") if f.is_file()])
        if files:
            for file_path in files:
                size_mb = file_path.stat().st_size / (1024 * 1024)
                print(f"  ✓ {file_path.name:<40} ({size_mb:.2f} MB)")
        else:
            print("  ⚠ No hay archivos en este directorio")
    else:
        print(f"  ✗ El directorio no existe: {MODELS_DIR}")
    
    print()
    
    # Verificar modelos configurados
    print("-" * 70)
    print("MODELOS CONFIGURADOS Y SU DISPONIBILIDAD:")
    print("-" * 70)
    
    available_count = 0
    missing_count = 0
    
    for model_id, model_info in MODELS.items():
        bin_name = model_info["filename"]
        param_name = model_info["param_filename"]
        
        # Verificar en binaries/models
        src_bin = models_subdir / bin_name
        src_param = models_subdir / param_name
        
        # Verificar en models/
        dst_bin = MODELS_DIR / bin_name
        dst_param = MODELS_DIR / param_name
        
        # Estado
        in_binaries = src_bin.exists() and src_param.exists()
        in_models = dst_bin.exists() and dst_param.exists()
        
        status_icon = "✓" if (in_binaries or in_models) else "✗"
        status_text = ""
        
        if in_models:
            status_text = "Disponible en models/"
            available_count += 1
        elif in_binaries:
            status_text = "Disponible en binaries/models/ (ejecuta setup.py para copiar)"
        else:
            status_text = "NO DISPONIBLE"
            missing_count += 1
        
        print(f"\n  {status_icon} Modelo: {model_id}")
        print(f"    Nombre:       {model_info['name']}")
        print(f"    Descripción:  {model_info['description']}")
        print(f"    Escala:       {model_info['scale']}x")
        print(f"    Archivos:")
        print(f"      - {bin_name} {'✓' if (src_bin.exists() or dst_bin.exists()) else '✗'}")
        print(f"      - {param_name} {'✓' if (src_param.exists() or dst_param.exists()) else '✗'}")
        print(f"    Estado:       {status_text}")
    
    print()
    print("="*70)
    print(f"RESUMEN:")
    print(f"  Total de modelos configurados: {len(MODELS)}")
    print(f"  Modelos disponibles:           {available_count}")
    print(f"  Modelos faltantes:             {missing_count}")
    print("="*70)
    
    if missing_count > 0:
        print("\n⚠️  ACCIÓN REQUERIDA:")
        print("  Algunos modelos no están disponibles.")
        print("  Si los archivos están en binaries/models/, ejecuta:")
        print("    python setup.py")
        print("  Para copiarlos al directorio correcto.\n")
    elif available_count == len(MODELS):
        print("\n✅ TODOS LOS MODELOS ESTÁN DISPONIBLES\n")
    else:
        print("\n✅ HAY MODELOS DISPONIBLES PERO FALTAN ALGUNOS\n")


if __name__ == "__main__":
    check_models()
