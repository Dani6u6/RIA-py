# 🚀 Inicio Rápido - Backend rIA

Guía ultra-rápida para poner en marcha el backend de Real-ESRGAN.

## ⚡ 3 Pasos Rápidos

### 1️⃣ Instalar Dependencias
```bash
cd backend
pip install -r requirements.txt
```

### 2️⃣ Configurar Backend
```bash
# Opción A: Descargar todo automáticamente (recomendado si no tienes los binarios)
python setup.py

# Opción B: Si ya descargaste los binarios manualmente
python check_models.py    # Ver qué tienes
python setup.py           # Copiar modelos al lugar correcto
```

### 3️⃣ Iniciar Servidor
```bash
# Windows
start.bat

# Linux/Mac
./start.sh

# O manualmente
python main.py
```

✅ **Listo!** El servidor estará en http://localhost:8000

---

## 🔍 Verificar que Todo Funciona

### Antes de iniciar el servidor
```bash
python verify_setup.py
```

Esto verificará:
- ✓ Python y dependencias
- ✓ Ejecutable de Real-ESRGAN
- ✓ Modelos disponibles
- ✓ Configuración correcta

### Después de iniciar el servidor

Abre en tu navegador:
- http://localhost:8000 → Ver estado
- http://localhost:8000/api/models → Ver modelos disponibles
- http://localhost:8000/docs → Documentación interactiva

---

## 🎯 Usar con la Aplicación

1. **Backend**: Asegúrate que el servidor esté corriendo
2. **App**: Inicia la aplicación (`npm run dev`)
3. **Activar**: En la app, activa el switch "Real-ESRGAN (Backend)"
4. **Procesar**: ¡Carga una imagen y pruébalo!

---

## 🆘 Problemas Comunes

### "No se encontró el ejecutable"
```bash
python setup.py
```

### "Modelos disponibles: 0"
```bash
python check_models.py  # Ver qué archivos tienes
python setup.py         # Copiar modelos
```

### "Backend no disponible" (en la app)
1. ¿Está corriendo el servidor? → `python main.py`
2. ¿Puerto correcto? → Verifica que sea 8000
3. ¿Firewall bloqueando? → Permite conexiones locales

### Procesamiento muy lento
- **Normal en CPU**: Sin GPU Vulkan, el procesamiento es lento
- **Solución**: Actualiza drivers de GPU
- **Alternativa**: Usa imágenes pequeñas para probar

---

## 📊 Modelos Disponibles

El backend incluye estos modelos:

| Modelo | Escala | Mejor Para |
|--------|--------|------------|
| **realesrgan-x4plus** | 4x | Imágenes generales |
| **realesrgan-x4plus-anime** | 4x | Anime e ilustraciones |
| **realesr-animevideov3** | 2x/3x/4x | Anime y video |

Ejecuta `python check_models.py` para ver cuáles tienes disponibles.

---

## 📚 Más Información

- **Guía completa**: Ver `README.md`
- **Guía de modelos**: Ver `MODELOS.md`
- **Setup detallado**: Ver `../BACKEND_SETUP.md`

---

## 🎮 Comandos Útiles

```bash
# Verificar todo
python verify_setup.py

# Ver modelos disponibles
python check_models.py

# Iniciar servidor
python main.py

# Iniciar con auto-reload (desarrollo)
uvicorn main:app --reload

# Ver logs en tiempo real
python main.py 2>&1 | tee backend.log
```

---

## 💡 Tips

- **Primera vez**: El setup puede tardar ~5 minutos descargando binarios
- **Espacio en disco**: Los binarios + modelos ocupan ~500MB
- **Memoria**: Procesar imágenes grandes requiere 2-4GB RAM
- **GPU**: No es obligatoria pero acelera MUCHO el procesamiento

---

¿Listo? 🚀 ¡A procesar imágenes con IA!
