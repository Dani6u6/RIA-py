# Backend FastAPI para rIA

Este es un ejemplo de backend para la aplicación rIA usando FastAPI y Python.

## Instalación

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

## Ejecución

```bash
# Modo desarrollo
uvicorn main:app --reload

# Modo producción
uvicorn main:app --host 0.0.0.0 --port 8000
```

El servidor estará disponible en `http://localhost:8000`

## Documentación API

Una vez ejecutando, accede a:
- Documentación interactiva (Swagger): `http://localhost:8000/docs`
- Documentación alternativa (ReDoc): `http://localhost:8000/redoc`

## Endpoints

### GET /
Endpoint de salud básico

### GET /health
Verificar estado del servidor

### POST /api/upscale
Reescalar imagen usando IA

**Request Body:**
```json
{
  "image": "data:image/png;base64,...",
  "scale": 2,
  "model": "general",
  "denoise_strength": 50,
  "upscale_type": "AI Enhanced"
}
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,...",
  "message": "Imagen reescalada exitosamente",
  "width": 1920,
  "height": 1080
}
```

### POST /api/models
Obtener modelos disponibles

## Integración con Modelos de IA Reales

Para usar modelos de IA reales como Real-ESRGAN:

1. Descomentar las dependencias de IA en `requirements.txt`
2. Instalar PyTorch según tu sistema: https://pytorch.org/get-started/locally/
3. Descargar modelos pre-entrenados
4. Integrar en `main.py` reemplazando la lógica de resize simple

### Ejemplo con Real-ESRGAN

```python
from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer

# Cargar modelo
model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
upsampler = RealESRGANer(
    scale=4,
    model_path='weights/RealESRGAN_x4plus.pth',
    model=model,
    tile=0,
    tile_pad=10,
    pre_pad=0,
    half=False
)

# En el endpoint de upscale
output, _ = upsampler.enhance(image_array, outscale=request.scale)
```

## Notas

- Este es un ejemplo básico que usa resize simple de Pillow
- Para producción, implementar modelos de IA reales
- Considerar cache de modelos para mejor rendimiento
- Agregar validación de tamaño de imagen
- Implementar límites de rate y autenticación según necesidad
