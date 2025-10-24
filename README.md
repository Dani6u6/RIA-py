# rIA - Reescalado Inteligente de Imágenes

Aplicación de escritorio para reescalado de imágenes usando IA, construida con React, Tailwind CSS, Electron y FastAPI.

## 🚀 Características

- 🖼️ Carga de imágenes por drag-and-drop
- 🔄 Comparación interactiva antes/después con slider
- ⚙️ Controles configurables (escala, modelo IA, reducción de ruido)
- 🌓 Modo oscuro
- 📊 Barra de progreso en tiempo real
- 💾 Descarga de imágenes procesadas
- 🎨 Diseño Material UI con Tailwind CSS

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Python 3.8+ (para el backend FastAPI)

## 🛠️ Instalación

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

### Backend (FastAPI + Real-ESRGAN)

El backend usa Real-ESRGAN con Vulkan para procesamiento de IA real.

```bash
# Instalación rápida
cd backend
pip install -r requirements.txt
python setup.py        # Descarga binarios y modelos
python main.py         # Inicia el servidor

# Ver guía completa
# Consulta /backend/INICIO_RAPIDO.md
```

**Documentación del Backend:**
- 📖 [Inicio Rápido](backend/INICIO_RAPIDO.md) - Guía de 3 pasos
- 📖 [README Completo](backend/README.md) - Documentación detallada
- 📖 [Guía de Modelos](backend/MODELOS.md) - Información sobre modelos disponibles
- 📖 [Setup General](BACKEND_SETUP.md) - Guía de instalación paso a paso

## 📁 Estructura del Proyecto

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

## 🎮 Uso

1. **Activar Backend** (opcional):
   - Inicia el backend siguiendo la guía en `backend/INICIO_RAPIDO.md`
   - En la app, activa el switch "Real-ESRGAN (Backend)"
   
2. **Cargar imagen**: Arrastra y suelta una imagen o haz clic en "Seleccionar imagen"

3. **Configurar parámetros**:
   - Modelo de IA (General, Anime, Anime Video 2x/3x/4x)
   - Factor de escala (2x, 3x, 4x)
   - Reducción de ruido (0-100%)

4. **Configuración avanzada**: Haz clic en el ícono de configuración para ajustar:
   - Tipo de reescalado
   - Tamaño de salida
   - Ruta de salida

5. **Procesar**: Haz clic en "Reescalar Imagen"
   - Con backend: Procesamiento real con IA
   - Sin backend: Simulación local en el navegador

6. **Comparar**: Usa el slider para comparar antes/después

7. **Descargar**: Guarda la imagen procesada

## 🔧 Tecnologías Utilizadas

- **Frontend**: React 18, Tailwind CSS 4.0
- **Desktop**: Electron
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Build Tool**: Vite
- **Backend**: Python, FastAPI, Real-ESRGAN (ncnn-vulkan)

### ⚠️ Importante: Tailwind CSS v4.0

Este proyecto usa **Tailwind CSS v4.0**, que NO requiere `tailwind.config.js`. Toda la configuración se maneja en `styles/globals.css` usando la directiva `@theme`. Ver `TAILWIND_CONFIG.md` para más detalles.

## 🌐 Backend de IA Real

La aplicación incluye un backend completo con **Real-ESRGAN** para procesamiento de IA real:

### Características del Backend:
- ✅ **Real-ESRGAN con Vulkan** - Acelerado por GPU
- ✅ **Sin PyTorch** - Usa binarios precompilados (~500MB)
- ✅ **Múltiples modelos** - General, Anime, Anime Video
- ✅ **Setup automático** - Un comando para configurar todo
- ✅ **Fallback automático** - Si el backend no está, usa simulación local

### Inicio Rápido del Backend:
```bash
cd backend
pip install -r requirements.txt
python setup.py
python main.py
```

**Documentación completa**: Ver [`backend/INICIO_RAPIDO.md`](backend/INICIO_RAPIDO.md)

### Uso en la Aplicación:

1. Inicia el backend (pasos arriba)
2. En la app, activa el switch **"Real-ESRGAN (Backend)"**
3. ¡Listo! Ahora usa IA real en lugar de simulación

## 📝 Notas de Desarrollo

- **Modo dual**: La app puede funcionar con o sin backend
- **Simulación local**: Si el backend no está disponible, usa procesamiento en el navegador
- **TypeScript + JavaScript**: UI en TypeScript, lógica en JavaScript
- **Modo oscuro**: Switch en la esquina superior derecha
- **Tailwind v4.0**: Sin config file, todo en `styles/globals.css`

## 📚 Documentación

- **`INSTALACION.md`** - Guía completa de instalación y solución de problemas
- **`TAILWIND_CONFIG.md`** - Explicación de la configuración de Tailwind v4.0
- **`ELECTRON_PYTHON_SETUP.md`** - Configuración de Electron y Python
- **`INTEGRATION.md`** - Integración frontend-backend
- **`RESUMEN_PROYECTO.md`** - Resumen general del proyecto

## 📄 Licencia

MIT

## 👥 Autores

rIA Team
