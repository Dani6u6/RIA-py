# rIA - Reescalado Inteligente de Imágenes

Aplicación de escritorio para reescalado de imágenes usando IA, construida con React, Tailwind CSS, Electron y FastAPI.

##  Características

- 🖼️ Carga de imágenes por drag-and-drop
- 🔄 Comparación interactiva antes/después con slider
- ⚙️ Controles configurables (escala, modelo IA, reducción de ruido)
- 🌓 Modo oscuro
- 📊 Barra de progreso en tiempo real
- 💾 Descarga de imágenes procesadas
- 🎨 Diseño Material UI con Tailwind CSS

##  Requisitos Previos

- Node.js 18+ y npm
- Python 3.8+ (para el backend FastAPI)

##  Instalación

### Frontend (React + Electron)

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar con Electron en modo desarrollo
npm run electron-dev

# Compilar para producción
npm run build
```

### Backend (FastAPI) - Próximamente

El backend de Python con FastAPI se conectará en `http://localhost:8000` y manejará el procesamiento real de IA.

```bash
# En el directorio del backend (crear separadamente)
pip install fastapi uvicorn pillow torch torchvision
uvicorn main:app --reload
```

##  Estructura del Proyecto

```
/
├── electron/           # Archivos de Electron
│   ├── main.js        # Proceso principal de Electron
│   └── preload.js     # Script de preload para IPC
├── components/        # Componentes React
│   ├── ImageComparison.jsx
│   ├── ImageUploader.jsx
│   ├── UpscaleControls.jsx
│   └── ui/           # Componentes UI de shadcn
├── styles/           # Estilos globales
│   └── globals.css   # Configuración de Tailwind
├── App.jsx           # Componente principal
├── main.jsx          # Punto de entrada React
├── index.html        # HTML base
├── vite.config.js    # Configuración de Vite
└── package.json      # Dependencias y scripts
```

##  Uso

1. **Cargar imagen**: Arrastra y suelta una imagen o haz clic en "Seleccionar imagen"
2. **Configurar parámetros**:
   - Modelo de IA (General, Fotografía, Anime, Rostros)
   - Factor de escala (2x, 3x, 4x)
   - Reducción de ruido (0-100%)
3. **Configuración avanzada**: Haz clic en el ícono de configuración para ajustar:
   - Tipo de reescalado
   - Tamaño de salida
   - Ruta de salida
4. **Procesar**: Haz clic en "Reescalar Imagen"
5. **Comparar**: Usa el slider para comparar antes/después
6. **Descargar**: Guarda la imagen procesada

##  Tecnologías Utilizadas

- **Frontend**: React 18, Tailwind CSS 4.0
- **Desktop**: Electron
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Build Tool**: Vite
- **Backend** (próximamente): Python, FastAPI

##  Integración con Backend

La aplicación está preparada para integrarse con un backend FastAPI. El archivo `electron/preload.js` incluye una función `callBackendAPI` lista para usar:

```javascript
// Ejemplo de uso en el frontend
const result = await window.electronAPI.callBackendAPI('/upscale', {
  image: imageData,
  scale: 2,
  model: 'general'
});
```

##  Notas de Desarrollo

- La funcionalidad de IA actualmente está simulada en el frontend
- Para producción, implementar el backend de FastAPI con modelos de IA reales (ESRGAN, Real-ESRGAN, etc.)
- Los componentes UI están en TypeScript pero la aplicación principal está en JavaScript
- El modo oscuro se activa con el switch en la esquina superior derecha

##  Licencia

MIT

##  Autores

rIA Team: Dani, José, Julio y Juan Carlos
