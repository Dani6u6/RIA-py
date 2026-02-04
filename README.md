# rIA - Reescalado Inteligente de Imágenes

Aplicación de escritorio para reescalado de imágenes usando IA, construida con React, Tailwind CSS, Electron y FastAPI.

## Características

- 🖼️ Carga de imágenes por drag-and-drop
- 🔄 Comparación interactiva antes/después con slider draggable
- 🔍 Zoom + Pan para inspección detallada
- ⚙️ Controles configurables (escala, modelo IA)
- 📊 **Métricas NIQE de calidad automáticas** (con backend)
- 🌓 Modo oscuro
- 📊 Barra de progreso en tiempo real
- 💾 Descarga de imágenes procesadas
- 🎨 Diseño Material UI con Tailwind CSS
- 🖥️ Backend Real-ESRGAN opcional (IA real)

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


## 🆘 Solución de Problemas

- **Instalación**: Ver [docs/INSTALACION.md](docs/INSTALACION.md)
- **Backend no funciona**: Ver [docs/DIAGNOSTICO_BACKEND.md](docs/DIAGNOSTICO_BACKEND.md)
- **Timeout de procesamiento**: Ver [docs/AUMENTAR_TIMEOUT.md](docs/AUMENTAR_TIMEOUT.md)
- **Configuración general**: Ver [docs/CONFIGURACION_COMPLETA.md](docs/CONFIGURACION_COMPLETA.md)

---

## 💻 Sistemas Operativos Compatibles

### ✅ Soportados
- **Windows** 10/11 (64-bit)
- **macOS** 10.13 (High Sierra) o superior
- **Linux** (Ubuntu 18.04+, Fedora 32+, Debian 10+)

### ⚠️ Notas
- Se requiere arquitectura x64 (64-bit)
- ARM64/Apple Silicon soportado en macOS con Rosetta 2

---

## 🖥️ Requisitos de Hardware

### Mínimos

| Componente | Requisito Mínimo |
|------------|------------------|
| **CPU** | Intel Core i3 / AMD Ryzen 3 (2 núcleos, 4 hilos) |
| **RAM** | 4 GB |
| **Almacenamiento** | 2 GB libres (500 MB app + 1.5 GB modelos) |
| **GPU** | Vulkan 1.0 compatible (integrada) |
| **Pantalla** | 1280x720 (HD) |

### Recomendados

| Componente | Requisito Recomendado |
|------------|----------------------|
| **CPU** | Intel Core i5 / AMD Ryzen 5 (4 núcleos, 8 hilos) o superior |
| **RAM** | 8 GB o más |
| **Almacenamiento** | 5 GB libres (SSD recomendado) |
| **GPU** | GPU dedicada con Vulkan 1.2+ (NVIDIA GTX 1050, AMD RX 560 o superior) |
| **Pantalla** | 1920x1080 (Full HD) o superior |

### Para Procesamiento Óptimo

| Componente | Requisito Óptimo |
|------------|-----------------|
| **CPU** | Intel Core i7 / AMD Ryzen 7 (6+ núcleos) |
| **RAM** | 16 GB |
| **Almacenamiento** | 10 GB libres en SSD NVMe |
| **GPU** | NVIDIA RTX 2060 / AMD RX 5700 o superior |
| **VRAM** | 4 GB o más |

---


## 📄 Licencia

MIT

## 👥 Autores

rIA Team

---

**Versión actual:** 32  
**Última actualización:** 10 de Noviembre, 2025

Para más información, consulta la [documentación completa](docs/README.md).
