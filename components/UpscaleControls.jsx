import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Card } from "./ui/card";
import { Info, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export function UpscaleControls({
  scale,
  onScaleChange,
  model,
  onModelChange,
  useRealBackend,
  onUseRealBackendChange,
  disabled,
  orientation = "vertical", // "vertical" | "horizontal"
}) {
  const isHorizontal = orientation === "horizontal";
  
  return (
    <Card className={`p-6 dark:bg-gray-800 dark:border-gray-700 ${isHorizontal ? '' : 'space-y-6'}`}>
      {isHorizontal ? (
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="dark:text-white">Configuración de Reescalado</h3>
        </div>
      ) : (
        <div>
          <h3 className="mb-4 dark:text-white">Configuración de Reescalado</h3>
        </div>
      )}

      <div className={isHorizontal ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
        {/* Model Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="model" className="dark:text-gray-200">Modelo de IA</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Diferentes modelos optimizados para distintos tipos de imágenes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={model} onValueChange={onModelChange} disabled={disabled}>
            <SelectTrigger id="model">
              <SelectValue placeholder="Seleccionar modelo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Purpose (4x)</SelectItem>
              <SelectItem value="anime">Anime & Arte (4x)</SelectItem>
              <SelectItem value="anime-video-2x">Anime Video (2x)</SelectItem>
              <SelectItem value="anime-video-3x">Anime Video (3x)</SelectItem>
              <SelectItem value="anime-video-4x">Anime Video (4x)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Scale Factor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="dark:text-gray-200">Factor de Escala</Label>
            <span className="text-sm text-blue-600 dark:text-blue-400">{scale}x</span>
          </div>
          <Slider
            value={[scale]}
            onValueChange={(value) => onScaleChange(value[0])}
            min={2}
            max={4}
            step={1}
            disabled={disabled}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Mayor escala = mayor resolución pero más tiempo de procesamiento
          </p>
        </div>

        {/* Backend Toggle */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="dark:text-gray-200">Modo de Procesamiento</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Real-ESRGAN usa el backend Python con IA real.
                    Simulación procesa en el navegador (para pruebas).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${useRealBackend ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-sm dark:text-gray-200">
                {useRealBackend ? "Real-ESRGAN" : "Simulación"}
              </span>
            </div>
            <Switch
              checked={useRealBackend}
              onCheckedChange={onUseRealBackendChange}
              disabled={disabled}
              aria-label="Toggle backend real"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {useRealBackend 
              ? "Procesamiento con IA real (requiere backend activo)" 
              : "Procesamiento simulado en el navegador"}
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className={`bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 ${isHorizontal ? 'mt-6' : ''}`}>
        <h4 className="text-blue-900 dark:text-blue-300 mb-2">Resolución estimada</h4>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          La imagen se reescalará <strong>{scale}x</strong> su tamaño original
        </p>
      </div>
    </Card>
  );
}
