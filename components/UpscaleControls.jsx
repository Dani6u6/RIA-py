import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Card } from "./ui/card";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export function UpscaleControls({
  scale,
  onScaleChange,
  model,
  onModelChange,
  denoiseStrength,
  onDenoiseStrengthChange,
  disabled,
}) {
  return (
    <Card className="p-6 space-y-6 dark:bg-gray-800 dark:border-gray-700">
      <div>
        <h3 className="mb-4 dark:text-white">Configuración de Reescalado</h3>
      </div>

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

      {/* Denoise Strength */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="dark:text-gray-200">Reducción de Ruido</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Elimina artefactos y ruido de la imagen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-sm text-blue-600 dark:text-blue-400">{denoiseStrength}%</span>
        </div>
        <Slider
          value={[denoiseStrength]}
          onValueChange={(value) => onDenoiseStrengthChange(value[0])}
          min={0}
          max={100}
          step={10}
          disabled={disabled}
        />
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h4 className="text-blue-900 dark:text-blue-300 mb-2">Resolución estimada</h4>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          La imagen se reescalará <strong>{scale}x</strong> su tamaño original
        </p>
      </div>
    </Card>
  );
}
