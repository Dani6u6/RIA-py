# 🚀 Guía de Instalación - rIA

## Requisitos Previos

- **Node.js** v18 o superior
- **npm** v9 o superior (incluido con Node.js)
- **Python** 3.8+ (para el backend, opcional)

## 📦 Instalación

### 1. Instalar dependencias de Node.js

```bash
npm install
```

Este comando instalará todas las dependencias necesarias, incluyendo:
- React 18
- Tailwind CSS v4.0 con el plugin de PostCSS
- Componentes de ShadCN UI
- Lucide React (iconos)
- Electron (para aplicación de escritorio)
- Y más...

### 2. Verificar la instalación de Tailwind

Después de `npm install`, deberías tener:

✅ `node_modules/tailwindcss` - Tailwind CSS v4.0
✅ `node_modules/@tailwindcss/postcss` - Plugin de PostCSS para Tailwind v4.0
✅ `postcss.config.js` - Configuración de PostCSS
✅ `styles/globals.css` - Estilos y configuración de tema

**NOTA**: En Tailwind v4.0 NO necesitas un archivo `tailwind.config.js`. Ver `TAILWIND_CONFIG.md` para más detalles.

## 🏃 Ejecutar la aplicación

### Modo desarrollo (solo web)

```bash
npm run dev
```

Esto iniciará el servidor de desarrollo de Vite en `http://localhost:5173`

### Modo Electron (aplicación de escritorio)

```bash
npm run electron-dev
```

Este comando:
1. Inicia el servidor de desarrollo de Vite
2. Espera a que esté listo
3. Lanza la aplicación Electron

### Vista previa de producción

```bash
npm run build
npm run preview
```

## 🐍 Backend (Opcional)

Si deseas integrar el backend de Python/FastAPI:

### 1. Navegar a la carpeta del backend

```bash
cd backend-example
```

### 2. Crear un entorno virtual

```bash
python -m venv venv
```

### 3. Activar el entorno virtual

**En Windows:**
```bash
venv\Scripts\activate
```

**En macOS/Linux:**
```bash
source venv/bin/activate
```

### 4. Instalar dependencias de Python

```bash
pip install -r requirements.txt
```

### 5. Ejecutar el servidor FastAPI

```bash
uvicorn main:app --reload
```

El backend estará disponible en `http://localhost:8000`

## 🔧 Solución de problemas

### Error: "Cannot find module 'tailwindcss'"

```bash
npm install
```

### Error de PostCSS

Asegúrate de que exista el archivo `postcss.config.js` en la raíz del proyecto.

### Tailwind no aplica estilos

1. Verifica que `styles/globals.css` comience con `@import "tailwindcss";`
2. Verifica que `main.jsx` importe el CSS: `import './styles/globals.css';`
3. Reinicia el servidor de desarrollo

### Electron no inicia

Asegúrate de que el puerto 5173 no esté en uso por otra aplicación.

```bash
# Matar procesos en puerto 5173 (Linux/macOS)
lsof -ti:5173 | xargs kill -9

# En Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

## 📁 Estructura del proyecto

```
ria-image-upscaler/
├── components/           # Componentes React
│   ├── ImageUploader.jsx
│   ├── ImageComparison.jsx
│   ├── UpscaleControls.jsx
│   └── ui/              # Componentes ShadCN UI
├── electron/            # Configuración de Electron
│   ├── main.js
│   └── preload.js
├── styles/
│   └── globals.css      # Estilos y configuración Tailwind v4.0
├── utils/
│   └── api.js           # Utilidades para llamadas API
├── backend-example/     # Backend FastAPI (Python)
├── App.jsx              # Componente principal
├── main.jsx             # Punto de entrada React
├── index.html           # HTML base
├── postcss.config.js    # Config PostCSS (para Tailwind)
├── vite.config.js       # Config Vite
└── package.json         # Dependencias y scripts
```

## 🎯 Próximos pasos

1. ✅ Instalar dependencias
2. ✅ Ejecutar en modo desarrollo
3. 📸 Probar cargando una imagen
4. ⚙️ Ajustar configuración de reescalado
5. 🚀 Procesar imagen
6. 💾 Descargar resultado

## 📚 Documentación adicional

- `TAILWIND_CONFIG.md` - Guía de configuración de Tailwind v4.0
- `ELECTRON_PYTHON_SETUP.md` - Configuración de Electron y Python
- `INTEGRATION.md` - Integración frontend-backend
- `README.md` - Información general del proyecto

## 💬 Soporte

Si encuentras algún problema:

1. Verifica que todas las dependencias estén instaladas
2. Revisa los logs de la consola
3. Consulta la documentación en los archivos `.md`
4. Asegúrate de usar Node.js v18+
