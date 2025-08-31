
import React, { useState, useCallback, useEffect } from 'react';
import type { ConsistencyProfile, UploadedImage, ChatMessage, GenerationConfig, Model, ConsistencyMode, AdditionalStyle, AdvancedEditRequest, PhotorealisticRequest, ActiveTab, ImageLabRequest, ExpandImageRequest } from './types';
import { ConsistencyProfileManager } from './components/ConsistencyProfileManager';
import { ImageAnalyzer } from './components/ImageAnalyzer';
import { ChatPanel } from './components/ChatPanel';
import { AdvancedEditor } from './components/AdvancedEditor';
import { PhotographicStudio } from './components/PhotographicStudio';
import { PhotographyStudy } from './components/PhotographyStudy';
import { UserManual } from './components/UserManual';
import { TipsCarousel } from './components/TipsCarousel';
import { AIEnginesPanel } from './components/AIEnginesPanel';
import { DownloadModal } from './components/DownloadModal';
import { ImageViewerModal } from './components/ImageViewerModal';
import { CreateProfileFromImageModal } from './components/CreateProfileFromImageModal';
import { ImageLab } from './components/ImageLab';
import { ImageExpander } from './components/ImageExpander';
import { VolumetricsEditor } from './components/VolumetricsEditor';
import { SplashScreen } from './components/SplashScreen';
import { Logo } from './components/Logo';
import { 
  generateImageFromText, 
  editImageWithConsistency, 
  editImageWithProfessionalConsistency, 
  editImageWithAmateurConsistency, 
  generateText, 
  advancedImageEdit, 
  photorealisticGeneration, 
  generateImageWithMultipleProfiles, 
  editImageWithPhotographicReality, 
  generatePhotoshootVariationPrompt, 
  QuotaExceededError,
  InvalidApiKeyError,
  generateTextWithGoogleSearch,
  analyzeImageStyle,
  rerenderFromAngle,
  expandImage,
  generateImageLabComposition,
} from './services/geminiService';
import { SparklesIcon, CameraIcon, EditIcon, StudioIcon, BookOpenIcon, QuestionMarkCircleIcon, CpuChipIcon, LabIcon, ArrowsPointingOutIcon, CubeIcon, DevicePhoneMobileIcon, ComputerDesktopIcon } from './components/icons';

const initialMessage: ChatMessage = {
  id: 'init',
  role: 'model',
  text: `Bem-vindo ao iLumium Studio!

**GRANDES NOVIDADES:**
- **Laboratório de Imagens:** Misture e combine imagens e prompts na nova aba 'Lab' para criar composições complexas.
- **Expansão de Imagem (Outpainting):** Use a nova aba 'Expandir' para aumentar o canvas de suas imagens e deixar a IA preencher o resto.
- **Simulação de Filme:** O Estúdio Fotográfico agora simula filmes clássicos (Kodak, Fuji) e defeitos realistas (lens flare, grão, etc).
- **Fluxo de Edição Integrado:** Envie qualquer imagem gerada diretamente para a 'Edição Avançada' ou 'Estúdio Fotográfico' com um clique.

Para um guia completo, explore a aba **'Manual'**.`,
  status: 'done'
};

const App: React.FC = () => {
  const [profiles, setProfiles] = useState<ConsistencyProfile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');
  const [chatInput, setChatInput] = useState('');
  const [reusedImage, setReusedImage] = useState<UploadedImage | null>(null);
  const [isShowingSplash, setIsShowingSplash] = useState(true);
  
  const [viewMode, setViewMode] = useState<'pc' | 'mobile'>(() => {
    try {
        const savedMode = localStorage.getItem('viewMode');
        if (savedMode === 'pc' || savedMode === 'mobile') {
            return savedMode;
        }
    } catch (e) {
        // Ignore localStorage errors (e.g., in private browsing)
    }
    // Auto-detect if no valid mode is saved
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobileDevice ? 'mobile' : 'pc';
  });

  // State for new modals
  const [downloadRequest, setDownloadRequest] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [profileCreationRequest, setProfileCreationRequest] = useState<UploadedImage | null>(null);

  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>({
    numberOfImages: 1,
    aspectRatio: '1:1',
    model: 'AUTO',
    outputMimeType: 'image/jpeg',
  });
  
  // Splash screen effect
  useEffect(() => {
    // Total animation time is ~4.4s.
    // Display splash for 4.5s to ensure all animations complete.
    const timer = setTimeout(() => {
      setIsShowingSplash(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('mobile-mode', viewMode === 'mobile');
    try {
        localStorage.setItem('viewMode', viewMode);
    } catch (e) {
        // Ignore localStorage errors
    }
  }, [viewMode]);

  const handleProfileCreate = (name: string, images: UploadedImage[], mode: ConsistencyMode, style: AdditionalStyle, amateurLevel?: number, photographicRealityStyle?: 'professional' | 'amateur', photoshootShots?: number) => {
    const newProfile: ConsistencyProfile = { id: `profile-${Date.now()}`, name, images, consistencyMode: mode, additionalStyle: style, amateurLevel: (mode === 'amateur' || (mode === 'photographic_reality' && photographicRealityStyle === 'amateur')) ? amateurLevel : undefined, photographicRealityStyle: mode === 'photographic_reality' ? (photographicRealityStyle || 'professional') : undefined, photoshootShots: mode === 'photographic_reality' ? photoshootShots : undefined };
    setProfiles(prev => [...prev, newProfile]);
  };

  const handleProfileDelete = (id: string) => { 
    setProfiles(prev => prev.filter(p => p.id !== id)); 
  };

  const handleProfileUpdate = (id: string, updates: Partial<ConsistencyProfile>) => { setProfiles(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p))); };

  const addMessagePair = (userMessage: Omit<ChatMessage, 'id' | 'role' | 'status'>, loadingText: string = '') => {
    const finalUserMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', ...userMessage, status: 'done' };
    const modelMessageId = `model-${Date.now()}`;
    const loadingModelMessage: ChatMessage = { id: modelMessageId, role: 'model', text: loadingText, status: 'loading', images: [] };
    setMessages(prev => [...prev, finalUserMessage, loadingModelMessage]);
    return modelMessageId;
  };
  
  const updateModelMessage = (id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates, status: updates.status || 'done' } : m));
  };
  
  const handleGenerationError = (id: string, error: unknown) => {
    console.error(error);
    updateModelMessage(id, { text: (error as Error).message || 'Ocorreu um erro inesperado.', status: 'error' });
  };

  const handlePhotorealisticGeneration = async (request: PhotorealisticRequest) => {
    setIsLoading(true);
    const profileName = request.profileId ? profiles.find(p => p.id === request.profileId)?.name : null;
    let userText = `**Estúdio Fotográfico**\n**Ação:** ${request.prompt}`;
    if (profileName) userText += `\n**Perfil:** ${profileName} (${request.useProfileForConsistency === false ? 'Referência' : 'Consistência'})`;
    if (request.baseImages && request.baseImages.length > 0) userText += `\n**Imagens Base:** ${request.baseImages.length} (${request.baseImageMode})`;
    if (request.autoEquip) userText += `\n**Equipamento:** Automático`;
    const modelMessageId = addMessagePair({ text: userText, images: request.baseImages?.map(img => `data:${img.mimeType};base64,${img.base64}`) }, "Gerando no Estúdio...");
    
    try {
        const images = await photorealisticGeneration(request, profileName);
        updateModelMessage(modelMessageId, { text: images.length > 0 ? `Resultado do Estúdio para "${request.prompt}"` : 'Não consegui gerar/editar a imagem.', images });
    } catch (error) {
        handleGenerationError(modelMessageId, error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleAdvancedEdit = async (request: AdvancedEditRequest) => {
    setIsLoading(true);
    const profileName = request.profileId ? profiles.find(p => p.id === request.profileId)?.name : null;
    let userText = `**Edição Avançada**\n**Ação:** ${request.action}`;
    if (profileName) userText += `\n**Perfil:** ${profileName}`;
    const modelMessageId = addMessagePair({ text: userText, images: [`data:${request.baseImage.mimeType};base64,${request.baseImage.base64}`] }, "Editando imagem...");
    
    try {
        const response = await advancedImageEdit(request, profiles);
        updateModelMessage(modelMessageId, { ...response });
    } catch (error) {
        handleGenerationError(modelMessageId, error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleImageLabGenerate = async (request: ImageLabRequest) => {
    setIsLoading(true);
    const modelMessageId = addMessagePair({ text: "**Laboratório de Imagens**\nIniciando a composição..." }, "Misturando elementos...");
    try {
      const response = await generateImageLabComposition(request);
      updateModelMessage(modelMessageId, { ...response });
    } catch (error) {
      handleGenerationError(modelMessageId, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageExpand = async (request: ExpandImageRequest) => {
    setIsLoading(true);
    const modelMessageId = addMessagePair({ text: `**Expandir Imagem**\nExpandindo para ${request.aspectRatio}...`, images: [`data:${request.image.mimeType};base64,${request.image.base64}`] }, "Expandindo e preenchendo a imagem...");
    try {
      const response = await expandImage(request);
      updateModelMessage(modelMessageId, { ...response });
    } catch (error) {
      handleGenerationError(modelMessageId, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRerenderFromAngle = async (image: UploadedImage, anglePrompt: string) => {
    setIsLoading(true);
    const modelMessageId = addMessagePair({ text: `**Volumetria**\nRenderizando de um novo ângulo: ${anglePrompt}`, images: [`data:${image.mimeType};base64,${image.base64}`] }, "Re-renderizando perspectiva...");
    try {
      const response = await rerenderFromAngle(image, anglePrompt);
      updateModelMessage(modelMessageId, { ...response });
    } catch (error) {
      handleGenerationError(modelMessageId, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeImageStyle = async (image: UploadedImage): Promise<string> => {
    // This is called by a component, so it returns the result directly
    // It doesn't manage chat messages, but it needs to handle errors
    try {
      return await analyzeImageStyle(image);
    } catch (error) {
      // Re-throw to be caught by the component
      throw error;
    }
  };
  
  const handleImageAction = useCallback((action: 'download' | 'edit' | 'studio' | 'view' | 'create_profile', image: string) => {
    const toUploadedImage = (b64: string): UploadedImage | null => {
      try {
        const [header, data] = b64.split(',');
        if (!header || !data) throw new Error('Invalid base64 string');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
        return { base64: data, mimeType, name: `reused_image_${Date.now()}.${mimeType.split('/')[1]}` };
      } catch (e) {
        console.error("Failed to parse base64 image:", e);
        const errorMsg: ChatMessage = { id: `err-${Date.now()}`, role: 'model', text: 'Erro ao processar a imagem.', status: 'error' };
        setMessages(prev => [...prev, errorMsg]);
        return null;
      }
    };

    const uploadedImage = toUploadedImage(image);
    if (!uploadedImage) return;

    switch (action) {
      case 'download':
        setDownloadRequest(image);
        break;
      case 'view':
        setViewingImage(image);
        break;
      case 'edit':
        setReusedImage(uploadedImage);
        setActiveTab('advanced');
        break;
      case 'studio':
        setReusedImage(uploadedImage);
        setActiveTab('studio');
        break;
      case 'create_profile':
        setProfileCreationRequest(uploadedImage);
        break;
    }
  }, []);
  

  const handleSendMessage = useCallback(async (prompt: string) => {
    setIsLoading(true);
    const modelMessageId = addMessagePair({ text: prompt });
    try {
      const matchedProfiles = profiles.filter(p => prompt.includes(p.name));
      if (matchedProfiles.length > 0) {
          const matchedProfile = matchedProfiles[0];
          if (matchedProfile.consistencyMode === 'photographic_reality') {
            const numberOfShots = matchedProfile.photoshootShots ?? 4;
            updateModelMessage(modelMessageId, { text: `Iniciando ensaio de ${numberOfShots} fotos...`, status: 'loading' });
            const finalImages: string[] = [];
            let previousShot: UploadedImage | undefined = undefined;
            for (let i = 0; i < numberOfShots; i++) {
                const currentPrompt = i === 0 ? `Para esta foto, ${prompt}. Capture um retrato em plano médio.` : await generatePhotoshootVariationPrompt(previousShot!, prompt);
                updateModelMessage(modelMessageId, { text: `Gerando foto ${i + 1}/${numberOfShots}: ${currentPrompt}`, status: 'loading' });
                if (i > 0) await new Promise(resolve => setTimeout(resolve, 3000));
                const response = await editImageWithPhotographicReality(currentPrompt, matchedProfile, previousShot);
                if (response.images?.length > 0) {
                    const newImageB64 = response.images[0];
                    finalImages.push(newImageB64);
                    const [header, data] = newImageB64.split(',');
                    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
                    previousShot = { base64: data, mimeType, name: `shot_${i+1}.jpg` };
                    updateModelMessage(modelMessageId, { images: [...finalImages], status: 'loading' });
                } else throw new Error(`Falha ao gerar a foto ${i + 1}.`);
            }
            updateModelMessage(modelMessageId, { text: `Ensaio para "${prompt}" concluído.` });
          } else if (matchedProfiles.length === 1) {
            const response = await { 'professional': editImageWithProfessionalConsistency, 'amateur': editImageWithAmateurConsistency, 'normal': editImageWithConsistency, 'photographic_reality': editImageWithConsistency }[matchedProfile.consistencyMode](prompt, matchedProfile);
            updateModelMessage(modelMessageId, { ...response });
          } else {
            const response = await generateImageWithMultipleProfiles(prompt, matchedProfiles);
            updateModelMessage(modelMessageId, { ...response });
          }
      } else {
        const effectiveModel = generationConfig.model === 'AUTO' ? (/gere|crie|desenhe|imagem de/i.test(prompt) ? 'imagen-4.0-generate-001' : 'gemini-2.5-flash') : generationConfig.model;
        if (effectiveModel === 'imagen-4.0-generate-001') {
            const images = await generateImageFromText(prompt, generationConfig);
            updateModelMessage(modelMessageId, { text: images.length > 0 ? `Imagens para "${prompt}"` : 'Não consegui gerar imagem.', images });
        } else if (effectiveModel === 'gemini-2.5-flash-image-preview') {
            updateModelMessage(modelMessageId, { text: 'Para editar, use um Perfil de Consistência ou a aba "Edição Avançada".' });
        } else if (effectiveModel === 'gemini-2.5-flash-grounded') {
            const { text, sources } = await generateTextWithGoogleSearch(prompt);
            let fullText = text;
            if (sources.length > 0) {
                fullText += "\n\n**Fontes:**\n";
                fullText += sources.map((source, index) => 
                    `${index + 1}. <a href="${source.uri}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${source.title || source.uri}</a>`
                ).join('\n');
            }
            updateModelMessage(modelMessageId, { text: fullText });
        } else {
            const text = await generateText(prompt);
            updateModelMessage(modelMessageId, { text });
        }
      }
    } catch (error) {
        handleGenerationError(modelMessageId, error);
    } finally {
        setIsLoading(false);
    }
  }, [profiles, generationConfig, messages]);
  
  const TABS_CONFIG: {id: ActiveTab, icon: React.FC<{className?: string}>, label: string}[] = [
      { id: 'studio', icon: StudioIcon, label: 'Estúdio' },
      { id: 'lab', icon: LabIcon, label: 'Lab' },
      { id: 'advanced', icon: EditIcon, label: 'Edição' },
      { id: 'expand', icon: ArrowsPointingOutIcon, label: 'Expandir' },
      { id: 'volumetrics', icon: CubeIcon, label: 'Volumetria' },
      { id: 'profiles', icon: SparklesIcon, label: 'Perfis' },
      { id: 'analyzer', icon: CameraIcon, label: 'Analisador' },
      { id: 'motores', icon: CpuChipIcon, label: 'Motores' },
      { id: 'study', icon: BookOpenIcon, label: 'Estudo' },
      { id: 'manual', icon: QuestionMarkCircleIcon, label: 'Manual' },
  ];
  
  const renderToolPanelContent = (tab: ActiveTab) => {
    switch (tab) {
        case 'studio': return <PhotographicStudio profiles={profiles} onGenerate={handlePhotorealisticGeneration} isLoading={isLoading} reusedImage={reusedImage} onReusedImageConsumed={() => setReusedImage(null)} />;
        case 'profiles': return <ConsistencyProfileManager profiles={profiles} onProfileCreate={handleProfileCreate} onProfileDelete={handleProfileDelete} onProfileUpdate={handleProfileUpdate} />;
        case 'advanced': return <AdvancedEditor profiles={profiles} onAdvancedEdit={handleAdvancedEdit} isLoading={isLoading} reusedImage={reusedImage} onReusedImageConsumed={() => setReusedImage(null)} />;
        case 'analyzer': return <ImageAnalyzer onAnalyze={handleAnalyzeImageStyle} onUseInChat={setChatInput} />;
        case 'study': return <PhotographyStudy />;
        case 'manual': return <UserManual />;
        case 'motores': return <AIEnginesPanel generationConfig={generationConfig} onGenerationConfigChange={setGenerationConfig} isLoading={isLoading} />;
        case 'lab': return <ImageLab onGenerate={handleImageLabGenerate} isLoading={isLoading} />;
        case 'expand': return <ImageExpander onExpand={handleImageExpand} isLoading={isLoading} />;
        case 'volumetrics': return <VolumetricsEditor onRerender={handleRerenderFromAngle} isLoading={isLoading} reusedImage={reusedImage} onReusedImageConsumed={() => setReusedImage(null)} />;
        default: return null;
    }
  };

  if (isShowingSplash) {
    return <SplashScreen />;
  }

  return (
    <div className={`h-screen w-screen bg-gray-900 flex flex-col font-sans overflow-hidden ${viewMode === 'mobile' ? 'mobile-view' : ''}`}>
      {downloadRequest && <DownloadModal imageUrl={downloadRequest} onClose={() => setDownloadRequest(null)} />}
      {viewingImage && <ImageViewerModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />}
      {profileCreationRequest && 
        <CreateProfileFromImageModal 
            image={profileCreationRequest} 
            onClose={() => setProfileCreationRequest(null)} 
            onCreate={(name) => {
              handleProfileCreate(name, [profileCreationRequest], 'normal', 'none');
              setProfileCreationRequest(null);
              const successMessage: ChatMessage = {
                id: `sys-${Date.now()}`,
                role: 'model',
                text: `Perfil '${name}' criado com sucesso! Você já pode usá-lo em seus prompts.`,
                status: 'done'
              };
              setMessages(prev => [...prev, successMessage]);
            }} 
            existingProfileNames={profiles.map(p => p.name)}
        />
      }


      <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-gray-700 bg-gray-900 z-10">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block text-right">
                <p className="text-xs text-yellow-400 font-semibold">Projeto Base em Desenvolvimento</p>
                <p className="text-[10px] text-gray-500 -mt-1">Versão Coringa em breve</p>
            </div>
            <button
                onClick={() => setViewMode(prev => (prev === 'pc' ? 'mobile' : 'pc'))}
                className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                title={viewMode === 'pc' ? 'Visualização Mobile' : 'Visualização Desktop'}
            >
                {viewMode === 'pc' ? <DevicePhoneMobileIcon className="w-6 h-6" /> : <ComputerDesktopIcon className="w-6 h-6" />}
            </button>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col sm:flex-row overflow-hidden">
        <aside className="w-full sm:w-1/3 sm:min-w-[400px] sm:max-w-[500px] bg-gray-800 flex flex-col border-r border-gray-700">
            <div className="p-2 border-b border-gray-700">
                <div className="grid grid-cols-5 gap-1">
                    {TABS_CONFIG.map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex flex-col items-center p-2 rounded-md transition-colors duration-200 ${activeTab === id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                            title={label}
                        >
                            <Icon className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-semibold text-center">{label}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                {renderToolPanelContent(activeTab)}
            </div>
        </aside>
        <section className="flex-grow h-full">
            <ChatPanel messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} input={chatInput} setInput={setChatInput} onImageAction={handleImageAction} />
        </section>
    </main>
      
      {viewMode === 'pc' && <TipsCarousel />}
    </div>
  );
};

export default App;