import React, { useState, useEffect, useRef, useCallback } from 'react';
import { XMarkIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon, ArrowsPointingInIcon } from './icons';

interface ImageViewerModalProps {
  imageUrl: string;
  onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 18;
const ZOOM_STEP = 0.5;

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ imageUrl, onClose }) => {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const isPanning = useRef(false);
  const lastPanPoint = useRef({ x: 0, y: 0 });

  const reset = useCallback(() => {
    setZoom(MIN_ZOOM);
    setPan({ x: 0, y: 0 });
  }, []);

  const clampPan = (x: number, y: number, currentZoom: number) => {
      if (currentZoom <= 1 || !imageRef.current) return { x: 0, y: 0 };
      const img = imageRef.current;
      const maxX = (img.offsetWidth * currentZoom - img.offsetWidth) / 2 / currentZoom;
      const maxY = (img.offsetHeight * currentZoom - img.offsetHeight) / 2 / currentZoom;
      return {
          x: Math.max(-maxX, Math.min(maxX, x)),
          y: Math.max(-maxY, Math.min(maxY, y)),
      };
  };

  const handleZoom = (delta: number) => {
    setZoom(prevZoom => {
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevZoom + delta));
      if (newZoom <= 1) setPan({ x: 0, y: 0 });
      else setPan(prevPan => clampPan(prevPan.x, prevPan.y, newZoom));
      return newZoom;
    });
  };

  const onMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    if (zoom > 1) {
      e.preventDefault();
      isPanning.current = true;
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
      if (imageRef.current) imageRef.current.style.cursor = 'grabbing';
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isPanning.current) return;
      const dx = (e.clientX - lastPanPoint.current.x) / zoom;
      const dy = (e.clientY - lastPanPoint.current.y) / zoom;
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
      setPan(prevPan => clampPan(prevPan.x + dx, prevPan.y + dy, zoom));
    };

    const onMouseUp = () => {
      isPanning.current = false;
      if (imageRef.current) imageRef.current.style.cursor = zoom > 1 ? 'grab' : 'default';
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [zoom]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === '+') handleZoom(ZOOM_STEP);
      if (event.key === '-') handleZoom(-ZOOM_STEP);
      if (event.key === '0') reset();
    };

    const handleWheel = (event: WheelEvent) => {
        event.preventDefault();
        handleZoom(event.deltaY * -0.01);
    };

    window.addEventListener('keydown', handleKeyDown);
    const container = imageRef.current?.parentElement;
    container?.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      container?.removeEventListener('wheel', handleWheel);
    };
  }, [onClose, reset]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Visualização em tela cheia"
          className="max-w-[95vw] max-h-[95vh] object-contain transition-transform duration-200"
          style={{ 
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            cursor: zoom > 1 ? 'grab' : 'default',
        }}
          onMouseDown={onMouseDown}
        />
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="flex items-center gap-1 bg-gray-800/80 p-1 rounded-full border border-gray-600">
            <button onClick={() => handleZoom(-ZOOM_STEP)} disabled={zoom <= MIN_ZOOM} className="p-2 text-white rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <MagnifyingGlassMinusIcon className="w-5 h-5"/>
            </button>
            <span className="text-white text-xs font-mono w-10 text-center" >{zoom.toFixed(1)}x</span>
            <button onClick={() => handleZoom(ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} className="p-2 text-white rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <MagnifyingGlassPlusIcon className="w-5 h-5"/>
            </button>
            <button onClick={reset} disabled={zoom === MIN_ZOOM && pan.x === 0 && pan.y === 0} className="p-2 text-white rounded-full hover:bg-gray-700 disabled:opacity-50">
                <ArrowsPointingInIcon className="w-5 h-5"/>
            </button>
        </div>
        <button onClick={onClose} className="p-3 bg-gray-800/80 rounded-full text-white hover:bg-red-500/80 border border-gray-600">
            <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
