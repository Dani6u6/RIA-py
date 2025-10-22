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
    const response = await fetch(`${API_BASE_URL}/api/upscale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
        scale,
        model,
        denoise_strength: denoiseStrength,
        upscale_type: upscaleType
      })
    });

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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Error al obtener modelos:', error);
    // Retornar modelos por defecto si el backend no está disponible
    return [
      { id: 'general', name: 'General Purpose', description: 'Modelo general' },
      { id: 'photo', name: 'Fotografía', description: 'Para fotografías' },
      { id: 'anime', name: 'Anime & Arte', description: 'Para ilustraciones' },
      { id: 'face', name: 'Mejora de Rostros', description: 'Para rostros' }
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
