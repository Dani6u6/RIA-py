# REPORTE TÉCNICO: ENTRENAMIENTO Y EVALUACIÓN DEL MODELO

**Proyecto:** rIA - Sistema de Reescalado de Imágenes con IA  
**Modelo:** Real-ESRGAN  
**Fecha:** 27 de Noviembre, 2025  
**Autor:** Equipo de Desarrollo rIA

---

## RESUMEN EJECUTIVO

Este reporte describe el paradigma de aprendizaje automático, metodología de entrenamiento y métricas de evaluación utilizadas en Real-ESRGAN. El modelo emplea **aprendizaje supervisado adversarial** (GAN), combinando pares de imágenes de alta y baja resolución para entrenar una red generadora mediante competición con una red discriminadora. El entrenamiento utiliza una función de pérdida multi-objetivo que combina fidelidad pixel-wise (L1), similitud perceptual (VGG) y realismo fotográfico (adversarial). La evaluación se realiza mediante métricas objetivas (PSNR, SSIM) y perceptuales (LPIPS, FID), priorizando la calidad visual sobre la exactitud numérica.

**Nota importante:** El proyecto rIA utiliza el modelo Real-ESRGAN **pre-entrenado**. Este reporte describe cómo fue entrenado originalmente y cómo evaluamos su desempeño en producción.

---

## 1. PARADIGMA DE APRENDIZAJE

### 1.1 Clasificación del Tipo de Aprendizaje

Real-ESRGAN implementa **APRENDIZAJE SUPERVISADO ADVERSARIAL**, que combina dos paradigmas:

#### **📊 Aprendizaje Supervisado**
- **Definición:** Entrenamiento con pares de datos etiquetados (input → output conocido)
- **En Real-ESRGAN:** Pares de imágenes (LR, HR) donde LR = Low Resolution, HR = High Resolution
- **Supervisión:** La imagen HR actúa como "etiqueta" o ground truth

#### **⚔️ Aprendizaje Adversarial (GAN)**
- **Definición:** Dos redes compiten - Generador vs Discriminador
- **En Real-ESRGAN:** El generador aprende a crear imágenes realistas que "engañen" al discriminador
- **Supervisión indirecta:** El discriminador proporciona señal de entrenamiento adicional

---

### 1.2 Comparación con Otros Paradigmas

| **Paradigma**              | **¿Se usa en Real-ESRGAN?** | **Justificación**                                    |
|---------------------------|-----------------------------|------------------------------------------------------|
| **Supervisado**            | ✅ SÍ                       | Usa pares (LR, HR) con ground truth                  |
| **No Supervisado**         | ❌ NO                       | Requiere etiquetas explícitas                        |
| **Semi-Supervisado**       | ❌ NO                       | No combina datos etiquetados/no etiquetados          |
| **Refuerzo**               | ❌ NO                       | No hay agente, ambiente, ni recompensas secuenciales |
| **Adversarial (GAN)**      | ✅ SÍ                       | Generador vs Discriminador                           |
| **Self-Supervised**        | ⚠️ PARCIAL                 | Degradación sintética simula self-supervision        |

---

### 1.3 ¿Por qué Aprendizaje Supervisado?

**Justificación para Super-Resolución:**

1. **Disponibilidad de Datos:**
   - Fácil obtener imágenes de alta resolución (HR)
   - Generar versiones de baja resolución (LR) mediante downsampling

2. **Objetivo Bien Definido:**
   - Input: Imagen LR (256×256)
   - Output deseado: Imagen HR (1024×1024)
   - Función objetivo clara: minimizar diferencia entre SR y HR

3. **Alternativas No Viables:**
   - **No Supervisado:** No hay forma de saber qué detalles generar sin ground truth
   - **Refuerzo:** No hay secuencia de acciones, solo transformación única

**Representación del Problema:**

```
┌─────────────────────────────────────────────────┐
│         APRENDIZAJE SUPERVISADO                 │
└─────────────────────────────────────────────────┘

Dataset:
  D = {(x₁, y₁), (x₂, y₂), ..., (xₙ, yₙ)}
  
  Donde:
    xᵢ = Imagen LR (256×256×3)
    yᵢ = Imagen HR (1024×1024×3)
    n = ~800,000 pares de imágenes

Objetivo:
  Aprender función f(x) ≈ y
  
  Donde f(x) es la red neuronal (Generador)
```

---

## 2. METODOLOGÍA DE ENTRENAMIENTO

### 2.1 Arquitectura de Entrenamiento (GAN)

Real-ESRGAN usa dos redes que se entrenan **simultáneamente**:

```
┌──────────────────────────────────────────────────────┐
│              ENTRENAMIENTO GAN                        │
└──────────────────────────────────────────────────────┘

    Imagen HR (real)
          ↓
    ┌─────────────┐
    │Discriminador│ → "Real o Fake?"
    │     (D)     │
    └─────────────┘
          ↑
          │
    Imagen SR (generada)
          ↑
    ┌─────────────┐
    │  Generador  │ ← Imagen LR (input)
    │     (G)     │
    └─────────────┘

Competición:
  • Generador (G): Intenta crear imágenes indistinguibles de reales
  • Discriminador (D): Intenta distinguir reales de generadas
```

---

### 2.2 Proceso de Entrenamiento Paso a Paso

#### **Fase 1: Preparación de Datos**

**Dataset Base:**
- **DIV2K:** 800 imágenes 2K de alta calidad
- **Flickr2K:** 2,650 imágenes de Flickr
- **OST (OutdoorSceneTraining):** 10,324 imágenes de escenas

**Degradación Sintética (Pipeline de Degradación):**

```python
# Pseudocódigo del proceso de degradación
def generar_par_LR_HR(imagen_HR):
    """
    Simula degradaciones del mundo real
    """
    # 1. Primer degradado: Blur + Downsampling
    imagen_degradada = aplicar_blur_gaussiano(imagen_HR, kernel_aleatorio)
    imagen_degradada = resize_bicubico(imagen_degradada, scale=1/4)
    
    # 2. Agregar ruido
    imagen_degradada = agregar_ruido_gaussiano(imagen_degradada, sigma_aleatorio)
    
    # 3. Compresión JPEG
    imagen_degradada = comprimir_jpeg(imagen_degradada, quality=60-100)
    
    # 4. Segundo degradado (opcional)
    imagen_degradada = aplicar_blur_gaussiano(imagen_degradada, kernel_aleatorio)
    imagen_degradada = resize_bicubico(imagen_degradada, scale=1/2)
    
    # 5. Sinusoidal noise (simula artifacts de cámara)
    imagen_degradada = agregar_ruido_sinusoidal(imagen_degradada)
    
    return imagen_degradada  # Esta es la LR
```

**Justificación de Degradación Sintética:**
- Modelos anteriores (ESRGAN) fallaban con imágenes reales porque solo entrenaban con bicubic downsampling
- Real-ESRGAN simula degradaciones **realistas** (blur, noise, JPEG compression)
- Esto es similar a **self-supervision**: genera sus propios datos de entrenamiento

---

#### **Fase 2: Entrenamiento del Discriminador**

El discriminador aprende a **distinguir imágenes reales de generadas**.

**Paso 1: Forward pass del Generador**
```
Imagen LR → Generador → Imagen SR (fake)
```

**Paso 2: Forward pass del Discriminador**
```
Imagen HR (real) → Discriminador → Probabilidad = 1.0 (real)
Imagen SR (fake) → Discriminador → Probabilidad = 0.0 (fake)
```

**Paso 3: Calcular pérdida del Discriminador**
```python
# Pérdida del discriminador (adversarial loss)
L_D = -[log(D(HR)) + log(1 - D(G(LR)))]

Objetivo:
  • D(HR) → 1.0 (clasificar reales como reales)
  • D(G(LR)) → 0.0 (clasificar fakes como fakes)
```

**Paso 4: Backpropagation**
```
L_D → Gradientes → Actualizar parámetros de D
```

---

#### **Fase 3: Entrenamiento del Generador**

El generador aprende a **crear imágenes que engañen al discriminador** y **sean similares al ground truth**.

**Paso 1: Forward pass**
```
Imagen LR → Generador → Imagen SR
```

**Paso 2: Calcular múltiples pérdidas**

**A) Pérdida L1 (Content Loss):**
```python
L_L1 = mean(|SR - HR|)

Objetivo: Fidelidad pixel-wise
Peso: λ₁ = 1.0
```

**B) Pérdida Perceptual (VGG Loss):**
```python
# Extraer características de VGG-19 pre-entrenada
features_SR = VGG19(SR)  # Salidas de conv3_4, conv4_4
features_HR = VGG19(HR)

L_perceptual = mean(|features_SR - features_HR|)

Objetivo: Similitud de características de alto nivel
Peso: λ₂ = 1.0
```

**C) Pérdida Adversarial:**
```python
L_adv = -log(D(G(LR)))

Objetivo: Engañar al discriminador (D(SR) → 1.0)
Peso: λ₃ = 0.1
```

**Paso 3: Pérdida Total del Generador**
```python
L_G = λ₁·L_L1 + λ₂·L_perceptual + λ₃·L_adv
    = 1.0·L_L1 + 1.0·L_perceptual + 0.1·L_adv
```

**Paso 4: Backpropagation**
```
L_G → Gradientes → Actualizar parámetros de G
```

---

### 2.3 Hiperparámetros de Entrenamiento

| **Parámetro**              | **Valor**                | **Justificación**                           |
|---------------------------|--------------------------|---------------------------------------------|
| **Optimizador**            | Adam                     | Converge rápido, estable para GANs          |
| **Learning Rate (G)**      | 2e-4                     | Estándar para GANs                          |
| **Learning Rate (D)**      | 2e-4                     | Mismo que G para balance                    |
| **Beta₁ (Adam)**           | 0.9                      | Momentum para estabilidad                   |
| **Beta₂ (Adam)**           | 0.99                     | Varianza adaptativa                         |
| **Batch Size**             | 16-32                    | Balance GPU memory vs convergencia          |
| **Patch Size (LR)**        | 64×64                    | Input al generador                          |
| **Patch Size (HR)**        | 256×256                  | Output esperado (scale 4×)                  |
| **Total Iterations**       | 400,000 - 1,000,000      | ~2-4 semanas en 8× V100 GPUs                |
| **Learning Rate Decay**    | Cosine annealing         | Reduce LR gradualmente                      |
| **Gradient Clipping**      | Norm = 1.0               | Evita explosión de gradientes               |

---

### 2.4 Estrategia de Entrenamiento (Curriculum Learning)

Real-ESRGAN usa entrenamiento **progresivo**:

**Etapa 1: Pre-entrenamiento con PSNR (100K iterations)**
```
Solo L_L1 + L_perceptual
Sin adversarial loss
Objetivo: Aprender estructura básica
```

**Etapa 2: Fine-tuning con GAN (300K iterations)**
```
L_L1 + L_perceptual + L_adv
Introduce discriminador gradualmente
Objetivo: Agregar realismo fotográfico
```

**Etapa 3: Refinamiento (opcional, 100K iterations)**
```
Learning rate reducido (1e-5)
Ajuste fino de detalles
```

**Diagrama de Entrenamiento:**

```
Epoch 0                100K              400K              500K
  │─────────────────────│─────────────────│─────────────────│
  │   Pre-training      │   GAN Training   │   Fine-tuning   │
  │   (L1 + Percep)     │  (+ Adversarial) │  (LR decay)     │
  └─────────────────────┴──────────────────┴─────────────────┘
  
  PSNR: ████████████████████████████████████████████████
              ↗ Mejora rápida    ↗ Estabiliza
  
  Realismo: ░░░░░░░░░░░░░░████████████████████████████████
                          ↗ Mejora con GAN
```

---

### 2.5 Técnicas de Estabilización

Entrenar GANs es **notoriamente inestable**. Real-ESRGAN usa:

**1. Spectral Normalization (Discriminador)**
```python
# Normaliza pesos del discriminador para evitar explosión
D_conv = SpectralNorm(nn.Conv2d(...))
```

**2. Gradient Penalty (R1 regularization)**
```python
# Penaliza gradientes grandes en el discriminador
L_R1 = γ/2 * ||∇D(HR)||²
```

**3. Exponential Moving Average (EMA)**
```python
# Mantiene promedio móvil de pesos del generador
G_ema = 0.999 * G_ema + 0.001 * G_current
# Usar G_ema para inferencia (más estable)
```

**4. Warmup del Discriminador**
```python
# No entrenar discriminador en primeras 1000 iteraciones
if iteration < 1000:
    solo_entrenar_generador()
```

---

## 3. MÉTRICAS DE EVALUACIÓN

### 3.1 Categorías de Métricas

Las métricas de super-resolución se dividen en dos categorías:

```
┌────────────────────────────────────────────────────┐
│              MÉTRICAS DE EVALUACIÓN                 │
└────────────────────────────────────────────────────┘

📐 MÉTRICAS OBJETIVAS (Reference-based)
   ↳ Comparan SR con HR pixel-by-pixel
   ↳ PSNR, SSIM, MSE
   ↳ Correlación: Baja con calidad perceptual

👁️ MÉTRICAS PERCEPTUALES (Perception-based)
   ↳ Evalúan calidad visual humana
   ↳ LPIPS, FID, NIQE, BRISQUE
   ↳ Correlación: Alta con preferencia humana
```

---

### 3.2 Métricas Objetivas (Reference-Based)

#### **A) PSNR (Peak Signal-to-Noise Ratio)**

**Definición:**
```python
MSE = mean((SR - HR)²)
PSNR = 10 * log₁₀(MAX²/MSE)
     = 20 * log₁₀(MAX/√MSE)

Donde MAX = 255 (para imágenes de 8 bits)
```

**Interpretación:**
- **Unidad:** Decibeles (dB)
- **Rango típico:** 20-50 dB
- **Mayor es mejor:** PSNR alto = menor error pixel-wise

**Valores de Referencia:**
```
PSNR < 25 dB  → Calidad pobre (artifacts visibles)
PSNR 25-30 dB → Calidad aceptable
PSNR 30-35 dB → Calidad buena
PSNR > 35 dB  → Calidad excelente (casi indistinguible)
```

**Ventajas:**
✅ Fácil de calcular  
✅ Ampliamente usado en literatura  
✅ Matemáticamente bien definido

**Desventajas:**
❌ **No correlaciona bien con calidad perceptual**  
❌ Penaliza "alucinaciones" realistas  
❌ Imágenes borrosas pueden tener PSNR alto

**Ejemplo:**
```
Imagen A: PSNR = 32 dB (borrosa, exacta pixel-wise)
Imagen B: PSNR = 28 dB (realista, con texturas generadas)

Preferencia humana: ⭐⭐ (A)  ⭐⭐⭐⭐⭐ (B)
```

---

#### **B) SSIM (Structural Similarity Index)**

**Definición:**
```python
SSIM(x,y) = [l(x,y)]^α · [c(x,y)]^β · [s(x,y)]^γ

Donde:
  l(x,y) = luminancia    (2μₓμᵧ + C₁) / (μₓ² + μᵧ² + C₁)
  c(x,y) = contraste     (2σₓσᵧ + C₂) / (σₓ² + σᵧ² + C₂)
  s(x,y) = estructura    (σₓᵧ + C₃) / (σₓσᵧ + C₃)
  
  Típicamente: α=β=γ=1
```

**Interpretación:**
- **Rango:** [-1, 1] (en práctica: [0, 1])
- **1.0 = Idénticas**
- **Mayor es mejor**

**Valores de Referencia:**
```
SSIM < 0.8   → Pobre
SSIM 0.8-0.9 → Aceptable
SSIM 0.9-0.95→ Bueno
SSIM > 0.95  → Excelente
```

**Ventajas:**
✅ Más cercano a percepción humana que PSNR  
✅ Considera estructura, no solo error pixel-wise  
✅ Robusto a cambios de iluminación

**Desventajas:**
❌ Más costoso de calcular que PSNR  
❌ Aún penaliza texturas generadas realistas  
❌ Parámetros (C₁, C₂, C₃) afectan resultado

---

#### **C) MSE (Mean Squared Error)**

**Definición:**
```python
MSE = (1/N) * Σ(SR - HR)²

Donde N = total de píxeles
```

**Interpretación:**
- **Rango:** [0, ∞)
- **Menor es mejor**
- **Relacionado con PSNR:** PSNR = -10·log₁₀(MSE/MAX²)

**Uso:** Principalmente como loss function durante entrenamiento.

---

### 3.3 Métricas Perceptuales (No-Reference y Perception-Based)

#### **A) LPIPS (Learned Perceptual Image Patch Similarity)**

**Definición:**
```python
# Usa red neuronal pre-entrenada (VGG, AlexNet)
features_SR = VGG(SR)  # Características de múltiples capas
features_HR = VGG(HR)

LPIPS = Σ ||features_SR - features_HR||²

Menor LPIPS = Mayor similitud perceptual
```

**Interpretación:**
- **Rango:** [0, 1] (normalizado)
- **Menor es mejor**
- **Correlación con humanos:** ~0.85-0.90

**Ventajas:**
✅ **Mejor correlación con percepción humana** que PSNR/SSIM  
✅ Evalúa características de alto nivel (texturas, objetos)  
✅ Entrenado con preferencias humanas

**Desventajas:**
❌ Requiere red neuronal (más lento)  
❌ Depende de la red elegida (VGG vs AlexNet)

---

#### **B) FID (Fréchet Inception Distance)**

**Definición:**
```python
# 1. Extraer características de Inception-v3
features_SR = InceptionV3(conjunto_SR)  # 2048D vector
features_HR = InceptionV3(conjunto_HR)

# 2. Calcular estadísticas
μ_SR, Σ_SR = mean(features_SR), cov(features_SR)
μ_HR, Σ_HR = mean(features_HR), cov(features_HR)

# 3. Distancia de Fréchet
FID = ||μ_SR - μ_HR||² + Tr(Σ_SR + Σ_HR - 2√(Σ_SR·Σ_HR))
```

**Interpretación:**
- **Rango:** [0, ∞)
- **Menor es mejor**
- **FID < 10:** Muy buena calidad
- **FID > 50:** Pobre calidad

**Ventajas:**
✅ Evalúa distribución de imágenes (no solo pares)  
✅ Usado en GANs para medir realismo  
✅ Robusto a outliers

**Desventajas:**
❌ Requiere CONJUNTO de imágenes (no funciona en 1 imagen)  
❌ Costoso computacionalmente  
❌ Sensible al tamaño del conjunto

---

#### **C) NIQE (Natural Image Quality Evaluator)**

**Definición:**
```python
# No requiere ground truth (no-reference)
# Compara estadísticas de la imagen con modelo de "naturalidad"

features = extraer_caracteristicas_naturales(SR)
NIQE = distancia(features, modelo_imagenes_naturales)
```

**Interpretación:**
- **Rango:** [0, ∞)
- **Menor es mejor**
- **No requiere HR** (no-reference)

**Valores de Referencia:**
```
NIQE < 3.5  → Excelente
NIQE 3.5-5  → Bueno
NIQE 5-7    → Aceptable
NIQE > 7    → Pobre
```

**Ventajas:**
✅ No requiere ground truth  
✅ Evalúa "naturalidad" de la imagen  
✅ Útil para imágenes del mundo real

**Desventajas:**
❌ Menos correlación con humanos que LPIPS  
❌ Modelo de "naturalidad" puede ser sesgado

---

#### **D) User Studies (Evaluación Humana)**

La **métrica gold standard** para super-resolución:

**Metodología:**
```
1. Mostrar a N usuarios (N > 20):
   - Imagen LR (referencia)
   - Imagen SR del modelo A
   - Imagen SR del modelo B
   - Imagen HR (opcional)

2. Preguntar:
   - ¿Cuál se ve más realista? (A vs B)
   - ¿Cuál tiene mejor calidad? (escala 1-5)
   - ¿Cuál prefieres? (A vs B)

3. Calcular métricas:
   - MOS (Mean Opinion Score): Promedio de calificaciones
   - Preference Rate: % que prefiere A vs B
```

**Ejemplo de Resultados:**
```
Modelo          | MOS (1-5) | Preference Rate
----------------|-----------|----------------
Bicúbica        | 2.1       | 5%
ESRGAN          | 3.8       | 35%
Real-ESRGAN     | 4.2       | 60%
```

**Ventajas:**
✅ **Ground truth definitivo** de calidad  
✅ Captura preferencias subjetivas

**Desventajas:**
❌ Costoso y lento  
❌ Sujeto a sesgos (contexto, orden de presentación)  
❌ No reproducible (diferentes usuarios = diferentes resultados)

---

### 3.4 Comparación de Métricas

| **Métrica** | **Tipo**      | **GT Requerido** | **Correlación Humana** | **Velocidad** | **Uso Principal**        |
|-------------|--------------|------------------|------------------------|---------------|--------------------------|
| **PSNR**    | Objetiva     | ✅ Sí            | ⭐⭐ Baja              | ⚡⚡⚡⚡⚡      | Benchmark académico      |
| **SSIM**    | Objetiva     | ✅ Sí            | ⭐⭐⭐ Media           | ⚡⚡⚡⚡        | Benchmark académico      |
| **LPIPS**   | Perceptual   | ✅ Sí            | ⭐⭐⭐⭐⭐ Alta         | ⚡⚡⚡          | Evaluar realismo         |
| **FID**     | Perceptual   | ⚠️ Conjunto      | ⭐⭐⭐⭐ Alta          | ⚡⚡            | GANs, distribuciones     |
| **NIQE**    | No-reference | ❌ No            | ⭐⭐⭐ Media           | ⚡⚡⚡          | Imágenes sin GT          |
| **User Study** | Perceptual | ❌ No         | ⭐⭐⭐⭐⭐ Perfecta    | ⚡ Muy lenta   | Validación final         |

---

### 3.5 Métricas Específicas para Real-ESRGAN

**Durante Entrenamiento (Training Metrics):**

```python
# Cada 100 iteraciones, registrar:
metrics = {
    'L_L1': valor_perdida_L1,
    'L_perceptual': valor_perdida_perceptual,
    'L_adv': valor_perdida_adversarial,
    'L_total_G': perdida_total_generador,
    'L_D': perdida_discriminador,
    'D(HR)': probabilidad_discriminador_reales,
    'D(SR)': probabilidad_discriminador_generadas,
    'learning_rate': lr_actual
}
```

**Durante Validación (Validation Metrics):**

```python
# Cada 1000 iteraciones, evaluar en conjunto de validación:
val_metrics = {
    'PSNR': calcular_psnr(SR, HR),
    'SSIM': calcular_ssim(SR, HR),
    'LPIPS': calcular_lpips(SR, HR),
    'NIQE': calcular_niqe(SR)  # No requiere HR
}
```

**Criterio de Convergencia:**

Real-ESRGAN **NO usa early stopping** basado en métricas porque:
- PSNR/SSIM no correlacionan con calidad perceptual
- El modelo mejora perceptualmente incluso si PSNR baja

**En su lugar:**
1. Entrenar número fijo de iteraciones (400K-1M)
2. Evaluar **visualmente** cada 5K iterations
3. Seleccionar checkpoint con mejor **LPIPS + preferencia visual**

---

## 4. EVALUACIÓN EN PRODUCCIÓN (PROYECTO rIA)

### 4.1 Métricas Implementadas en rIA

Como rIA usa el modelo **pre-entrenado**, no se entrena. Pero podemos evaluar desempeño:

#### **Métricas de Calidad (si hay ground truth):**

```javascript
// En frontend (si usuario provee imagen original HR)
async function evaluarCalidad(imagenOriginal, imagenUpscaled) {
  const metrics = {
    psnr: calcularPSNR(imagenOriginal, imagenUpscaled),
    ssim: calcularSSIM(imagenOriginal, imagenUpscaled),
    tiempo: tiempoUpscaling,
    tamaño: {
      original: imagenOriginal.size,
      upscaled: imagenUpscaled.size
    }
  };
  
  return metrics;
}
```

#### **Métricas de Rendimiento:**

```python
# En backend (backend/app.py)
metrics = {
    'tiempo_total': tiempo_total,
    'tiempo_carga_modelo': tiempo_carga,
    'tiempo_inferencia': tiempo_inferencia,
    'tiempo_guardado': tiempo_guardado,
    'resolucion_entrada': (width_in, height_in),
    'resolucion_salida': (width_out, height_out),
    'factor_escala': scale_factor,
    'memoria_gpu_usada': gpu_memory_used,
    'modelo_usado': model_name
}
```

---

### 4.2 Sistema de Logging de Métricas

**Propuesta de Implementación:**

```python
# backend/metrics_logger.py
import json
from datetime import datetime

class MetricsLogger:
    def __init__(self, log_file='metrics.json'):
        self.log_file = log_file
    
    def log_inference(self, metrics):
        """Registra métricas de cada inferencia"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'modelo': metrics['modelo_usado'],
            'resolucion_entrada': metrics['resolucion_entrada'],
            'resolucion_salida': metrics['resolucion_salida'],
            'tiempo_total_ms': metrics['tiempo_total'] * 1000,
            'tiempo_inferencia_ms': metrics['tiempo_inferencia'] * 1000,
            'memoria_gpu_mb': metrics['memoria_gpu_usada'],
            'scale_factor': metrics['factor_escala']
        }
        
        with open(self.log_file, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    
    def get_statistics(self):
        """Obtiene estadísticas agregadas"""
        with open(self.log_file, 'r') as f:
            logs = [json.loads(line) for line in f]
        
        return {
            'total_inferencias': len(logs),
            'tiempo_promedio_ms': sum(l['tiempo_total_ms'] for l in logs) / len(logs),
            'memoria_promedio_mb': sum(l['memoria_gpu_mb'] for l in logs) / len(logs),
            'resoluciones_comunes': self._top_resolutions(logs)
        }
```

**Uso en Backend:**

```python
# En backend/app.py
from metrics_logger import MetricsLogger

logger = MetricsLogger()

@app.post("/upscale")
async def upscale(file: UploadFile):
    start_time = time.time()
    
    # ... proceso de upscaling ...
    
    metrics = {
        'modelo_usado': model_name,
        'resolucion_entrada': (width, height),
        'resolucion_salida': (width_out, height_out),
        'tiempo_total': time.time() - start_time,
        'tiempo_inferencia': inference_time,
        'memoria_gpu_usada': get_gpu_memory(),
        'factor_escala': scale
    }
    
    logger.log_inference(metrics)
    
    return output_image
```

---

### 4.3 Dashboard de Métricas (Propuesta)

Crear un endpoint para visualizar estadísticas:

```python
# backend/app.py
@app.get("/metrics/stats")
async def get_metrics_stats():
    """Endpoint para obtener estadísticas de uso"""
    logger = MetricsLogger()
    stats = logger.get_statistics()
    
    return {
        'total_procesadas': stats['total_inferencias'],
        'tiempo_promedio_ms': round(stats['tiempo_promedio_ms'], 2),
        'memoria_promedio_mb': round(stats['memoria_promedio_mb'], 2),
        'resoluciones_mas_usadas': stats['resoluciones_comunes'],
        'uptime': get_uptime()
    }
```

**Visualización en Frontend:**

```javascript
// components/MetricsPanel.jsx
export function MetricsPanel() {
  const [metrics, setMetrics] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:8000/metrics/stats')
      .then(res => res.json())
      .then(data => setMetrics(data));
  }, []);
  
  return (
    <div className="metrics-panel">
      <h3>Estadísticas de Uso</h3>
      <p>Imágenes procesadas: {metrics?.total_procesadas}</p>
      <p>Tiempo promedio: {metrics?.tiempo_promedio_ms} ms</p>
      <p>Memoria GPU promedio: {metrics?.memoria_promedio_mb} MB</p>
    </div>
  );
}
```

---

## 5. CRITERIOS DE ÉXITO DEL PROYECTO

### 5.1 Métricas de Rendimiento

| **Métrica**                | **Objetivo**       | **Aceptable**      | **Óptimo**        |
|---------------------------|--------------------|--------------------|-------------------|
| Tiempo de upscale (1K→4K) | < 10 segundos      | < 5 segundos       | < 2 segundos      |
| Uso de memoria GPU        | < 8 GB             | < 4 GB             | < 2 GB            |
| Latencia del backend      | < 500 ms overhead  | < 200 ms           | < 100 ms          |
| Tamaño del modelo         | < 50 MB            | < 20 MB            | < 10 MB           |

### 5.2 Métricas de Calidad

| **Métrica**                | **Objetivo**       | **Comparación**                    |
|---------------------------|--------------------|------------------------------------|
| PSNR (si hay GT)          | > 28 dB            | vs Bicubic: +5 dB                  |
| LPIPS (si hay GT)         | < 0.15             | vs Bicubic: -0.10                  |
| NIQE (sin GT)             | < 4.5              | Imágenes naturales típicas < 5     |
| Preferencia de usuarios   | > 70%              | vs Bicubic en user studies         |

### 5.3 Métricas de Usabilidad

| **Métrica**                | **Objetivo**       |
|---------------------------|--------------------| 
| Tasa de éxito de carga    | > 95%              |
| Tiempo de respuesta UI    | < 100 ms           |
| Compatibilidad formatos   | JPG, PNG, WEBP     |
| Tamaño máximo soportado   | > 16 megapíxeles   |

---

## 6. LIMITACIONES Y CONSIDERACIONES

### 6.1 Limitaciones del Paradigma Supervisado

**1. Dependencia de Ground Truth:**
- Real-ESRGAN aprende patrones del dataset DIV2K/Flickr
- **Sesgo:** Si dataset no contiene cierto tipo de imágenes, el modelo falla
- **Ejemplo:** Pocas imágenes médicas → pobre rendimiento en rayos X

**2. Alucinación vs Fidelidad:**
- GANs **generan texturas** que no existen en LR
- Esto puede ser deseable (fotos) o peligroso (análisis forense)
- **Trade-off:** Realismo ↔ Fidelidad

**3. Mode Collapse:**
- En entrenamiento GAN, el generador puede colapsar a generar pocas variaciones
- Real-ESRGAN mitiga esto con degradación sintética variada

---

### 6.2 Métricas No Capturan Todo

**PSNR/SSIM pueden ser engañosas:**
```
Caso 1: Imagen borrosa pero "correcta"
  → PSNR alto, pero mala calidad perceptual

Caso 2: Imagen con texturas realistas generadas
  → PSNR bajo, pero excelente calidad perceptual
```

**Recomendación:** Siempre combinar métricas objetivas + perceptuales + validación visual.

---

## 7. CONCLUSIONES

### 7.1 Resumen del Paradigma

| **Aspecto**               | **Real-ESRGAN**                                       |
|--------------------------|-------------------------------------------------------|
| **Tipo de aprendizaje**   | **Supervisado Adversarial** (GAN)                     |
| **Datos de entrenamiento**| Pares (LR, HR) con degradación sintética realista     |
| **Función objetivo**      | L₁ + Perceptual + Adversarial                         |
| **Arquitectura**          | Generador (RRDB) + Discriminador (VGG-style)          |
| **Dataset**               | DIV2K + Flickr2K + OST (~800K pares)                  |
| **Iteraciones**           | 400K - 1M                                             |
| **Hardware**              | 8× NVIDIA V100 GPUs, ~2-4 semanas                     |
| **Métrica principal**     | LPIPS + Validación visual humana                      |

### 7.2 Ventajas del Enfoque

✅ **Aprendizaje supervisado:** Usa conocimiento de imágenes HR  
✅ **GAN:** Genera texturas fotorrealistas  
✅ **Degradación sintética:** Generaliza a imágenes del mundo real  
✅ **Multi-loss:** Balancea fidelidad y realismo  
✅ **Métricas perceptuales:** Evalúa calidad visual real

### 7.3 Aplicabilidad al Proyecto rIA

El modelo pre-entrenado Real-ESRGAN es **óptimo para rIA** porque:

1. **No requiere re-entrenamiento:** Listo para usar
2. **Generaliza bien:** Funciona en fotos, arte, capturas de pantalla
3. **Métrica clara:** Evaluar con LPIPS + tiempo de inferencia
4. **Escalable:** Versión Vulkan optimizada para producción

### 7.4 Próximos Pasos

**Para implementar en rIA:**

1. ✅ Integrar logging de métricas de rendimiento
2. ✅ Crear dashboard de estadísticas de uso
3. ⚠️ Implementar cálculo de NIQE para imágenes sin GT
4. ⚠️ Agregar user feedback para métricas cualitativas
5. ⚠️ Benchmark contra otros modelos (ESRGAN, SwinIR)

---

## 8. REFERENCIAS

### 8.1 Publicaciones Científicas

1. **Real-ESRGAN:**  
   Wang et al. (2021). "Real-ESRGAN: Training Real-World Blind Super-Resolution with Pure Synthetic Data"  
   arXiv:2107.10833

2. **GAN Original:**  
   Goodfellow et al. (2014). "Generative Adversarial Networks"  
   NeurIPS 2014

3. **LPIPS:**  
   Zhang et al. (2018). "The Unreasonable Effectiveness of Deep Features as a Perceptual Metric"  
   CVPR 2018

4. **SSIM:**  
   Wang et al. (2004). "Image Quality Assessment: From Error Visibility to Structural Similarity"  
   IEEE TIP 2004

5. **FID:**  
   Heusel et al. (2017). "GANs Trained by a Two Time-Scale Update Rule Converge to a Local Nash Equilibrium"  
   NeurIPS 2017

### 8.2 Recursos Adicionales

- **Papers with Code - Super Resolution Benchmark:**  
  https://paperswithcode.com/task/image-super-resolution

- **NTIRE Challenges (SR competitions):**  
  https://data.vision.ee.ethz.ch/cvl/ntire/

- **Real-ESRGAN Training Code:**  
  https://github.com/xinntao/Real-ESRGAN/tree/master/scripts

---

## APÉNDICE A: CÓDIGO DE EVALUACIÓN

### Cálculo de PSNR en Python:

```python
import numpy as np
import cv2

def calcular_psnr(img1, img2, max_value=255):
    """
    Calcula PSNR entre dos imágenes.
    
    Args:
        img1, img2: Imágenes numpy array (H, W, C)
        max_value: Valor máximo de píxel (255 para uint8)
    
    Returns:
        psnr: Peak Signal-to-Noise Ratio en dB
    """
    mse = np.mean((img1.astype(np.float64) - img2.astype(np.float64)) ** 2)
    
    if mse == 0:
        return float('inf')  # Imágenes idénticas
    
    psnr = 20 * np.log10(max_value / np.sqrt(mse))
    return psnr

# Uso
img_sr = cv2.imread('upscaled.png')
img_hr = cv2.imread('ground_truth.png')

psnr = calcular_psnr(img_sr, img_hr)
print(f"PSNR: {psnr:.2f} dB")
```

### Cálculo de SSIM en Python:

```python
from skimage.metrics import structural_similarity as ssim
import cv2

def calcular_ssim(img1, img2):
    """
    Calcula SSIM entre dos imágenes.
    
    Args:
        img1, img2: Imágenes numpy array (H, W, C)
    
    Returns:
        ssim_value: Structural Similarity Index [0, 1]
    """
    # Convertir a escala de grises si es necesario
    if len(img1.shape) == 3:
        img1_gray = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
        img2_gray = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
    else:
        img1_gray = img1
        img2_gray = img2
    
    ssim_value = ssim(img1_gray, img2_gray, data_range=255)
    return ssim_value

# Uso
img_sr = cv2.imread('upscaled.png')
img_hr = cv2.imread('ground_truth.png')

ssim_value = calcular_ssim(img_sr, img_hr)
print(f"SSIM: {ssim_value:.4f}")
```

### Cálculo de LPIPS (requiere PyTorch):

```python
import lpips
import torch
from PIL import Image
import torchvision.transforms as transforms

def calcular_lpips(img1_path, img2_path):
    """
    Calcula LPIPS entre dos imágenes.
    
    Args:
        img1_path, img2_path: Rutas a las imágenes
    
    Returns:
        lpips_value: Learned Perceptual Image Patch Similarity [0, 1]
    """
    # Inicializar modelo LPIPS (VGG)
    loss_fn = lpips.LPIPS(net='vgg')
    
    # Cargar imágenes
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ])
    
    img1 = transform(Image.open(img1_path)).unsqueeze(0)
    img2 = transform(Image.open(img2_path)).unsqueeze(0)
    
    # Calcular LPIPS
    with torch.no_grad():
        lpips_value = loss_fn(img1, img2).item()
    
    return lpips_value

# Uso
lpips_value = calcular_lpips('upscaled.png', 'ground_truth.png')
print(f"LPIPS: {lpips_value:.4f}")
```

---

## APÉNDICE B: GLOSARIO

- **Aprendizaje Supervisado:** Entrenamiento con pares (input, output) etiquetados
- **GAN:** Generative Adversarial Network - Generador vs Discriminador
- **Ground Truth (GT):** Imagen de referencia "correcta" (alta resolución)
- **PSNR:** Peak Signal-to-Noise Ratio - Métrica objetiva pixel-wise
- **SSIM:** Structural Similarity Index - Métrica objetiva estructural
- **LPIPS:** Learned Perceptual Image Patch Similarity - Métrica perceptual
- **FID:** Fréchet Inception Distance - Métrica de distribución de imágenes
- **NIQE:** Natural Image Quality Evaluator - Métrica no-reference
- **MOS:** Mean Opinion Score - Promedio de calificaciones humanas
- **Adversarial Loss:** Pérdida que mide cuán bien el discriminador clasifica
- **Perceptual Loss:** Pérdida basada en características de alto nivel (VGG)
- **Mode Collapse:** Problema en GANs donde generador produce poca variación

---

**FIN DEL REPORTE**

---

*Este documento es parte de la suite de documentación técnica del proyecto rIA. Para más información sobre la arquitectura del modelo, consulte [ARQUITECTURA_MODELO_IA.md](./ARQUITECTURA_MODELO_IA.md).*

**Última actualización:** 27 de Noviembre, 2025  
**Versión:** 1.0