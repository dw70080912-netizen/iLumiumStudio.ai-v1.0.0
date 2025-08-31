import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { UserIcon, BotIcon, SendIcon, ArrowDownTrayIcon, EditIcon, StudioIcon, ArrowsPointingOutIcon, SparklesIcon } from './icons';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  onImageAction: (action: 'download' | 'edit' | 'studio' | 'view' | 'create_profile', image: string) => void;
}

const LoadingIndicator = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
    </div>
);

const Message = ({ message, onImageAction }: { message: ChatMessage; onImageAction: (action: 'download' | 'edit' | 'studio' | 'view' | 'create_profile', image: string) => void; }) => {
    const isUser = message.role === 'user';
    const Icon = isUser ? UserIcon : BotIcon;

    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center"><Icon className="w-5 h-5 text-gray-400" /></div>}
            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-2xl p-3 rounded-lg ${isUser ? 'bg-gray-700 text-white' : 'bg-gray-700 text-gray-200'}`}>
                    <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br />') }} />
                    {message.status === 'loading' && <div className="mt-2"><LoadingIndicator /></div>}
                    {message.status === 'error' && <p className="mt-2 text-sm text-red-400">Ocorreu um erro. Por favor, tente novamente.</p>}
                </div>
                {message.images && message.images.length > 0 && (
                     <div className={`mt-2 grid gap-2 max-w-xl ${message.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {message.images.map((img, index) => (
                            <div key={index} className="relative group overflow-hidden rounded-md">
                                <img src={img} alt={`conteúdo gerado ${index + 1}`} className="rounded-md" />
                                {!isUser && (
                                     <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 sm:gap-2">
                                        <button 
                                            onClick={() => onImageAction('view', img)} 
                                            title="Ver em Tela Cheia"
                                            className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                                        >
                                            <ArrowsPointingOutIcon className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => onImageAction('download', img)} 
                                            title="Download"
                                            className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                                        >
                                            <ArrowDownTrayIcon className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => onImageAction('create_profile', img)} 
                                            title="Criar Perfil de Consistência"
                                            className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                                        >
                                            <SparklesIcon className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => onImageAction('edit', img)} 
                                            title="Edição Rápida"
                                            className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                                        >
                                            <EditIcon className="w-5 h-5" />
                                        </button>
                                         <button 
                                            onClick={() => onImageAction('studio', img)} 
                                            title="Abrir no Estúdio"
                                            className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                                        >
                                            <StudioIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {isUser && <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"><Icon className="w-5 h-5 text-white" /></div>}
        </div>
    );
};

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading, input, setInput, onImageAction }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {messages.map(msg => (
          <Message key={msg.id} message={msg} onImageAction={onImageAction} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <form onSubmit={handleSend} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Digite seu prompt... ex: 'Um gato astronauta' ou 'coloque meu_cachorro em uma prancha de surf'"
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 pr-12 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 text-white disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
         <div className="flex items-center justify-end mt-2 text-xs text-gray-400">
            <p>As configurações de geração (modelo, proporção, etc.) estão na aba 'Motores de IA'.</p>
        </div>
      </div>
    </div>
  );
};