
import React, { useState, useCallback, useEffect } from 'react';
import type { UploadedImage, ImageLabRequest, ImageLabSlotData } from '../types';
import { UploadIcon, XMarkIcon, LabIcon, CameraIcon } from './icons';

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

interface LabSlotProps {
  title: string;
  description: string;
  slotData: ImageLabSlotData;
  onSlotDataChange: (data: ImageLabSlotData) => void;
  onSetError: (error: string | null) => void;
}

const LabSlot: React.FC<LabSlotProps> = ({ title, description, slotData, onSlotDataChange, onSetError }) => {
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;

      if (slotData.images.length + files.length > 10) {
          onSetError('Você pode enviar no máximo 10 imagens por campo.');
          return;
      }
      
      const validFiles = files.filter(file => ACCEPTED_IMAGE_TYPES.includes(file.type));
      if (validFiles.length !== files.length) {
          onSetError('Apenas arquivos JPG, PNG e WEBP são permitidos.');
      }
      if (validFiles.length === 0) return;

      try {
        const uploadedImages = await Promise.all(validFiles.map(fileToBase64));
        onSlotDataChange({ ...slotData, images: [...slotData.images, ...uploadedImages] });
        onSetError(null);
      } catch (err) {
        onSetError('Erro ao ler os arquivos.');
        console.error(err);
      } finally {
        if(event.target) event.target.value = ''; // Reset file input
      }
    }
  }, [slotData, onSlotDataChange, onSetError]);

  const removeImage = (indexToRemove: number) => {
      onSlotDataChange({ ...slotData, images: slotData.images.filter((_, index) => index !== indexToRemove) });
  };

  return (
    <div className="p-3 bg-gray-700 rounded-lg">
      <h3 className="font-bold text-sm text-white flex items-center gap-2">
        {title}
        {slotData.images.length > 0 && <CameraIcon className="w-4 h-4 text-green-400" title={`${slotData.images.length} imagem(ns) enviada(s)`} />}
      </h3>
      <p className="text-xs text-gray-400 mb-2">{description}</p>
      <div className="space-y-2">
        <label className="w-full flex items-center justify-center p-2 border-2 border-dashed border-gray-600 rounded-md cursor-pointer hover:bg-gray-800 transition-colors">
          <UploadIcon className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-xs text-gray-400">{slotData.images.length > 0 ? `${slotData.images.length}/10 Imagens` : 'Enviar Imagem(ns)'}</span>
          <input type="file" multiple accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={handleFileChange} className="hidden" />
        </label>
        {slotData.images.length > 0 && (
          <div className="grid grid-cols-5 gap-1">
            {slotData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img src={`data:${image.mimeType};base64,${image.base64}`} alt={image.name} className="w-full h-12 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0.5 right-0.5 bg-black bg-opacity-60 p-0.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <textarea
          value={slotData.prompt}
          onChange={(e) => onSlotDataChange({ ...slotData, prompt: e.target.value })}
          placeholder="Ou descreva em um prompt..."
          rows={2}
          className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-xs text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        />
      </div>
    </div>
  );
};

interface ImageLabProps {
  onGenerate: (request: ImageLabRequest) => void;
  isLoading: boolean;
}

const ModeSelector: React.FC<{
    mode: ImageLabRequest['mode'],
    label: string,
    value: ImageLabRequest['mode'],
    onChange: (mode: ImageLabRequest['mode']) => void,
    className: string,
    disabled?: boolean,
    name: string,
    }> = ({ mode, label, value, onChange, className, disabled = false, name }) => (
    <label className={`flex-1 p-2 border rounded-md text-center text-xs sm:text-sm font-semibold transition-all duration-200 ${mode === value ? className : 'bg-gray-600 border-gray-500 hover:border-blue-500'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <input type="radio" name={name} value={value} checked={mode === value} onChange={() => !disabled && onChange(value)} className="hidden" disabled={disabled} />
      {label}
    </label>
);

export const ImageLab: React.FC<ImageLabProps> = ({ onGenerate, isLoading }) => {
  const [subject, setSubject] = useState<ImageLabSlotData>({ images: [], prompt: '' });
  const [scenery, setScenery] = useState<ImageLabSlotData>({ images: [], prompt: '' });
  const [style, setStyle] = useState<ImageLabSlotData>({ images: [], prompt: '' });
  const [extra, setExtra] = useState<ImageLabSlotData>({ images: [], prompt: '' });
  const [perspective, setPerspective] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [numberOfImages, setNumberOfImages] = useState(1);
  const [mode, setMode] = useState<ImageLabRequest['mode']>('normal');
  const [amateurLevel, setAmateurLevel] = useState(3);
  const [isPhotoshoot, setIsPhotoshoot] = useState(false);

  useEffect(() => {
    if (isPhotoshoot && numberOfImages < 2) {
      setNumberOfImages(2);
    }
  }, [isPhotoshoot, numberOfImages]);
  
  const amateurLevelDescriptions: { [key: number]: string } = {
    1: 'Nível 1: Semi-pro de smartphone, nítida e com bom HDR.',
    2: 'Nível 2: Foto casual boa, com bom foco e iluminação.',
    3: 'Nível 3: Foto casual normal, com composição centralizada e pequenas imperfeições.',
    4: 'Nível 4: Foto ruim, com flash direto, composição estranha (cortes) e foco errado.',
    5: 'Nível 5: Muito ruim, com borrões de movimento e trepidação.'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
        (subject.images.length === 0 && !subject.prompt.trim()) &&
        (scenery.images.length === 0 && !scenery.prompt.trim()) &&
        (style.images.length === 0 && !style.prompt.trim()) &&
        (extra.images.length === 0 && !extra.prompt.trim())
    ) {
        setError('Por favor, forneça pelo menos uma imagem ou um prompt em um dos campos.');
        return;
    }
    setError(null);
    onGenerate({ subject, scenery, style, extra, numberOfImages, mode, amateurLevel, isPhotoshoot, perspective });
  };

  return (
    <div className="p-4 bg-gray-800 flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4 text-white flex items-center"><LabIcon className="w-6 h-6 mr-2 text-blue-400" /> Laboratório de Imagens</h2>
      <p className="text-sm text-gray-400 mb-4">
        Misture imagens e prompts para criar uma composição única. A IA irá analisar todas as entradas para criar uma imagem final coesa e realista.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3 flex-grow overflow-y-auto pr-2">
        <LabSlot
            title="1. Personagem / Objeto Principal"
            description="Envie a(s) imagem(ns) do seu sujeito principal ou descreva-o."
            slotData={subject}
            onSlotDataChange={setSubject}
            onSetError={setError}
        />
         <LabSlot
            title="2. Cenário"
            description="Forneça o ambiente, fundo ou cenário para a sua imagem."
            slotData={scenery}
            onSlotDataChange={setScenery}
            onSetError={setError}
        />
         <LabSlot
            title="3. Estilo de Fotografia / Arte"
            description="Envie imagens de referência para o estilo de iluminação, cores e arte."
            slotData={style}
            onSlotDataChange={setStyle}
            onSetError={setError}
        />
         <LabSlot
            title="4. Elementos Extras"
            description="Adicione outros objetos, pessoas ou detalhes na cena."
            slotData={extra}
            onSlotDataChange={setExtra}
            onSetError={setError}
        />

        <div className="p-3 bg-gray-700 rounded-lg space-y-4">
            <div>
                <label htmlFor="num-images-slider" className="block text-sm font-medium text-gray-300 mb-1">Número de Imagens: <span className="font-bold text-white">{numberOfImages}</span></label>
                <input
                    id="num-images-slider"
                    type="range"
                    min={isPhotoshoot ? 2 : 1}
                    max="6"
                    step="1"
                    value={numberOfImages}
                    onChange={(e) => setNumberOfImages(Number(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
            </div>
             <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Modo Criativo:</p>
                <div className="flex justify-between gap-1 sm:gap-2">
                  <ModeSelector name="labMode" mode={mode} label="Normal" value="normal" onChange={setMode} className="bg-blue-600 border-blue-500 text-white" disabled={isPhotoshoot} />
                  <ModeSelector name="labMode" mode={mode} label="Pro" value="professional" onChange={setMode} className="bg-yellow-500 border-yellow-400 text-gray-900" />
                  <ModeSelector name="labMode" mode={mode} label="Amador" value="amateur" onChange={setMode} className="bg-green-600 border-green-500 text-white" />
                </div>
            </div>
             {mode === 'professional' && (
                <div className="p-3 bg-gray-800 rounded-lg">
                    <label htmlFor="perspective-input" className="block text-sm font-medium text-gray-300 mb-1">
                        Perspectiva da Câmera
                    </label>
                    <textarea
                        id="perspective-input"
                        value={perspective}
                        onChange={(e) => setPerspective(e.target.value)}
                        placeholder="Ex: vista de baixo para cima (contra-plongée), close-up extremo, câmera no nível do chão..."
                        rows={2}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-xs text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                    />
                </div>
            )}
             {mode === 'amateur' && (
                <div className="space-y-2">
                    <label htmlFor="amateur-level-lab" className="block text-sm font-medium text-gray-300">Nível de Amadorismo: <span className="font-bold text-white">{amateurLevel}</span></label>
                    <input
                        id="amateur-level-lab"
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={amateurLevel}
                        onChange={(e) => setAmateurLevel(Number(e.target.value))}
                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-gray-400 text-center">{amateurLevelDescriptions[amateurLevel]}</p>
                </div>
              )}
            <div>
                <label className="flex items-center p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-opacity-75 transition-colors">
                    <input 
                        type="checkbox" 
                        checked={isPhotoshoot}
                        onChange={(e) => {
                            const checked = e.target.checked;
                            setIsPhotoshoot(checked);
                            if (checked && mode === 'normal') {
                                setMode('professional');
                            }
                        }}
                        className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-3 flex items-center gap-2">
                        <CameraIcon className="w-5 h-5 text-blue-400" />
                        <div>
                            <span className="font-bold text-white">Sessão de Fotos</span>
                            <span className="block text-xs text-gray-400">Gera múltiplas fotos com poses e ângulos variados.</span>
                        </div>
                    </span>
                </label>
            </div>
        </div>
        
        {error && <p className="text-red-400 text-sm text-center py-1">{error}</p>}

        <div className="pt-2">
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed">
                {isLoading ? 'Gerando...' : 'Gerar Mixagem'}
            </button>
        </div>
      </form>
    </div>
  );
};
