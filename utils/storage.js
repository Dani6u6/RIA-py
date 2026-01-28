/**
 * Utilidades para manejar el almacenamiento de imágenes en Electron
 * 
 * IMPORTANTE: Este archivo debe ser llamado desde el proceso principal (main) de Electron
 * La comunicación con el renderer process debe hacerse vía IPC
 */

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: { invoke: () => Promise.resolve() } };

/**
 * Copia una imagen al directorio de álbumes de la aplicación
 * @param {string} sourceBase64 - Imagen en formato base64
 * @param {number} albumId - ID del álbum
 * @param {string} type - Tipo de imagen ('original' o 'upscaled')
 * @returns {Promise<string>} Ruta donde se guardó la imagen
 */
export async function saveImageToAlbumFolder(sourceBase64, albumId, type = 'upscaled') {
  try {
    return await ipcRenderer.invoke('storage:saveImage', { sourceBase64, albumId, type });
  } catch (error) {
    console.error("Error saving image to album folder:", error);
    throw error;
  }
}

/**
 * Obtiene la ruta del directorio de álbumes
 * @returns {Promise<string>} Ruta del directorio
 */
export async function getAlbumsDirectory() {
  try {
    return await ipcRenderer.invoke('storage:getAlbumsDir');
  } catch (error) {
    console.error("Error getting albums directory:", error);
    return "";
  }
}

/**
 * Abre el directorio de un álbum en el explorador de archivos
 * @param {number} albumId - ID del álbum
 * @returns {Promise<void>}
 */
export async function openAlbumFolder(albumId) {
  try {
    return await ipcRenderer.invoke('storage:openAlbumFolder', albumId);
  } catch (error) {
    console.error("Error opening album folder:", error);
    throw error;
  }
}

/**
 * Obtiene el tamaño total usado por un álbum
 * @param {number} albumId - ID del álbum
 * @returns {Promise<number>} Tamaño en bytes
 */
export async function getAlbumSize(albumId) {
  try {
    return await ipcRenderer.invoke('storage:getAlbumSize', albumId);
  } catch (error) {
    console.error("Error getting album size:", error);
    return 0;
  }
}

/**
 * Obtiene información de una imagen desde su ruta
 * @param {string} imagePath - Ruta de la imagen
 * @returns {Promise<Object>} Información de la imagen (ancho, alto, tamaño)
 */
export async function getImageInfo(imagePath) {
  try {
    return await ipcRenderer.invoke('storage:getImageInfo', imagePath);
  } catch (error) {
    console.error("Error getting image info:", error);
    throw error;
  }
}

/**
 * Convierte bytes a formato legible (KB, MB, GB)
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Lee una imagen desde el sistema de archivos y la convierte a base64
 * @param {string} imagePath - Ruta de la imagen
 * @returns {Promise<string>} Imagen en formato base64
 */
export async function readImageAsBase64(imagePath) {
  try {
    return await ipcRenderer.invoke('storage:readImageAsBase64', imagePath);
  } catch (error) {
    console.error("Error reading image as base64:", error);
    return imagePath; // Fallback
  }
}
