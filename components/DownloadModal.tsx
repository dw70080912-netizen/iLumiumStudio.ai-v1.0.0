import React, { useState, useEffect, useCallback } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from './icons';

interface DownloadModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ imageUrl, onClose }) => {
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [quality, setQuality] = useState(92);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(() => {
    setIsDownloading(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
          alert("Erro: Não foi possível criar o contexto do canvas para download.");
          setIsDownloading(false);
          return;
      }
      ctx.drawImage(img, 0, 0);

      const mimeType = `image/${format}`;
      const dataUrl = canvas.toDataURL(mimeType, format === 'jpeg' ? quality / 100 : undefined);
      
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `ilumium_image_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setIsDownloading(false);
      onClose();
    };
    img.onerror = () => {
        alert("Erro ao carregar a imagem para download. Tente novamente.");
        setIsDownloading(false);
    }
  }, [imageUrl, format, quality, onClose]);
  
  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md border border-gray-700 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowDownTrayIcon className="w-6 h-6 text-blue-400" />
                Opções de Download
            </h2>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-600">
                <XMarkIcon className="w-5 h-5" />
            </button>
        </div>
        <div className="p-6 space-y-6">
            <img src={imageUrl} alt="Preview" className="w-full max-h-64 object-contain rounded-md" />
            
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Formato</label>
                    <select value={format} onChange={(e) => setFormat(e.target.value as 'jpeg' | 'png')} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-blue-500 focus:outline-none">
                        <option value="jpeg">JPEG (Ideal para web)</option>
                        <option value="png">PNG (Máxima qualidade)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Qualidade: {quality}%</label>
                    <input 
                        type="range"
                        min="1"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        disabled={format === 'png'}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                     {format === 'png' && <p className="text-xs text-gray-500 mt-1">Qualidade é 100% para PNG.</p>}
                </div>
            </div>
        </div>

        <div className="p-4 bg-gray-900/50 border-t border-gray-700 rounded-b-lg">
             <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-wait"
            >
                {isDownloading ? 'Preparando...' : 'Download da Imagem'}
            </button>
        </div>
      </div>
    </div>
  );
};
