# 📊 Flujo de Datos - rIA

Esquema detallado del flujo de datos en la aplicación rIA, desde la entrada de la imagen hasta la salida del modelo de IA.

---

## 🔄 Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO (Frontend)                        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣  ENTRADA: Selección de Imagen                                │
│     • Drag & Drop                                                │
│     • Selector de archivos                                       │
│     • Formatos: JPG, PNG, WebP, BMP                             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2️⃣  VALIDACIÓN FRONTEND (React)                                 │
│     • Tipo de archivo permitido                                  │
│     • Tamaño máximo (< 50MB recomendado)                        │
│     • Formato de imagen válido                                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3️⃣  PREVIEW ORIGINAL (Frontend)                                 │
│     • Conversión a base64/URL                                    │
│     • Render en ImageComparison (lado izquierdo)                │
│     • Display de metadatos (dimensiones, peso)                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4️⃣  CONFIGURACIÓN DE PARÁMETROS (Frontend)                      │
│     • Tipo de reescalado: General/Anime/Face/Denoise            │
│     • Factor de escala: 2x, 3x, 4x                              │
│     • Formato de salida: PNG, JPG, WebP                         │
│     • Ruta de salida personalizada                              │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5️⃣  ENVÍO AL BACKEND (HTTP POST)                                │
│                                                                  │
│     Request:                                                     │
│     • Endpoint: POST /api/upscale                               │
│     • Method: multipart/form-data                               │
│     • Headers: Content-Type: multipart/form-data               │
│                                                                  │
│     Payload:                                                     │
│     {                                                            │
│       "file": <binary image data>,                              │
│       "model": "realesrgan-x4plus",                             │
│       "scale": 4,                                               │
│       "format": "png",                                          │
│       "denoise_strength": 0.5  // opcional                      │
│     }                                                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│            🔌 ELECTRON IPC BRIDGE (Opcional)                     │
│     • Comunicación segura Frontend ↔ Backend local              │
│     • Paso de archivos sin exponer puertos HTTP                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6️⃣  RECEPCIÓN EN BACKEND (FastAPI)                              │
│                                                                  │
│     Endpoint: POST /api/upscale                                 │
│     Handler: upscale_image()                                    │
│                                                                  │
│     Validaciones:                                                │
│     • Verificar tipo MIME                                        │
│     • Validar tamaño de archivo                                  │
│     • Verificar modelo disponible                                │
│     • Validar parámetros de escala                              │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7️⃣  GUARDADO TEMPORAL (Backend)                                 │
│                                                                  │
│     • Crear directorio temporal único                            │
│     • Path: /tmp/ria_XXXXX/input.png                            │
│     • Guardar imagen original en disco                           │
│                                                                  │
│     Tipo de dato: Archivo binario de imagen                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8️⃣  CARGA Y PREPROCESAMIENTO (Python)                           │
│                                                                  │
│     import cv2                                                   │
│     from PIL import Image                                        │
│                                                                  │
│     Transformaciones:                                            │
│     • Leer imagen con cv2.imread() o PIL.Image.open()          │
│     • Convertir a formato RGB (si está en BGR)                  │
│     • Normalizar valores de píxeles [0-255] → [0-1]            │
│     • Convertir a numpy array (H, W, C)                         │
│                                                                  │
│     Tipo de dato:                                                │
│     numpy.ndarray, shape=(height, width, 3), dtype=float32     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9️⃣  PROCESAMIENTO CON REAL-ESRGAN (IA)                          │
│                                                                  │
│     Motor: Real-ESRGAN con backend Vulkan                       │
│     Binary: realesrgan-ncnn-vulkan                              │
│                                                                  │
│     Comando ejecutado:                                           │
│     ./realesrgan-ncnn-vulkan \                                  │
│         -i /tmp/ria_XXXXX/input.png \                           │
│         -o /tmp/ria_XXXXX/output.png \                          │
│         -n realesrgan-x4plus \                                  │
│         -s 4 \                                                  │
│         -f png                                                  │
│                                                                  │
│     Modelos disponibles:                                         │
│     • realesrgan-x4plus: General propósito (fotos/textos)      │
│     • realesrgan-x4plus-anime: Optimizado para anime           │
│     • realesr-animevideov3: Video anime                         │
│     • realesrgan-x4plus-denoise: Con reducción de ruido        │
│                                                                  │
│     ┌──────────────────────────────────────────────────────┐   │
│     │          🧠 MODELO DE IA (Real-ESRGAN)               │   │
│     │                                                       │   │
│     │  Arquitectura: Enhanced Super-Resolution GAN         │   │
│     │                                                       │   │
│     │  Entrada:                                            │   │
│     │  • Imagen RGB de baja resolución                     │   │
│     │  • Tensor: (1, 3, H, W)                             │   │
│     │  • Valores normalizados [0, 1]                       │   │
│     │                                                       │   │
│     │  Procesamiento:                                       │   │
│     │  1. Extracción de características (Encoder)          │   │
│     │  2. Upsampling con capas convolucionales             │   │
│     │  3. Refinamiento de detalles (Residual blocks)       │   │
│     │  4. Reconstrucción de alta frecuencia                │   │
│     │                                                       │   │
│     │  Transformación:                                      │   │
│     │  • Ampliación inteligente de píxeles                 │   │
│     │  • Predicción de detalles faltantes                  │   │
│     │  • Reducción de artefactos de compresión             │   │
│     │  • Mejora de bordes y texturas                       │   │
│     │                                                       │   │
│     │  Salida:                                             │   │
│     │  • Imagen RGB de alta resolución                     │   │
│     │  • Dimensiones: H×scale, W×scale                     │   │
│     │  • Tensor: (1, 3, H×4, W×4) para escala 4x         │   │
│     │  • Valores denormalizados [0, 255]                   │   │
│     └──────────────────────────────────────────────────────┘   │
│                                                                  │
│     Backend: Vulkan (no requiere CUDA/PyTorch)                 │
│     GPU: Utiliza GPU si está disponible, sino CPU              │
│     Tiempo estimado: 2-10s para imagen 1920×1080               │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 🔟 POSTPROCESAMIENTO (Python)                                   │
│                                                                  │
│     Transformaciones:                                            │
│     • Leer imagen resultante                                     │
│     • Desnormalizar valores [0-1] → [0-255]                    │
│     • Convertir de float32 a uint8                              │
│     • Aplicar formato de salida solicitado                      │
│     • Comprimir según formato (JPG: calidad 95)                │
│                                                                  │
│     Tipo de dato:                                                │
│     numpy.ndarray → bytes (imagen codificada)                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣1️⃣ GENERACIÓN DE RESPUESTA (Backend)                           │
│                                                                  │
│     Response HTTP 200 OK:                                        │
│     {                                                            │
│       "success": true,                                           │
│       "output_image": "base64EncodedImage...",                  │
│       "metadata": {                                             │
│         "original_size": [1920, 1080],                          │
│         "output_size": [7680, 4320],                            │
│         "scale_factor": 4,                                       │
│         "model_used": "realesrgan-x4plus",                      │
│         "processing_time": 5.2,                                 │
│         "file_size": "15.3 MB"                                  │
│       }                                                          │
│     }                                                            │
│                                                                  │
│     O si hay error:                                              │
│     {                                                            │
│       "success": false,                                          │
│       "error": "Descripción del error",                         │
│       "error_code": "MODEL_NOT_FOUND"                           │
│     }                                                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣2️⃣ LIMPIEZA DE ARCHIVOS TEMPORALES (Backend)                   │
│                                                                  │
│     • Eliminar /tmp/ria_XXXXX/input.png                        │
│     • Eliminar /tmp/ria_XXXXX/output.png                       │
│     • Eliminar directorio temporal                               │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣3️⃣ RECEPCIÓN EN FRONTEND (React)                               │
│                                                                  │
│     const response = await fetch('/api/upscale', {...})        │
│     const data = await response.json()                          │
│                                                                  │
│     Procesamiento:                                               │
│     • Parsear JSON de respuesta                                  │
│     • Decodificar base64 → blob → URL                          │
│     • Validar éxito de operación                                │
│     • Manejar errores si los hay                                │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣4️⃣ DISPLAY DE RESULTADO (Frontend)                             │
│                                                                  │
│     Componente: ImageComparison                                  │
│     • Lado izquierdo: Imagen original                           │
│     • Lado derecho: Imagen reescalada                           │
│     • Handle draggable para comparar                            │
│     • Pan/Zoom para ver detalles                                │
│     • Overlay con metadatos                                     │
│                                                                  │
│     Interacciones:                                               │
│     • Descargar imagen resultante                               │
│     • Procesar otra imagen                                       │
│     • Cambiar configuración y reprocesar                         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣5️⃣ GUARDADO LOCAL (Opcional)                                   │
│                                                                  │
│     Si el usuario seleccionó ruta personalizada:                │
│     • Electron salva el archivo en disco                        │
│     • Path: Configurado por el usuario                          │
│     • Nombre: original_upscaled_4x.png                          │
│                                                                  │
│     Si no:                                                       │
│     • Descarga estándar del navegador                           │
│     • Path: ~/Downloads/                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Tipos de Datos en Cada Etapa

### Entrada (Frontend → Backend)

| Etapa | Tipo de Dato | Formato | Tamaño Aprox. |
|-------|--------------|---------|---------------|
| Upload usuario | `File` (JavaScript) | Binario | 2-20 MB |
| Request HTTP | `FormData` | multipart/form-data | 2-20 MB |
| Parámetros | `JSON` | { model, scale, format } | < 1 KB |

### Procesamiento (Backend)

| Etapa | Tipo de Dato | Formato | Descripción |
|-------|--------------|---------|-------------|
| Archivo temporal | `bytes` | PNG/JPG binario | Imagen guardada en disco |
| Array NumPy | `numpy.ndarray` | float32 (H, W, 3) | Imagen normalizada [0-1] |
| Tensor entrada IA | `Tensor` | (1, 3, H, W) | Entrada al modelo |
| Tensor salida IA | `Tensor` | (1, 3, H×4, W×4) | Salida del modelo |
| Imagen procesada | `numpy.ndarray` | uint8 (H×4, W×4, 3) | Imagen [0-255] |
| Archivo resultado | `bytes` | PNG/JPG binario | Imagen codificada |

### Salida (Backend → Frontend)

| Etapa | Tipo de Dato | Formato | Tamaño Aprox. |
|-------|--------------|---------|---------------|
| Response HTTP | `JSON` | { success, output_image, metadata } | 15-80 MB |
| Imagen base64 | `string` | Base64 encoded | 15-80 MB |
| Blob frontend | `Blob` | Binario | 15-80 MB |
| URL imagen | `string` | blob:http://... | < 1 KB |
| Display | `HTMLImageElement` | Rendered | - |

---

## 🎨 Transformaciones de Imagen

### 1. Carga Inicial

```
Input:  Archivo JPG/PNG (H × W × 3)
        ↓ cv2.imread()
Output: numpy array, shape=(H, W, 3), dtype=uint8, range=[0, 255]
```

### 2. Normalización

```
Input:  numpy array, dtype=uint8, range=[0, 255]
        ↓ img = img.astype(np.float32) / 255.0
Output: numpy array, dtype=float32, range=[0.0, 1.0]
```

### 3. Conversión a Tensor

```
Input:  numpy array, shape=(H, W, 3)
        ↓ transpose + to_tensor
Output: Tensor, shape=(1, 3, H, W), dtype=float32
```

### 4. Upscaling con IA

```
Input:  Tensor (1, 3, H, W)
        ↓ Real-ESRGAN model forward pass
Output: Tensor (1, 3, H×scale, W×scale)

Ejemplo con escala 4x:
  Input:  (1, 3, 1080, 1920)   # Full HD
  Output: (1, 3, 4320, 7680)   # 4K × 4
```

### 5. Desnormalización

```
Input:  Tensor, range=[0.0, 1.0]
        ↓ img = img * 255.0
Output: numpy array, dtype=float32, range=[0.0, 255.0]
```

### 6. Conversión a Imagen

```
Input:  numpy array, dtype=float32
        ↓ img = img.astype(np.uint8)
Output: numpy array, dtype=uint8, range=[0, 255]
```

### 7. Codificación

```
Input:  numpy array
        ↓ cv2.imencode('.png', img)
Output: bytes (imagen codificada en PNG/JPG)
```

---

## 📈 Escalas y Dimensiones

### Factores de Escala Soportados

| Escala | Dimensión Input | Dimensión Output | Tamaño Output |
|--------|-----------------|------------------|---------------|
| 2x | 1920 × 1080 | 3840 × 2160 | ~8-12 MB |
| 3x | 1920 × 1080 | 5760 × 3240 | ~18-25 MB |
| 4x | 1920 × 1080 | 7680 × 4320 | ~30-50 MB |

### Límites Recomendados

| Parámetro | Valor Recomendado | Límite Máximo |
|-----------|-------------------|---------------|
| Tamaño entrada | < 10 MB | 50 MB |
| Dimensión entrada | < 4K (3840×2160) | 8K (7680×4320) |
| Tamaño salida | < 50 MB | 200 MB |
| Tiempo procesamiento | < 10 segundos | 60 segundos |

---

## 🚀 Optimizaciones de Flujo

### 1. Procesamiento Asíncrono

```javascript
// Frontend envía y continúa responsive
const processImage = async (file, config) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('config', JSON.stringify(config))
  
  const response = await fetch('/api/upscale', {
    method: 'POST',
    body: formData
  })
  
  return await response.json()
}
```

### 2. Streaming de Resultados (Futuro)

```python
# Backend puede enviar progreso
async def upscale_with_progress(image_path):
    yield {"status": "loading", "progress": 0}
    yield {"status": "processing", "progress": 50}
    yield {"status": "complete", "progress": 100, "result": image}
```

### 3. Caché de Modelos

```python
# Backend mantiene modelos cargados en memoria
class ModelCache:
    models = {}
    
    def get_model(model_name):
        if model_name not in models:
            models[model_name] = load_model(model_name)
        return models[model_name]
```

### 4. Compresión de Respuestas

```python
# Backend comprime respuesta con gzip
from fastapi.responses import Response
import gzip

compressed = gzip.compress(image_bytes)
return Response(content=compressed, media_type="application/gzip")
```

---

## 🔐 Seguridad del Flujo

### Validaciones de Entrada

✅ **Frontend**:
- Tipo de archivo (MIME type)
- Tamaño de archivo (< 50MB)
- Extensión válida (.jpg, .png, .webp)

✅ **Backend**:
- Doble verificación de MIME type
- Validación de formato de imagen real (magic bytes)
- Sanitización de parámetros
- Rate limiting (max 10 requests/minuto)

### Gestión de Archivos Temporales

```python
import tempfile
import os
from pathlib import Path

def process_image_safely(input_image):
    # Crear directorio temporal único
    with tempfile.TemporaryDirectory(prefix='ria_') as tmpdir:
        input_path = Path(tmpdir) / 'input.png'
        output_path = Path(tmpdir) / 'output.png'
        
        # Procesar
        input_path.write_bytes(input_image)
        result = upscale(input_path, output_path)
        
        # Leer resultado
        output_data = output_path.read_bytes()
        
        # Limpieza automática al salir del contexto
        return output_data
```

---

## 📊 Métricas del Flujo

### Tiempos de Procesamiento Típicos

| Resolución Input | Escala | GPU | CPU | Modelo |
|------------------|--------|-----|-----|--------|
| 720p (1280×720) | 2x | ~1s | ~8s | x4plus |
| 1080p (1920×1080) | 2x | ~2s | ~15s | x4plus |
| 1080p (1920×1080) | 4x | ~5s | ~30s | x4plus |
| 4K (3840×2160) | 2x | ~8s | ~60s | x4plus |

### Uso de Recursos

| Componente | CPU | RAM | GPU (VRAM) | Disco |
|------------|-----|-----|------------|-------|
| Frontend | ~5% | ~200 MB | - | ~50 MB cache |
| Backend (idle) | ~1% | ~100 MB | - | - |
| Backend (processing) | ~80% | ~2 GB | ~4 GB | ~100 MB temp |
| Electron | ~3% | ~150 MB | - | - |

---

## 🎯 Próximas Optimizaciones

### En Desarrollo

- [ ] **Batch processing**: Procesar múltiples imágenes en cola
- [ ] **Progress streaming**: Enviar progreso en tiempo real
- [ ] **Model preloading**: Precargar modelos más usados
- [ ] **Result caching**: Cachear resultados de imágenes ya procesadas

### Planificadas

- [ ] **Tiling**: Dividir imágenes grandes en tiles para procesar
- [ ] **Multi-threading**: Procesar múltiples tiles en paralelo
- [ ] **GPU optimization**: Optimizar uso de GPU con TensorRT
- [ ] **Compression**: Comprimir transferencia con gzip/brotli

---

## 📚 Referencias

- **Real-ESRGAN**: [GitHub](https://github.com/xinntao/Real-ESRGAN)
- **Real-ESRGAN-ncnn-vulkan**: [GitHub](https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan)
- **FastAPI**: [Documentación](https://fastapi.tiangolo.com/)
- **Electron**: [Documentación](https://www.electronjs.org/)

---

## 🔗 Documentos Relacionados

- **[Backend Setup](backend/INICIO_RAPIDO.md)**: Configuración del backend
- **[Modelos](backend/MODELOS.md)**: Modelos de IA disponibles
- **[Integración](INTEGRATION.md)**: Frontend-Backend integration
- **[Timeouts](AUMENTAR_TIMEOUT.md)**: Configurar timeouts de procesamiento

---

**Última actualización:** 22 de Noviembre, 2024  
**Versión:** 1.0  
**Autor:** Documentación rIA
