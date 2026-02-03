const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const sizeOf = require("image-size");
const AdmZip = require("adm-zip");

let db;

// Inicializar base de datos
function initDatabase() {
  const dbPath = path.join(app.getPath("userData"), "albums", "ria-albums.db");

  // Crear directorio de álbumes si no existe
  const albumsDir = path.dirname(dbPath);
  if (!fs.existsSync(albumsDir)) {
    fs.mkdirSync(albumsDir, { recursive: true });
  }

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Error opening database:", err);
    } else {
      console.log("Database connected");
      db.run("PRAGMA foreign_keys = ON");
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
    db.run(
      `CREATE INDEX IF NOT EXISTS idx_images_category ON images(category)`,
    );
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Nota: Por simplicidad, aunque idealmente debería ser true con preload
      webSecurity: false, // Permitir cargar imágenes locales
    },
  });

  // Manejador para confirmar cierre de la aplicación
  mainWindow.on('close', (event) => {
    event.preventDefault(); // Prevenir el cierre inmediato
    
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: ['Sí', 'No'],
      title: 'Confirmar cierre',
      message: '¿Estás seguro de que quieres cerrar la aplicación?',
      defaultId: 1, // El botón "No" será el predeterminado
      cancelId: 1   // Presionar ESC equivale a "No"
    });
    
    if (choice === 0) {
      // Usuario eligió "Sí", cerrar la ventana
      mainWindow.destroy();
    }
    // Si choice === 1, no hacer nada (mantener la ventana abierta)
  });

  if (!app.isPackaged) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

// Handlers IPC para Base de Datos

// Crear álbum
ipcMain.handle("db:createAlbum", async (event, { name }) => {
  return new Promise((resolve, reject) => {
    const createdAt = new Date().toISOString();
    db.run(
      "INSERT INTO albums (name, imageCount, createdAt) VALUES (?, 0, ?)",
      [name, createdAt],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      },
    );
  });
});

// Obtener todos los álbumes
ipcMain.handle("db:getAllAlbums", async () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM albums ORDER BY createdAt DESC", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

// Actualizar álbum
ipcMain.handle("db:updateAlbum", async (event, { id, name }) => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE albums SET name = ? WHERE id = ?",
      [name, id],
      function (err) {
        if (err) reject(err);
        else resolve();
      },
    );
  });
});

// Guardar imagen en álbum
ipcMain.handle("db:saveImageToAlbum", async (event, imageData) => {
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
        savedAt,
      ],
      function (err) {
        if (err) {
          reject(err);
        } else {
          const imageId = this.lastID;

          // Actualizar contador de imágenes
          db.run("UPDATE albums SET imageCount = imageCount + 1 WHERE id = ?", [
            imageData.albumId,
          ]);

          // Si es la primera imagen, establecer como cover
          db.get(
            "SELECT imageCount, coverImagePath FROM albums WHERE id = ?",
            [imageData.albumId],
            (err, album) => {
              if (
                !err &&
                album &&
                album.imageCount === 1 &&
                !album.coverImagePath
              ) {
                db.run("UPDATE albums SET coverImagePath = ? WHERE id = ?", [
                  imageData.upscaledPath,
                  imageData.albumId,
                ]);
              }
            },
          );

          resolve(imageId);
        }
      },
    );
  });
});

// Obtener imágenes de un álbum
ipcMain.handle("db:getAlbumImages", async (event, albumId) => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM images WHERE albumId = ? ORDER BY savedAt DESC",
      [albumId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      },
    );
  });
});

// Eliminar imagen
ipcMain.handle("db:deleteImage", async (event, imageId) => {
  return new Promise((resolve, reject) => {
    // Obtener info de la imagen antes de eliminar
    db.get("SELECT * FROM images WHERE id = ?", [imageId], (err, image) => {
      if (err || !image) {
        reject(err || new Error("Image not found"));
        return;
      }

      // Eliminar archivos físicos
      try {
        if (fs.existsSync(image.originalPath))
          fs.unlinkSync(image.originalPath);
        if (fs.existsSync(image.upscaledPath))
          fs.unlinkSync(image.upscaledPath);
      } catch (fsErr) {
        console.error("Error deleting image files:", fsErr);
      }

      // Eliminar de la base de datos
      db.run("DELETE FROM images WHERE id = ?", [imageId], (err) => {
        if (err) {
          reject(err);
        } else {
          // Decrementar contador
          db.run("UPDATE albums SET imageCount = imageCount - 1 WHERE id = ?", [
            image.albumId,
          ]);

          // Si era el cover, actualizar con siguiente imagen
          db.get(
            "SELECT coverImagePath FROM albums WHERE id = ?",
            [image.albumId],
            (err, album) => {
              if (
                !err &&
                album &&
                album.coverImagePath === image.upscaledPath
              ) {
                db.get(
                  "SELECT upscaledPath FROM images WHERE albumId = ? ORDER BY savedAt DESC LIMIT 1",
                  [image.albumId],
                  (err, nextImage) => {
                    const newCover = nextImage ? nextImage.upscaledPath : null;
                    db.run(
                      "UPDATE albums SET coverImagePath = ? WHERE id = ?",
                      [newCover, image.albumId],
                    );
                  },
                );
              }
            },
          );

          resolve();
        }
      });
    });
  });
});

// Eliminar álbum
ipcMain.handle("db:deleteAlbum", async (event, albumId) => {
  return new Promise((resolve, reject) => {
    // Obtener todas las imágenes del álbum
    db.all(
      "SELECT * FROM images WHERE albumId = ?",
      [albumId],
      (err, images) => {
        if (err) {
          reject(err);
          return;
        }

        // Eliminar archivos físicos
        images.forEach((image) => {
          try {
            if (fs.existsSync(image.originalPath))
              fs.unlinkSync(image.originalPath);
            if (fs.existsSync(image.upscaledPath))
              fs.unlinkSync(image.upscaledPath);
          } catch (fsErr) {
            console.error("Error deleting image files:", fsErr);
          }
        });

        // Eliminar el álbum (CASCADE eliminará las imágenes de la BD)
        db.run("DELETE FROM albums WHERE id = ?", [albumId], (err) => {
          if (err) reject(err);
          else {
            // Opcionalmente, eliminar carpeta del álbum
            const albumDir = path.join(
              app.getPath("userData"),
              "albums",
              `album_${albumId}`,
            );
            if (fs.existsSync(albumDir)) {
              // fs.rmSync está disponible en Node > 14
              fs.rmSync(albumDir, { recursive: true, force: true });
            }
            resolve();
          }
        });
      },
    );
  });
});

// Buscar imágenes
ipcMain.handle(
  "db:searchImages",
  async (event, { albumId, searchText, category }) => {
    return new Promise((resolve, reject) => {
      let query = "SELECT * FROM images WHERE 1=1";
      const params = [];

      if (albumId) {
        query += " AND albumId = ?";
        params.push(albumId);
      }

      if (searchText) {
        query += " AND title LIKE ?";
        params.push(`%${searchText}%`);
      }

      if (category) {
        query += " AND category = ?";
        params.push(category);
      }

      query += " ORDER BY savedAt DESC";

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
);

// Handlers IPC para Almacenamiento

// Guardar imagen en carpeta de álbum
ipcMain.handle(
  "storage:saveImage",
  async (event, { sourceBase64, albumId, type }) => {
    try {
      const albumsDir = path.join(app.getPath("userData"), "albums");

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
      const base64Data = sourceBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      fs.writeFileSync(filePath, buffer);

      return filePath;
    } catch (error) {
      console.error("Error saving image:", error);
      throw error;
    }
  },
);

// Leer imagen como base64
ipcMain.handle("storage:readImageAsBase64", async (event, imagePath) => {
  try {
    if (!fs.existsSync(imagePath)) {
      throw new Error("Image file not found");
    }

    const buffer = fs.readFileSync(imagePath);
    const base64 = buffer.toString("base64");
    const ext = path.extname(imagePath).toLowerCase();

    let mimeType = "image/png";
    if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
    else if (ext === ".webp") mimeType = "image/webp";

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error("Error reading image:", error);
    throw error;
  }
});

// Abrir carpeta de álbum
ipcMain.handle("storage:openAlbumFolder", async (event, albumId) => {
  const albumDir = path.join(
    app.getPath("userData"),
    "albums",
    `album_${albumId}`,
  );

  if (!fs.existsSync(albumDir)) {
    fs.mkdirSync(albumDir, { recursive: true });
  }

  shell.openPath(albumDir);
});

// Obtener info de imagen
ipcMain.handle("storage:getImageInfo", async (event, imagePath) => {
  try {
    if (!fs.existsSync(imagePath)) {
      throw new Error("Image file not found");
    }

    const stats = fs.statSync(imagePath);
    const dimensions = sizeOf(imagePath);

    return {
      width: dimensions.width,
      height: dimensions.height,
      size: stats.size,
      path: imagePath,
    };
  } catch (error) {
    console.error("Error getting image info:", error);
    throw error;
  }
});

// Exportar álbum
ipcMain.handle("db:exportAlbum", async (event, albumId) => {
  try {
    // Obtener datos del álbum
    const album = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM albums WHERE id = ?", [albumId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!album) {
      throw new Error("Album not found");
    }

    // Obtener imágenes del álbum
    const images = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM images WHERE albumId = ?",
        [albumId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Crear directorio temporal
    const tempDir = path.join(app.getPath("temp"), `album_export_${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    const imagesDir = path.join(tempDir, "images");
    fs.mkdirSync(imagesDir, { recursive: true });

    // Copiar archivos de imágenes
    const imageRecords = [];
    for (const image of images) {
      const originalFilename = path.basename(image.originalPath);
      const upscaledFilename = path.basename(image.upscaledPath);

      // Copiar archivos si existen
      if (fs.existsSync(image.originalPath)) {
        fs.copyFileSync(
          image.originalPath,
          path.join(imagesDir, originalFilename)
        );
      }
      if (fs.existsSync(image.upscaledPath)) {
        fs.copyFileSync(
          image.upscaledPath,
          path.join(imagesDir, upscaledFilename)
        );
      }

      // Guardar registro con rutas relativas
      imageRecords.push({
        title: image.title,
        category: image.category,
        originalPath: originalFilename,
        upscaledPath: upscaledFilename,
        originalResolution: image.originalResolution,
        upscaledResolution: image.upscaledResolution,
        model: image.model,
        savedAt: image.savedAt,
      });
    }

    // Crear manifest
    const manifest = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      album: {
        name: album.name,
        imageCount: album.imageCount,
        createdAt: album.createdAt,
      },
      images: imageRecords,
    };

    // Guardar manifest.json
    fs.writeFileSync(
      path.join(tempDir, "manifest.json"),
      JSON.stringify(manifest, null, 2)
    );

    // Mostrar diálogo para guardar
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: "Exportar Álbum",
      defaultPath: `${album.name}.ria-album`,
      filters: [{ name: "RIA Album", extensions: ["ria-album"] }],
    });

    if (canceled || !filePath) {
      // Limpiar directorio temporal
      fs.rmSync(tempDir, { recursive: true, force: true });
      return { success: false, canceled: true };
    }

    // Crear ZIP
    const zip = new AdmZip();
    zip.addLocalFolder(tempDir);
    zip.writeZip(filePath);

    // Limpiar directorio temporal
    fs.rmSync(tempDir, { recursive: true, force: true });

    return {
      success: true,
      filePath,
      albumName: album.name,
      imageCount: images.length,
    };
  } catch (error) {
    console.error("Error exporting album:", error);
    throw error;
  }
});

// Importar álbum
ipcMain.handle("db:importAlbum", async () => {
  try {
    // Mostrar diálogo para seleccionar archivo
    const { filePaths, canceled } = await dialog.showOpenDialog({
      title: "Importar Álbum",
      filters: [{ name: "RIA Album", extensions: ["ria-album"] }],
      properties: ["openFile"],
    });

    if (canceled || filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    const importFilePath = filePaths[0];

    // Crear directorio temporal para extracción
    const tempDir = path.join(app.getPath("temp"), `album_import_${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    // Extraer ZIP
    const zip = new AdmZip(importFilePath);
    zip.extractAllTo(tempDir, true);

    // Leer manifest
    const manifestPath = path.join(tempDir, "manifest.json");
    if (!fs.existsSync(manifestPath)) {
      throw new Error("Invalid album file: manifest.json not found");
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

    // Validar versión del manifest
    if (!manifest.version || !manifest.album || !manifest.images) {
      throw new Error("Invalid album file: corrupted manifest");
    }

    // Verificar conflicto de nombres y resolver
    let albumName = manifest.album.name;
    const existingAlbums = await new Promise((resolve, reject) => {
      db.all(
        "SELECT name FROM albums WHERE name LIKE ?",
        [`${albumName}%`],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    if (existingAlbums.length > 0) {
      const existingNames = existingAlbums.map((a) => a.name);
      let counter = 2;
      while (existingNames.includes(albumName)) {
        albumName = `${manifest.album.name} (${counter})`;
        counter++;
      }
    }

    // Crear álbum en la base de datos
    const albumId = await new Promise((resolve, reject) => {
      const createdAt = new Date().toISOString();
      db.run(
        "INSERT INTO albums (name, imageCount, createdAt) VALUES (?, 0, ?)",
        [albumName, createdAt],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Crear directorio del álbum
    const albumDir = path.join(
      app.getPath("userData"),
      "albums",
      `album_${albumId}`
    );
    fs.mkdirSync(albumDir, { recursive: true });

    const originalDir = path.join(albumDir, "original");
    const upscaledDir = path.join(albumDir, "upscaled");
    fs.mkdirSync(originalDir, { recursive: true });
    fs.mkdirSync(upscaledDir, { recursive: true });

    // Importar imágenes
    const imagesSourceDir = path.join(tempDir, "images");
    let firstUpscaledPath = null;

    for (const imageRecord of manifest.images) {
      const originalSrc = path.join(imagesSourceDir, imageRecord.originalPath);
      const upscaledSrc = path.join(imagesSourceDir, imageRecord.upscaledPath);

      const originalDest = path.join(originalDir, imageRecord.originalPath);
      const upscaledDest = path.join(upscaledDir, imageRecord.upscaledPath);

      // Copiar archivos
      if (fs.existsSync(originalSrc)) {
        fs.copyFileSync(originalSrc, originalDest);
      }
      if (fs.existsSync(upscaledSrc)) {
        fs.copyFileSync(upscaledSrc, upscaledDest);
        if (!firstUpscaledPath) {
          firstUpscaledPath = upscaledDest;
        }
      }

      // Insertar registro en la base de datos
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO images 
          (albumId, title, category, originalPath, upscaledPath, 
           originalResolution, upscaledResolution, model, savedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            albumId,
            imageRecord.title,
            imageRecord.category,
            originalDest,
            upscaledDest,
            imageRecord.originalResolution,
            imageRecord.upscaledResolution,
            imageRecord.model,
            imageRecord.savedAt,
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Actualizar contador de imágenes y cover
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE albums SET imageCount = ?, coverImagePath = ? WHERE id = ?",
        [manifest.images.length, firstUpscaledPath, albumId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Limpiar directorio temporal
    fs.rmSync(tempDir, { recursive: true, force: true });

    // Obtener álbum completo para retornar
    const importedAlbum = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM albums WHERE id = ?", [albumId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    return {
      success: true,
      album: importedAlbum,
      imageCount: manifest.images.length,
    };
  } catch (error) {
    console.error("Error importing album:", error);
    throw error;
  }
});


app.whenReady().then(() => {
  initDatabase();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("quit", () => {
  if (db) {
    db.close();
  }
});
