import React from 'react';
import type { GenerationConfig, Model, AspectRatio } from '../types';
import { CpuChipIcon } from './icons';

interface AIEnginesPanelProps {
  generationConfig: GenerationConfig;
  onGenerationConfigChange: (newConfig: GenerationConfig) => void;
  isLoading: boolean;
}

const MODELS_INFO: { id: Model; name: string; description: string; disabled?: boolean }[] = [
  {
    id: 'AUTO',
    name: 'Automático (Recomendado)',
    description: 'A IA decide o melhor modelo (texto ou imagem) com base no seu prompt. Ideal para a maioria dos usos no chat.',
  },
  {
    id: 'imagen-4.0-generate-001',
    name: 'Imagen 4.0 (Qualidade Máxima)',
    description: 'O modelo mais poderoso para criação de imagens a partir de texto. Use para obter os melhores resultados fotorrealistas e artísticos. Força a geração de imagem.',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (Chat Rápido)',
    description: 'Um modelo de linguagem rápido e eficiente, ideal para conversas, resumos, e tarefas de texto que não envolvem criação de imagens. Força a geração de texto.',
  },
  {
    id: 'gemini-2.5-flash-grounded',
    name: 'Gemini 2.5 + Google Search',
    description: 'Para perguntas sobre eventos atuais ou informações da web. A IA usará o Google para encontrar respostas atualizadas e fornecerá as fontes.',
  },
  {
    id: 'gemini-2.5-flash-image-preview',
    name: 'Nano Editor (Edição com Perfil)',
    description: 'Modelo especializado em editar imagens usando um Perfil de Consistência. Não gera imagens do zero, apenas modifica com base em um perfil.',
  },
  {
    id: 'veo-2.0-generate-001',
    name: 'Veo 2.0 (Geração de Vídeo)',
    description: 'Gera vídeos curtos a partir de texto. (Integração futura, atualmente desabilitado nesta interface).',
    disabled: true,
  },
];

const FormField: React.FC<{ label: string, description: string, children: React.ReactNode }> = ({ label, description, children }) => (
    <div className="border-t border-gray-700 pt-4">
        <label className="block text-sm font-bold text-gray-200 mb-1">{label}</label>
        <p className="text-xs text-gray-400 mb-2">{description}</p>
        {children}
    </div>
);

export const AIEnginesPanel: React.FC<AIEnginesPanelProps> = ({ generationConfig, onGenerationConfigChange, isLoading }) => {
  const handleConfigChange = (key: keyof GenerationConfig, value: number | string) => {
    onGenerationConfigChange({ ...generationConfig, [key]: value as any });
  };
  
  const selectedModelInfo = MODELS_INFO.find(m => m.id === generationConfig.model);

  return (
    <div className="p-4 bg-gray-800 flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4 text-white flex items-center">
        <CpuChipIcon className="w-6 h-6 mr-2 text-blue-400" />
        Motores de IA e Configurações
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Controle as configurações padrão para a geração de imagens via chat. Estas opções não se aplicam ao usar um Perfil de Consistência.
      </p>

      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <h3 className="font-bold text-base text-white mb-2">Modelos Google</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-200 mb-1">Modelo de Geração</label>
                    <select
                        value={generationConfig.model}
                        onChange={(e) => handleConfigChange('model', e.target.value as Model)}
                        disabled={isLoading}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-blue-500 focus:outline-none"
                    >
                        {MODELS_INFO.map(model => (
                            <option key={model.id} value={model.id} disabled={model.disabled}>
                                {model.name}
                            </option>
                        ))}
                    </select>
                    {selectedModelInfo && (
                         <p className="text-xs text-gray-400 mt-2 p-2 bg-gray-800 rounded-md">{selectedModelInfo.description}</p>
                    )}
                </div>

                <FormField label="Número de Imagens" description="Quantas imagens gerar por prompt no chat.">
                     <select
                        value={generationConfig.numberOfImages}
                        onChange={(e) => handleConfigChange('numberOfImages', parseInt(e.target.value))}
                        disabled={isLoading}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-blue-500 focus:outline-none"
                    >
                        {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </FormField>
                
                <FormField label="Proporção da Imagem" description="Defina o formato padrão das imagens geradas.">
                     <select
                        value={generationConfig.aspectRatio}
                        onChange={(e) => handleConfigChange('aspectRatio', e.target.value as AspectRatio)}
                        disabled={isLoading}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="1:1">Quadrado (1:1)</option>
                        <option value="16:9">Paisagem (16:9)</option>
                        <option value="9:16">Retrato (9:16)</option>
                        <option value="4:3">Paisagem (4:3)</option>
                        <option value="3:4">Retrato (3:4)</option>
                    </select>
                </FormField>
            </div>
        </div>
      </div>
    </div>
  );
};