import React, { useState } from 'react';
import { SparklesIcon } from './icons';

interface QuotaExceededModalProps {
  onApiKeySubmit: (key: string) => Promise<boolean>;
}

export const QuotaExceededModal: React.FC<QuotaExceededModalProps> = ({ onApiKeySubmit }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!key.trim()) {
        setError("A chave de API não pode estar vazia.");
        return;
    }
    setIsSubmitting(true);
    const success = await onApiKeySubmit(key.trim());
    if (!success) {
        setError("A nova chave de API fornecida parece ser inválida. Por favor, verifique e tente novamente.");
    }
    // On success, the component will be unmounted by the parent.
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-lg w-full border border-yellow-500">
        <div className="flex items-center mb-4">
          <SparklesIcon className="w-8 h-8 text-yellow-400 mr-3" />
          <h1 className="text-2xl font-bold text-white">Limite de Cota Atingido</h1>
        </div>
        <p className="text-gray-400 mb-6">
          A chave de API que você está usando atingiu o limite de uso. Para continuar usando o aplicativo, por favor, insira uma nova chave de API.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-300 mb-2">
              Nova Chave de API do Google
            </label>
            <input
              id="api-key-input"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Cole sua nova chave de API aqui"
              className={`w-full bg-gray-700 border rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:outline-none ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
              required
            />
             {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-wait"
          >
            {isSubmitting ? 'Verificando...' : 'Atualizar Chave e Continuar'}
          </button>
        </form>
        <div className="text-center mt-6">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            Obtenha uma nova chave aqui &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};
