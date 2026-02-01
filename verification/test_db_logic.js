const sqlite3 = require('sqlite3').verbose();
const assert = require('assert');

// Test database in memory
const db = new sqlite3.Database(':memory:');

console.log("Running Database Integration Test...");

db.serialize(() => {
  // 1. Test Table Creation
  console.log("1. Testing Table Creation...");
  db.run(`
    CREATE TABLE IF NOT EXISTS albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      coverImagePath TEXT,
      imageCount INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    )
  `);
  
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
  console.log("   Tables created successfully.");

  // 2. Test Create Album
  console.log("2. Testing Create Album...");
  const albumName = "Test Album";
  const createdAt = new Date().toISOString();
  
  db.run(
    'INSERT INTO albums (name, imageCount, createdAt) VALUES (?, 0, ?)',
    [albumName, createdAt],
    function(err) {
      if (err) {
        console.error("   Failed to create album:", err);
        process.exit(1);
      }
      const albumId = this.lastID;
      console.log(`   Album created with ID: ${albumId}`);

      // 3. Test Create Image
      console.log("3. Testing Create Image...");
      const savedAt = new Date().toISOString();
      const imageData = {
        albumId: albumId,
        title: "Test Image",
        category: "Test",
        originalPath: "/tmp/orig.png",
        upscaledPath: "/tmp/upscale.png",
        originalResolution: "100x100",
        upscaledResolution: "200x200",
        model: "TestModel",
        savedAt: savedAt
      };

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
          imageData.savedAt
        ],
        function(err) {
            if (err) {
                console.error("   Failed to save image:", err);
                process.exit(1);
            }
            const imageId = this.lastID;
            console.log(`   Image created with ID: ${imageId}`);

            // 4. Test Update Image Count and Cover
            console.log("4. Testing Album Update logic...");
            db.run(
                'UPDATE albums SET imageCount = imageCount + 1 WHERE id = ?',
                [albumId]
            );
            
            // Check if cover update logic works (simulated)
            db.get(
                'SELECT imageCount, coverImagePath FROM albums WHERE id = ?',
                [albumId],
                (err, album) => {
                    // Manually simulate the check since we just incremented it separately above in real code flow
                    // In real code: imageCount was 0, now it is 1 (after update).
                    // But here we need to read it back.
                    if (album.imageCount === 1 && !album.coverImagePath) {
                         db.run(
                            'UPDATE albums SET coverImagePath = ? WHERE id = ?',
                            [imageData.upscaledPath, albumId],
                            (err) => {
                                if (err) console.error("Failed to update cover:", err);
                                else console.log("   Cover image updated successfully.");
                                
                                // 5. Final Verification
                                db.get('SELECT * FROM albums WHERE id = ?', [albumId], (err, row) => {
                                    console.log("   Final Album State:", row);
                                    if(row.imageCount === 1 && row.coverImagePath === imageData.upscaledPath) {
                                        console.log("SUCCESS: All database integration tests passed.");
                                        process.exit(0);
                                    } else {
                                        console.error("FAILURE: State verification failed.");
                                        process.exit(1);
                                    }
                                });
                            }
                        );
                    }
                }
            );
        }
      );
    }
  );
});
