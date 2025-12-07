# Métricas NIQE en rIA

## ¿Qué es NIQE?

**NIQE (Natural Image Quality Evaluator)** es una métrica de calidad de imagen sin referencia que evalúa la "naturalidad" de una imagen basándose en estadísticas de escenas naturales.

### Características principales

- ✅ **No requiere imagen de referencia**: Evalúa calidad sin necesidad de comparar con el original
- ✅ **Basada en estadísticas naturales**: Compara la imagen con modelos de escenas naturales
- ✅ **Detecta artefactos**: Identifica distorsiones, blur, y falta de naturalidad
- ✅ **Valores más bajos = mejor calidad**: Típicamente en rango 0-100

## Interpretación de Scores NIQE

| Score NIQE | Clasificación | Descripción                                    |
| ---------- | ------------- | ---------------------------------------------- |
| 0 - 3      | **Excellent** | Calidad excelente, imagen muy natural          |
| 3 - 5      | **Good**      | Buena calidad, artefactos mínimos              |
| 5 - 7      | **Fair**      | Calidad aceptable, algunos artefactos visibles |
| 7+         | **Poor**      | Calidad pobre, artefactos significativos       |

> **Nota**: Valores más bajos indican mejor calidad. Un score de 2.5 es mejor que un score de 5.0.

## Uso en rIA

### Visualización en la Interfaz

Cuando procesas una imagen con el backend activado, verás un **badge de calidad** en la esquina superior derecha de la imagen procesada:

- 🟢 **Verde**: Excellent (NIQE < 3)
- 🟡 **Amarillo**: Good (NIQE 3-5)
- 🟠 **Naranja**: Fair (NIQE 5-7)
- 🔴 **Rojo**: Poor (NIQE > 7)

El badge muestra:

```
Excellent • NIQE: 2.45
```

### Cómo se Calcula

1. **Procesamiento**: Cuando el backend procesa una imagen con Real-ESRGAN
2. **Cálculo automático**: Se calcula el score NIQE de la imagen resultante
3. **Clasificación**: Se asigna una categoría de calidad basada en el score
4. **Visualización**: Se muestra en la interfaz con código de colores

### Requisitos

Para que NIQE funcione, necesitas:

- ✅ Backend activado (switch "Real-ESRGAN (Backend)")
- ✅ Dependencias instaladas: `scikit-image`, `opencv-python`
- ✅ Backend ejecutándose: `python backend/main.py`

## Instalación de Dependencias

Si aún no has instalado las dependencias de NIQE:

```bash
cd backend
pip install scikit-image opencv-python numpy
```

O reinstala todas las dependencias:

```bash
cd backend
pip install -r requirements.txt
```

## Ejemplos de Scores

### Imagen de Alta Calidad

```
NIQE Score: 2.3
Rating: Excellent
```

- Sin artefactos visibles
- Detalles nítidos y naturales
- Colores bien preservados

### Imagen de Calidad Media

```
NIQE Score: 4.8
Rating: Good
```

- Artefactos mínimos
- Ligera pérdida de detalle
- Generalmente aceptable

### Imagen de Baja Calidad

```
NIQE Score: 7.5
Rating: Poor
```

- Artefactos visibles (blur, blocking)
- Pérdida significativa de detalle
- Colores distorsionados

## Limitaciones

### NIQE no es perfecto

- **Subjetividad**: La calidad percibida puede variar entre personas
- **Contexto**: Un score "Fair" puede ser aceptable para ciertos usos
- **Tipo de contenido**: Funciona mejor con fotografías naturales
- **No reemplaza inspección visual**: Siempre verifica visualmente el resultado

### Cuándo NIQE no está disponible

NIQE solo está disponible cuando:

- ✅ Usas el backend Real-ESRGAN
- ✅ Las dependencias están instaladas
- ✅ El procesamiento se completa exitosamente

En modo simulación local, NIQE no estará disponible.

## API Backend

### Respuesta con NIQE

Cuando procesas una imagen, la respuesta incluye:

```json
{
  "success": true,
  "image": "data:image/png;base64,...",
  "width": 2048,
  "height": 1536,
  "processing_time": 12.5,
  "niqe_score": 3.2,
  "quality_rating": "Good"
}
```

### Campos NIQE

- `niqe_score`: Score numérico (float), más bajo = mejor
- `quality_rating`: Clasificación textual (Excellent/Good/Fair/Poor)

## Comparación entre Modelos

Puedes usar NIQE para comparar la calidad de diferentes modelos:

| Modelo         | NIQE Promedio | Mejor para            |
| -------------- | ------------- | --------------------- |
| General        | 3.5 - 4.5     | Fotografías generales |
| Anime          | 2.8 - 3.8     | Ilustraciones anime   |
| Anime Video 4x | 3.2 - 4.2     | Videos anime          |

> **Nota**: Estos son valores aproximados. Los resultados varían según la imagen.

## Troubleshooting

### NIQE no aparece en la interfaz

1. **Verifica que el backend esté activo**

   ```bash
   # En una terminal
   cd backend
   python main.py
   ```

2. **Confirma que las dependencias estén instaladas**

   ```bash
   python -c "from skimage.metrics import niqe; print('NIQE disponible')"
   ```

3. **Revisa los logs del backend**
   - Busca mensajes sobre NIQE en la consola del backend
   - Verifica que no haya errores de importación

### Score NIQE parece incorrecto

- **Verifica la imagen original**: Imágenes de baja calidad tendrán scores altos
- **Considera el modelo usado**: Diferentes modelos producen diferentes resultados
- **Compara visualmente**: El score es una guía, no una verdad absoluta

## Referencias

- [Artículo original NIQE](https://live.ece.utexas.edu/publications/2013/mittal2013.pdf)
- [scikit-image NIQE](https://scikit-image.org/docs/stable/api/skimage.metrics.html#skimage.metrics.niqe)

---

**Versión**: 1.0  
**Última actualización**: Diciembre 2025
