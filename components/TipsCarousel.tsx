import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LightBulbIcon, XMarkIcon, ArrowsPointingOutIcon } from './icons';

const TIPS = [
  { title: "Recorte e Redimensionamento", content: "Ajuste o enquadramento final da sua imagem e redimensione para o destino (web, impressão)." },
  { title: "Perfis de Cor", content: "Use sRGB para a web para garantir consistência de cores em todos os dispositivos. Use Adobe RGB ou CMYK para impressão profissional." },
  { title: "Metadados (Metadata)", content: "Preencha informações de copyright e palavras-chave para proteger e organizar suas fotos." },
  { title: "Exportação Inteligente", content: "Ao exportar, defina o formato (JPEG), resolução (72-150 PPI para web) e qualidade para otimizar o arquivo." },
  { title: "Teoria da Cor", content: "Use cores complementares (opostas no círculo cromático, como azul e laranja) para criar impacto visual." },
  { title: "Narrativa Visual", content: "Tente contar uma história com sua imagem. O que aconteceu antes? O que vai acontecer depois?" },
  { title: "Crítica Fotográfica", content: "Aprenda a analisar seu próprio trabalho e a receber feedback para identificar pontos de melhoria." },
  { title: "Direção de Modelos", content: "Comunique-se de forma clara e positiva para deixar as pessoas à vontade e obter expressões autênticas." },
  { title: "Gestão de Cor", content: "Calibre seu monitor regularmente para garantir que as cores que você vê na edição são as cores reais da foto." },
  { title: "Marketing para Fotógrafos", content: "Construa um portfólio coeso com suas melhores imagens e defina um nicho para se destacar." },
];

export const TipsCarousel: React.FC = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isClosed, setIsClosed] = useState(false);

  // For dragging and resizing
  const carouselRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 320, height: 'auto' as 'auto' | number });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const dragInfo = useRef({ offsetX: 0, offsetY: 0 });
  const resizeInfo = useRef({ startX: 0, startY: 0, startWidth: 0, startHeight: 0 });

  // Tip rotation logic
  useEffect(() => {
    if (TIPS.length === 0 || isClosed) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentTipIndex(prevIndex => (prevIndex + 1) % TIPS.length);
        setIsVisible(true);
      }, 500); // Duration of fade-out transition
    }, 7000); // 7 seconds

    return () => clearInterval(interval);
  }, [isClosed]);

  // Set initial position
  useEffect(() => {
    if (carouselRef.current && !isInitialized) {
      const rect = carouselRef.current.getBoundingClientRect();
      setPosition({
        x: window.innerWidth - rect.width - 20,
        y: window.innerHeight - rect.height - 20,
      });
      setSize({
        width: rect.width,
        height: rect.height
      });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const handleDragMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!carouselRef.current) return;
    setIsDragging(true);
    dragInfo.current = {
      offsetX: e.clientX - position.x,
      offsetY: e.clientY - position.y,
    };
  }, [position]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!carouselRef.current) return;
    setIsResizing(true);
    const rect = carouselRef.current.getBoundingClientRect();
    resizeInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
    };
    if (size.height === 'auto') {
        setSize(s => ({...s, height: rect.height}));
    }
  }, [size.height]);

  // Handle move and resize events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        let newX = e.clientX - dragInfo.current.offsetX;
        let newY = e.clientY - dragInfo.current.offsetY;

        if (carouselRef.current) {
          const rect = carouselRef.current.getBoundingClientRect();
          newX = Math.max(0, Math.min(newX, window.innerWidth - rect.width));
          newY = Math.max(0, Math.min(newY, window.innerHeight - rect.height));
        }

        setPosition({ x: newX, y: newY });
      }
      if (isResizing) {
        const newWidth = resizeInfo.current.startWidth + (e.clientX - resizeInfo.current.startX);
        const newHeight = resizeInfo.current.startHeight + (e.clientY - resizeInfo.current.startY);
        setSize({
          width: Math.max(300, newWidth),
          height: Math.max(120, newHeight),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, isResizing]);

  if (isClosed || TIPS.length === 0) return null;

  const currentTip = TIPS[currentTipIndex];
  
  const dynamicStyles: React.CSSProperties = isInitialized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${size.width}px`,
        height: typeof size.height === 'number' ? `${size.height}px` : size.height,
        opacity: isVisible ? 1 : 0,
      }
    : {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        maxWidth: '20rem',
        width: '100%',
        opacity: 0, // Hidden until positioned
      };

  return (
    <div
      ref={carouselRef}
      className="z-50 transition-opacity duration-500 flex flex-col bg-gray-800 rounded-lg shadow-2xl border border-gray-700"
      style={dynamicStyles}
      aria-live="polite"
    >
        <div 
            className="flex items-center justify-between p-2 bg-gray-700 rounded-t-lg cursor-move touch-none"
            onMouseDown={handleDragMouseDown}
        >
            <div className="flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5 text-yellow-400" />
                <h4 className="font-bold text-xs text-yellow-400">Dica Rápida</h4>
            </div>
            <button
                onClick={() => setIsClosed(true)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-600 hover:text-white"
                aria-label="Ocultar dicas"
            >
                <XMarkIcon className="w-4 h-4" />
            </button>
        </div>
        
        <div className="p-4 flex-grow overflow-y-auto">
            <h5 className="font-bold text-sm text-white">{currentTip.title}</h5>
            <p className="text-xs text-gray-400 mt-1">{currentTip.content}</p>
        </div>

        <div
            className="absolute bottom-0 right-0 p-1 cursor-se-resize text-gray-500 hover:text-blue-400 touch-none"
            onMouseDown={handleResizeMouseDown}
            aria-label="Redimensionar dica"
        >
            <ArrowsPointingOutIcon className="w-4 h-4" />
        </div>
    </div>
  );
};