# Backend de rIA - Real-ESRGAN con Vulkan

Backend de la aplicación rIA para reescalado de imágenes usando Real-ESRGAN con soporte Vulkan.

## Características

- ✅ **Real-ESRGAN con Vulkan**: Procesamiento acelerado por GPU compatible con todas las máquinas
- ✅ **Sin dependencias pesadas**: Usa binarios precompilados, no requiere PyTorch
- ✅ **Múltiples modelos**: General, Anime, y Photo
- ✅ **API REST**: FastAPI para integración fácil con Electron
- ✅ **Procesamiento por tiles**: Maneja imágenes grandes
- ✅ **Limpieza automática**: Gestión de archivos temporales

## Requisitos del Sistema

### Python
- Python 3.8 o superior

### GPU (Recomendado)
- GPU compatible con Vulkan
- Drivers actualizados

**Nota**: El binario de Real-ESRGAN con Vulkan funciona en CPU si no hay GPU disponible, pero será más lento.

## Instalación

### 1. Instalar dependencias de Python

```bash
cd backend
pip install -r requirements.txt
```

### 2. Descargar binarios y modelos

El script de setup descargará automáticamente:
- El binario de Real-ESRGAN para tu sistema operativo
- Los modelos de IA necesarios

```bash
python setup.py
```

Este proceso puede tardar varios minutos dependiendo de tu conexión.

### Verificación del setup

El script mostrará un resumen al final:
```
✓ Ejecutable encontrado
✓ Modelo 'general' disponible
✓ Modelo 'anime' disponible
✓ Modelo 'photo' disponible
```

## Estructura de Directorios

```
backend/
├── main.py                 # API FastAPI
├── config.py              # Configuración
├── upscale_service.py     # Lógica de procesamiento
├── setup.py               # Script de instalación
├── requirements.txt       # Dependencias Python
├── README.md             # Esta documentación
├── binaries/             # Binarios de Real-ESRGAN
│   ├── realesrgan-ncnn-vulkan(.exe)
│   └── models/           # Modelos incluidos en el binario
├── models/               # Modelos copiados para uso
│   ├── RealESRGAN_x4plus.bin
│   ├── RealESRGAN_x4plus.param
│   └── ...
├── temp/                 # Archivos temporales de entrada
└── output/               # Archivos procesados (se limpian automáticamente)
```

## Uso

### Iniciar el servidor

```bash
python main.py
```

O con uvicorn directamente:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en: `http://localhost:8000`

### Endpoints disponibles

#### `GET /`
Verificar que el servidor está funcionando

#### `GET /health`
Estado del servidor y modelos disponibles

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "models_available": 3,
  "models": ["general", "anime", "photo"]
}
```

#### `GET /api/models`
Listar modelos disponibles

```json
[
  {
    "id": "general",
    "name": "RealESRGAN_x4plus",
    "description": "Modelo general para todo tipo de imágenes",
    "scale": 4
  }
]
```

#### `POST /api/upscale`
Reescalar una imagen

**Request Body:**
```json
{
  "image": "data:image/png;base64,...",
  "scale": 2,
  "model": "general",
  "denoise_strength": 50,
  "upscale_type": "AI Enhanced",
  "tile_size": 0
}
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,...",
  "message": "Imagen reescalada exitosamente",
  "width": 2048,
  "height": 2048,
  "processing_time": 3.45
}
```

#### `POST /api/upscale/file`
Alternativa que acepta archivos directamente (multipart/form-data)

## Modelos Disponibles

### General (RealESRGAN_x4plus)
- **Uso**: Todo tipo de imágenes
- **Escala**: 2x, 3x, 4x
- **Mejor para**: Fotografías, texturas, imágenes generales

### Anime (RealESRGAN_x4plus_anime_6B)
- **Uso**: Ilustraciones y anime
- **Escala**: 2x, 3x, 4x
- **Mejor para**: Arte digital, anime, ilustraciones

### Photo (RealESRNet_x4plus)
- **Uso**: Fotografías realistas
- **Escala**: 2x, 3x, 4x
- **Mejor para**: Fotografías con menos artefactos

## Configuración

### Variables de Entorno

Crea un archivo `.env` en el directorio `backend/`:

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true

# Vulkan Configuration
VULKAN_DEVICE_ID=0  # ID de la GPU a usar (0 para la primera)
```

### Parámetros de Procesamiento

En `config.py` puedes ajustar:

```python
MAX_IMAGE_SIZE = 4096  # Tamaño máximo permitido
PROCESSING_TIMEOUT = 300  # Timeout en segundos
```

## Solución de Problemas

### Error: "Ejecutable de Real-ESRGAN no encontrado"
**Solución**: Ejecuta `python setup.py` para descargar los binarios

### Error: "No se encontraron modelos"
**Solución**: 
1. Verifica que `setup.py` se ejecutó correctamente
2. Verifica manualmente el directorio `binaries/models/`
3. Copia manualmente los modelos a `models/` si es necesario

### Procesamiento muy lento
**Causas posibles**:
1. No hay GPU disponible (ejecutando en CPU)
2. Imagen muy grande (usa tile_size > 0)
3. Drivers de Vulkan no instalados

**Soluciones**:
- Instala drivers de GPU actualizados
- Usa `tile_size: 400` para imágenes grandes
- Reduce el tamaño de la imagen antes de procesar

### Error: "Vulkan not found"
**Solución**: Instala los drivers de Vulkan para tu GPU
- NVIDIA: Incluidos en drivers GeForce/Quadro
- AMD: Incluidos en drivers Radeon
- Intel: Incluidos en drivers HD Graphics

### Timeout en procesamiento
**Solución**: Aumenta `PROCESSING_TIMEOUT` en `config.py`

## Integración con Electron

El frontend en Electron se comunica con este backend a través de HTTP.

Ver `utils/api.js` en el frontend para la implementación del cliente.

## Limpieza de Archivos

Los archivos temporales se limpian automáticamente:
- Al iniciar el servidor (archivos > 24 horas)
- Después de cada procesamiento exitoso
- En caso de error

## Desarrollo

### Agregar un nuevo modelo

1. Descarga los archivos `.bin` y `.param` del modelo
2. Colócalos en `models/`
3. Agrega la configuración en `config.py`:

```python
MODELS = {
    "mi_modelo": {
        "name": "nombre_del_modelo",
        "filename": "modelo.bin",
        "param_filename": "modelo.param",
        "scale": 4,
        "description": "Descripción"
    }
}
```

### Logs

Los logs se muestran en la consola con el formato:
```
2025-10-23 10:30:45 - upscale_service - INFO - Procesando imagen: 1024x768
```

## Performance

### Tiempos estimados (GPU NVIDIA RTX 3060)
- 512x512 → 2048x2048 (4x): ~2-3 segundos
- 1024x1024 → 4096x4096 (4x): ~8-10 segundos

### Tiempos estimados (CPU Intel i7)
- 512x512 → 2048x2048 (4x): ~30-40 segundos
- 1024x1024 → 4096x4096 (4x): ~2-3 minutos

## Referencias

- [Real-ESRGAN GitHub](https://github.com/xinntao/Real-ESRGAN)
- [Real-ESRGAN ncnn Vulkan](https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## Licencia

Este backend usa Real-ESRGAN, que está bajo licencia BSD 3-Clause.
