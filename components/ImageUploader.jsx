import { Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/button";

export function ImageUploader({ onImageSelect, disabled }) {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onImageSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="mb-2 dark:text-white">Arrastra y suelta tu imagen aquí</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">o</p>
          <div>
            <Button 
              variant="default" 
              disabled={disabled}
              onClick={() => document.getElementById('file-upload').click()}
              type="button"
            >
              <Upload className="w-4 h-4 mr-2" />
              Seleccionar imagen
            </Button>
          </div>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          PNG, JPG, WEBP hasta 10MB
        </p>
      </div>
    </div>
  );
}
