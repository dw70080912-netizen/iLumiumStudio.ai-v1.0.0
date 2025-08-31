
import React, { useState, useCallback } from 'react';
import type { UploadedImage, AspectRatio, ExpandImageRequest } from '../types';
import { UploadIcon, ArrowsPointingOutIcon } from './icons';

interface ImageExpanderProps {
  onExpand: (request: ExpandImageRequest) => void;
  isLoading: boolean;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const fileToBase64 = (file: File): Promise<UploadedImage> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve({ base64: base64String, mimeType: file.type, name: file.name });
        };
        reader.onerror = (error) => reject(error);
    });
};

export const ImageExpander: React.FC<ImageExpanderProps> = ({ onExpand, isLoading }) => {
  const [baseImage, setBaseImage] = useState<UploadedImage | null>(null);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setError(null);

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError('Arquivo inválido. Por favor, envie uma imagem JPG, PNG ou WEBP.');
        setBaseImage(null);
        return;
      }
      
      try {
        const uploadedImage = await fileToBase64(file);
        setBaseImage(uploadedImage);
      } catch (err) {
        setError('Erro ao ler o arquivo. Por favor, tente novamente.');
        console.error(err);
      }
    }
  }, []);

  const handleExpandClick = (aspectRatio: AspectRatio) => {
    if (!baseImage) {
      setError('Por favor, envie uma imagem primeiro.');
      return;
    }
    if (isLoading) return;
    setError(null);
    onExpand({ image: baseImage, aspectRatio, prompt });
  };
  
  const aspectRatios: { value: AspectRatio; label: string }[] = [
      { value: '16:9', label: 'Paisagem (16:9)' },
      { value: '4:3', label: 'Paisagem (4:3)' },
      { value: '1:1', label: 'Quadrado (1:1)' },
      { value: '3:4', label: 'Retrato (3:4)' },
      { value: '9:16', label: 'Retrato (9:16)' },
  ];

  return (
    <div className="p-4 bg-gray-800 flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4 text-white flex items-center"><ArrowsPointingOutIcon className="w-6 h-6 mr-2 text-blue-400" /> Expandir & Preencher Imagem</h2>
      <p className="text-sm text-gray-400 mb-4">
        Envie uma imagem, descreva o que adicionar e escolha uma nova proporção. A IA irá recriar o restante da imagem, preenchendo o espaço em branco com base no seu prompt.
      </p>

       <div className="p-3 mb-4 bg-yellow-900/50 border border-yellow-600 rounded-lg text-yellow-200 text-sm">
        <p><strong className="font-bold">Aviso:</strong> Esta ferramenta está em fase de testes (beta). Os resultados podem demorar para serem concluídos e a qualidade pode variar. Estamos trabalhando para aprimorá-la!</p>
      </div>

      <div className="space-y-4 flex-grow overflow-y-auto pr-2">
        <div>
          <label className={`w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${baseImage ? 'border-blue-500' : 'border-gray-600 hover:bg-gray-700'}`}>
            <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-400 text-center">{baseImage ? `Selecionado: ${baseImage.name}` : 'Clique para enviar a imagem a ser expandida'}</span>
            <input type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={handleFileChange} className="hidden" />
          </label>
          {baseImage && <img src={`data:${baseImage.mimeType};base64,${baseImage.base64}`} alt="Imagem base" className="mt-4 mx-auto max-h-40 rounded-lg" />}
        </div>
        
        {baseImage && (
             <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Opcional: Descreva o que adicionar na área expandida..."
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
        )}
        
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        
        {baseImage && (
            <div>
                <p className="text-sm font-bold text-white mb-2 text-center">Expandir Para:</p>
                <div className="grid grid-cols-1 gap-2">
                    {aspectRatios.map(ar => (
                         <button 
                            key={ar.value}
                            onClick={() => handleExpandClick(ar.value)}
                            disabled={isLoading}
                            className="w-full bg-gray-700 text-gray-200 font-semibold py-2 px-4 rounded-md hover:bg-blue-600 hover:text-white transition-colors duration-200 disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed"
                         >
                            {ar.label}
                         </button>
                    ))}
                </div>
            </div>
        )}
         {isLoading && baseImage && (
             <p className="text-center text-blue-400 text-sm font-semibold animate-pulse mt-4">Expandindo imagem, por favor aguarde...</p>
        )}
      </div>
    </div>
  );
};