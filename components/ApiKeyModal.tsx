import React, { useState } from 'react';
import { SparklesIcon } from './icons';
import { validateApiKey } from '../services/geminiService';

interface ApiKeyModalProps {
  onApiKeySubmit: (key: string) => void;
  initialError?: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onApiKeySubmit, initialError }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(initialError || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedKey = key.trim();

    if (!trimmedKey) {
        setError("A chave de API não pode estar vazia.");
        return;
    }

    const apiKeyRegex = /^[A-Za-z0-9_-]{30,}$/;
    if (!apiKeyRegex.test(trimmedKey)) {
        setError("O formato da chave de API parece inválido. Verifique se copiou a chave completa.");
        return;
    }

    setIsLoading(true);
    try {
        const isValid = await validateApiKey(trimmedKey);
        if (isValid) {
            onApiKeySubmit(trimmedKey);
        } else {
            setError("A chave de API é inválida ou não tem permissão. Verifique sua chave no Google AI Studio e tente novamente.");
        }
    } catch (e) {
        setError("Ocorreu um erro ao validar a chave. Verifique sua conexão com a internet.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-lg w-full border border-gray-700">
        <div className="flex items-center mb-4">
          <SparklesIcon className="w-8 h-8 text-blue-400 mr-3" />
          <h1 className="text-2xl font-bold text-white">Bem-vindo ao iLumium Studio</h1>
        </div>
        <p className="text-gray-400 mb-6">
          Para usar esta aplicação, por favor, forneça sua chave de API pessoal do Google Gemini. A sua chave é armazenada localmente no seu navegador e nunca é enviada para os nossos servidores.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-300 mb-2">
              Sua Chave de API do Google
            </label>
            <input
              id="api-key-input"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Cole sua chave de API aqui"
              className={`w-full bg-gray-700 border rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:outline-none ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
              required
            />
             {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-wait"
          >
            {isLoading ? 'Validando...' : 'Salvar e Continuar'}
          </button>
        </form>
        <div className="text-center mt-6">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            Não tem uma chave? Obtenha uma aqui (abre em nova aba) &rarr;
          </a>
        </div>
        <div className="text-center mt-4 border-t border-gray-700 pt-4">
          <p className="text-xs text-gray-500">Creditos e desenvolvimento: @dawi.araujo</p>
        </div>
      </div>
    </div>
  );
};