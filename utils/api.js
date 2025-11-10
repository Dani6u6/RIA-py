/**
 * Utilidades para comunicación con el backend FastAPI
 * 
 * Este archivo proporciona funciones para integrar el frontend con el backend
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Verifica si el backend está disponible
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('Backend no disponible:', error);
    return false;
  }
}

/**
 * Reescala una imagen usando el backend de IA
 * 
 * @param {string} imageBase64 - Imagen en formato base64
 * @param {object} options - Opciones de reescalado
 * @returns {Promise<object>} - Resultado con la imagen reescalada
 */
export async function upscaleImageWithBackend(imageBase64, options = {}) {
  const {
    scale = 2,
    model = 'general',
    denoiseStrength = 50,
    upscaleType = 'AI Enhanced'
  } = options;

  try {
    // Crear AbortController para timeout personalizado
    // 900000ms = 15 minutos (ajustable según necesidad)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 900000);

    const response = await fetch(`${API_BASE_URL}/api/upscale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        image: imageBase64,
        scale,
        model,
        denoise_strength: denoiseStrength,
        upscale_type: upscaleType
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error al procesar imagen');
    }

    return {
      success: true,
      image: result.image,
      width: result.width,
      height: result.height,
      message: result.message
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('⏱️ Timeout: El procesamiento tomó más de 15 minutos. Intenta con una imagen más pequeña o ajusta el timeout.');
    }
    console.error('Error al llamar al backend:', error);
    throw error;
  }
}

/**
 * Obtiene los modelos de IA disponibles
 */
export async function getAvailableModels() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const models = await response.json();
    return models || [];
  } catch (error) {
    console.error('Error al obtener modelos:', error);
    // Retornar modelos por defecto si el backend no está disponible
    return [
      { id: 'general', name: 'realesrgan-x4plus', description: 'Modelo general para todo tipo de imágenes', scale: 4 },
      { id: 'anime', name: 'realesrgan-x4plus-anime', description: 'Optimizado para anime e ilustraciones', scale: 4 },
      { id: 'anime-video-2x', name: 'realesr-animevideov3', description: 'Optimizado para anime y video 2x', scale: 2 },
      { id: 'anime-video-3x', name: 'realesr-animevideov3', description: 'Optimizado para anime y video 3x', scale: 3 },
      { id: 'anime-video-4x', name: 'realesr-animevideov3', description: 'Optimizado para anime y video 4x', scale: 4 }
    ];
  }
}

/**
 * Wrapper para usar con Electron
 * Usa la API expuesta por el preload script si está disponible
 */
export async function upscaleImage(imageBase64, options = {}) {
  // Verificar si estamos en Electron y si la API está disponible
  if (window.electronAPI && window.electronAPI.callBackendAPI) {
    try {
      return await window.electronAPI.callBackendAPI('/api/upscale', {
        image: imageBase64,
        scale: options.scale || 2,
        model: options.model || 'general',
        denoise_strength: options.denoiseStrength || 50,
        upscale_type: options.upscaleType || 'AI Enhanced'
      });
    } catch (error) {
      console.error('Error con Electron API, usando fetch directo:', error);
      // Fallback a fetch directo si falla
      return await upscaleImageWithBackend(imageBase64, options);
    }
  } else {
    // Si no estamos en Electron, usar fetch directo
    return await upscaleImageWithBackend(imageBase64, options);
  }
}
