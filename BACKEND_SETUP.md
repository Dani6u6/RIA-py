# Configuración del Backend rIA - Real-ESRGAN

Esta guía te ayudará a configurar el backend de Real-ESRGAN con Vulkan para la aplicación rIA.

## Requisitos Previos

- **Python 3.8+** instalado en tu sistema
- **Vulkan drivers** instalados (generalmente incluidos en drivers de GPU modernos)
- **~500 MB** de espacio libre para binarios y modelos

## Instalación Rápida

### Windows

1. Abre PowerShell o CMD en la carpeta `backend`:
```cmd
cd backend
```

2. Instala las dependencias de Python:
```cmd
pip install -r requirements.txt
```

3. Descarga los binarios y modelos automáticamente:
```cmd
python setup.py
```

4. Inicia el servidor:
```cmd
start.bat
```

O manualmente:
```cmd
python main.py
```

### macOS / Linux

1. Abre Terminal en la carpeta `backend`:
```bash
cd backend
```

2. Instala las dependencias de Python:
```bash
pip3 install -r requirements.txt
```

3. Descarga los binarios y modelos automáticamente:
```bash
python3 setup.py
```

4. Inicia el servidor:
```bash
chmod +x start.sh
./start.sh
```

O manualmente:
```bash
python3 main.py
```

## Verificación

### Verificar modelos disponibles

Antes de iniciar el servidor, puedes verificar qué modelos están disponibles:

```bash
cd backend
python check_models.py
```

Este script te mostrará:
- Qué archivos hay en `binaries/models/`
- Qué archivos hay en `models/`
- Qué modelos están configurados y cuáles están disponibles

### Verificar el servidor

Una vez iniciado el servidor, verifica que funciona correctamente:

1. Abre tu navegador en: http://localhost:8000
2. Deberías ver: `{"status":"ok","message":"rIA Backend API está funcionando"}`

3. Verifica los modelos disponibles en: http://localhost:8000/api/models

4. Documentación interactiva: http://localhost:8000/docs

## Uso en la Aplicación

1. **Inicia el backend** siguiendo los pasos anteriores
2. **Inicia la aplicación** Electron:
   ```bash
   npm run dev
   ```
3. En la interfaz de rIA, **activa el switch "Real-ESRGAN (Backend)"** en los controles
4. ¡Carga una imagen y prueba el reescalado real con IA!

## Modelos Disponibles

Los binarios de Real-ESRGAN incluyen estos modelos:

- **realesrgan-x4plus** (General) - Para todo tipo de imágenes (4x)
- **realesrgan-x4plus-anime** (Anime) - Optimizado para ilustraciones (4x)
- **realesr-animevideov3** (Anime Video) - Para anime y video (2x, 3x, 4x)

Ejecuta `python check_models.py` para ver cuáles están disponibles en tu instalación.

## Solución de Problemas

### "Ejecutable de Real-ESRGAN no encontrado"
**Solución**: Ejecuta `python setup.py` nuevamente.

### "Modelos disponibles: 0/X" o "Modelos faltantes"
**Causa**: Los archivos de modelos en `binaries/models/` no coinciden con los configurados.

**Solución**:
1. Verifica qué archivos tienes: `python check_models.py`
2. Si los archivos están en `binaries/models/`, ejecuta: `python setup.py`
3. Esto copiará los modelos disponibles a `models/`

**Nota**: El backend funciona con cualquier modelo que esté disponible. Si tienes al menos uno, ya puedes usar la aplicación.

### "Backend no disponible"
**Causas**:
- El backend no está iniciado
- Está corriendo en un puerto diferente

**Solución**: 
1. Verifica que `python main.py` esté corriendo
2. Verifica en http://localhost:8000/health

### Procesamiento muy lento
**Causas**:
- Ejecutando en CPU (sin GPU compatible con Vulkan)
- Imagen muy grande

**Soluciones**:
- Instala drivers de GPU actualizados
- Usa imágenes más pequeñas para pruebas
- El procesamiento en CPU es normal que sea más lento

### Error: "Module not found"
**Solución**: Asegúrate de haber instalado las dependencias:
```bash
pip install -r requirements.txt
```

### Puerto 8000 ya en uso
**Solución**: Cambia el puerto en `backend/.env`:
```
API_PORT=8001
```

## Configuración Avanzada

### Cambiar puerto del servidor

Crea un archivo `.env` en `backend/`:
```env
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true
```

### Usar una GPU específica

Si tienes múltiples GPUs:
```env
VULKAN_DEVICE_ID=0  # 0 = primera GPU, 1 = segunda, etc.
```

### Ajustar límites de procesamiento

En `backend/config.py`:
```python
MAX_IMAGE_SIZE = 4096  # Tamaño máximo en píxeles
PROCESSING_TIMEOUT = 300  # Timeout en segundos
```

## Estructura de Archivos del Backend

```
backend/
├── main.py              # Servidor FastAPI
├── config.py           # Configuración
├── upscale_service.py  # Lógica de procesamiento
├── setup.py            # Script de instalación
├── start.sh/.bat       # Scripts de inicio
├── requirements.txt    # Dependencias
├── binaries/          # Binarios descargados
├── models/            # Modelos de IA
├── temp/              # Archivos temporales
└── output/            # Resultados procesados
```

## Documentación Completa

Para más detalles, consulta:
- **Backend README**: `backend/README.md`
- **Documentación de la API**: http://localhost:8000/docs (con servidor iniciado)
- **Real-ESRGAN GitHub**: https://github.com/xinntao/Real-ESRGAN

## Notas Importantes

- **Primera ejecución**: El setup puede tardar varios minutos descargando binarios (~200MB)
- **Almacenamiento**: Los modelos y binarios ocupan ~500MB
- **Limpieza automática**: Los archivos temporales se limpian cada 24 horas
- **Sin PyTorch**: Este backend usa binarios precompilados, no requiere PyTorch

## Desinstalar

Para eliminar completamente el backend:

```bash
cd backend
rm -rf binaries/ models/ temp/ output/
pip uninstall -r requirements.txt -y
```

¡Listo! Ahora tienes Real-ESRGAN funcionando para reescalado de imágenes con IA real.
