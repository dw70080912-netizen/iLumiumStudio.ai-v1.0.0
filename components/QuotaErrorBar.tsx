import React, { useState } from 'react';

interface QuotaErrorBarProps {
  onApiKeySubmit: (key: string) => Promise<boolean>;
}

export const QuotaErrorBar: React.FC<QuotaErrorBarProps> = ({ onApiKeySubmit }) => {
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
        setError("A nova chave de API fornecida parece ser inválida. Tente novamente.");
        setKey('');
    }
    // On success, the parent component will hide this bar.
    setIsSubmitting(false);
  };

  return (
    <div className="bg-yellow-900/50 border-b-2 border-yellow-500 text-white p-3 z-20 shrink-0">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="text-center sm:text-left">
            <p className="font-bold text-yellow-300">Limite de Cota da API Atingido</p>
            <p className="text-xs text-yellow-200">Para continuar, por favor, insira uma nova chave.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow sm:max-w-md w-full flex items-center gap-2">
           <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Cole sua nova chave de API aqui"
              className="flex-grow bg-gray-800/50 border border-yellow-400 rounded-md p-2 text-sm text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              required
            />
            <button
                type="submit"
                disabled={isSubmitting}
                className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-md hover:bg-yellow-400 transition-colors disabled:bg-gray-500 disabled:cursor-wait"
            >
                {isSubmitting ? '...' : 'Salvar'}
            </button>
        </form>
         <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-yellow-200 hover:text-white underline whitespace-nowrap"
          >
            Obter nova chave &rarr;
          </a>
      </div>
      {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}
    </div>
  );
};
