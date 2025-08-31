import React, { useState, useCallback, useEffect } from 'react';
import type { AdvancedEditRequest, ConsistencyProfile, UploadedImage } from '../types';
import { UploadIcon, EditIcon, SparklesIcon } from './icons';

interface AdvancedEditorProps {
    profiles: ConsistencyProfile[];
    onAdvancedEdit: (request: AdvancedEditRequest) => void;
    isLoading: boolean;
    reusedImage: UploadedImage | null;
    onReusedImageConsumed: () => void;
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

const FormField: React.FC<{ label: string, description: string, children: React.ReactNode }> = ({ label, description, children }) => (
    <div>
        <label className="block text-sm font-bold text-gray-200 mb-1">{label}</label>
        <p className="text-xs text-gray-400 mb-2">{description}</p>
        {children}
    </div>
);

export const AdvancedEditor: React.FC<AdvancedEditorProps> = ({ profiles, onAdvancedEdit, isLoading, reusedImage, onReusedImageConsumed }) => {
    const [baseImage, setBaseImage] = useState<UploadedImage | null>(null);
    const [profileId, setProfileId] = useState<string>('');
    const [subject, setSubject] = useState('');
    const [action, setAction] = useState('');
    const [style, setStyle] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (reusedImage) {
            setBaseImage(reusedImage);
            onReusedImageConsumed(); // Inform parent that the image has been consumed
        }
    }, [reusedImage, onReusedImageConsumed]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!baseImage) {
            setError('Por favor, envie uma imagem de base para editar.');
            return;
        }
        if (!action.trim()) {
            setError('O campo "Ação" é obrigatório.');
            return;
        }
        setError(null);
        onAdvancedEdit({
            baseImage,
            profileId: profileId || undefined,
            subject,
            action,
            style,
            negativePrompt
        });
    };

    return (
        <div className="p-4 bg-gray-800 flex flex-col h-full">
            <h2 className="text-lg font-bold mb-4 text-white flex items-center"><EditIcon className="w-6 h-6 mr-2 text-blue-400" /> Edição Avançada</h2>
            <p className="text-sm text-gray-400 mb-4">
                Use este formulário para um controle detalhado sobre a edição da imagem. Envie uma imagem de base, descreva as mudanças e gere.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 flex-grow overflow-y-auto pr-2">
                <div>
                    <label className={`w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${baseImage ? 'border-blue-500' : 'border-gray-600 hover:bg-gray-700'}`}>
                        <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-400 text-center">{baseImage ? `Base: ${baseImage.name}` : 'Clique para enviar a imagem de base'}</span>
                        <input type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={handleFileChange} className="hidden" />
                    </label>
                    {baseImage && <img src={`data:${baseImage.mimeType};base64,${baseImage.base64}`} alt="Imagem de base" className="mt-2 mx-auto max-h-32 rounded-lg" />}
                </div>
                 <FormField label="Perfil de Consistência (Opcional)" description="Selecione um perfil para manter a identidade do personagem ou objeto durante a edição.">
                    <div className="relative">
                        <SparklesIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                            value={profileId}
                            onChange={(e) => setProfileId(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 pl-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                        >
                            <option value="">Nenhum perfil selecionado</option>
                            {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </FormField>

                <FormField label="Assunto da Edição" description="O que deve ser modificado? Ex: 'a pessoa', 'o carro', 'o céu', 'o fundo'.">
                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: a mulher de vestido vermelho" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </FormField>

                <FormField label="Ação a ser executada" description="Descreva a mudança que você quer fazer. Seja específico. (Obrigatório)">
                    <textarea value={action} onChange={(e) => setAction(e.target.value)} placeholder="Ex: adicionar um chapéu de sol, mudar a cor do vestido para azul, fazer a pessoa sorrir" rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
                </FormField>

                <FormField label="Estilo e Atmosfera" description="Descreva o estilo artístico, iluminação, humor ou qualidade geral da imagem final.">
                    <textarea value={style} onChange={(e) => setStyle(e.target.value)} placeholder="Ex: iluminação cinematográfica, estilo de pintura a óleo, foto vintage dos anos 80" rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
                </FormField>

                <FormField label="Prompt Negativo" description="O que você NÃO quer ver na imagem?">
                    <input type="text" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} placeholder="Ex: feio, deformado, mãos extras, cores opacas" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </FormField>

                {error && <p className="text-red-400 text-sm">{error}</p>}
                
                <div className="pt-2">
                    <button type="submit" disabled={isLoading || !baseImage || !action.trim()} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? 'Gerando...' : 'Gerar Edição'}
                    </button>
                </div>
            </form>
        </div>
    );
};