import { useState } from "react";
import { Slider } from "./ui/slider";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "./ui/button";

export function ImageComparison({ beforeImage, afterImage }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [zoom, setZoom] = useState(1);

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video bg-gray-900 dark:bg-black rounded-lg overflow-hidden">
        {/* After Image (Full) */}
        <img
          src={afterImage}
          alt="Después"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        />
        
        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={beforeImage}
            alt="Antes"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          />
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-4 bg-gray-600"></div>
              <div className="w-0.5 h-4 bg-gray-600"></div>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          Antes
        </div>
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          Después
        </div>
      </div>

      {/* Slider Control */}
      <div className="px-4">
        <Slider
          value={[sliderPosition]}
          onValueChange={(value) => setSliderPosition(value[0])}
          min={0}
          max={100}
          step={1}
          className="cursor-ew-resize"
        />
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(Math.max(1, zoom - 0.25))}
          disabled={zoom <= 1}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(Math.min(3, zoom + 0.25))}
          disabled={zoom >= 3}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(1)}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
