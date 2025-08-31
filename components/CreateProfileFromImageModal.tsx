import React, { useState, useEffect } from 'react';
import type { UploadedImage } from '../types';
import { XMarkIcon, SparklesIcon } from './icons';

interface CreateProfileFromImageModalProps {
  image: UploadedImage;
  onClose: () => void;
  onCreate: (name: string) => void;
  existingProfileNames: string[];
}

export const CreateProfileFromImageModal: React.FC<CreateProfileFromImageModalProps> = ({ image, onClose, onCreate, existingProfileNames }) => {
  const [profileName, setProfileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = profileName.trim();

    if (!trimmedName) {
      setError('O nome do perfil é obrigatório.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedName)) {
      setError('O nome pode conter apenas letras, números e underscores (_).');
      return;
    }
    if (existingProfileNames.includes(trimmedName)) {
        setError(`O nome de perfil '${trimmedName}' já existe. Por favor, escolha outro.`);
        return;
    }

    setError(null);
    onCreate(trimmedName);
  };
  
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
                <SparklesIcon className="w-6 h-6 text-blue-400" />
                Criar Perfil de Consistência
            </h2>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-600">
                <XMarkIcon className="w-5 h-5" />
            </button>
        </div>
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <p className="text-sm text-gray-400">
                    Crie um "token visual" a partir desta imagem para manter a consistência em futuras gerações.
                </p>
                <img src={`data:${image.mimeType};base64,${image.base64}`} alt="Imagem para perfil" className="w-full max-h-64 object-contain rounded-md" />
                
                <div>
                    <label htmlFor="profile-name-input" className="block text-sm font-medium text-gray-300 mb-2">
                        Nome do Perfil (Token)
                    </label>
                    <input
                        id="profile-name-input"
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Ex: meu_heroi, logotipo_da_empresa"
                        className={`w-full bg-gray-700 border rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:outline-none ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
                        required
                        autoFocus
                    />
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>
            </div>

            <div className="p-4 bg-gray-900/50 border-t border-gray-700 rounded-b-lg">
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                    Salvar Perfil
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};