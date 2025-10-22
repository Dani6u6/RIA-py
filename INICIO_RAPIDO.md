#  Inicio Rápido - rIA

## Instalación y Ejecución en 3 Pasos

### 1️⃣ Instalar Dependencias

```bash
npm install
```

### 2️⃣ Ejecutar la Aplicación

#### Opción A: Modo Web (Navegador)
```bash
npm run dev
```
Abre tu navegador en `http://localhost:5173`

#### Opción B: Modo Desktop (Electron)
```bash
npm run electron-dev
```
Se abrirá automáticamente la ventana de la aplicación.

### 3️⃣ ¡Listo! 

Ya puedes usar rIA:
- Arrastra y suelta una imagen
- Configura los parámetros (escala, modelo, etc.)
- Click en "Reescalar Imagen"
- Compara el resultado con el slider
- Descarga tu imagen mejorada

---

##  Comandos Disponibles

```bash
# Desarrollo web
npm run dev

# Desarrollo Electron
npm run electron-dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

---

##  ¿Qué está instalado?

- ✅ React 18 con JavaScript
- ✅ Tailwind CSS 4.0
- ✅ Componentes UI (shadcn/ui)
- ✅ Iconos (Lucide React)
- ✅ Notificaciones (Sonner)
- ✅ Electron (listo para desktop)
- ✅ Vite (build tool ultra rápido)

---

##  Modo Actual

**Simulación Frontend**: La aplicación actualmente simula el procesamiento de IA en el navegador usando Canvas API. Los resultados son un simple reescalado con filtros básicos.

**Para IA Real**: Consulta el archivo `INTEGRATION.md` para conectar con el backend de FastAPI que incluye procesamiento real con modelos de IA.

---

##  Problemas Comunes

### Error: Puerto 5173 en uso
```bash
# Mata el proceso que usa el puerto
npx kill-port 5173
# O cambia el puerto en vite.config.js
```

### Error: node_modules no encontrado
```bash
# Reinstala las dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: Electron no inicia
```bash
# Asegúrate de que el servidor de desarrollo esté corriendo primero
npm run dev
# En otra terminal:
npm run electron
```

---

##  Documentación Completa

- `README.md` - Información general del proyecto
- `INTEGRATION.md` - Cómo integrar el backend de IA
- `backend-example/` - Código de ejemplo del backend FastAPI

---

##  Personalización

### Cambiar Colores
Edita `/styles/globals.css` para modificar el tema:
```css
:root {
  --primary: #tu-color;
  --background: #otro-color;
}
```

### Agregar Funcionalidades
Los componentes principales están en:
- `/App.jsx` - Componente principal
- `/components/` - Componentes reutilizables
- `/utils/api.js` - Comunicación con backend

---

##  Siguiente Nivel

1. **Conectar Backend Real** → Ver `INTEGRATION.md`
2. **Desplegar Producción** → `npm run build`
3. **Empaquetar Electron** → Configurar electron-builder
4. **Agregar Más Modelos** → Extender el backend con más opciones

---

**¿Necesitas ayuda?** Revisa la documentación o abre un issue en el repositorio.

**¡Feliz reescalado! 🎨✨**
