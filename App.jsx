import { useState, useEffect } from "react";
import { ImageUploader } from "./components/ImageUploader";
import { ImageComparison } from "./components/ImageComparison";
import { UpscaleControls } from "./components/UpscaleControls";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Progress } from "./components/ui/progress";
import { Switch } from "./components/ui/switch";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { Sparkles, Download, RotateCcw, Settings2, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import {
  handleImageSelect as handleImageSelectScript,
  simulateUpscale as simulateUpscaleScript,
  handleDownload as handleDownloadScript,
  handleReset as handleResetScript,
  resetSettings,
  applyDarkMode,
} from "./utils/appScripts";

export default function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [upscaledImage, setUpscaledImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  
  // Controls state
  const [scale, setScale] = useState(2);
  const [model, setModel] = useState("general");
  const [denoiseStrength, setDenoiseStrength] = useState(50);
  
  // Settings state
  const [outputPath, setOutputPath] = useState("~/Downloads");
  const [upscaleType, setUpscaleType] = useState("AI Enhanced");
  const [outputSize, setOutputSize] = useState("Auto");

  // Dark mode effect
  useEffect(() => {
    applyDarkMode(isDarkMode);
  }, [isDarkMode]);

  // Debug effects
  useEffect(() => {
    console.log("useEffect - upscaledImage cambió:", upscaledImage ? "SÍ TIENE VALOR" : "NO TIENE VALOR");
  }, [upscaledImage]);

  useEffect(() => {
    console.log("useEffect - isProcessing cambió:", isProcessing);
  }, [isProcessing]);

  // Wrapper functions para conectar los scripts con el estado local
  const handleImageSelect = (file) => {
    handleImageSelectScript(file, setOriginalImage, setUpscaledImage);
  };

  const simulateUpscale = async () => {
    await simulateUpscaleScript(
      originalImage,
      scale,
      denoiseStrength,
      setIsProcessing,
      setProgress,
      setUpscaledImage,
      setRenderKey
    );
  };

  const handleDownload = () => {
    handleDownloadScript(upscaledImage, scale, outputPath);
  };

  const handleReset = () => {
    handleResetScript(setOriginalImage, setUpscaledImage, setProgress);
  };

  const handleResetSettings = () => {
    resetSettings(setOutputPath, setUpscaleType, setOutputSize);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900 dark:text-white">rIA</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reescalado inteligente de imágenes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                  aria-label="Toggle dark mode"
                />
                <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>

              {/* Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                    <Settings2 className="w-4 h-4" />
                    Configuración
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Configuración General</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className="p-2 space-y-4">
                    {/* Upscale Type */}
                    <div className="space-y-2">
                      <Label className="text-xs">Tipo de Reescalado</Label>
                      <select 
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                        value={upscaleType}
                        onChange={(e) => {
                          setUpscaleType(e.target.value);
                          toast.success(`Tipo cambiado a: ${e.target.value}`);
                        }}
                      >
                        <option value="AI Enhanced">AI Enhanced</option>
                        <option value="Standard">Standard</option>
                        <option value="Fast">Fast</option>
                        <option value="Quality">Quality</option>
                      </select>
                    </div>

                    {/* Output Size */}
                    <div className="space-y-2">
                      <Label className="text-xs">Tamaño de Salida</Label>
                      <select 
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                        value={outputSize}
                        onChange={(e) => {
                          setOutputSize(e.target.value);
                          toast.success(`Tamaño cambiado a: ${e.target.value}`);
                        }}
                      >
                        <option value="Auto">Auto</option>
                        <option value="1080p">1080p</option>
                        <option value="4K">4K</option>
                        <option value="8K">8K</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>

                    {/* Output Path */}
                    <div className="space-y-2">
                      <Label className="text-xs">Ruta de Salida</Label>
                      <Input
                        value={outputPath}
                        onChange={(e) => setOutputPath(e.target.value)}
                        placeholder="~/Downloads"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleResetSettings}>
                    Restablecer valores predeterminados
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
          {/* Left Column - Upload and Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 dark:bg-gray-800 dark:border-gray-700 min-h-[400px]">
              <div className="h-full flex items-center justify-center">
                {!originalImage ? (
                  <ImageUploader onImageSelect={handleImageSelect} />
                ) : (
                  <div className="space-y-4 w-full">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={originalImage}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      Imagen original cargada
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleReset}
                      disabled={isProcessing}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Cargar otra imagen
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {originalImage && (
              <>
                <UpscaleControls
                  scale={scale}
                  onScaleChange={setScale}
                  model={model}
                  onModelChange={setModel}
                  denoiseStrength={denoiseStrength}
                  onDenoiseStrengthChange={setDenoiseStrength}
                  disabled={isProcessing}
                />

                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  size="lg"
                  onClick={simulateUpscale}
                  disabled={isProcessing}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {isProcessing ? "Procesando..." : "Reescalar Imagen"}
                </Button>
              </>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            <Card className="p-6 dark:bg-gray-800 dark:border-gray-700 min-h-[400px]">
              {!originalImage && !upscaledImage && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h2 className="text-gray-900 dark:text-white mb-2">Comienza cargando una imagen</h2>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Sube una imagen en el panel izquierdo para comenzar el proceso de reescalado con IA
                  </p>
                </div>
              )}

              {isProcessing && (
                <div className="space-y-4 py-20">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4 animate-pulse">
                      <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-gray-900 dark:text-white mb-2">Procesando con IA</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Aplicando modelo <strong>{model}</strong> con escala {scale}x
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      Tipo: {upscaleType} | Tamaño: {outputSize}
                    </p>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}%</p>
                </div>
              )}

              {(() => {
                console.log("Condiciones de renderizado:", {
                  isProcessing,
                  hasOriginal: !!originalImage,
                  hasUpscaled: !!upscaledImage,
                  shouldShow: !isProcessing && originalImage && upscaledImage
                });
                return null;
              })()}

              {!isProcessing && originalImage && upscaledImage && (
                <div className="space-y-6" key={renderKey}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-gray-900 dark:text-white">Comparación de Resultados</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Desliza para comparar antes y después
                      </p>
                    </div>
                    <Button onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                  </div>

                  <ImageComparison
                    key={`comparison-${renderKey}`}
                    beforeImage={originalImage}
                    afterImage={upscaledImage}
                  />

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Modelo usado</p>
                      <p className="text-gray-900 dark:text-white">{model}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Factor de escala</p>
                      <p className="text-gray-900 dark:text-white">{scale}x</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tipo</p>
                      <p className="text-gray-900 dark:text-white">{upscaleType}</p>
                    </div>
                  </div>
                </div>
              )}

              {!isProcessing && originalImage && !upscaledImage && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-gray-900 dark:text-white mb-2">Listo para reescalar</h2>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Configura los parámetros y haz clic en "Reescalar Imagen" para comenzar
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
