# Implementación de SQLite en Electron para rIA

## 📋 Resumen

La aplicación rIA ahora usa **SQLite** para almacenar metadatos de álbumes e imágenes, con las **imágenes físicas guardadas en carpetas locales**. Esto mantiene la aplicación ligera y eficiente.

## 🗃️ Estructura de la Base de Datos

### Tabla: `albums`
```sql
CREATE TABLE albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  coverImagePath TEXT,
  imageCount INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL
);
```

### Tabla: `images`
```sql
CREATE TABLE images (
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
);
```

## 📁 Estructura de Archivos Locales

```
userData/
└── albums/
    ├── album_1/
    │   ├── original/
    │   │   ├── original_1642345678901_abc123.png
    │   │   └── original_1642345679123_def456.png
    │   └── upscaled/
    │       ├── upscaled_1642345678901_abc123.png
    │       └── upscaled_1642345679123_def456.png
    ├── album_2/
    │   ├── original/
    │   └── upscaled/
    └── ria-albums.db
```

## 🔧 Implementación en Electron

### 1. Instalar Dependencias

```bash
npm install sqlite3
npm install image-size
```

### 2. Configurar en `main.js` (Electron Main Process)

```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const sizeOf = require('image-size');

let db;

// Inicializar base de datos
function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'albums', 'ria-albums.db');
  
  // Crear directorio de álbumes si no existe
  const albumsDir = path.dirname(dbPath);
  if (!fs.existsSync(albumsDir)) {
    fs.mkdirSync(albumsDir, { recursive: true });
  }
  
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Database connected');
      createTables();
    }
  });
}

function createTables() {
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
    `);
    
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
    `);
    
    // Índices
    db.run(`CREATE INDEX IF NOT EXISTS idx_images_albumId ON images(albumId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_images_category ON images(category)`);
  });
}

// Inicializar al iniciar la app
app.whenReady().then(() => {
  initDatabase();
  createWindow();
});

// Cerrar DB al salir
app.on('quit', () => {
  if (db) {
    db.close();
  }
});
```

### 3. Handlers IPC para Base de Datos

```javascript
// Crear álbum
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

// Obtener todos los álbumes
ipcMain.handle('db:getAllAlbums', async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM albums ORDER BY createdAt DESC', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

// Guardar imagen en álbum
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
          
          // Actualizar contador de imágenes
          db.run(
            'UPDATE albums SET imageCount = imageCount + 1 WHERE id = ?',
            [imageData.albumId]
          );
          
          // Si es la primera imagen, establecer como cover
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

// Obtener imágenes de un álbum
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

// Eliminar imagen
ipcMain.handle('db:deleteImage', async (event, imageId) => {
  return new Promise((resolve, reject) => {
    // Obtener info de la imagen antes de eliminar
    db.get('SELECT * FROM images WHERE id = ?', [imageId], (err, image) => {
      if (err || !image) {
        reject(err || new Error('Image not found'));
        return;
      }
      
      // Eliminar archivos físicos
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
          // Decrementar contador
          db.run(
            'UPDATE albums SET imageCount = imageCount - 1 WHERE id = ?',
            [image.albumId]
          );
          
          // Si era el cover, actualizar con siguiente imagen
          db.get(
            'SELECT coverImagePath FROM albums WHERE id = ?',
            [image.albumId],
            (err, album) => {
              if (!err && album && album.coverImagePath === image.upscaledPath) {
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

// Eliminar álbum
ipcMain.handle('db:deleteAlbum', async (event, albumId) => {
  return new Promise((resolve, reject) => {
    // Obtener todas las imágenes del álbum
    db.all('SELECT * FROM images WHERE albumId = ?', [albumId], (err, images) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Eliminar archivos físicos
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
        else {
          // Opcionalmente, eliminar carpeta del álbum
          const albumDir = path.join(app.getPath('userData'), 'albums', `album_${albumId}`);
          if (fs.existsSync(albumDir)) {
            fs.rmSync(albumDir, { recursive: true, force: true });
          }
          resolve();
        }
      });
    });
  });
});

// Buscar imágenes
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
```

### 4. Handlers IPC para Almacenamiento

```javascript
// Guardar imagen en carpeta de álbum
ipcMain.handle('storage:saveImage', async (event, { sourceBase64, albumId, type }) => {
  try {
    const albumsDir = path.join(app.getPath('userData'), 'albums');
    
    // Crear directorios necesarios
    const albumDir = path.join(albumsDir, `album_${albumId}`);
    const typeDir = path.join(albumDir, type);
    
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
    
    // Generar nombre único
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `${type}_${timestamp}_${random}.png`;
    const filePath = path.join(typeDir, filename);
    
    // Convertir base64 a buffer y guardar
    const base64Data = sourceBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    fs.writeFileSync(filePath, buffer);
    
    return filePath;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
});

// Leer imagen como base64
ipcMain.handle('storage:readImageAsBase64', async (event, imagePath) => {
  try {
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
  } catch (error) {
    console.error('Error reading image:', error);
    throw error;
  }
});

// Abrir carpeta de álbum
ipcMain.handle('storage:openAlbumFolder', async (event, albumId) => {
  const { shell } = require('electron');
  const albumDir = path.join(app.getPath('userData'), 'albums', `album_${albumId}`);
  
  if (!fs.existsSync(albumDir)) {
    fs.mkdirSync(albumDir, { recursive: true });
  }
  
  shell.openPath(albumDir);
});

// Obtener info de imagen
ipcMain.handle('storage:getImageInfo', async (event, imagePath) => {
  try {
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
  } catch (error) {
    console.error('Error getting image info:', error);
    throw error;
  }
});
```

## 🚀 Cómo Usar en el Renderer Process

Los archivos `utils/database.js` y `utils/storage.js` ya están configurados. Solo necesitas descomentar la sección `IMPLEMENTACIÓN EN ELECTRON` en cada función.

### Ejemplo en React:

```javascript
import { getAllAlbums, createAlbum, saveImageToAlbum } from './utils/database';
import { saveImageToAlbumFolder } from './utils/storage';

// Obtener álbumes
const albums = await getAllAlbums();

// Crear álbum
const albumId = await createAlbum("Mis Fotos");

// Guardar imagen
const originalPath = await saveImageToAlbumFolder(originalImage, albumId, 'original');
const upscaledPath = await saveImageToAlbumFolder(upscaledImage, albumId, 'upscaled');

await saveImageToAlbum({
  albumId,
  title: "Mi Foto",
  category: "Paisaje",
  originalPath,
  upscaledPath,
  originalResolution: "1920x1080",
  upscaledResolution: "3840x2160",
  model: "RealESRGAN_x4plus"
});
```

## 📊 Metadatos Guardados

Para cada imagen guardada, se almacenan:

- ✅ **Título**: Nombre descriptivo
- ✅ **Categoría**: Histórica, Retrato, Arquitectura, etc.
- ✅ **Fecha**: Timestamp de cuándo se guardó
- ✅ **Resolución Original**: Ej. "1920x1080"
- ✅ **Resolución Upscaled**: Ej. "3840x2160"
- ✅ **Modelo Usado**: Ej. "RealESRGAN_x4plus"
- ✅ **Rutas**: Path a imagen original y upscaled

## 🔍 Features Implementados

- ✅ Crear álbumes
- ✅ Guardar imágenes con metadatos
- ✅ Primera imagen automáticamente se convierte en cover del álbum
- ✅ Buscar por título
- ✅ Filtrar por categoría
- ✅ Eliminar imágenes (archivos y BD)
- ✅ Eliminar álbumes completos
- ✅ Vista grid y lista
- ✅ Abrir carpeta del álbum en explorador

## 🎯 Próximos Pasos

1. Implementar los handlers IPC en `main.js` de Electron
2. Instalar dependencias: `npm install sqlite3 image-size`
3. Descomentar código en `utils/database.js` y `utils/storage.js`
4. Pasar metadatos correctos desde el componente principal al `SaveToAlbumDialog`:
   - `originalResolution`: Obtener del state de la imagen original
   - `upscaledResolution`: Obtener del state de la imagen upscaled
   - `model`: Obtener del select de modelos en UpscaleControls

¡Todo está listo para la integración con Electron! 🚀
