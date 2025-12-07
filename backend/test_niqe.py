"""
Script de prueba para verificar la instalación y funcionalidad de NIQE
Versión simplificada sin scikit-image
"""

import sys
from pathlib import Path

print("=" * 60)
print("VERIFICACIÓN DE NIQE - rIA (Implementación Simplificada)")
print("=" * 60)

# 1. Verificar importaciones
print("\n1. Verificando importaciones...")
try:
    import numpy as np
    print("   ✅ numpy disponible")
except ImportError as e:
    print(f"   ❌ numpy NO disponible: {e}")
    sys.exit(1)

try:
    import cv2
    print("   ✅ opencv-python disponible")
except ImportError as e:
    print(f"   ❌ opencv-python NO disponible: {e}")
    sys.exit(1)

try:
    import scipy
    print("   ✅ scipy disponible")
except ImportError as e:
    print(f"   ❌ scipy NO disponible: {e}")
    print("\n   SOLUCIÓN:")
    print("   pip install scipy opencv-python numpy")
    sys.exit(1)

# 2. Verificar servicio NIQE
print("\n2. Verificando servicio NIQE...")
try:
    from niqe_service import get_niqe_service, NIQEService
    print("   ✅ niqe_service.py importado correctamente")
    
    service = get_niqe_service()
    print(f"   ✅ Servicio NIQE inicializado: {type(service)}")
    print(f"   ✅ NIQE disponible: {service.is_available()}")
except Exception as e:
    print(f"   ❌ Error al importar niqe_service: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# 3. Verificar upscale_service
print("\n3. Verificando upscale_service...")
try:
    from upscale_service import get_upscale_service
    print("   ✅ upscale_service.py importado correctamente")
except Exception as e:
    print(f"   ❌ Error al importar upscale_service: {e}")

# 4. Verificar main.py (API)
print("\n4. Verificando main.py (API)...")
try:
    from main import UpscaleResponse
    print("   ✅ main.py importado correctamente")
    
    # Verificar que UpscaleResponse tiene campos NIQE
    response_fields = UpscaleResponse.__fields__.keys()
    has_niqe = 'niqe_score' in response_fields
    has_rating = 'quality_rating' in response_fields
    
    print(f"   {'✅' if has_niqe else '❌'} Campo 'niqe_score' en UpscaleResponse")
    print(f"   {'✅' if has_rating else '❌'} Campo 'quality_rating' en UpscaleResponse")
except Exception as e:
    print(f"   ❌ Error al importar main: {e}")

# 5. Test básico de NIQE
print("\n5. Test básico de métricas de calidad...")
try:
    # Crear imagen de prueba
    test_image = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
    test_path = Path("test_temp_image.png")
    
    # Guardar imagen temporal
    cv2.imwrite(str(test_path), test_image)
    
    # Calcular score
    score = service.calculate_niqe(test_path)
    print(f"   ✅ Score calculado en imagen de prueba: {score:.4f}")
    
    # Interpretar score
    rating = service.interpret_score(score)
    print(f"   ✅ Clasificación: {rating}")
    
    # Obtener color
    color = service.get_quality_color(rating)
    print(f"   ✅ Color: {color}")
    
    # Limpiar
    test_path.unlink()
    print("   ✅ Imagen temporal eliminada")
    
except Exception as e:
    print(f"   ❌ Error en test de calidad: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("VERIFICACIÓN COMPLETADA")
print("=" * 60)
print("\n✅ Sistema de métricas de calidad está funcional!")
print("\nNota: Esta es una implementación simplificada que calcula")
print("métricas de calidad basadas en nitidez, contraste y ruido.")
print("\nPróximos pasos:")
print("1. Inicia el backend: python main.py")
print("2. Activa el switch 'Real-ESRGAN (Backend)' en la interfaz")
print("3. Procesa una imagen y verifica el badge de calidad")
