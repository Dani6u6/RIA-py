import { useState, useRef, useEffect } from "react";
import { Slider } from "./ui/slider";
import { ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react";
import { Button } from "./ui/button";

export function ImageComparison({ beforeImage, afterImage }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Reset pan when zoom changes to 1
  useEffect(() => {
    if (zoom === 1) {
      setPan({ x: 0, y: 0 });
    }
  }, [zoom]);

  // Handle slider drag with mouse/touch
  const handleSliderMouseDown = (e) => {
    e.preventDefault();
    setIsDraggingSlider(true);
  };

  const handleMouseMove = (e) => {
    if (isDraggingSlider && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    }

    // Handle panning when zoomed
    if (isPanning && zoom > 1) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingSlider(false);
    setIsPanning(false);
  };

  const handleTouchMove = (e) => {
    if (isDraggingSlider && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    }

    // Handle touch panning when zoomed
    if (isPanning && zoom > 1 && e.touches[0]) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - panStart.x;
      const deltaY = touch.clientY - panStart.y;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setPanStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = () => {
    setIsDraggingSlider(false);
    setIsPanning(false);
  };

  // Start panning on image click (when zoomed)
  const handleImageMouseDown = (e) => {
    if (zoom > 1 && e.target.tagName === 'IMG') {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleImageTouchStart = (e) => {
    if (zoom > 1 && e.target.tagName === 'IMG' && e.touches[0]) {
      const touch = e.touches[0];
      setIsPanning(true);
      setPanStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  // Add/remove event listeners
  useEffect(() => {
    if (isDraggingSlider || isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDraggingSlider, isPanning, panStart, zoom]);

  const imageTransform = `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`;

  return (
    <div className="space-y-4">
      <div 
        ref={containerRef}
        className="relative w-full aspect-video bg-gray-900 dark:bg-black rounded-lg overflow-hidden"
        style={{ cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
        onMouseDown={handleImageMouseDown}
        onTouchStart={handleImageTouchStart}
      >
        {/* After Image (Full) */}
        <img
          src={afterImage}
          alt="Después"
          className="absolute inset-0 w-full h-full object-contain select-none"
          style={{ 
            transform: imageTransform,
            transformOrigin: 'center',
            transition: isPanning ? 'none' : 'transform 0.1s ease-out'
          }}
          draggable={false}
        />
        
        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={beforeImage}
            alt="Antes"
            className="absolute inset-0 w-full h-full object-contain select-none"
            style={{ 
              transform: imageTransform,
              transformOrigin: 'center',
              transition: isPanning ? 'none' : 'transform 0.1s ease-out'
            }}
            draggable={false}
          />
        </div>

        {/* Slider Line with Draggable Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center cursor-ew-resize pointer-events-auto hover:scale-110 active:scale-95 transition-transform"
            onMouseDown={handleSliderMouseDown}
            onTouchStart={(e) => {
              e.preventDefault();
              setIsDraggingSlider(true);
            }}
          >
            <div className="flex gap-0.5">
              <div className="w-0.5 h-4 bg-gray-600"></div>
              <div className="w-0.5 h-4 bg-gray-600"></div>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm pointer-events-none">
          Antes
        </div>
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm pointer-events-none">
          Después
        </div>

        {/* Pan Indicator (when zoomed) */}
        {zoom > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm pointer-events-none flex items-center gap-1">
            <Move className="w-3 h-3" />
            Arrastra para navegar
          </div>
        )}
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
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          disabled={zoom === 1}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        {zoom > 1 ? (
          <p>🖱️ Arrastra la imagen para navegar • Usa el slider para comparar antes/después</p>
        ) : (
          <p>↔️ Arrastra el círculo o usa el slider para comparar • + Zoom para ver detalles</p>
        )}
      </div>
    </div>
  );
}
