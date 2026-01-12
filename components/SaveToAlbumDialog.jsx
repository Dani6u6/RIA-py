import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { BookOpen, Save, FolderPlus } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { getAllAlbums, createAlbum, saveImageToAlbum } from "../utils/database";
import { saveImageToAlbumFolder } from "../utils/storage";

export function SaveToAlbumDialog({ 
  open, 
  onOpenChange, 
  originalImage, 
  upscaledImage,
  originalResolution, // Nuevo: "1920x1080"
  upscaledResolution, // Nuevo: "3840x2160"
  model, // Nuevo: "RealESRGAN_x4plus"
  onSave 
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [albums, setAlbums] = useState([]);
  const [showNewAlbumInput, setShowNewAlbumInput] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");

  const categories = [
    "Histórica",
    "Retrato",
    "Arquitectura",
    "Paisaje",
    "Familiar",
    "Urbana",
    "Natural",
    "Otra"
  ];

  useEffect(() => {
    // Cargar álbumes desde SQLite
    if (open) {
      loadAlbums();
    }
  }, [open]);

  const loadAlbums = async () => {
    try {
      const albumsData = await getAllAlbums();
      setAlbums(albumsData);
    } catch (error) {
      console.error("Error loading albums:", error);
      toast.error("Error al cargar álbumes");
    }
  };

  useEffect(() => {
    // Generar un título por defecto basado en la fecha
    if (open) {
      const now = new Date();
      const defaultTitle = `Imagen ${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
      setTitle(defaultTitle);
    }
  }, [open]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Por favor ingresa un título");
      return;
    }

    if (!category) {
      toast.error("Por favor selecciona una categoría");
      return;
    }

    if (!selectedAlbum && !newAlbumName.trim()) {
      toast.error("Por favor selecciona o crea un álbum");
      return;
    }

    try {
      let albumId = selectedAlbum;
      let albumName = albums.find(a => a.id.toString() === selectedAlbum)?.name;

      // Si se creó un nuevo álbum
      if (newAlbumName.trim()) {
        albumId = await createAlbum(newAlbumName.trim());
        albumName = newAlbumName.trim();
        toast.success(`Álbum "${albumName}" creado`);
      }

      // Guardar las imágenes en el sistema de archivos
      const originalPath = await saveImageToAlbumFolder(originalImage, albumId, 'original');
      const upscaledPath = await saveImageToAlbumFolder(upscaledImage, albumId, 'upscaled');

      // Guardar metadatos en SQLite
      const imageData = {
        albumId: parseInt(albumId),
        title: title.trim(),
        category,
        originalPath,
        upscaledPath,
        originalResolution: originalResolution || "Unknown",
        upscaledResolution: upscaledResolution || "Unknown",
        model: model || "Unknown",
      };

      await saveImageToAlbum(imageData);

      console.log("Imagen guardada:", imageData);
      
      toast.success(`Imagen guardada en "${albumName}"`);
      
      // Llamar al callback si existe
      if (onSave) {
        onSave({
          ...imageData,
          albumName,
          savedAt: new Date(),
        });
      }

      // Resetear el formulario
      setTitle("");
      setCategory("");
      setSelectedAlbum("");
      setNewAlbumName("");
      setShowNewAlbumInput(false);
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Error al guardar la imagen");
    }
  };

  const handleCreateNewAlbum = () => {
    setShowNewAlbumInput(true);
    setSelectedAlbum("");
  };

  const handleSelectExistingAlbum = () => {
    setShowNewAlbumInput(false);
    setNewAlbumName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Guardar en Álbum
          </DialogTitle>
          <DialogDescription>
            Agrega un título y categoría para organizar tu imagen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preview de la imagen */}
          {/*<div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden">
            {upscaledImage && (
              <img 
                src={upscaledImage} 
                alt="Preview" 
                className="w-full h-full object-contain"
              />
            )}
          </div> */}

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título de la Imagen</Label>
            <Input
              id="title"
              placeholder="Ej: Plaza Central 1920"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <select 
              id="category"
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Selección de Álbum */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Álbum</Label>
              {!showNewAlbumInput ? (
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={handleCreateNewAlbum}
                  className="h-auto p-0"
                >
                  <FolderPlus className="w-4 h-4 mr-1" />
                  Crear nuevo
                </Button>
              ) : (
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={handleSelectExistingAlbum}
                  className="h-auto p-0"
                >
                  Seleccionar existente
                </Button>
              )}
            </div>

            {showNewAlbumInput ? (
              <Input
                placeholder="Nombre del nuevo álbum"
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
              />
            ) : (
              <select 
                value={selectedAlbum} 
                onChange={(e) => setSelectedAlbum(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
              >
                <option value="">Selecciona un álbum</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id.toString()}>
                    {album.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}