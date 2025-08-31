
import React, { useState, useCallback } from 'react';
import type { UploadedImage } from '../types';
import { CameraIcon, UploadIcon, ClipboardCopyIcon, ArrowUpTrayIcon } from './icons';

interface ImageAnalyzerProps {
  onAnalyze: (image: UploadedImage) => Promise<string>;
  onUseInChat: (text: string) => void;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const fileToBase64 = (file: File): Promise<UploadedImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        base64: base64String,
        mimeType: file.type,
        name: file.name,
      });
    };
    reader.onerror = (error) => reject(error);
  });
};

export const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ onAnalyze, onUseInChat }) => {
  const [stagedImage, setStagedImage] = useState<UploadedImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setError(null);
      setAnalysisResult(null);

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError('Arquivo inválido. Por favor, envie uma imagem JPG, PNG ou WEBP.');
        setStagedImage(null);
        return;
      }
      
      setIsLoading(true);
      try {
        const uploadedImage = await fileToBase64(file);
        setStagedImage(uploadedImage);
      } catch (err) {
        setError('Erro ao ler o arquivo. Por favor, tente novamente.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);
  
  const handleAnalyzeImage = async () => {
      if (!stagedImage) {
          setError('Por favor, envie uma imagem primeiro.');
          return;
      }
      setIsLoading(true);
      setError(null);
      setAnalysisResult(null);
      try {
          const result = await onAnalyze(stagedImage);
          setAnalysisResult(result);
      } catch (err) {
          setError((err as Error).message || 'Ocorreu um erro inesperado durante a análise.');
          console.error(err);
      } finally {
          setIsLoading(false);
      }
  };

  const handleCopyToClipboard = () => {
    if (analysisResult) {
      navigator.clipboard.writeText(analysisResult);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };
  
  const handleUseInChat = () => {
      if(analysisResult) {
          onUseInChat(analysisResult);
      }
  };

  return (
    <div className="p-4 bg-gray-800 flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4 text-white flex items-center"><CameraIcon className="w-6 h-6 mr-2 text-blue-400" /> Analisador de Imagem</h2>
      <p className="text-sm text-gray-400 mb-4">Envie uma imagem de referência para obter uma análise detalhada de seu estilo fotográfico, composição, iluminação e mais.</p>
      
      <div className="space-y-4">
          <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
            <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-400">{stagedImage ? `Selecionado: ${stagedImage.name}` : 'Clique para enviar uma imagem de referência'}</span>
            <input type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={handleFileChange} className="hidden" />
          </label>

          {stagedImage && (
            <div className="flex flex-col items-center space-y-4">
              <img src={`data:${stagedImage.mimeType};base64,${stagedImage.base64}`} alt="Pré-visualização da referência" className="max-h-48 w-auto rounded-lg" />
               <button
                  onClick={handleAnalyzeImage}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-wait"
                >
                  {isLoading ? 'Analisando...' : 'Analisar Estilo da Imagem'}
                </button>
            </div>
          )}

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          {analysisResult && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-300">Resultado da Análise:</h3>
                <div className="flex items-center gap-2">
                    <button onClick={handleUseInChat} className="text-xs flex items-center gap-1 bg-gray-700 px-2 py-1 rounded-md hover:bg-gray-600 transition-colors" title="Usar no Chat">
                        <ArrowUpTrayIcon className="w-4 h-4" />
                        Usar no Chat
                    </button>
                    <button onClick={handleCopyToClipboard} className="text-xs flex items-center gap-1 bg-gray-700 px-2 py-1 rounded-md hover:bg-gray-600 transition-colors" title="Copiar para Área de Transferência">
                        <ClipboardCopyIcon className="w-4 h-4" />
                        {copySuccess ? 'Copiado!' : 'Copiar'}
                    </button>
                 </div>
              </div>
              <pre className="w-full bg-gray-900 p-3 rounded-md text-sm text-gray-200 overflow-x-auto whitespace-pre-wrap">
                  <code>
                      {analysisResult}
                  </code>
              </pre>
            </div>
          )}
      </div>
    </div>
  );
};
