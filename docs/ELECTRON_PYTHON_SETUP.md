# ⚡ Configuración Electron + Python (FastAPI)

Esta guía te ayudará a ejecutar rIA como una aplicación de escritorio completa con Electron en el frontend y Python/FastAPI en el backend.

---

## 🎯 Arquitectura

```
┌─────────────────────────────────────────┐
│         Aplicación Electron             │
│  ┌───────────────────────────────────┐  │
│  │   React (JavaScript) Frontend     │  │
│  │   - Interfaz de usuario           │  │
│  │   - Tailwind CSS                  │  │
│  │   - Componentes UI                │  │
│  └───────────────┬───────────────────┘  │
│                  │ HTTP/WebSocket        │
│                  ▼                       │
│  ┌───────────────────────────────────┐  │
│  │   Comunicación IPC (preload.js)   │  │
│  └───────────────┬───────────────────┘  │
└──────────────────┼───────────────────────┘
                   │
                   ▼
     ┌────────────────────────────┐
     │  FastAPI Backend (Python)  │
     │  - Modelos de IA           │
     │  - Procesamiento           │
     │  - API REST                │
     └────────────────────────────┘
```

---

## 📋 Requisitos Previos

### Frontend (Electron)
- Node.js 18 o superior
- npm 9 o superior

### Backend (Python)
- Python 3.8 o superior
- pip (gestor de paquetes de Python)

---

## 🚀 Instalación Paso a Paso

### Paso 1: Configurar Frontend

```bash
# En el directorio raíz del proyecto
npm install
```

Esto instalará todas las dependencias necesarias incluyendo:
- React y React DOM
- Electron
- Vite
- Tailwind CSS
- Componentes UI
- Lucide Icons
- Sonner (notificaciones)

### Paso 2: Configurar Backend

```bash
# Ir al directorio del backend
cd backend-example

# Crear entorno virtual de Python
python -m venv venv

# Activar el entorno virtual
# En Windows:
venv\Scripts\activate

# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

---

## ▶️ Ejecución

### Opción 1: Desarrollo (Frontend + Backend)

**Terminal 1 - Backend:**
```bash
cd backend-example
source venv/bin/activate  # o venv\Scripts\activate en Windows
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Deberías ver:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Terminal 2 - Frontend (Electron):**
```bash
# En el directorio raíz
npm run electron-dev
```

Esto iniciará:
1. El servidor de desarrollo de Vite (puerto 5173)
2. La aplicación Electron automáticamente

### Opción 2: Solo Frontend (Sin Backend)

```bash
npm run electron-dev
```

La aplicación funcionará en modo simulación (sin IA real).

---

## 🔗 Integración Frontend-Backend

### Verificar Conectividad

Una vez que ambos estén corriendo, la aplicación verificará automáticamente la conexión con el backend.

**Indicadores en la UI:**
- ✅ "Conectado al backend de IA" → Backend disponible
- ℹ️ "Modo offline - usando simulación local" → Sin backend

### Cambiar de Simulación a Backend Real

La aplicación ya está preparada para usar el backend. Para activarlo completamente:

1. Abre `App.jsx`
2. Importa las utilidades de API:
   ```javascript
   import { upscaleImage, checkBackendHealth } from './utils/api.js';
   ```

3. Sigue las instrucciones en `INTEGRATION.md` para modificar la función `simulateUpscale()`

---

## 🛠️ Configuración Avanzada

### Cambiar Puerto del Backend

**En `backend-example/main.py`:**
```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)  # Cambiar 8000 a 8080
```

**En `utils/api.js`:**
```javascript
const API_BASE_URL = 'http://localhost:8080';  // Actualizar puerto
```

### Habilitar HTTPS (Producción)

**Backend:**
```python
uvicorn.run(
    app,
    host="0.0.0.0",
    port=8000,
    ssl_keyfile="./key.pem",
    ssl_certfile="./cert.pem"
)
```

**Frontend:**
```javascript
const API_BASE_URL = 'https://localhost:8000';
```

### Variables de Entorno

Crea un archivo `.env` en la raíz:

```env
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_DEBUG=true
```

Úsalas en el código:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

---

## 📦 Build para Producción

### Frontend (Electron App)

```bash
# Build de React/Vite
npm run build

# Empaquetar con Electron (requiere electron-builder)
npm install --save-dev electron-builder

# Agregar al package.json:
{
  "scripts": {
    "electron:build": "npm run build && electron-builder"
  },
  "build": {
    "appId": "com.ria.imageupscaler",
    "productName": "rIA",
    "files": [
      "dist/**/*",
      "electron/**/*",
      "package.json"
    ],
    "directories": {
      "buildResources": "assets",
      "output": "release"
    }
  }
}

# Ejecutar build
npm run electron:build
```

### Backend (Ejecutable Python)

**Opción 1: PyInstaller**
```bash
pip install pyinstaller

cd backend-example
pyinstaller --onefile --name ria-backend main.py
```

**Opción 2: Docker**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t ria-backend .
docker run -p 8000:8000 ria-backend
```

---

## 🔧 Estructura de Comunicación

### 1. Electron IPC (Inter-Process Communication)

**Renderer Process (React) → Main Process (Electron):**

```javascript
// En tu componente React
const result = await window.electronAPI.callBackendAPI('/api/upscale', data);
```

**Preload Script:**
```javascript
// electron/preload.js expone APIs seguras
contextBridge.exposeInMainWorld('electronAPI', {
  callBackendAPI: async (endpoint, data) => {
    // Comunicación segura con el backend
  }
});
```

### 2. Backend API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/` | GET | Health check básico |
| `/health` | GET | Estado del servidor |
| `/api/upscale` | POST | Reescalar imagen con IA |
| `/api/models` | POST | Obtener modelos disponibles |

### 3. Flujo de Datos

```
Usuario carga imagen
        ↓
React convierte a Base64
        ↓
Electron IPC (preload.js)
        ↓
HTTP POST a FastAPI
        ↓
FastAPI procesa con IA
        ↓
Retorna imagen procesada
        ↓
Electron recibe respuesta
        ↓
React muestra resultado
```

---

## 🐛 Debugging

### Logs del Frontend

**En Electron:**
```javascript
// Abre DevTools automáticamente
mainWindow.webContents.openDevTools();
```

**En el navegador:**
```bash
npm run dev
# Abre http://localhost:5173
# Usa DevTools del navegador (F12)
```

### Logs del Backend

**FastAPI incluye logs automáticos:**
```
INFO:     127.0.0.1:52345 - "POST /api/upscale HTTP/1.1" 200 OK
```

**Logs personalizados:**
```python
import logging
logger = logging.getLogger(__name__)

logger.info("Procesando imagen...")
logger.error(f"Error: {str(e)}")
```

### Verificar Comunicación

**Test del Backend:**
```bash
curl http://localhost:8000/health
```

**Test desde el Frontend:**
```javascript
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(data => console.log(data));
```

---

## 🔐 Seguridad

### CORS

El backend ya incluye configuración CORS:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ En producción, especificar origen exacto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Para producción:**
```python
allow_origins=[
    "http://localhost:5173",
    "app://.",  # Para Electron
]
```

### Content Security Policy (CSP)

En producción, agregar CSP headers:

```javascript
// electron/main.js
mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ["default-src 'self'"]
    }
  });
});
```

---

## ⚡ Optimizaciones

### Cache de Modelos

```python
# Cargar modelos una sola vez al iniciar
from functools import lru_cache

@lru_cache(maxsize=4)
def load_model(model_name: str):
    # Cargar y retornar modelo
    pass
```

### Procesamiento Asíncrono

```python
from fastapi import BackgroundTasks

@app.post("/api/upscale")
async def upscale_image(
    request: UpscaleRequest,
    background_tasks: BackgroundTasks
):
    # Procesar en background
    background_tasks.add_task(process_image, request)
```

### Pool de Workers

```bash
# Múltiples workers de Uvicorn
uvicorn main:app --workers 4
```

---

## 📊 Monitoreo

### Prometheus + Grafana (Opcional)

```python
from prometheus_client import Counter, Histogram

upscale_requests = Counter('upscale_requests_total', 'Total upscale requests')
upscale_duration = Histogram('upscale_duration_seconds', 'Upscale duration')
```

---

## ❓ Problemas Comunes

### Backend no se conecta

**Verificar:**
1. ¿El backend está corriendo? → `http://localhost:8000/health`
2. ¿El puerto es correcto? → Revisar `utils/api.js`
3. ¿CORS configurado? → Ver logs del backend
4. ¿Firewall bloqueando? → Verificar configuración

### Electron no carga

**Verificar:**
1. ¿Vite está corriendo? → Debe estar en puerto 5173
2. ¿`wait-on` instalado? → `npm install`
3. ¿Puerto ocupado? → `npx kill-port 5173`

### Procesamiento lento

**Optimizar:**
1. Usar GPU si está disponible (PyTorch CUDA)
2. Reducir tamaño de imagen antes de procesar
3. Usar workers múltiples
4. Implementar cache de resultados

---

## 📚 Recursos Adicionales

- [Electron Documentation](https://www.electronjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Uvicorn Deployment](https://www.uvicorn.org/deployment/)
- [Electron Builder](https://www.electron.build/)

---

**¡Todo listo para ejecutar rIA como una aplicación de escritorio profesional!** 🎉
