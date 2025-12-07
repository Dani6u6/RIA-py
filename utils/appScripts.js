import { toast } from "sonner";
import { upscaleImage as upscaleWithBackend, checkBackendHealth } from "./api";

/**
 * Maneja la selección de una imagen
 * @param {File} file - Archivo de imagen seleccionado
 * @param {Function} setOriginalImage - Setter para la imagen original
 * @param {Function} setUpscaledImage - Setter para la imagen reescalada
 */
export const handleImageSelect = (file, setOriginalImage, setUpscaledImage) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    setOriginalImage(e.target?.result);
    setUpscaledImage(null);
    toast.success("Imagen cargada correctamente");
  };
  reader.readAsDataURL(file);
};

/**
 * Procesa reescalado de imagen con IA usando el backend o simulación local
 * @param {string} originalImage - URL de la imagen original en formato base64
 * @param {number} scale - Factor de escala
 * @param {string} model - Modelo a usar
 * @param {number} denoiseStrength - Fuerza del denoise/mejora
 * @param {string} upscaleType - Tipo de reescalado
 * @param {Function} setIsProcessing - Setter para el estado de procesamiento
 * @param {Function} setProgress - Setter para el progreso
 * @param {Function} setUpscaledImage - Setter para la imagen reescalada
 * @param {Function} setRenderKey - Setter para forzar re-render
 * @param {boolean} useBackend - Si usar el backend real o simulación
 */
export const upscaleImage = async (
  originalImage,
  scale,
  model,
  denoiseStrength,
  upscaleType,
  setIsProcessing,
  setProgress,
  setUpscaledImage,
  setRenderKey,
  useBackend = false,
  setNiqeScore = null,
  setQualityRating = null
) => {
  if (!originalImage) {
    console.log("No hay imagen original");
    return;
  }

  console.log("Iniciando procesamiento...");
  setIsProcessing(true);
  setProgress(0);

  try {
    if (useBackend) {
      // ========================================
      // MODO BACKEND REAL CON REAL-ESRGAN
      // ========================================
      console.log("🚀 Usando backend de Real-ESRGAN...");

      // Verificar salud del backend
      console.log(
        `🔍 Verificando backend en http://localhost:8000 para modelo: ${model}`
      );
      const isHealthy = await checkBackendHealth();

      if (!isHealthy) {
        console.error("❌ Backend no disponible en http://localhost:8000");
        console.log("💡 SOLUCIÓN:");
        console.log("  1. Abre una terminal en la carpeta 'backend'");
        console.log("  2. Ejecuta: python main.py");
        console.log("  3. Si el backend está corriendo pero falla:");
        console.log(
          "     - Verifica los modelos: python backend/check_models.py"
        );
        console.log("     - Copia los modelos: python backend/setup.py");
        console.log(
          "  4. Asegúrate de que los modelos estén en backend/models/"
        );
        throw new Error("Backend no disponible, usando simulación local");
      }

      console.log("✅ Backend disponible, procesando con Real-ESRGAN...");
      console.log(
        `📊 Parámetros: modelo="${model}", escala=${scale}x, denoise=${denoiseStrength}%, tipo="${upscaleType}"`
      );

      // Simular progreso mientras procesa el backend
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 500);

      try {
        // LLAMADA REAL AL BACKEND DE REAL-ESRGAN
        console.log(`🚀 Enviando solicitud al backend con modelo: ${model}`);
        const result = await upscaleWithBackend(originalImage, {
          scale,
          model,
          denoiseStrength,
          upscaleType,
        });

        clearInterval(progressInterval);
        setProgress(100);

        // IMPORTANTE: Aquí es donde se recibe la imagen real procesada
        console.log("✅ Respuesta del backend:", {
          width: result.width,
          height: result.height,
          hasImage: !!result.image,
        });

        // POSIBLE CAUSA DEL "0x0 undefined":
        // Si result.width o result.height son undefined/0, hay un problema con el backend
        if (!result.width || !result.height || !result.image) {
          console.error("❌ ERROR: El backend devolvió datos incompletos");
          console.error("Datos recibidos:", result);
          throw new Error(
            `Backend devolvió dimensiones inválidas: ${result.width}x${result.height}`
          );
        }

        setUpscaledImage(result.image);
        setIsProcessing(false);
        setRenderKey((prev) => prev + 1);

        // Extraer y guardar métricas NIQE si están disponibles
        if (result.niqe_score !== undefined && result.niqe_score !== null) {
          console.log("📊 Métricas NIQE recibidas:", {
            score: result.niqe_score,
            rating: result.quality_rating,
          });
          if (setNiqeScore) setNiqeScore(result.niqe_score);
          if (setQualityRating)
            setQualityRating(result.quality_rating || "Unknown");
          toast.success(
            `¡Reescalado completado! (${result.width}x${result.height}) - Calidad: ${result.quality_rating}`
          );
        } else {
          console.log("⚠️ NIQE no disponible en la respuesta del backend");
          toast.success(
            `¡Reescalado completado con Real-ESRGAN! (${result.width}x${result.height})`
          );
        }
      } catch (backendError) {
        clearInterval(progressInterval);
        console.error("❌ Error del backend Real-ESRGAN:", backendError);
        console.log("💡 El error puede ser por:");
        console.log("  - El modelo seleccionado no está disponible");
        console.log("  - La imagen es demasiado grande");
        console.log("  - Falta Vulkan o drivers de GPU");
        throw new Error("Backend falló, usando simulación local");
      }
    } else {
      // ========================================
      // MODO SIMULACIÓN LOCAL (SIN REAL-ESRGAN)
      // ========================================
      console.log("🎨 Usando simulación local (NO es Real-ESRGAN)");

      // Usar simulación local (método anterior)
      await simulateUpscaleLocally(
        originalImage,
        scale,
        denoiseStrength,
        setProgress,
        setUpscaledImage,
        setIsProcessing,
        setRenderKey
      );

      // Resetear NIQE en modo simulación
      if (setNiqeScore) setNiqeScore(null);
      if (setQualityRating) setQualityRating(null);
    }
  } catch (error) {
    console.error("Error durante el procesamiento:", error);

    // Si falla el backend, intentar con simulación local
    if (useBackend && error.message.includes("Backend")) {
      console.log("Fallback a simulación local...");
      toast.warning("Backend no disponible, usando simulación local");

      try {
        await simulateUpscaleLocally(
          originalImage,
          scale,
          denoiseStrength,
          setProgress,
          setUpscaledImage,
          setIsProcessing,
          setRenderKey
        );
      } catch (localError) {
        setIsProcessing(false);
        toast.error(`Error: ${localError.message}`);
      }
    } else {
      setIsProcessing(false);
      toast.error(`Error: ${error.message}`);
    }
  }
};

/**
 * Simula el proceso de reescalado de imagen localmente (sin backend)
 *
 * NOTA IMPORTANTE SOBRE EL PROBLEMA "0x0 undefined":
 * Este es un método de SIMULACIÓN que usa Canvas HTML5 del navegador,
 * NO es el reescalado real con Real-ESRGAN.
 *
 * El problema "reescalado exitoso 0x0 undefined" puede ocurrir por:
 * 1. La imagen no se carga correctamente antes de procesarla
 * 2. El canvas no tiene dimensiones válidas
 * 3. El backend Real-ESRGAN no está conectado o devuelve error
 *
 * SOLUCIÓN PARA USAR REAL-ESRGAN REAL:
 * - Activar el switch "Real-ESRGAN (Backend)" en la interfaz
 * - Asegurarse de que el backend FastAPI esté ejecutándose (python backend/main.py)
 * - El backend debe estar en http://localhost:8000
 * - Los modelos Real-ESRGAN deben estar descargados en backend/models/
 */
async function simulateUpscaleLocally(
  originalImage,
  scale,
  denoiseStrength,
  setProgress,
  setUpscaledImage,
  setIsProcessing,
  setRenderKey
) {
  // Simulate AI processing with progress
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    setProgress((i / steps) * 100);
  }

  console.log("Progreso completado, creando imagen...");

  // IMPORTANTE: En una aplicación real con Real-ESRGAN, este código NO se usa
  // Este es solo para demostración cuando el backend no está disponible
  const img = new Image();

  // Wait for image to load
  await new Promise((resolve, reject) => {
    img.onload = () => {
      console.log("Imagen cargada:", img.width, "x", img.height);
      resolve();
    };
    img.onerror = (error) => {
      console.error("Error al cargar imagen:", error);
      reject(error);
    };
    img.src = originalImage;
  });

  // POSIBLE CAUSA DEL PROBLEMA: Si img.width o img.height son 0, el canvas será 0x0
  if (!img.width || !img.height) {
    console.error(
      "⚠️ PROBLEMA DETECTADO: La imagen no tiene dimensiones válidas"
    );
    console.error("img.width:", img.width, "img.height:", img.height);
    throw new Error("La imagen no se cargó correctamente. Dimensiones: 0x0");
  }

  const canvas = document.createElement("canvas");
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  console.log("Canvas creado:", canvas.width, "x", canvas.height);

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No se pudo obtener el contexto del canvas");
  }

  // Apply scaling and simulated enhancement
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  console.log("Imagen dibujada en canvas");

  // Apply slight sharpening effect to simulate AI enhancement
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Simple contrast adjustment for demo
  const factor = 1.1 + denoiseStrength / 500;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * factor);
    data[i + 1] = Math.min(255, data[i + 1] * factor);
    data[i + 2] = Math.min(255, data[i + 2] * factor);
  }

  ctx.putImageData(imageData, 0, 0);
  console.log("Filtros aplicados");

  const result = canvas.toDataURL("image/png");
  console.log("Canvas convertido a dataURL, longitud:", result.length);
  console.log("Resultado preview:", result.substring(0, 100));

  // Update states
  console.log("Actualizando estados...");
  setUpscaledImage(result);
  setIsProcessing(false);
  setRenderKey((prev) => prev + 1);

  console.log("Estados actualizados");
  // NOTA: Este mensaje muestra "simulación local" porque NO está usando Real-ESRGAN
  toast.success(
    `¡Reescalado completado! (simulación local - ${canvas.width}x${canvas.height})`
  );
}

/**
 * Alias para compatibilidad (simulación local)
 */
export const simulateUpscale = async (
  originalImage,
  scale,
  denoiseStrength,
  setIsProcessing,
  setProgress,
  setUpscaledImage,
  setRenderKey
) => {
  await upscaleImage(
    originalImage,
    scale,
    "general",
    denoiseStrength,
    "AI Enhanced",
    setIsProcessing,
    setProgress,
    setUpscaledImage,
    setRenderKey,
    false // No usar backend por defecto
  );
};

/**
 * Maneja la descarga de la imagen reescalada
 * @param {string} upscaledImage - URL de la imagen reescalada en formato base64
 * @param {number} scale - Factor de escala usado
 * @param {string} outputPath - Ruta de salida configurada
 */
export const handleDownload = (upscaledImage, scale, outputPath) => {
  if (!upscaledImage) return;

  const link = document.createElement("a");
  link.href = upscaledImage;
  link.download = `upscaled_${scale}x_${Date.now()}.png`;
  link.click();
  toast.success(`Imagen guardada en ${outputPath}`);
};

/**
 * Resetea el estado de la aplicación
 * @param {Function} setOriginalImage - Setter para la imagen original
 * @param {Function} setUpscaledImage - Setter para la imagen reescalada
 * @param {Function} setProgress - Setter para el progreso
 */
export const handleReset = (
  setOriginalImage,
  setUpscaledImage,
  setProgress
) => {
  setOriginalImage(null);
  setUpscaledImage(null);
  setProgress(0);
  toast.info("Reiniciado");
};

/**
 * Restablece la configuración a valores predeterminados
 * @param {Function} setOutputPath - Setter para la ruta de salida
 * @param {Function} setUpscaleType - Setter para el tipo de reescalado
 * @param {Function} setOutputSize - Setter para el tamaño de salida
 */
export const resetSettings = (setOutputPath, setUpscaleType, setOutputSize) => {
  setOutputPath("~/Downloads");
  setUpscaleType("AI Enhanced");
  setOutputSize("Auto");
  toast.success("Configuración restablecida");
};

/**
 * Aplica o remueve el modo oscuro del documento
 * @param {boolean} isDarkMode - Estado del modo oscuro
 */
export const applyDarkMode = (isDarkMode) => {
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};
