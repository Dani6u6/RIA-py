/**
 * Utilidades para manejar el almacenamiento de imágenes en Electron
 * 
 * IMPORTANTE: Este archivo debe ser llamado desde el proceso principal (main) de Electron
 * La comunicación con el renderer process debe hacerse vía IPC
 */

/**
 * Copia una imagen al directorio de álbumes de la aplicación
 * @param {string} sourceBase64 - Imagen en formato base64
 * @param {number} albumId - ID del álbum
 * @param {string} type - Tipo de imagen ('original' o 'upscaled')
 * @returns {Promise<string>} Ruta donde se guardó la imagen
 */
export async function saveImageToAlbumFolder(sourceBase64, albumId, type = 'upscaled') {
  /* IMPLEMENTACIÓN EN ELECTRON:
  
  const { ipcRenderer } = require('electron');
  return ipcRenderer.invoke('storage:saveImage', { sourceBase64, albumId, type });
  
  // En el main process:
  const fs = require('fs');
  const path = require('path');
  const { app } = require('electron');
  
  ipcMain.handle('storage:saveImage', async (event, { sourceBase64, albumId, type }) => {
    try {
      // Directorio base para álbumes: userData/albums
      const albumsDir = path.join(app.getPath('userData'), 'albums');
      
      // Crear directorio de álbumes si no existe
      if (!fs.existsSync(albumsDir)) {
        fs.mkdirSync(albumsDir, { recursive: true });
      }
      
      // Crear subdirectorio para este álbum
      const albumDir = path.join(albumsDir, `album_${albumId}`);
      if (!fs.existsSync(albumDir)) {
        fs.mkdirSync(albumDir, { recursive: true });
      }
      
      // Crear subdirectorios para original y upscaled
      const typeDir = path.join(albumDir, type);
      if (!fs.existsSync(typeDir)) {
        fs.mkdirSync(typeDir, { recursive: true });
      }
      
      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const filename = `${type}_${timestamp}_${random}.png`;
      const filePath = path.join(typeDir, filename);
      
      // Convertir base64 a buffer y guardar
      // Remover el prefijo "data:image/png;base64," si existe
      const base64Data = sourceBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      fs.writeFileSync(filePath, buffer);
      
      return filePath;
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  });
  */
  
  console.log(`Saving ${type} image to album ${albumId}`);
  // En desarrollo, retornamos la misma imagen base64
  return Promise.resolve(sourceBase64);
}

/**
 * Obtiene la ruta del directorio de álbumes
 * @returns {Promise<string>} Ruta del directorio
 */
export async function getAlbumsDirectory() {
  /* IMPLEMENTACIÓN EN ELECTRON:
  
  const { ipcRenderer } = require('electron');
  return ipcRenderer.invoke('storage:getAlbumsDir');
  
  // En el main process:
  ipcMain.handle('storage:getAlbumsDir', async () => {
    const path = require('path');
    const { app } = require('electron');
    return path.join(app.getPath('userData'), 'albums');
  });
  */
  
  console.log("Getting albums directory");
  return Promise.resolve("/path/to/albums");
}

/**
 * Abre el directorio de un álbum en el explorador de archivos
 * @param {number} albumId - ID del álbum
 * @returns {Promise<void>}
 */
export async function openAlbumFolder(albumId) {
  /* IMPLEMENTACIÓN EN ELECTRON:
  
  const { ipcRenderer } = require('electron');
  return ipcRenderer.invoke('storage:openAlbumFolder', albumId);
  
  // En el main process:
  ipcMain.handle('storage:openAlbumFolder', async (event, albumId) => {
    const path = require('path');
    const { app, shell } = require('electron');
    
    const albumDir = path.join(app.getPath('userData'), 'albums', `album_${albumId}`);
    
    // Crear el directorio si no existe
    const fs = require('fs');
    if (!fs.existsSync(albumDir)) {
      fs.mkdirSync(albumDir, { recursive: true });
    }
    
    // Abrir en el explorador de archivos
    shell.openPath(albumDir);
  });
  */
  
  console.log("Opening album folder:", albumId);
  return Promise.resolve();
}

/**
 * Obtiene el tamaño total usado por un álbum
 * @param {number} albumId - ID del álbum
 * @returns {Promise<number>} Tamaño en bytes
 */
export async function getAlbumSize(albumId) {
  /* IMPLEMENTACIÓN EN ELECTRON:
  
  const { ipcRenderer } = require('electron');
  return ipcRenderer.invoke('storage:getAlbumSize', albumId);
  
  // En el main process:
  ipcMain.handle('storage:getAlbumSize', async (event, albumId) => {
    const fs = require('fs');
    const path = require('path');
    const { app } = require('electron');
    
    const albumDir = path.join(app.getPath('userData'), 'albums', `album_${albumId}`);
    
    if (!fs.existsSync(albumDir)) {
      return 0;
    }
    
    let totalSize = 0;
    
    function getDirectorySize(dirPath) {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      });
    }
    
    getDirectorySize(albumDir);
    return totalSize;
  });
  */
  
  console.log("Getting album size:", albumId);
  return Promise.resolve(0);
}

/**
 * Obtiene información de una imagen desde su ruta
 * @param {string} imagePath - Ruta de la imagen
 * @returns {Promise<Object>} Información de la imagen (ancho, alto, tamaño)
 */
export async function getImageInfo(imagePath) {
  /* IMPLEMENTACIÓN EN ELECTRON:
  
  const { ipcRenderer } = require('electron');
  return ipcRenderer.invoke('storage:getImageInfo', imagePath);
  
  // En el main process:
  ipcMain.handle('storage:getImageInfo', async (event, imagePath) => {
    const fs = require('fs');
    const sizeOf = require('image-size'); // npm install image-size
    
    if (!fs.existsSync(imagePath)) {
      throw new Error('Image file not found');
    }
    
    const stats = fs.statSync(imagePath);
    const dimensions = sizeOf(imagePath);
    
    return {
      width: dimensions.width,
      height: dimensions.height,
      size: stats.size,
      path: imagePath
    };
  });
  */
  
  console.log("Getting image info:", imagePath);
  return Promise.resolve({
    width: 1920,
    height: 1080,
    size: 1024000,
    path: imagePath
  });
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
  /* IMPLEMENTACIÓN EN ELECTRON:
  
  const { ipcRenderer } = require('electron');
  return ipcRenderer.invoke('storage:readImageAsBase64', imagePath);
  
  // En el main process:
  ipcMain.handle('storage:readImageAsBase64', async (event, imagePath) => {
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(imagePath)) {
      throw new Error('Image file not found');
    }
    
    const buffer = fs.readFileSync(imagePath);
    const base64 = buffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    
    let mimeType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.webp') mimeType = 'image/webp';
    
    return `data:${mimeType};base64,${base64}`;
  });
  */
  
  console.log("Reading image as base64:", imagePath);
  return Promise.resolve(imagePath); // En desarrollo, retornamos la ruta
}
