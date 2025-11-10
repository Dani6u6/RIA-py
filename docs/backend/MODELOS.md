# Guía de Modelos Real-ESRGAN

Esta guía explica los diferentes modelos disponibles en Real-ESRGAN y cuándo usar cada uno.

## Modelos Incluidos en el Binario

Cuando descargas el binario de Real-ESRGAN ncnn-vulkan, incluye estos modelos:

### 1. realesrgan-x4plus (General Purpose)

**Archivos:**
- `realesrgan-x4plus.bin`
- `realesrgan-x4plus.param`

**Características:**
- ✅ Modelo versátil para todo tipo de imágenes
- ✅ Escala: **4x**
- ✅ Buen balance entre calidad y velocidad
- ✅ Funciona bien con fotografías, texturas, paisajes

**Cuándo usarlo:**
- Imágenes generales
- Fotografías de paisajes
- Texturas y patrones
- Cuando no estés seguro qué modelo usar

---

### 2. realesrgan-x4plus-anime (Anime & Illustrations)

**Archivos:**
- `realesrgan-x4plus-anime.bin`
- `realesrgan-x4plus-anime.param`

**Características:**
- ✅ Optimizado específicamente para anime e ilustraciones
- ✅ Escala: **4x**
- ✅ Preserva líneas nítidas y colores vibrantes
- ✅ Menos blur en bordes

**Cuándo usarlo:**
- Arte digital y anime
- Ilustraciones
- Manga y comics
- Screenshots de anime
- Dibujos con líneas definidas

---

### 3. realesr-animevideov3 (Anime Video)

**Archivos:**
- `realesr-animevideov3-x2.bin/param` (escala 2x)
- `realesr-animevideov3-x3.bin/param` (escala 3x)
- `realesr-animevideov3-x4.bin/param` (escala 4x)

**Características:**
- ✅ Optimizado para contenido de anime en movimiento
- ✅ Escalas disponibles: **2x, 3x, 4x**
- ✅ Menor denoise para preservar detalles temporales
- ✅ Diseñado para frames de video

**Cuándo usarlo:**
- Frames extraídos de video anime
- Contenido con ligero motion blur
- Cuando el modelo anime estándar genera demasiado sharpening
- Imágenes que formarán parte de un video

---

## Comparación Rápida

| Modelo | Escala | Mejor Para | Velocidad | Calidad |
|--------|--------|------------|-----------|---------|
| **realesrgan-x4plus** | 4x | Fotos generales | ⚡⚡ Media | ⭐⭐⭐ Buena |
| **realesrgan-x4plus-anime** | 4x | Anime/Arte | ⚡⚡ Media | ⭐⭐⭐⭐ Excelente* |
| **realesr-animevideov3-x2** | 2x | Anime/Video | ⚡⚡⚡ Rápida | ⭐⭐⭐ Buena |
| **realesr-animevideov3-x3** | 3x | Anime/Video | ⚡⚡ Media | ⭐⭐⭐ Buena |
| **realesr-animevideov3-x4** | 4x | Anime/Video | ⚡ Lenta | ⭐⭐⭐⭐ Muy buena |

*La calidad es relativa al tipo de contenido

---

## Ejemplos de Uso

### Fotografía de Paisaje
```
Modelo recomendado: realesrgan-x4plus
Escala: 4x
Denoise: 40-60%
```

### Fan Art de Anime
```
Modelo recomendado: realesrgan-x4plus-anime
Escala: 4x
Denoise: 30-50%
```

### Screenshot de Anime (de video)
```
Modelo recomendado: realesr-animevideov3-x4
Escala: 4x
Denoise: 20-40%
```

### Wallpaper de baja resolución
```
Modelo recomendado: realesrgan-x4plus
Escala: 4x
Denoise: 50-70%
```

---

## Verificar Modelos Disponibles

Para ver qué modelos tienes disponibles en tu instalación:

```bash
cd backend
python check_models.py
```

O verifica desde la API (con el servidor iniciado):
```
http://localhost:8000/api/models
```

---

## Agregar o Modificar Modelos

Si descargas modelos adicionales de Real-ESRGAN:

1. **Coloca los archivos** `.bin` y `.param` en `backend/models/`

2. **Actualiza la configuración** en `backend/config.py`:

```python
MODELS = {
    "tu-modelo": {
        "name": "nombre-del-modelo-sin-extension",
        "filename": "nombre-del-modelo.bin",
        "param_filename": "nombre-del-modelo.param",
        "scale": 4,  # o 2, 3, según el modelo
        "description": "Descripción de tu modelo"
    }
}
```

3. **Reinicia el servidor**

---

## Notas Importantes

### Sobre las Escalas

- **2x**: Más rápido, usa menos memoria, bueno para mejoras sutiles
- **3x**: Balance entre velocidad y aumento de resolución
- **4x**: Mejor calidad, más lento, requiere más memoria

### Sobre el Denoise

- **0-30%**: Preserva textura original, puede mantener algo de ruido
- **40-60%**: Balance recomendado para la mayoría de imágenes
- **70-100%**: Limpieza agresiva, puede perder detalles finos

### Limitaciones

- Tamaño máximo de imagen: **4096px por lado** (configurable)
- A mayor resolución de entrada, más tiempo de procesamiento
- GPUs con menos de 2GB VRAM pueden tener problemas con 4x en imágenes grandes

---

## Recursos Adicionales

- [Real-ESRGAN GitHub](https://github.com/xinntao/Real-ESRGAN)
- [Real-ESRGAN ncnn Vulkan](https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan)
- [Comparación de modelos (wiki)](https://github.com/xinntao/Real-ESRGAN/blob/master/docs/model_zoo.md)

---

## FAQ

**P: ¿Por qué no veo todos los modelos en la app?**  
R: Solo se muestran los modelos que están disponibles en `backend/models/`. Ejecuta `python check_models.py` para verificar.

**P: ¿Puedo usar múltiples modelos en la misma sesión?**  
R: Sí, simplemente cambia el modelo en el dropdown antes de procesar cada imagen.

**P: ¿Qué modelo es más rápido?**  
R: Los modelos x2 son más rápidos que los x4. En general: animevideov3-x2 > x4plus > animevideov3-x4

**P: ¿El modelo "general" funciona con anime?**  
R: Sí, pero obtendrás mejores resultados con los modelos específicos de anime.
