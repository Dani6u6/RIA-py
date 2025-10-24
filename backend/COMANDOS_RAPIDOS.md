# ⚡ Comandos Rápidos - Backend rIA

Referencia rápida de todos los comandos útiles para el backend.

---

## 🔧 Setup Inicial

```bash
# Cambiar al directorio del backend
cd backend

# Instalar dependencias
pip install -r requirements.txt

# Descargar binarios y modelos
python setup.py
```

---

## ✅ Verificación

```bash
# Verificación completa (recomendado antes de iniciar)
python verify_setup.py

# Ver solo modelos disponibles
python check_models.py

# Verificar que el servidor responde (después de iniciarlo)
curl http://localhost:8000
curl http://localhost:8000/health
curl http://localhost:8000/api/models
```

---

## 🚀 Iniciar Servidor

```bash
# Opción 1: Script automático (recomendado)
./start.sh              # Linux/Mac
start.bat               # Windows

# Opción 2: Directamente con Python
python main.py

# Opción 3: Con Uvicorn (desarrollo con auto-reload)
uvicorn main:app --reload

# Opción 4: Especificar host y puerto
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Opción 5: Con logs detallados
python main.py 2>&1 | tee backend.log
```

---

## 🧪 Testing

```bash
# Verificar API con curl
curl http://localhost:8000/

# Ver modelos disponibles
curl http://localhost:8000/api/models

# Test de upscale (requiere imagen en base64)
curl -X POST http://localhost:8000/api/upscale \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KG...",
    "scale": 2,
    "model": "general",
    "denoise_strength": 50
  }'
```

---

## 📊 Diagnóstico

```bash
# Ver qué archivos hay en binaries/models/
ls -lh binaries/models/

# Ver qué archivos hay en models/
ls -lh models/

# Verificar permisos del ejecutable (Linux/Mac)
ls -l binaries/realesrgan-ncnn-vulkan

# Dar permisos de ejecución (si es necesario)
chmod +x binaries/realesrgan-ncnn-vulkan

# Ver logs del servidor en tiempo real
tail -f backend.log
```

---

## 🧹 Limpieza

```bash
# Limpiar archivos temporales
rm -rf temp/*
rm -rf output/*

# Limpiar todo (para reinstalar)
rm -rf binaries/
rm -rf models/
rm -rf temp/*
rm -rf output/*

# Reinstalar desde cero
pip install -r requirements.txt
python setup.py
```

---

## 🔄 Actualización

```bash
# Actualizar dependencias
pip install -r requirements.txt --upgrade

# Re-descargar binarios (si hay nueva versión)
rm -rf binaries/
python setup.py

# Re-copiar modelos
python setup.py
```

---

## 🐛 Debugging

```bash
# Iniciar servidor en modo debug (más logs)
python -u main.py

# Ver información del sistema
python -c "import platform; print(platform.system(), platform.version())"

# Ver versión de Python
python --version

# Ver dependencias instaladas
pip list

# Verificar FastAPI
python -c "import fastapi; print(fastapi.__version__)"

# Verificar Pillow
python -c "from PIL import Image; print(Image.__version__)"

# Test básico de imports
python -c "from config import MODELS; print(MODELS.keys())"
```

---

## 📦 Gestión de Modelos

```bash
# Listar modelos configurados
python -c "from config import MODELS; import json; print(json.dumps(MODELS, indent=2))"

# Verificar modelos disponibles
python check_models.py

# Copiar manualmente un modelo
cp binaries/models/realesrgan-x4plus.bin models/
cp binaries/models/realesrgan-x4plus.param models/

# Verificar tamaño de modelos
du -sh models/
```

---

## 🌐 Acceso Remoto (Opcional)

```bash
# Permitir acceso desde otras máquinas en la red local
uvicorn main:app --host 0.0.0.0 --port 8000

# Con variables de entorno
export API_HOST=0.0.0.0
export API_PORT=8000
python main.py

# Ver IP de tu máquina (para acceso remoto)
# Linux/Mac:
ifconfig | grep "inet "
# Windows:
ipconfig
```

---

## 📈 Monitoreo

```bash
# Ver procesos de Python corriendo
ps aux | grep python

# Ver uso de puerto 8000
# Linux/Mac:
lsof -i :8000
# Windows:
netstat -ano | findstr :8000

# Monitorear uso de GPU (si tienes nvidia-smi)
watch -n 1 nvidia-smi

# Monitorear logs en tiempo real
tail -f backend.log | grep ERROR
```

---

## 🛑 Detener Servidor

```bash
# Ctrl+C en la terminal donde corre

# O matar proceso por puerto (Linux/Mac)
lsof -ti:8000 | xargs kill -9

# O matar proceso por puerto (Windows)
FOR /F "tokens=5" %P IN ('netstat -ano ^| findstr :8000') DO TaskKill /PID %P /F
```

---

## 🔐 Variables de Entorno

```bash
# Crear archivo .env desde la plantilla
cp .env.example .env

# Editar configuración
nano .env

# Cargar variables y ejecutar
source .env && python main.py  # Linux/Mac
set -a; source .env; set +a; python main.py  # Linux/Mac alternativa
```

---

## 📝 Atajos Útiles

```bash
# Alias para terminal (añadir a .bashrc o .zshrc)
alias ria-backend='cd /ruta/a/backend && python main.py'
alias ria-verify='cd /ruta/a/backend && python verify_setup.py'
alias ria-models='cd /ruta/a/backend && python check_models.py'

# Función para iniciar todo
function ria-start() {
    cd /ruta/a/backend
    python verify_setup.py && python main.py
}
```

---

## 🚨 Solución Rápida de Problemas

```bash
# Problema: "No module named 'fastapi'"
pip install -r requirements.txt

# Problema: "Ejecutable no encontrado"
python setup.py

# Problema: "Modelos disponibles: 0"
python check_models.py
python setup.py

# Problema: "Permission denied" (Linux/Mac)
chmod +x binaries/realesrgan-ncnn-vulkan

# Problema: "Puerto ya en uso"
# Cambiar puerto en .env o:
uvicorn main:app --port 8001

# Problema: "Backend no disponible" (desde la app)
# 1. Verificar que el servidor esté corriendo
curl http://localhost:8000
# 2. Verificar puerto correcto
# 3. Verificar firewall
```

---

## 📚 Más Información

```bash
# Ver documentación interactiva (con servidor corriendo)
# Abrir en navegador: http://localhost:8000/docs

# Ver documentación local
cat README.md
cat INICIO_RAPIDO.md
cat MODELOS.md
```

---

## 💡 Tips

- Usa `verify_setup.py` antes de cada inicio para detectar problemas temprano
- Usa `check_models.py` si tienes dudas sobre qué modelos están disponibles
- Los logs son tu amigo - revísalos si algo falla
- El servidor se reinicia automáticamente con `--reload` durante desarrollo
- `Ctrl+C` detiene el servidor de forma limpia

---

