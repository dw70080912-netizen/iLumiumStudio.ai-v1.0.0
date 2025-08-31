
import React, { useState, useCallback, useEffect } from 'react';
import { CubeIcon, UploadIcon } from './icons';
import type { ChatMessage, UploadedImage } from '../types';

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

interface VolumetricsEditorProps {
  onRerender: (image: UploadedImage, anglePrompt: string) => void;
  isLoading: boolean;
  reusedImage: UploadedImage | null;
  onReusedImageConsumed: () => void;
}

export const VolumetricsEditor: React.FC<VolumetricsEditorProps> = ({ onRerender, isLoading, reusedImage, onReusedImageConsumed }) => {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [anglePrompt, setAnglePrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reusedImage) {
      setUploadedImage(reusedImage);
      setAnglePrompt('');
      setError(null);
      onReusedImageConsumed();
    }
  }, [reusedImage, onReusedImageConsumed]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setError(null);
      setAnglePrompt('');

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError('Arquivo inválido. Por favor, envie uma imagem JPG, PNG ou WEBP.');
        setUploadedImage(null);
        return;
      }
      
      try {
        const image = await fileToBase64(file);
        setUploadedImage(image);
      } catch (err) {
        setError('Erro ao ler o arquivo. Por favor, tente novamente.');
        console.error(err);
      }
    }
  }, []);

  const handleRerender = async () => {
    if (!uploadedImage) {
      setError('Por favor, envie uma imagem primeiro.');
      return;
    }
    if (!anglePrompt.trim()) {
      setError('Por favor, descreva o novo ângulo da câmera.');
      return;
    }
    setError(null);
    onRerender(uploadedImage, anglePrompt);
  };

  return (
    <div className="p-4 bg-gray-800 flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4 text-white flex items-center">
        <CubeIcon className="w-6 h-6 mr-2 text-blue-400" />
        Volumetria (Experimental)
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Simule uma re-renderização 3D. Envie uma imagem, descreva uma nova perspectiva e a IA tentará recriar a cena a partir desse novo ângulo.
      </p>

      <div className="p-3 mb-4 bg-yellow-900/50 border border-yellow-600 rounded-lg text-yellow-200 text-sm">
        <p><strong className="font-bold">Aviso:</strong> Esta ferramenta está em fase de testes (beta). Os resultados podem demorar para serem concluídos e a qualidade pode variar. Estamos trabalhando para aprimorá-la!</p>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        <div>
            <label className={`w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploadedImage ? 'border-blue-500' : 'border-gray-600 hover:bg-gray-700'}`}>
                <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-400 text-center">{uploadedImage ? `Base: ${uploadedImage.name}` : 'Clique para enviar a imagem de base'}</span>
                <input type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={handleFileChange} className="hidden" />
            </label>
        </div>

        {uploadedImage && (
            <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4 items-center">
                    <img
                      src={`data:${uploadedImage.mimeType};base64,${uploadedImage.base64}`}
                      alt="Imagem enviada"
                      className="w-full h-auto mx-auto rounded-lg"
                    />
                    <textarea
                        value={anglePrompt}
                        onChange={(e) => setAnglePrompt(e.target.value)}
                        placeholder="Ex: vista aérea, profundidade de campo rasa, ângulo holandês, simular lente tilt-shift"
                        rows={4}
                        className="w-full h-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                    />
                </div>
                
                <button 
                    onClick={handleRerender}
                    disabled={isLoading || !anglePrompt.trim()}
                    className="w-full bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Re-renderizando...' : 'Re-renderizar Perspectiva'}
                </button>
            </div>
        )}

        {error && <p className="text-red-400 text-sm text-center py-1">{error}</p>}
        
        {isLoading && (
            <div className="text-center text-blue-400 text-sm font-semibold animate-pulse mt-4">
                <p>Analisando a geometria da imagem...</p>
                <p>Por favor, aguarde. Este processo pode levar um momento.</p>
            </div>
        )}
      </div>
    </div>
  );
};