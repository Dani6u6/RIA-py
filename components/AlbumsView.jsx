import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  BookOpen,
  FolderPlus,
  Search,
  Grid,
  List,
  MoreVertical,
  Trash2,
  Edit,
  Image as ImageIcon,
  Download,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllAlbums,
  getAlbumImages,
  deleteAlbum,
  deleteImage,
  searchImages,
  createAlbum,
  updateAlbum,
  exportAlbum,
  importAlbum,
} from "../utils/database";
import { readImageAsBase64 } from "../utils/storage";

export function AlbumsView({ open, onOpenChange, refreshTrigger }) {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [images, setImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [showEditAlbum, setShowEditAlbum] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const categories = [
    "Histórica",
    "Retrato",
    "Arquitectura",
    "Paisaje",
    "Familiar",
    "Urbana",
    "Natural",
    "Otra",
  ];

  useEffect(() => {
    // Cargar álbumes desde MySQL
    const fetchAlbums = async () => {
      try {
        const albumsData = await getAllAlbums();
        setAlbums(albumsData);

        // Si ya hay un álbum seleccionado, intentar mantenerlo
        if (selectedAlbum) {
          const current = albumsData.find((a) => a.id === selectedAlbum.id);
          if (current) {
            setSelectedAlbum(current);
          } else if (albumsData.length > 0) {
            setSelectedAlbum(albumsData[0]);
          } else {
            setSelectedAlbum(null);
          }
        }
        // Si no hay seleccionado pero hay álbumes, seleccionar el primero
        else if (albumsData.length > 0) {
          setSelectedAlbum(albumsData[0]);
        }
      } catch (error) {
        console.error("Error fetching albums:", error);
      }
    };
    fetchAlbums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  useEffect(() => {
    if (selectedAlbum) {
      // Cargar imágenes del álbum desde MySQL
      const fetchImages = async () => {
        const imagesData = await getAlbumImages(selectedAlbum.id);
        setImages(imagesData);

        /* LÓGICA PARA ACTUALIZAR COVER DEL ÁLBUM CON LA PRIMERA IMAGEN:
        
        // Al cargar las imágenes del álbum desde MySQL
        const albumImages = await getAlbumImages(selectedAlbum.id);
        setImages(albumImages);
        
        // Si el álbum tiene imágenes pero no tiene cover, usar la primera imagen
        if (albumImages.length > 0 && !selectedAlbum.coverImagePath) {
          const firstImageCover = albumImages[0].upscaledPath;
          
          // Actualizar en MySQL
          await updateAlbumCover(selectedAlbum.id, firstImageCover);
          
          // Actualizar estado local
          const updatedAlbums = albums.map(album => 
            album.id === selectedAlbum.id 
              ? { ...album, coverImagePath: firstImageCover }
              : album
          );
          setAlbums(updatedAlbums);
          setSelectedAlbum({ ...selectedAlbum, coverImagePath: firstImageCover });
        }
        
        // Al guardar una nueva imagen desde SaveToAlbumDialog.jsx:
        // 1. Insertar imagen en MySQL con albumId
        // 2. Si es la primera imagen del álbum, actualizar coverImagePath del álbum
        // 3. Incrementar imageCount del álbum
        
        const savedImage = await saveImageToAlbum(albumId, imageData);
        
        if (album.imageCount === 0) {
          await updateAlbumCover(albumId, savedImage.upscaledPath);
          await updateAlbumCount(albumId, 1);
        }
        */
      };
      fetchImages();
    }
  }, [selectedAlbum]);

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      toast.error("Por favor ingresa un nombre para el álbum");
      return;
    }

    try {
      const albumId = await createAlbum(newAlbumName.trim());

      // Recargar álbumes
      const updatedAlbums = await getAllAlbums();
      setAlbums(updatedAlbums);

      const newAlbum = updatedAlbums.find((a) => a.id === albumId);
      if (newAlbum) setSelectedAlbum(newAlbum);

      setNewAlbumName("");
      setShowCreateAlbum(false);
      toast.success(`Álbum "${newAlbumName}" creado exitosamente`);
    } catch (error) {
      console.error("Error creating album:", error);
      toast.error("Error al crear el álbum");
    }
  };

  const handleEditAlbum = async () => {
    if (!newAlbumName.trim()) {
      toast.error("Por favor ingresa un nombre para el álbum");
      return;
    }

    try {
      await updateAlbum(editingAlbum.id, newAlbumName.trim());

      // Recargar álbumes
      const updatedAlbums = await getAllAlbums();
      setAlbums(updatedAlbums);

      // Si el álbum editado es el seleccionado, actualizar su nombre en local
      if (selectedAlbum?.id === editingAlbum.id) {
        setSelectedAlbum({ ...selectedAlbum, name: newAlbumName.trim() });
      }

      setNewAlbumName("");
      setShowEditAlbum(false);
      setEditingAlbum(null);
      toast.success("Álbum actualizado exitosamente");
    } catch (error) {
      console.error("Error updating album:", error);
      toast.error("Error al actualizar el álbum");
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    try {
      await deleteAlbum(albumId);

      // Recargar y filtrar
      const updatedAlbums = albums.filter((album) => album.id !== albumId);
      setAlbums(updatedAlbums);

      if (selectedAlbum?.id === albumId) {
        setSelectedAlbum(updatedAlbums.length > 0 ? updatedAlbums[0] : null);
      }
      toast.success("Álbum eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting album:", error);
      toast.error("Error al eliminar el álbum");
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await deleteImage(imageId);

      const updatedImages = images.filter((img) => img.id !== imageId);
      setImages(updatedImages);

      // Actualizar contador del álbum localmente (o recargar álbumes)
      // Opcional: recargar álbumes para actualizar el contador en el sidebar
      const updatedAlbums = await getAllAlbums();
      setAlbums(updatedAlbums);

      toast.success("Imagen eliminada exitosamente");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Error al eliminar la imagen");
    }
  };

  const handleExportAlbum = async (albumId, albumName) => {
    try {
      toast.info(`Exportando álbum "${albumName}"...`);
      const result = await exportAlbum(albumId);
      
      if (result.canceled) {
        return;
      }
      
      if (result.success) {
        toast.success(`Álbum "${albumName}" exportado exitosamente`);
      }
    } catch (error) {
      console.error("Error exporting album:", error);
      toast.error("Error al exportar el álbum");
    }
  };

  const handleImportAlbum = async () => {
    try {
      const result = await importAlbum();
      
      if (result.canceled) {
        return;
      }
      
      if (result.success) {
        // Recargar álbumes
        const updatedAlbums = await getAllAlbums();
        setAlbums(updatedAlbums);
        
        // Seleccionar el álbum importado
        if (result.album) {
          setSelectedAlbum(result.album);
        }
        
        toast.success(`Álbum "${result.album.name}" importado exitosamente con ${result.imageCount} imágenes`);
      }
    } catch (error) {
      console.error("Error importing album:", error);
      toast.error("Error al importar el álbum. Verifica que el archivo sea válido.");
    }
  };

  const filteredImages = images.filter((img) => {
    const matchesSearch = img.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || img.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const openEditDialog = (album) => {
    setEditingAlbum(album);
    setNewAlbumName(album.name);
    setShowEditAlbum(true);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1400px] h-[85vh] p-0">
        <div className="flex h-full">
          {/* Panel izquierdo - Lista de álbumes */}
          <div className="w-80 border-r dark:border-gray-700 flex flex-col">
            {/* Header de álbumes */}
            <div className="px-4 py-4 border-b dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Álbumes
                  </h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleImportAlbum}
                    className="h-8"
                    title="Importar álbum"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowCreateAlbum(true)}
                    className="h-8"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista de álbumes - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {albums.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    No hay álbumes aún
                  </p>
                  <Button size="sm" onClick={() => setShowCreateAlbum(true)}>
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Crear Álbum
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {albums.map((album) => (
                    <Card
                      key={album.id}
                      className={`cursor-pointer transition-all dark:border-gray-700 overflow-hidden group ${
                        selectedAlbum?.id === album.id
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                          : "hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setSelectedAlbum(album)}
                    >
                      <div className="flex items-center gap-3 p-3">
                        <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded flex items-center justify-center shrink-0">
                          {album.coverImagePath ? (
                            <img
                              src={`file://${album.coverImagePath}`}
                              alt={album.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {album.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {album.imageCount}{" "}
                            {album.imageCount === 1 ? "imagen" : "imágenes"}
                          </p>
                        </div>
                        <div
                          className="transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(album);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportAlbum(album.id, album.name);
                                }}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Exportar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAlbum(album.id);
                                }}
                                variant="destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho - Galería de imágenes */}
          <div className="flex-1 flex flex-col">
            {/* Header de galería */}
            <div className="px-6 py-4 border-b dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <DialogTitle className="text-xl">
                  {selectedAlbum?.name || "Selecciona un álbum"}
                </DialogTitle>
              </div>

              {/* Barra de herramientas */}
              {selectedAlbum && (
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Input
                      placeholder="Buscar imágenes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-9"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 bg-background border border-border rounded-md text-sm dark:bg-gray-800"
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1 border border-border rounded-md p-1 dark:border-gray-700">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="h-7 w-7 p-0"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="h-7 w-7 p-0"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Contenido de galería - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {!selectedAlbum ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ImageIcon className="w-20 h-20 text-gray-400 mb-4" />
                  <h3 className="text-lg text-gray-900 dark:text-white mb-2">
                    Selecciona un álbum
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Elige un álbum de la lista para ver sus imágenes
                  </p>
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ImageIcon className="w-20 h-20 text-gray-400 mb-4" />
                  <h3 className="text-lg text-gray-900 dark:text-white mb-2">
                    No hay imágenes
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm || filterCategory !== "all"
                      ? "No se encontraron imágenes con los filtros aplicados"
                      : "Procesa y guarda imágenes para verlas aquí"}
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                  {filteredImages.map((image) => (
                    <Card
                      key={image.id}
                      className="cursor-pointer hover:shadow-lg transition-all dark:bg-gray-800 dark:border-gray-700 overflow-hidden group"
                      onClick={() => setSelectedImage(image)}
                    >
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
                        {image.upscaledPath ? (
                          <img
                            src={`file://${image.upscaledPath}`}
                            alt={image.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}

                        {/* Delete button */}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(image.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="p-3">
                        <h4 className="text-sm text-gray-900 dark:text-white truncate">
                          {image.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {image.category}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredImages.map((image) => (
                    <Card
                      key={image.id}
                      className="p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all dark:bg-gray-800 dark:border-gray-700"
                      onClick={() => setSelectedImage(image)}
                    >
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded shrink-0">
                        {image.upscaledPath ? (
                          <img
                            src={`file://${image.upscaledPath}`}
                            alt={image.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-gray-900 dark:text-white truncate">
                          {image.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {image.category} •{" "}
                          {new Date(image.savedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Create Album Dialog */}
      <Dialog open={showCreateAlbum} onOpenChange={setShowCreateAlbum}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Álbum</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="albumName">Nombre del Álbum</Label>
            <Input
              id="albumName"
              placeholder="Ej: Fotos Familiares"
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateAlbum();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateAlbum(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAlbum}>Crear Álbum</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Album Dialog */}
      <Dialog open={showEditAlbum} onOpenChange={setShowEditAlbum}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Álbum</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="editAlbumName">Nombre del Álbum</Label>
            <Input
              id="editAlbumName"
              placeholder="Ej: Fotos Familiares"
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditAlbum();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditAlbum(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditAlbum}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Detail Dialog */}
      {selectedImage && (
        <Dialog
          open={!!selectedImage}
          onOpenChange={() => setSelectedImage(null)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedImage.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {selectedImage.upscaledPath && (
                  <img
                    src={`file://${selectedImage.upscaledPath}`}
                    alt={selectedImage.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Categoría</p>
                  <p className="text-gray-900 dark:text-white">
                    {selectedImage.category}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Fecha</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedImage.savedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedImage(null)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
