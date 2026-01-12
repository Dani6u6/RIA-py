/**
 * Utilidades para manejar SQLite en Electron
 * 
 * IMPORTANTE: Este archivo debe ser llamado desde el proceso principal (main) de Electron
 * La comunicación con el renderer process debe hacerse vía IPC
 */

// Estas funciones deben implementarse en el proceso principal de Electron (main.js)
// Por ahora simulamos las operaciones para desarrollo

/**
 * Inicializa la base de datos SQLite
 * Crea las tablas si no existen
 */
export async function initDatabase() {
  /* IMPLEMENTACIÓN EN ELECTRON MAIN PROCESS:
  
  const sqlite3 = require('sqlite3');
  const path = require('path');
  const { app } = require('electron');
  
  const dbPath = path.join(app.getPath('userData'), 'ria-albums.db');
  const db = new sqlite3.Database(dbPath);
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabla de álbumes
      db.run(`
        CREATE TABLE IF NOT EXISTS albums (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          coverImagePath TEXT,
          imageCount INTEGER DEFAULT 0,
          createdAt TEXT NOT NULL
        )
      `, (err) => {
        if (err) reject(err);
      });
      
      // Tabla de imágenes
      db.run(`
        CREATE TABLE IF NOT EXISTS images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          albumId INTEGER NOT NULL,
          title TEXT NOT NULL,
          category TEXT,
          originalPath TEXT NOT NULL,
          upscaledPath TEXT NOT NULL,
          originalResolution TEXT,
          upscaledResolution TEXT,
          model TEXT,
          savedAt TEXT NOT NULL,
          FOREIGN KEY (albumId) REFERENCES albums(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
      
      // Crear índices para mejorar el rendimiento
      db.run(`CREATE INDEX IF NOT EXISTS idx_images_albumId ON images(albumId)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_images_category ON images(category)`);
    });
  });
  */
  
  console.log("SQLite database initialized");
  return Promise.resolve();
}

/**
 * Crea un nuevo álbum
 * @param {string} name - Nombre del álbum
 * @returns {Promise<number>} ID del álbum creado
 */
export async function createAlbum(name) {
  /* IMPLEMENTACIÓN EN ELECTRON:
  
  const { ipcRenderer } = require('electron');
  return ipcRenderer.invoke('db:createAlbum', { name });
  
  // En el main process:
  ipcMain.handle('db:createAlbum', async (event, { name }) => {
    return new Promise((resolve, reject) => {
      const createdAt = new Date().toISOString();
      db.run(
        'INSERT INTO albums (name, imageCount, createdAt) VALUES (?, 0, ?)',
        [name, createdAt],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  });
  */
  
  console.log("Creating album:", name);
  return Promise.resolve(Date.now()); // ID simulado
}

/**
 * Obtiene todos los álbumes
 * @returns {Promise<Array>} Lista de álbumes
 */
export async function getAllAlbums() {
  /* IMPLEMENTACIÓN EN ELECTRON:
  
  const { ipcRenderer } = require('electron');
  return ipcRenderer.invoke('db:getAllAlbums');
  
  // En el main process:
  ipcMain.handle('db:getAllAlbums', async () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM albums ORDER BY createdAt DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });
  */
  
  console.log("Getting all albums");
  return Promise.resolve([
    {
      id: 1,
      name: "Fotos Históricas",
      coverImagePath: null,
      imageCount: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "Retratos",
      coverImagePath: null,
      imageCount: 0,
      createdAt: new Date().toISOString()
    }
  ]);
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
  /* IMPLEMENTACIÓN EN ELECTRON:
  
  const { ipcRenderer } = require('electron');
  return ipcRenderer.invoke('db:saveImageToAlbum', imageData);
  
  // En el main process:
  ipcMain.handle('db:saveImageToAlbum', async (event, imageData) => {
    return new Promise((resolve, reject) => {
      const savedAt = new Date().toISOString();
      
      db.run(
        `INSERT INTO images 
        (albumId, title, category, originalPath, upscaledPath, 
         originalResolution, upscaledResolution, model, savedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          imageData.albumId,
          imageData.title,
          imageData.category,
          imageData.originalPath,
          imageData.upscaledPath,
          imageData.originalResolution,
          imageData.upscaledResolution,
          imageData.model,
          savedAt
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            const imageId = this.lastID;
            
            // Actualizar el contador de imágenes del álbum
            db.run(
              'UPDATE albums SET imageCount = imageCount + 1 WHERE id = ?',
              [imageData.albumId],
              (err) => {
                if (err) reject(err);
              }
            );
            
            // Si es la primera imagen, establecerla como cover
            db.get(
              'SELECT imageCount, coverImagePath FROM albums WHERE id = ?',
              [imageData.albumId],
              (err, album) => {
                if (!err && album && album.imageCount === 1 && !album.coverImagePath) {
                  db.run(
                    'UPDATE albums SET coverImagePath = ? WHERE id = ?',
                    [imageData.upscaledPath, imageData.albumId]
                  );
                }
              }
            );
            
            resolve(imageId);
          }
        }
      );
    });
  });
  */
  
  console.log("Saving image to album:", imageData);
  return Promise.resolve(Date.now()); // ID simulado
}

/**
 * Obtiene todas las imágenes de un álbum
 * @param {number} albumId - ID del álbum
 * @returns {Promise<Array>} Lista de imágenes
 */
export async function getAlbumImages(albumId) {
  /* IMPLEMENTACIÓN EN ELECTRON:
  
  const { ipcRenderer } = require('electron');
  return ipcRenderer.invoke('db:getAlbumImages', albumId);
  
  // En el main process:
  ipcMain.handle('db:getAlbumImages', async (event, albumId) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM images WHERE albumId = ? ORDER BY savedAt DESC',
        [albumId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  });
  */
  
  console.log("Getting images for album:", albumId);
  return Promise.resolve([]);
}

/**
 * Elimina una imagen
 * @param {number} imageId - ID de la imagen
 * @returns {Promise<void>}
 */
export async function deleteImage(imageId) {
  /* IMPLEMENTACIÓN EN ELECTRON:
  
  const { ipcRenderer } = require('electron');
  return ipcRenderer.invoke('db:deleteImage', imageId);
  
  // En el main process:
  ipcMain.handle('db:deleteImage', async (event, imageId) => {
    return new Promise((resolve, reject) => {
      // Obtener la imagen antes de eliminarla
      db.get('SELECT * FROM images WHERE id = ?', [imageId], (err, image) => {
        if (err || !image) {
          reject(err || new Error('Image not found'));
          return;
        }
        
        // Eliminar los archivos físicos
        const fs = require('fs');
        try {
          if (fs.existsSync(image.originalPath)) fs.unlinkSync(image.originalPath);
          if (fs.existsSync(image.upscaledPath)) fs.unlinkSync(image.upscaledPath);
        } catch (fsErr) {
          console.error('Error deleting image files:', fsErr);
        }
        
        // Eliminar de la base de datos
        db.run('DELETE FROM images WHERE id = ?', [imageId], (err) => {
          if (err) {
            reject(err);
          } else {
            // Decrementar el contador del álbum
            db.run(
              'UPDATE albums SET imageCount = imageCount - 1 WHERE id = ?',
              [image.albumId]
            );
            
            // Si era el cover, actualizar con la siguiente imagen
            db.get(
              'SELECT coverImagePath FROM albums WHERE id = ?',
              [image.albumId],
              (err, album) => {
                if (!err && album && album.coverImagePath === image.upscaledPath) {
                  // Buscar la siguiente imagen más reciente
                  db.get(
                    'SELECT upscaledPath FROM images WHERE albumId = ? ORDER BY savedAt DESC LIMIT 1',
                    [image.albumId],
                    (err, nextImage) => {
                      const newCover = nextImage ? nextImage.upscaledPath : null;
                      db.run(
                        'UPDATE albums SET coverImagePath = ? WHERE id = ?',
                        [newCover, image.albumId]
                      );
                    }
                  );
                }
              }
            );
            
            resolve();
          }
        });
      });
    });
  });
  */
  
  console.log("Deleting image:", imageId);
  return Promise.resolve();
}

/**
 * Elimina un álbum y todas sus imágenes
 * @param {number} albumId - ID del álbum
 * @returns {Promise<void>}
 */
export async function deleteAlbum(albumId) {
  /* IMPLEMENTACIÓN EN ELECTRON:
  
  const { ipcRenderer } = require('electron');
  return ipcRenderer.invoke('db:deleteAlbum', albumId);
  
  // En el main process:
  ipcMain.handle('db:deleteAlbum', async (event, albumId) => {
    return new Promise((resolve, reject) => {
      // Obtener todas las imágenes del álbum
      db.all('SELECT * FROM images WHERE albumId = ?', [albumId], (err, images) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Eliminar archivos físicos
        const fs = require('fs');
        images.forEach(image => {
          try {
            if (fs.existsSync(image.originalPath)) fs.unlinkSync(image.originalPath);
            if (fs.existsSync(image.upscaledPath)) fs.unlinkSync(image.upscaledPath);
          } catch (fsErr) {
            console.error('Error deleting image files:', fsErr);
          }
        });
        
        // Eliminar el álbum (CASCADE eliminará las imágenes de la BD)
        db.run('DELETE FROM albums WHERE id = ?', [albumId], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  });
  */
  
  console.log("Deleting album:", albumId);
  return Promise.resolve();
}

/**
 * Busca imágenes por categoría o texto
 * @param {number} albumId - ID del álbum (opcional)
 * @param {string} searchText - Texto a buscar
 * @param {string} category - Categoría a filtrar (opcional)
 * @returns {Promise<Array>} Lista de imágenes que coinciden
 */
export async function searchImages(albumId, searchText, category) {
  /* IMPLEMENTACIÓN EN ELECTRON:
  
  const { ipcRenderer } = require('electron');
  return ipcRenderer.invoke('db:searchImages', { albumId, searchText, category });
  
  // En el main process:
  ipcMain.handle('db:searchImages', async (event, { albumId, searchText, category }) => {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM images WHERE 1=1';
      const params = [];
      
      if (albumId) {
        query += ' AND albumId = ?';
        params.push(albumId);
      }
      
      if (searchText) {
        query += ' AND title LIKE ?';
        params.push(`%${searchText}%`);
      }
      
      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }
      
      query += ' ORDER BY savedAt DESC';
      
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });
  */
  
  console.log("Searching images:", { albumId, searchText, category });
  return Promise.resolve([]);
}
