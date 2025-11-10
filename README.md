# rIA - Reescalado Inteligente de Imágenes

Aplicación de escritorio para reescalado de imágenes usando IA, construida con React, Tailwind CSS, Electron y FastAPI.

## 🚀 Características

- 🖼️ Carga de imágenes por drag-and-drop
- 🔄 Comparación interactiva antes/después con slider draggable
- 🔍 Zoom + Pan para inspección detallada
- ⚙️ Controles configurables (escala, modelo IA)
- 🌓 Modo oscuro
- 📊 Barra de progreso en tiempo real
- 💾 Descarga de imágenes procesadas
- 🎨 Diseño Material UI con Tailwind CSS
- 🖥️ Backend Real-ESRGAN opcional (IA real)

## 📋 Inicio Rápido

### Frontend (React + Electron)

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar con Electron
npm run electron-dev
```

### Backend (FastAPI + Real-ESRGAN) - Opcional

```bash
cd backend
pip install -r requirements.txt
python setup.py        # Descarga binarios y modelos
python main.py         # Inicia el servidor
```

**Ver guía completa**: [`docs/backend/INICIO_RAPIDO.md`](docs/backend/INICIO_RAPIDO.md)

## 📁 Estructura del Proyecto

```
/
├── components/        # Componentes React
│   ├── ImageComparison.jsx      # Comparador con zoom + pan
│   ├── ImageUploader.jsx        # Cargador drag-and-drop
│   ├── UpscaleControls.jsx      # Controles de reescalado
│   ├── BackendStatusDialog.jsx  # Estado del backend
│   └── ui/                      # Componentes shadcn/ui
├── backend/           # Backend FastAPI + Real-ESRGAN
│   ├── main.py                  # API principal
│   ├── upscale_service.py       # Servicio de IA
│   └── config.py                # Configuración
├── docs/              # 📚 Documentación completa
│   ├── README.md                # Índice de docs
│   ├── INSTALACION.md           # Guía de instalación
│   ├── backend/                 # Docs del backend
│   └── ...                      # Más documentación
├── electron/          # Archivos de Electron
├── styles/            # Estilos globales (Tailwind v4.0)
├── utils/             # Utilidades (API, scripts)
├── App.jsx            # Componente principal
├── main.jsx           # Punto de entrada React
└── package.json       # Dependencias y scripts
```

## 🎮 Uso

1. **Activar Backend** (opcional):
   - Inicia el backend: `cd backend && python main.py`
   - En la app, activa el switch "Real-ESRGAN (Backend)" en UpscaleControls
   
2. **Cargar imagen**: Arrastra y suelta o haz clic en "Seleccionar imagen"

3. **Configurar parámetros**:
   - Modelo de IA (General, Anime, Anime Video 2x/3x/4x)
   - Factor de escala (2x, 3x, 4x)

4. **Procesar**: Haz clic en "Reescalar Imagen"
   - Con backend: Procesamiento real con IA
   - Sin backend: Simulación local en el navegador

5. **Comparar**: 
   - Arrastra el círculo blanco para comparar antes/después
   - Usa los botones de zoom para inspeccionar detalles
   - Con zoom activo, arrastra la imagen para navegar

6. **Descargar**: Guarda la imagen procesada

## 🔧 Tecnologías

- **Frontend**: React 18, Tailwind CSS 4.0, Vite
- **Desktop**: Electron
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **Backend**: Python, FastAPI, Real-ESRGAN (ncnn-vulkan)

## 📚 Documentación

### 📖 General
- **[Índice de Documentación](docs/README.md)** - Punto de entrada a toda la documentación
- **[Instalación](docs/INSTALACION.md)** - Guía completa de instalación
- **[Checklist](docs/CHECKLIST.md)** - Lista de verificación del proyecto
- **[Cambios Recientes](docs/CAMBIOS_RECIENTES.md)** - Últimas actualizaciones

### 🎨 Interfaz
- **[Interfaz Compactada](docs/INTERFAZ_COMPACTADA.md)** - UI 50% más compacta (v32)
- **[Mejoras Image Comparison](docs/MEJORAS_IMAGE_COMPARISON.md)** - Handle draggable + Pan con zoom
- **[Layout Responsivo](docs/LAYOUT_RESPONSIVO.md)** - Sistema responsive

### 🔌 Backend
- **[Backend - Inicio Rápido](docs/backend/INICIO_RAPIDO.md)** - Guía de 3 pasos
- **[Backend - README](docs/backend/README.md)** - Documentación completa
- **[Backend - Modelos](docs/backend/MODELOS.md)** - Modelos de IA disponibles
- **[Backend Setup](docs/BACKEND_SETUP.md)** - Instalación paso a paso
- **[Diagnóstico Backend](docs/DIAGNOSTICO_BACKEND.md)** - Solución de problemas

### ⚙️ Configuración
- **[Configuración Completa](docs/CONFIGURACION_COMPLETA.md)** - Todas las configuraciones
- **[Tailwind Config](docs/TAILWIND_CONFIG.md)** - Tailwind CSS v4.0 (sin config file)
- **[Electron + Python](docs/ELECTRON_PYTHON_SETUP.md)** - Setup de Electron
- **[Aumentar Timeout](docs/AUMENTAR_TIMEOUT.md)** - Configurar timeouts de procesamiento

### 🔗 Integración
- **[Integration](docs/INTEGRATION.md)** - Frontend-Backend integration
- **[Resumen Proyecto](docs/RESUMEN_PROYECTO.md)** - Resumen general

## 🆕 Novedades - Versión 32

### ✨ Interfaz 50% Más Compacta
- ✅ Eliminado control de denoise (no funcional con ncnn-vulkan)
- ✅ Toggle de backend integrado en UpscaleControls
- ✅ Estado del backend movido a modal accesible desde header
- ✅ Solo 2 elementos principales en lugar de 4 cards

### 🎯 Comparador Mejorado
- ✅ **Handle draggable**: Arrastra el círculo blanco para comparar
- ✅ **Pan con zoom**: Navega la imagen cuando está con zoom
- ✅ Cursors dinámicos (grab/grabbing/ew-resize)
- ✅ Indicadores contextuales
- ✅ Soporte completo touch/móvil

### 🖥️ Modal de Diagnóstico
- ✅ BackendStatusDialog con troubleshooting integrado
- ✅ Auto-refresh al abrir
- ✅ Lista de modelos disponibles
- ✅ Comandos rápidos

Ver detalles: [INTERFAZ_COMPACTADA.md](docs/INTERFAZ_COMPACTADA.md) y [MEJORAS_IMAGE_COMPARISON.md](docs/MEJORAS_IMAGE_COMPARISON.md)

## ⚠️ Importante: Tailwind CSS v4.0

Este proyecto usa **Tailwind CSS v4.0**, que NO requiere `tailwind.config.js`. 

Toda la configuración se maneja en `styles/globals.css` usando la directiva `@theme`.

**Ver**: [`docs/TAILWIND_CONFIG.md`](docs/TAILWIND_CONFIG.md)

## 🌐 Backend de IA Real

La aplicación puede funcionar con o sin backend:

- **Sin backend**: Simulación local en el navegador
- **Con backend**: Real-ESRGAN con IA real y aceleración GPU

### Características del Backend:
- ✅ Real-ESRGAN con Vulkan (acelerado por GPU)
- ✅ Sin PyTorch (usa binarios precompilados ~500MB)
- ✅ 5 modelos: General, Anime, Anime Video (2x/3x/4x)
- ✅ Setup automático con un comando
- ✅ Fallback automático a simulación si no está disponible

**Guía rápida**: [`docs/backend/INICIO_RAPIDO.md`](docs/backend/INICIO_RAPIDO.md)

## 🆘 Solución de Problemas

- **Instalación**: Ver [docs/INSTALACION.md](docs/INSTALACION.md)
- **Backend no funciona**: Ver [docs/DIAGNOSTICO_BACKEND.md](docs/DIAGNOSTICO_BACKEND.md)
- **Timeout de procesamiento**: Ver [docs/AUMENTAR_TIMEOUT.md](docs/AUMENTAR_TIMEOUT.md)
- **Configuración general**: Ver [docs/CONFIGURACION_COMPLETA.md](docs/CONFIGURACION_COMPLETA.md)

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo con Vite
npm run build        # Compilar producción
npm run electron-dev # Electron en desarrollo
npm run preview      # Preview de producción
```

## 📄 Licencia

MIT

## 👥 Autores

rIA Team

---

**Versión actual:** 32  
**Última actualización:** 10 de Noviembre, 2025

Para más información, consulta la [documentación completa](docs/README.md).
