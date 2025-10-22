# Guía de Integración Backend-Frontend

Esta guía explica cómo integrar el backend de FastAPI con el frontend de React/Electron.

## 🔧 Configuración Actual

Actualmente, la aplicación funciona completamente en el frontend con una simulación del procesamiento de IA. Para integrar con un backend real de Python/FastAPI, sigue estos pasos:

## 📝 Pasos para Integrar el Backend

### 1. Iniciar el Backend

```bash
cd backend-example
python -m venv venv
source venv/bin/activate  # o venv\Scripts\activate en Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

El backend estará disponible en `http://localhost:8000`

### 2. Modificar App.jsx para Usar el Backend

Importa las utilidades de API en `App.jsx`:

```javascript
import { upscaleImage, checkBackendHealth } from './utils/api.js';
```

### 3. Reemplazar la Función simulateUpscale

Reemplaza el código actual de `simulateUpscale` en `App.jsx` con esta versión que usa el backend:

```javascript
const simulateUpscale = async () => {
  if (!originalImage) {
    console.log("No hay imagen original");
    return;
  }

  console.log("Iniciando procesamiento...");
  setIsProcessing(true);
  setProgress(0);

  try {
    // Verificar si el backend está disponible
    const backendAvailable = await checkBackendHealth();
    
    if (!backendAvailable) {
      toast.warning("Backend no disponible, usando simulación local");
      // Usar la lógica de simulación actual como fallback
      // ... código de simulación existente ...
      return;
    }

    // Simular progreso mientras se procesa
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 90));
    }, 200);

    // Llamar al backend real
    const result = await upscaleImage(originalImage, {
      scale,
      model,
      denoiseStrength,
      upscaleType
    });

    clearInterval(progressInterval);
    setProgress(100);

    if (result.success) {
      setUpscaledImage(result.image);
      setIsProcessing(false);
      setRenderKey(prev => prev + 1);
      toast.success(`¡Reescalado completado! ${result.width}x${result.height}`);
    } else {
      throw new Error(result.message || 'Error al procesar');
    }
    
  } catch (error) {
    console.error("Error durante el procesamiento:", error);
    setIsProcessing(false);
    toast.error(`Error: ${error.message}`);
  }
};
```

### 4. Agregar Verificación de Backend al Inicio

Agrega este useEffect en `App.jsx` para verificar el backend al iniciar:

```javascript
useEffect(() => {
  // Verificar backend al iniciar
  checkBackendHealth().then(available => {
    if (available) {
      toast.success("Conectado al backend de IA");
    } else {
      toast.info("Modo offline - usando simulación local");
    }
  });
}, []);
```

## 🔄 Modo Híbrido (Recomendado)

Para tener lo mejor de ambos mundos, puedes mantener ambas implementaciones:

1. **Backend disponible**: Usar el procesamiento real de IA
2. **Backend no disponible**: Usar la simulación local

Esto permite que la app funcione sin el backend pero aproveche la IA cuando esté disponible.

```javascript
const simulateUpscale = async () => {
  if (!originalImage) return;

  setIsProcessing(true);
  setProgress(0);

  try {
    // Intentar usar backend primero
    const backendAvailable = await checkBackendHealth();
    
    if (backendAvailable) {
      // MODO BACKEND
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      const result = await upscaleImage(originalImage, {
        scale, model, denoiseStrength, upscaleType
      });

      clearInterval(progressInterval);
      setProgress(100);
      setUpscaledImage(result.image);
      setIsProcessing(false);
      setRenderKey(prev => prev + 1);
      toast.success("¡Reescalado con IA completado!");
    } else {
      // MODO SIMULACIÓN (código actual)
      toast.info("Usando simulación local");
      // ... resto del código de simulación actual ...
    }
  } catch (error) {
    console.error("Error:", error);
    setIsProcessing(false);
    toast.error(`Error: ${error.message}`);
  }
};
```

## 🚀 Características Avanzadas

### Progreso en Tiempo Real

Para mostrar progreso real del backend, implementa WebSockets:

1. En el backend (FastAPI):
```python
from fastapi import WebSocket

@app.websocket("/ws/progress/{task_id}")
async def websocket_progress(websocket: WebSocket, task_id: str):
    await websocket.accept()
    # Enviar actualizaciones de progreso
```

2. En el frontend:
```javascript
const ws = new WebSocket(`ws://localhost:8000/ws/progress/${taskId}`);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  setProgress(data.progress);
};
```

### Procesamiento por Lotes

Permitir subir múltiples imágenes:

```javascript
const processBatch = async (images) => {
  for (const image of images) {
    await upscaleImage(image, options);
  }
};
```

### Cache de Resultados

Guardar resultados procesados para evitar reprocesar:

```javascript
const cache = new Map();

const upscaleWithCache = async (imageData, options) => {
  const cacheKey = `${imageData.substring(0, 100)}_${JSON.stringify(options)}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const result = await upscaleImage(imageData, options);
  cache.set(cacheKey, result);
  return result;
};
```

## 🔒 Consideraciones de Seguridad

1. **Validación**: Validar tamaño y tipo de imagen antes de enviar
2. **Rate Limiting**: Implementar límites de peticiones
3. **CORS**: Configurar correctamente en producción
4. **Autenticación**: Agregar si es necesario para API pública

## 📊 Monitoreo y Logs

Agregar logging para debugging:

```javascript
const logUpscaleRequest = (options) => {
  console.log('[UPSCALE]', {
    timestamp: new Date().toISOString(),
    model: options.model,
    scale: options.scale,
    imageSize: options.imageSize
  });
};
```

## 🎯 Próximos Pasos

1. ✅ Configurar backend FastAPI
2. ✅ Probar integración básica
3. ⬜ Implementar modelos de IA reales (Real-ESRGAN, etc.)
4. ⬜ Agregar WebSockets para progreso en tiempo real
5. ⬜ Implementar cache y optimizaciones
6. ⬜ Agregar tests
7. ⬜ Preparar para producción

## 📚 Recursos

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN)
- [Electron IPC](https://www.electronjs.org/docs/latest/api/ipc-main)
- [React Best Practices](https://react.dev/)
