import React, { useState, useCallback, useRef } from 'react';
import type { ConsistencyProfile, UploadedImage, ConsistencyMode, AdditionalStyle } from '../types';
import { UploadIcon, SparklesIcon, TrashIcon, SettingsIcon } from './icons';

interface ConsistencyProfileManagerProps {
  profiles: ConsistencyProfile[];
  onProfileCreate: (name: string, images: UploadedImage[], mode: ConsistencyMode, style: AdditionalStyle, amateurLevel?: number, photographicRealityStyle?: 'professional' | 'amateur', photoshootShots?: number) => void;
  onProfileDelete: (id: string) => void;
  onProfileUpdate: (id: string, updates: Partial<ConsistencyProfile>) => void;
}

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

const ModeSelector: React.FC<{
    mode: ConsistencyMode,
    label: string,
    value: ConsistencyMode,
    onChange: (mode: ConsistencyMode) => void,
    className: string,
    disabled?: boolean,
    name: string,
    }> = ({ mode, label, value, onChange, className, disabled = false, name }) => (
    <label className={`flex-1 py-2 px-1 border rounded text-center text-xs sm:text-sm font-semibold transition-colors duration-200 ${mode === value ? className : 'bg-gray-600 border-gray-500 hover:border-blue-500'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <input type="radio" name={name} value={value} checked={mode === value} onChange={() => !disabled && onChange(value)} className="hidden" disabled={disabled} />
      {label}
    </label>
);

const StyleSelector: React.FC<{ 
    value: AdditionalStyle; 
    onChange: (style: AdditionalStyle) => void; 
}> = ({ value, onChange }) => (
    <div>
        <label htmlFor="style-select" className="block text-sm font-medium text-gray-300 mb-1">Estilo Adicional:</label>
        <select
            id="style-select"
            value={value}
            onChange={(e) => onChange(e.target.value as AdditionalStyle)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
        >
            <option value="none">Nenhum</option>
            <option value="ghibli">Ghibli</option>
            <option value="anime">Anime</option>
            <option value="3d_render">Render 3D</option>
            <option value="oil_painting">Pintura a Óleo</option>
            <option value="pencil_drawing">Desenho a Lápis</option>
            <option value="cinematic">Cinematográfico</option>
            <option value="watercolor">Aquarela</option>
            <option value="sketch">Esboço</option>
            <option value="concept_art">Arte Conceitual</option>
            <option value="vaporwave">Vaporwave</option>
        </select>
    </div>
);


export const ConsistencyProfileManager: React.FC<ConsistencyProfileManagerProps> = ({
  profiles,
  onProfileCreate,
  onProfileDelete,
  onProfileUpdate
}) => {
  const [stagedImages, setStagedImages] = useState<UploadedImage[]>([]);
  const [profileName, setProfileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consistencyMode, setConsistencyMode] = useState<ConsistencyMode>('normal');
  const [additionalStyle, setAdditionalStyle] = useState<AdditionalStyle>('none');
  const [amateurLevel, setAmateurLevel] = useState<number>(3);
  const [photographicRealityStyle, setPhotographicRealityStyle] = useState<'professional' | 'amateur'>('professional');
  const [photoshootShots, setPhotoshootShots] = useState<number>(4);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  
  const createFileInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setError(null);
      const files = Array.from(event.target.files);
      if (files.length === 0) return;

      const validFiles = files.filter(file => ACCEPTED_IMAGE_TYPES.includes(file.type));
      
      if (validFiles.length !== files.length) {
        setError('Apenas arquivos JPG, PNG e WEBP são permitidos.');
      }
      
      if (validFiles.length === 0) return;
      
      const imagePromises = validFiles.map(fileToBase64);
      try {
        const uploadedImages = await Promise.all(imagePromises);
        setStagedImages(prev => [...prev, ...uploadedImages]);
      } catch (err) {
        setError('Erro ao ler os arquivos. Por favor, tente novamente.');
        console.error(err);
      }
    }
  }, []);

  const handleAddImages = async (profileId: string, files: FileList | null) => {
    if (files) {
      const validFiles = Array.from(files).filter(file => ACCEPTED_IMAGE_TYPES.includes(file.type));
      if (validFiles.length === 0) return;
      
      const imagePromises = validFiles.map(fileToBase64);
      try {
        const newImages = await Promise.all(imagePromises);
        const targetProfile = profiles.find(p => p.id === profileId);
        if (targetProfile) {
            onProfileUpdate(profileId, { images: [...targetProfile.images, ...newImages] });
            if (addFileInputRef.current) {
                addFileInputRef.current.value = '';
            }
        }
      } catch (err) {
        setError('Erro ao processar as novas imagens.');
        console.error(err);
      }
    }
  };

  const resetCreationForm = () => {
    setProfileName('');
    setStagedImages([]);
    setIsCreating(false);
    setError(null);
    setConsistencyMode('normal');
    setAdditionalStyle('none');
    setAmateurLevel(3);
    setPhotographicRealityStyle('professional');
    setPhotoshootShots(4);
    if (createFileInputRef.current) {
        createFileInputRef.current.value = '';
    }
  }

  const handleCreateProfile = () => {
    if (!profileName.trim()) {
      setError('O nome do perfil é obrigatório.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(profileName.trim())) {
      setError('O nome do perfil pode conter apenas letras, números e underscores (_).');
      return;
    }
    if (stagedImages.length === 0) {
      setError('Por favor, envie pelo menos uma imagem.');
      return;
    }
    onProfileCreate(profileName.trim(), stagedImages, consistencyMode, additionalStyle, amateurLevel, photographicRealityStyle, photoshootShots);
    resetCreationForm();
  };
  
  const isNormalModeDisabledOnCreate = additionalStyle !== 'none';

  const amateurLevelDescriptions: { [key: number]: string } = {
    1: 'Nível 1: Semi-pro de smartphone, nítida e com bom HDR.',
    2: 'Nível 2: Foto casual boa, com bom foco e iluminação.',
    3: 'Nível 3: Foto casual normal, com composição centralizada e pequenas imperfeições.',
    4: 'Nível 4: Foto ruim, com flash direto, composição estranha (cortes) e foco errado.',
    5: 'Nível 5: Muito ruim, com borrões de movimento e trepidação.'
  };

  return (
    <div className="p-4 bg-gray-800 flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4 text-white flex items-center"><SparklesIcon className="w-6 h-6 mr-2 text-blue-400" /> Perfis de Consistência</h2>
      
      {!isCreating && (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Criar Novo Perfil
        </button>
      )}

      {isCreating && (
        <div className="border border-gray-700 rounded-md p-4 space-y-4">
          <input
            type="text"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Nome do Perfil (ex: meu_cachorro)"
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-300">Modo de Consistência:</p>
            <div className="flex justify-between gap-1 sm:gap-2">
              <ModeSelector name="consistencyModeCreate" mode={consistencyMode} label="Normal" value="normal" onChange={setConsistencyMode} className="bg-blue-600 border-blue-500 text-white" disabled={isNormalModeDisabledOnCreate}/>
              <ModeSelector name="consistencyModeCreate" mode={consistencyMode} label="Pro" value="professional" onChange={setConsistencyMode} className="bg-yellow-500 border-yellow-400 text-gray-900" />
              <ModeSelector name="consistencyModeCreate" mode={consistencyMode} label="Amador" value="amateur" onChange={setConsistencyMode} className="bg-green-600 border-green-500 text-white" />
              <ModeSelector name="consistencyModeCreate" mode={consistencyMode} label="Realidade" value="photographic_reality" onChange={setConsistencyMode} className="bg-cyan-500 border-cyan-400 text-white" />
            </div>
             <p className="text-xs text-gray-400 text-center px-1 h-8 flex items-center justify-center">
                {consistencyMode === 'professional' && 'Qualidade de estúdio, alta nitidez e iluminação perfeita.'}
                {consistencyMode === 'amateur' && 'Simula uma foto casual de celular. Ajuste o nível abaixo.'}
                {consistencyMode === 'photographic_reality' && 'Gera um ensaio fotográfico mantendo cenário e roupas.'}
                {consistencyMode === 'normal' && !isNormalModeDisabledOnCreate && 'Um equilíbrio entre qualidade e realismo para uso geral.'}
                {isNormalModeDisabledOnCreate && 'O modo Normal é desativado quando um estilo é selecionado.'}
            </p>
          </div>

          {consistencyMode === 'amateur' && (
            <div className="space-y-2">
                <label htmlFor="amateur-level-create" className="block text-sm font-medium text-gray-300">Nível de Amadorismo: <span className="font-bold text-white">{amateurLevel}</span></label>
                <input
                    id="amateur-level-create"
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={amateurLevel}
                    onChange={(e) => setAmateurLevel(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-gray-400 text-center">{amateurLevelDescriptions[amateurLevel]}</p>
            </div>
          )}

          {consistencyMode === 'photographic_reality' && (
            <div className="p-2 border border-gray-700 rounded-lg space-y-2">
              <p className="text-xs font-semibold text-gray-400">Estilo do Ensaio:</p>
              <div className="flex gap-2">
                <label className={`flex-1 p-2 border rounded-md text-center text-xs font-semibold transition-colors duration-200 cursor-pointer ${photographicRealityStyle === 'professional' ? 'bg-yellow-500 border-yellow-400 text-gray-900' : 'bg-gray-600 border-gray-500 hover:border-yellow-400'}`}>
                  <input type="radio" name="realityStyleCreate" value="professional" checked={photographicRealityStyle === 'professional'} onChange={() => setPhotographicRealityStyle('professional')} className="hidden" />
                  Profissional
                </label>
                <label className={`flex-1 p-2 border rounded-md text-center text-xs font-semibold transition-colors duration-200 cursor-pointer ${photographicRealityStyle === 'amateur' ? 'bg-green-600 border-green-500 text-white' : 'bg-gray-600 border-gray-500 hover:border-green-500'}`}>
                  <input type="radio" name="realityStyleCreate" value="amateur" checked={photographicRealityStyle === 'amateur'} onChange={() => setPhotographicRealityStyle('amateur')} className="hidden" />
                  Amador
                </label>
              </div>
              {photographicRealityStyle === 'amateur' && (
                <div className="pt-2">
                  <label htmlFor="amateur-level-create-reality" className="block text-sm font-medium text-gray-300">Nível de Amadorismo: <span className="font-bold text-white">{amateurLevel}</span></label>
                  <input
                      id="amateur-level-create-reality"
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={amateurLevel}
                      onChange={(e) => setAmateurLevel(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-400 text-center">{amateurLevelDescriptions[amateurLevel]}</p>
                </div>
              )}
               <div className="pt-2">
                  <label htmlFor="photoshoot-shots-create" className="block text-sm font-medium text-gray-300">Número de Fotos: <span className="font-bold text-white">{photoshootShots}</span></label>
                  <input
                      id="photoshoot-shots-create"
                      type="range"
                      min="2"
                      max="8"
                      step="1"
                      value={photoshootShots}
                      onChange={(e) => setPhotoshootShots(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
            </div>
          )}
          
          <StyleSelector value={additionalStyle} onChange={setAdditionalStyle} />

          <label className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-md cursor-pointer hover:bg-gray-700 transition-colors">
            <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-400">{stagedImages.length > 0 ? `${stagedImages.length} imagem(ns) selecionada(s)` : 'Clique para enviar imagens'}</span>
            <input type="file" multiple accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={handleFileChange} className="hidden" ref={createFileInputRef} />
          </label>
          
          {stagedImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {stagedImages.map((img, index) => (
                <img key={index} src={`data:${img.mimeType};base64,${img.base64}`} alt={img.name} className="w-full h-16 object-cover rounded-md" />
              ))}
            </div>
          )}
          
          {error && <p className="text-red-400 text-sm">{error}</p>}
          
          <div className="flex space-x-2">
            <button
              onClick={handleCreateProfile}
              className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Salvar Perfil
            </button>
            <button
              onClick={resetCreationForm}
              className="flex-1 bg-gray-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex-grow overflow-y-auto -mr-2 pr-2">
        <h3 className="font-semibold text-gray-400 mb-2">Seus Perfis</h3>
        {profiles.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-4">Nenhum perfil criado ainda.</p>
        ) : (
          <ul className="space-y-3">
            {profiles.map(profile => {
              const isNormalModeDisabledOnEdit = profile.additionalStyle !== 'none';
              const currentAmateurLevel = profile.amateurLevel ?? 3;
              const currentPhotoshootShots = profile.photoshootShots ?? 4;

              return (
              <li key={profile.id} className="bg-gray-700 p-3 rounded-lg">
                <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-mono font-bold text-blue-400">{profile.name}</p>
                         {profile.consistencyMode === 'professional' && (
                          <span className="text-xs font-bold bg-yellow-500 text-gray-900 px-2 py-0.5 rounded-full">PRO</span>
                        )}
                        {profile.consistencyMode === 'amateur' && (
                          <span className="text-xs font-bold bg-green-600 text-white px-2 py-0.5 rounded-full">AMADOR (NÍVEL {currentAmateurLevel})</span>
                        )}
                        {profile.consistencyMode === 'photographic_reality' && (
                          <span className="text-xs font-bold bg-cyan-500 text-white px-2 py-0.5 rounded-full">REALIDADE ({currentPhotoshootShots} FOTOS)</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{profile.images.length} imagem(ns)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingProfileId(editingProfileId === profile.id ? null : profile.id)} className={`text-gray-400 hover:text-blue-400 transition-colors p-1 rounded-full ${editingProfileId === profile.id ? 'text-blue-400 bg-gray-800' : ''}`}>
                          <SettingsIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => onProfileDelete(profile.id)} className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded-full">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                </div>
                 <div className="mt-2 grid grid-cols-5 gap-2">
                  {profile.images.slice(0, 5).map((img, index) => (
                    <img key={index} src={`data:${img.mimeType};base64,${img.base64}`} alt={img.name} className="w-full h-12 object-cover rounded" title={img.name} />
                  ))}
                  {profile.images.length > 5 && (
                    <div className="w-full h-12 bg-gray-800 rounded flex items-center justify-center text-xs font-bold text-gray-400">
                      +{profile.images.length - 5}
                    </div>
                  )}
                </div>
                {editingProfileId === profile.id && (
                  <div className="mt-4 pt-4 border-t border-gray-600 space-y-4">
                      <div>
                        <label htmlFor={`profile-name-${profile.id}`} className="block text-sm font-medium text-gray-300 mb-1">Nome do Perfil:</label>
                        <input
                            id={`profile-name-${profile.id}`}
                            type="text"
                            value={profile.name}
                             onChange={(e) => {
                                const newName = e.target.value;
                                if (!/^[a-zA-Z0-9_]*$/.test(newName)) {
                                    setEditErrors(prev => ({ ...prev, [profile.id]: 'Use apenas letras, números e _.' }));
                                } else {
                                    setEditErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors[profile.id];
                                        return newErrors;
                                    });
                                }
                                onProfileUpdate(profile.id, { name: newName });
                            }}
                            onBlur={(e) => {
                                const newName = e.target.value.trim();
                                if (newName === '') {
                                    setEditErrors(prev => ({ ...prev, [profile.id]: 'O nome não pode ser vazio.' }));
                                } else {
                                    onProfileUpdate(profile.id, { name: newName });
                                }
                            }}
                            className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        />
                         {editErrors[profile.id] && <p className="text-red-400 text-xs mt-1">{editErrors[profile.id]}</p>}
                      </div>
                      
                       <div>
                        <label className="w-full flex items-center justify-center p-2 border-2 border-dashed border-gray-600 rounded-md cursor-pointer hover:bg-gray-800 transition-colors">
                            <UploadIcon className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-400">Adicionar mais imagens</span>
                            <input 
                                type="file" 
                                multiple 
                                accept={ACCEPTED_IMAGE_TYPES.join(',')} 
                                onChange={(e) => handleAddImages(profile.id, e.target.files)} 
                                className="hidden" 
                                ref={addFileInputRef}
                            />
                        </label>
                      </div>

                     <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-300">Modo de Consistência:</p>
                        <div className="flex justify-between gap-1 sm:gap-2">
                          <ModeSelector name={`consistencyMode-${profile.id}`} mode={profile.consistencyMode} label="Normal" value="normal" onChange={(mode) => onProfileUpdate(profile.id, { consistencyMode: mode })} className="bg-blue-600 border-blue-500 text-white" disabled={isNormalModeDisabledOnEdit}/>
                          <ModeSelector name={`consistencyMode-${profile.id}`} mode={profile.consistencyMode} label="Pro" value="professional" onChange={(mode) => onProfileUpdate(profile.id, { consistencyMode: mode })} className="bg-yellow-500 border-yellow-400 text-gray-900" />
                          <ModeSelector name={`consistencyMode-${profile.id}`} mode={profile.consistencyMode} label="Amador" value="amateur" onChange={(mode) => onProfileUpdate(profile.id, { consistencyMode: mode })} className="bg-green-600 border-green-500 text-white" />
                          <ModeSelector name={`consistencyMode-${profile.id}`} mode={profile.consistencyMode} label="Realidade" value="photographic_reality" onChange={(mode) => onProfileUpdate(profile.id, { consistencyMode: mode })} className="bg-cyan-500 border-cyan-400 text-white" />
                        </div>
                      </div>

                      {profile.consistencyMode === 'amateur' && (
                        <div className="space-y-2">
                            <label htmlFor={`amateur-level-edit-${profile.id}`} className="block text-sm font-medium text-gray-300">Nível de Amadorismo: <span className="font-bold text-white">{currentAmateurLevel}</span></label>
                            <input
                                id={`amateur-level-edit-${profile.id}`}
                                type="range"
                                min="1"
                                max="5"
                                step="1"
                                value={currentAmateurLevel}
                                onChange={(e) => onProfileUpdate(profile.id, { amateurLevel: Number(e.target.value) })}
                                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                            />
                             <p className="text-xs text-gray-400 text-center">{amateurLevelDescriptions[currentAmateurLevel]}</p>
                        </div>
                      )}

                      {profile.consistencyMode === 'photographic_reality' && (
                        <div className="p-2 border border-gray-600 rounded-lg space-y-2 mt-2">
                          <p className="text-xs font-semibold text-gray-400">Estilo do Ensaio:</p>
                          <div className="flex gap-2">
                            <label className={`flex-1 p-2 border rounded-md text-center text-xs font-semibold transition-colors duration-200 cursor-pointer ${profile.photographicRealityStyle === 'professional' || !profile.photographicRealityStyle ? 'bg-yellow-500 border-yellow-400 text-gray-900' : 'bg-gray-600 border-gray-500 hover:border-yellow-400'}`}>
                              <input type="radio" name={`realityStyleEdit-${profile.id}`} value="professional" checked={profile.photographicRealityStyle === 'professional' || !profile.photographicRealityStyle} onChange={() => onProfileUpdate(profile.id, { photographicRealityStyle: 'professional' })} className="hidden" />
                              Profissional
                            </label>
                            <label className={`flex-1 p-2 border rounded-md text-center text-xs font-semibold transition-colors duration-200 cursor-pointer ${profile.photographicRealityStyle === 'amateur' ? 'bg-green-600 border-green-500 text-white' : 'bg-gray-600 border-gray-500 hover:border-green-500'}`}>
                              <input type="radio" name={`realityStyleEdit-${profile.id}`} value="amateur" checked={profile.photographicRealityStyle === 'amateur'} onChange={() => onProfileUpdate(profile.id, { photographicRealityStyle: 'amateur' })} className="hidden" />
                              Amador
                            </label>
                          </div>
                          {(profile.photographicRealityStyle === 'amateur') && (
                            <div className="pt-2">
                              <label htmlFor={`amateur-level-edit-reality-${profile.id}`} className="block text-sm font-medium text-gray-300">Nível de Amadorismo: <span className="font-bold text-white">{currentAmateurLevel}</span></label>
                              <input
                                  id={`amateur-level-edit-reality-${profile.id}`}
                                  type="range"
                                  min="1"
                                  max="5"
                                  step="1"
                                  value={currentAmateurLevel}
                                  onChange={(e) => onProfileUpdate(profile.id, { amateurLevel: Number(e.target.value) })}
                                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                              />
                              <p className="text-xs text-gray-400 text-center">{amateurLevelDescriptions[currentAmateurLevel]}</p>
                            </div>
                          )}
                           <div className="pt-2">
                              <label htmlFor={`photoshoot-shots-edit-${profile.id}`} className="block text-sm font-medium text-gray-300">Número de Fotos: <span className="font-bold text-white">{currentPhotoshootShots}</span></label>
                              <input
                                  id={`photoshoot-shots-edit-${profile.id}`}
                                  type="range"
                                  min="2"
                                  max="8"
                                  step="1"
                                  value={currentPhotoshootShots}
                                  onChange={(e) => onProfileUpdate(profile.id, { photoshootShots: Number(e.target.value) })}
                                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                        </div>
                      )}

                      <StyleSelector 
                        value={profile.additionalStyle} 
                        onChange={(style) => onProfileUpdate(profile.id, { additionalStyle: style })}
                      />
                  </div>
                )}
              </li>
            )})}
          </ul>
        )}
      </div>
    </div>
  );
};