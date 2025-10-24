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
  useBackend = false
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
      // Intentar usar el backend real
      console.log("Usando backend de Real-ESRGAN...");
      
      // Verificar salud del backend
      const isHealthy = await checkBackendHealth();
      
      if (!isHealthy) {
        throw new Error("Backend no disponible, usando simulación local");
      }
      
      // Simular progreso mientras procesa el backend
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 500);
      
      try {
        const result = await upscaleWithBackend(originalImage, {
          scale,
          model,
          denoiseStrength,
          upscaleType
        });
        
        clearInterval(progressInterval);
        setProgress(100);
        
        setUpscaledImage(result.image);
        setIsProcessing(false);
        setRenderKey(prev => prev + 1);
        
        toast.success(`¡Reescalado completado! (${result.width}x${result.height})`);
      } catch (backendError) {
        clearInterval(progressInterval);
        console.error("Error del backend:", backendError);
        throw new Error("Backend falló, usando simulación local");
      }
    } else {
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
    await new Promise(resolve => setTimeout(resolve, 100));
    setProgress((i / steps) * 100);
  }

  console.log("Progreso completado, creando imagen...");

  // In a real app, this would call an AI API
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
  const factor = 1.1 + (denoiseStrength / 500);
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
  setRenderKey(prev => prev + 1);
  
  console.log("Estados actualizados");
  toast.success("¡Reescalado completado! (simulación local)");
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
export const handleReset = (setOriginalImage, setUpscaledImage, setProgress) => {
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
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
