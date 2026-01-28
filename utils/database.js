/**
 * Utilidades para manejar SQLite en Electron
 * 
 * IMPORTANTE: Este archivo debe ser llamado desde el proceso principal (main) de Electron
 * La comunicación con el renderer process debe hacerse vía IPC
 */

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: { invoke: () => Promise.resolve() } };

/**
 * Inicializa la base de datos SQLite
 * Crea las tablas si no existen
 */
export async function initDatabase() {
  console.log("SQLite database initialized via Main Process");
  return Promise.resolve();
}

/**
 * Crea un nuevo álbum
 * @param {string} name - Nombre del álbum
 * @returns {Promise<number>} ID del álbum creado
 */
export async function createAlbum(name) {
  try {
    return await ipcRenderer.invoke('db:createAlbum', { name });
  } catch (error) {
    console.error("Error creating album:", error);
    throw error;
  }
}

/**
 * Obtiene todos los álbumes
 * @returns {Promise<Array>} Lista de álbumes
 */
export async function getAllAlbums() {
  try {
    return await ipcRenderer.invoke('db:getAllAlbums');
  } catch (error) {
    console.error("Error getting albums:", error);
    return [];
  }
}

/**
 * Actualiza el nombre de un álbum
 * @param {number} id - ID del álbum
 * @param {string} name - Nuevo nombre
 * @returns {Promise<void>}
 */
export async function updateAlbum(id, name) {
  try {
    return await ipcRenderer.invoke('db:updateAlbum', { id, name });
  } catch (error) {
    console.error("Error updating album:", error);
    throw error;
  }
}

/**
 * Guarda una imagen en un álbum
 * @param {Object} imageData - Datos de la imagen
 * @param {number} imageData.albumId - ID del álbum
 * @param {string} imageData.title - Título de la imagen
 * @param {string} imageData.category - Categoría
 * @param {string} imageData.originalPath - Ruta de la imagen original
 * @param {string} imageData.upscaledPath - Ruta de la imagen upscaled
 * @param {string} imageData.originalResolution - Resolución original (ej: "1920x1080")
 * @param {string} imageData.upscaledResolution - Resolución después del upscale
 * @param {string} imageData.model - Modelo utilizado (ej: "RealESRGAN_x4plus")
 * @returns {Promise<number>} ID de la imagen guardada
 */
export async function saveImageToAlbum(imageData) {
  try {
    return await ipcRenderer.invoke('db:saveImageToAlbum', imageData);
  } catch (error) {
    console.error("Error saving image to album:", error);
    throw error;
  }
}

/**
 * Obtiene todas las imágenes de un álbum
 * @param {number} albumId - ID del álbum
 * @returns {Promise<Array>} Lista de imágenes
 */
export async function getAlbumImages(albumId) {
  try {
    return await ipcRenderer.invoke('db:getAlbumImages', albumId);
  } catch (error) {
    console.error("Error getting album images:", error);
    return [];
  }
}

/**
 * Elimina una imagen
 * @param {number} imageId - ID de la imagen
 * @returns {Promise<void>}
 */
export async function deleteImage(imageId) {
  try {
    return await ipcRenderer.invoke('db:deleteImage', imageId);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

/**
 * Elimina un álbum y todas sus imágenes
 * @param {number} albumId - ID del álbum
 * @returns {Promise<void>}
 */
export async function deleteAlbum(albumId) {
  try {
    return await ipcRenderer.invoke('db:deleteAlbum', albumId);
  } catch (error) {
    console.error("Error deleting album:", error);
    throw error;
  }
}

/**
 * Busca imágenes por categoría o texto
 * @param {number} albumId - ID del álbum (opcional)
 * @param {string} searchText - Texto a buscar
 * @param {string} category - Categoría a filtrar (opcional)
 * @returns {Promise<Array>} Lista de imágenes que coinciden
 */
export async function searchImages(albumId, searchText, category) {
  try {
    return await ipcRenderer.invoke('db:searchImages', { albumId, searchText, category });
  } catch (error) {
    console.error("Error searching images:", error);
    return [];
  }
}
