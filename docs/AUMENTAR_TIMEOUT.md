# 🕐 Aumentar Timeout de Procesamiento

## 📍 Ubicaciones del Límite de 300s

El timeout de 300 segundos (5 minutos) está configurado en **3 lugares** que debes modificar:

---

## 1️⃣ Backend Config - `/backend/config.py`

**Línea 89:**
```python
# Tiempo máximo de procesamiento (segundos)
PROCESSING_TIMEOUT = 300
```

### ✏️ Cambiar a (ejemplo: 10 minutos):
```python
# Tiempo máximo de procesamiento (segundos)
PROCESSING_TIMEOUT = 600  # 10 minutos
```

### ✏️ O sin límite:
```python
# Tiempo máximo de procesamiento (segundos)
PROCESSING_TIMEOUT = None  # Sin límite
```

---

## 2️⃣ API Client (Frontend) - `/utils/api.js`

**Actualmente NO tiene timeout explícito**, pero los navegadores tienen límites por defecto (~2-5 minutos).

### ✏️ Agregar después de la línea 38:

```javascript
export async function upscaleImageWithBackend(imageBase64, options = {}) {
  const {
    scale = 2,
    model = 'general',
    denoiseStrength = 50,
    upscaleType = 'AI Enhanced'
  } = options;

  try {
    // Crear AbortController para timeout personalizado
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutos

    const response = await fetch(`${API_BASE_URL}/api/upscale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,  // AGREGAR ESTA LÍNEA
      body: JSON.stringify({
        image: imageBase64,
        scale,
        model,
        denoise_strength: denoiseStrength,
        upscale_type: upscaleType
      })
    });

    clearTimeout(timeoutId); // Limpiar timeout si se completa

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    // ... resto del código
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Timeout: El procesamiento tomó más de 10 minutos');
    }
    console.error('Error al llamar al backend:', error);
    throw error;
  }
}
```

---

## 3️⃣ Uvicorn Server (Servidor HTTP) - `/backend/main.py`

**Línea 336** (al final):

```python
if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Iniciando servidor en {API_HOST}:{API_PORT}")
    uvicorn.run(
        "main:app",
        host=API_HOST,
        port=API_PORT,
        reload=API_RELOAD,
        log_level="info"
    )
```

### ✏️ Agregar timeout a uvicorn:

```python
if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Iniciando servidor en {API_HOST}:{API_PORT}")
    uvicorn.run(
        "main:app",
        host=API_HOST,
        port=API_PORT,
        reload=API_RELOAD,
        log_level="info",
        timeout_keep_alive=600,  # AGREGAR: 10 minutos
        timeout_graceful_shutdown=30  # AGREGAR: 30 segundos para shutdown
    )
```

---

## 🚀 Valores Recomendados según Uso

### Para imágenes GRANDES (4K+):

```python
# backend/config.py
PROCESSING_TIMEOUT = 1800  # 30 minutos

# utils/api.js
setTimeout(() => controller.abort(), 1800000)  // 30 minutos

# backend/main.py
timeout_keep_alive=1800  # 30 minutos
```

### Para imágenes NORMALES (1080p):

```python
# backend/config.py
PROCESSING_TIMEOUT = 600  # 10 minutos

# utils/api.js
setTimeout(() => controller.abort(), 600000)  // 10 minutos

# backend/main.py
timeout_keep_alive=600  # 10 minutos
```

### SIN LÍMITE (no recomendado):

```python
# backend/config.py
PROCESSING_TIMEOUT = None  # Sin límite

# utils/api.js
# No agregar AbortController

# backend/main.py
timeout_keep_alive=None  # Sin límite
```

---

## 📝 Pasos para Aplicar los Cambios

### Opción 1: Cambio Rápido (solo backend config)

```bash
# 1. Editar archivo
nano backend/config.py

# 2. Cambiar línea 89:
PROCESSING_TIMEOUT = 600  # 10 minutos

# 3. Reiniciar backend
cd backend
python main.py
```

### Opción 2: Cambio Completo (recomendado)

```bash
# 1. Modificar los 3 archivos:
#    - backend/config.py (línea 89)
#    - utils/api.js (función upscaleImageWithBackend)
#    - backend/main.py (línea 336)

# 2. Reiniciar backend
cd backend
# Ctrl+C si está corriendo
python main.py

# 3. Reiniciar frontend
npm run dev
```

---

## 🔍 Verificar que Funciona

### Test 1: Ver timeout en logs

```bash
# Iniciar backend con logs visibles
cd backend
python main.py

# Debería mostrar:
# INFO: Uvicorn running with timeout_keep_alive=600
```

### Test 2: Procesar imagen grande

```javascript
// En la consola del navegador (F12)
console.log("Timeout configurado:", 600000, "ms");

// Al procesar, debería tomar más de 5 minutos sin error
```

---

## ⚠️ Consideraciones Importantes

### 1. Límites del Navegador

Los navegadores tienen límites propios:
- **Chrome/Edge**: ~5-10 minutos
- **Firefox**: ~5 minutos
- **Safari**: ~2-3 minutos

**Solución:** Usar `AbortController` con timeout personalizado (ya mostrado arriba).

### 2. Memoria RAM

Procesar imágenes grandes consume mucha RAM:
- **4K (3840×2160)**: ~2-4 GB RAM
- **8K (7680×4320)**: ~8-16 GB RAM

**Solución:** Usar `tile_size` para procesar en bloques:

```python
# backend/upscale_service.py
output_path = service.upscale(
    input_path=temp_input_path,
    scale=request.scale,
    model=request.model,
    denoise_strength=denoise,
    tile_size=512  # Procesar en tiles de 512×512
)
```

### 3. Timeout vs Hang

Si el proceso se "cuelga" (no avanza):
- ✅ **Timeout largo**: Permite que termine
- ❌ **Sin timeout**: Puede quedar colgado para siempre

**Recomendación:** Usar timeout largo pero no infinito (ejemplo: 30 minutos).

---

## 🐛 Problemas Comunes

### Problema 1: Sigue fallando a los 5 minutos

**Causa:** El frontend tiene timeout del navegador

**Solución:**
```javascript
// Agregar AbortController en api.js como se mostró arriba
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 600000);
```

### Problema 2: "Connection reset" o "Connection closed"

**Causa:** Uvicorn cierra la conexión

**Solución:**
```python
# Agregar en main.py
timeout_keep_alive=600,
timeout_graceful_shutdown=30
```

### Problema 3: Backend responde pero imagen no se muestra

**Causa:** La respuesta es muy grande para la conexión HTTP

**Solución:**
```python
# En backend/config.py, reducir tamaño máximo
MAX_IMAGE_SIZE = 3072  # En lugar de 4096
```

---

## 📊 Tabla de Referencia Rápida

| Tamaño Imagen | Tiempo Típico | Timeout Recomendado |
|---------------|---------------|---------------------|
| 1080p         | 30-90s        | 300s (5 min)        |
| 2K            | 1-3 min       | 600s (10 min)       |
| 4K            | 3-10 min      | 1200s (20 min)      |
| 8K            | 10-30 min     | 1800s (30 min)      |

---

## 🎯 Configuración Recomendada Final

### Para uso general (1080p - 4K):

#### `/backend/config.py` (línea 89):
```python
PROCESSING_TIMEOUT = 900  # 15 minutos
```

#### `/utils/api.js` (línea 39):
```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 900000); // 15 minutos

const response = await fetch(`${API_BASE_URL}/api/upscale`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  signal: controller.signal,
  body: JSON.stringify({
    image: imageBase64,
    scale,
    model,
    denoise_strength: denoiseStrength,
    upscale_type: upscaleType
  })
});

clearTimeout(timeoutId);
```

#### `/backend/main.py` (línea 340):
```python
uvicorn.run(
    "main:app",
    host=API_HOST,
    port=API_PORT,
    reload=API_RELOAD,
    log_level="info",
    timeout_keep_alive=900,
    timeout_graceful_shutdown=30
)
```

---

## ✅ Checklist de Verificación

Después de aplicar los cambios:

- [ ] ✏️ Modificado `backend/config.py` línea 89
- [ ] ✏️ Modificado `utils/api.js` función `upscaleImageWithBackend`
- [ ] ✏️ Modificado `backend/main.py` línea 336
- [ ] 🔄 Backend reiniciado
- [ ] 🔄 Frontend reiniciado
- [ ] 🧪 Probado con imagen grande
- [ ] 📋 Verificado logs del backend
- [ ] ✅ Procesamiento completa sin timeout

---

**Nota:** Si solo quieres hacer un cambio rápido sin editar código, modifica **solo** el archivo `backend/config.py` y reinicia el backend. Eso debería ser suficiente para la mayoría de casos.
