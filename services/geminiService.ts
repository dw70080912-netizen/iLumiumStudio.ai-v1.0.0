

import { GoogleGenAI, Modality, Part, Type } from "@google/genai";
import type { ConsistencyProfile, UploadedImage, GenerationConfig, AdditionalStyle, AdvancedEditRequest, PhotorealisticRequest, TimeOfDay, LightSource, LensType, SensorType, PhotographicStyle, AspectRatio, ChatMessage, ExpandImageRequest, ImageLabRequest, CameraAngle } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Add validateApiKey function to resolve import error in ApiKeyModal.tsx.
// This function is used to verify a user-provided API key by making a simple test call.
export const validateApiKey = async (key: string): Promise<boolean> => {
  if (!key) {
    return false;
  }
  try {
    const validationAi = new GoogleGenAI({ apiKey: key });
    // Use a lightweight call to test the API key
    await validationAi.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: 'test',
    });
    return true;
  } catch (error) {
    // This can happen for various reasons, including an invalid key, network issues, or quota problems.
    // For the purpose of validation, any error means the key is not usable.
    console.error("API Key validation failed:", error);
    return false;
  }
};

export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

export class InvalidApiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidApiKeyError';
  }
}

const handleApiCall = async <T,>(apiCall: () => Promise<T>): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    console.error("Gemini API Error:", error);
    const errorMessage = (error as Error).message?.toLowerCase() || '';
    if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('resource_exhausted')) {
      throw new QuotaExceededError('A cota de uso da API foi excedida. Por favor, tente novamente mais tarde.');
    }
    if (errorMessage.includes('api key not valid') || errorMessage.includes('api_key_invalid') || errorMessage.includes('permission_denied') || errorMessage.includes('401') || errorMessage.includes('403')) {
        throw new InvalidApiKeyError('A chave de API configurada é inválida ou expirou. Contate o administrador do aplicativo.');
    }
    throw error;
  }
};


const fileToGenerativePart = (image: UploadedImage): Part => {
  return {
    inlineData: {
      data: image.base64,
      mimeType: image.mimeType,
    },
  };
};

const getStylePrompt = (style: AdditionalStyle): string => {
  switch (style) {
    case 'ghibli':
      return 'Crie a imagem no estilo de arte do Studio Ghibli, com cores vibrantes, cenários pastorais e personagens com expressões suaves.';
    case 'anime':
      return 'Crie a imagem no estilo de anime japonês moderno, com linhas nítidas, olhos grandes e expressivos e cores saturadas.';
    case '3d_render':
      return 'Crie a imagem como uma renderização 3D fotorrealista, com iluminação e texturas detalhadas, semelhante ao Octane Render ou V-Ray.';
    case 'oil_painting':
      return 'Crie a imagem como uma pintura a óleo clássica, com pinceladas visíveis, textura de tela e uma paleta de cores rica.';
    case 'pencil_drawing':
      return 'Crie a imagem como um desenho detalhado a lápis de grafite, com sombreamento realista, hachuras e diferentes pesos de linha.';
    case 'cinematic':
      return 'Crie a imagem com uma estética cinematográfica, usando iluminação dramática, cores graduadas (color grading), e uma composição widescreen com profundidade de campo rasa.';
    case 'watercolor':
      return 'Crie a imagem como uma pintura em aquarela, com cores translúcidas, bordas suaves e a textura do papel visível.';
    case 'sketch':
      return 'Crie a imagem como um esboço rápido, com linhas gestuais, hachuras para sombreamento e uma sensação de espontaneidade.';
    case 'concept_art':
        return 'Crie a imagem no estilo de arte conceitual para filmes ou videogames, com um foco em design, atmosfera e narrativa visual.';
    case 'vaporwave':
        return 'Crie a imagem com uma estética vaporwave, usando cores neon, grades de perspectiva, estátuas romanas, e elementos de design retro-futurista dos anos 80 e 90.';
    case 'none':
    default:
      return '';
  }
}

// Funções auxiliares para o Estúdio Fotográfico
const getAdvancedLightingDescription = (lighting: PhotorealisticRequest['lighting']) => {
    const timeOfDay = {
        'amanhecer': 'no amanhecer, com luz suave e quente e sombras longas.',
        'meio-dia': 'ao meio-dia, sob luz solar direta e forte, com sombras curtas e duras.',
        'por_do_sol': 'durante o pôr do sol (golden hour), com uma luz dourada, quente e difusa.',
        'hora_azul': 'na hora azul, após o pôr do sol, com uma luz ambiente fria, azulada e suave.',
        'noite': 'à noite, com fontes de luz limitadas, exigindo iluminação artificial ou lunar.',
    }[lighting.timeOfDay];

    const source = {
        'natural_daylight': 'luz natural do dia, vinda de uma janela ou ao ar livre em um dia nublado.',
        'golden_hour_sun': 'luz direta do sol durante a golden hour, criando um brilho quente e reflexos na lente (lens flare).',
        'studio_flash': 'flash de estúdio profissional (ex: beauty dish, softbox).',
        'ring_light': 'uma luz de anel (ring light), criando um brilho característico nos olhos (catchlights).',
        'neon_city': 'luzes de neon de uma cidade noturna, criando reflexos coloridos e uma atmosfera cyberpunk.',
        'dramatic_spotlight': 'um holofote (spotlight) dramático, criando um forte contraste entre luz e sombra (chiaroscuro).',
        'tungsten_bulb': 'luz de uma lâmpada de tungstênio, criando um ambiente muito quente e alaranjado.',
        'fluorescent_light': 'luz de uma lâmpada fluorescente, com um tom levemente esverdeado e uma sensação de ambiente de escritório ou industrial.',
        'led_panel': 'luz de um painel de LED moderno, que pode ser ajustado para qualquer cor, mas geralmente é neutro e limpo.',
        'candlelight': 'luz de velas, que é muito quente, suave, bruxuleante e cria sombras longas e dançantes.',
    }[lighting.source];
    
    const quality = lighting.quality === 'dura' ? 'A luz é dura, criando sombras nítidas e alto contraste.' : 'A luz é difusa e suave, envolvendo o sujeito e minimizando as sombras.';
    const angle = {
        'frontal': 'A luz principal vem da frente, iluminando o sujeito diretamente.',
        'lateral': 'A luz principal vem do lado (iluminação Rembrandt ou split), criando profundidade e drama.',
        'contra-luz': 'A luz principal vem de trás do sujeito (contra-luz), criando uma silhueta ou um brilho de contorno.',
        'superior': 'A luz vem de cima (iluminação borboleta), criando uma sombra abaixo do nariz.',
    }[lighting.angle];
    const intensity = `A intensidade da luz principal é ${lighting.intensity}.`;
    const fill = lighting.fillLight ? 'Use uma luz de preenchimento suave para clarear as sombras no lado oposto à luz principal.' : 'Não use luz de preenchimento, permitindo que as sombras sejam profundas e dramáticas.';
    const rim = lighting.rimLight ? 'Adicione uma luz de contorno (rim light) por trás do sujeito para separá-lo do fundo com um brilho sutil.' : 'Não use luz de contorno.';

    return `A cena ocorre ${timeOfDay} A fonte de luz principal simula ${source} ${quality} ${angle} ${intensity} ${fill} ${rim}`;
};

const getAtmosphericAndMaterialPrompt = (request: PhotorealisticRequest): string => {
    let prompt = '';
    const densityMap = { light: 'leve', medium: 'média', heavy: 'densa' };
    const density = densityMap[request.atmosphere.density] || 'média';

    switch (request.atmosphere.type) {
        case 'fog':
            prompt += ` A cena está envolta em uma neblina ${density}, difundindo a luz e reduzindo a visibilidade.`;
            break;
        case 'mist':
            prompt += ` Uma névoa ${density} paira no ar, criando uma atmosfera suave e úmida e raios de luz visíveis (god rays).`;
            break;
        case 'rain':
            prompt += ` Está caindo uma chuva ${density}, com superfícies molhadas e reflexivas, e possíveis gotas visíveis.`;
            break;
        case 'dust_particles':
            prompt += ` Partículas de poeira ${density} estão suspensas no ar, capturando a luz e criando um efeito de luz volumétrica.`;
            break;
        default:
            break;
    }

    if (request.materialProperties.trim() || request.atmosphere.lightPhysics.trim()) {
        prompt += ` A simulação física deve ser 99,99% precisa, com atenção rigorosa aos detalhes.`;
    }
    if (request.materialProperties.trim()) {
        prompt += ` Propriedades de materiais a simular: ${request.materialProperties.trim()}.`;
    }
     if (request.atmosphere.lightPhysics.trim()) {
        prompt += ` Simule a física da luz com estas características: ${request.atmosphere.lightPhysics.trim()}.`;
    }

    return prompt;
};

const getFilmAndDefectsPrompt = (film: PhotorealisticRequest['film']): string => {
    let prompt = '';
    
    if (film.stock !== 'none') {
        const stocks: Record<string, string> = {
            'kodak_portra_400': 'Simule as cores e o contraste do filme Kodak Portra 400, com tons de pele quentes e realistas e saturação moderada.',
            'fuji_velvia_50': 'Simule as cores vibrantes e a alta saturação do filme Fuji Velvia 50, ideal para paisagens com verdes e azuis intensos.',
            'ilford_hp5_400': 'Simule o filme preto e branco Ilford HP5 400, com granulação clássica, alto contraste e uma ampla gama de tons de cinza.',
            'kodak_ektar_100': 'Simule as cores do filme Kodak Ektar 100, com saturação viva e a granulação mais fina do mundo.',
            'cinestill_800t': 'Simule o filme CineStill 800T, com seu característico brilho avermelhado (halation) em torno das luzes e uma estética cinematográfica de filme de tungstênio.',
            'polaroid_600': 'Simule uma foto instantânea Polaroid 600, com cores suaves e sonhadoras, contraste baixo e a clássica moldura branca.',
        };
        prompt += ` ${stocks[film.stock]}`;
    }

    if (film.defects.filmGrain !== 'none') {
        prompt += ` Adicione uma granulação de filme ${film.defects.filmGrain}.`;
    }
    if (film.defects.lensFlare !== 'none') {
         const flareTypes: Record<string, string> = {
            'subtle': 'um lens flare sutil',
            'dramatic': 'um lens flare dramático',
            'imperfect': 'um lens flare imperfeito e realista, com artefatos e anéis assimétricos',
        };
        prompt += ` Inclua ${flareTypes[film.defects.lensFlare]} vindo da fonte de luz principal.`;
    }
    if (film.defects.cameraShake !== 'none') {
        prompt += ` A imagem deve ter um leve borrão de movimento como se fosse tirada com um ${film.defects.cameraShake} tremor da câmera.`;
    }
    if (film.defects.lightLeaks) {
        prompt += ' Adicione vazamentos de luz (light leaks) sutis nas bordas da imagem, como em uma câmera de filme antiga.';
    }
    if (film.defects.dustAndScratches) {
        prompt += ' Inclua pequenas partículas de poeira e arranhões finos, como em um negativo de filme escaneado.';
    }
     if (film.defects.sensorSpots) {
        prompt += ' Adicione pequenas manchas de poeira no sensor, visíveis em áreas de cor uniforme como o céu.';
    }
    if (film.defects.negativeScratches) {
        prompt += ' Inclua arranhões finos e verticais, como em um negativo de filme mal manuseado.';
    }

    return prompt;
};

const getConceptualPrompt = (request: PhotorealisticRequest): string => {
    let prompt = '';
    if (request.conceptual.prompt.trim()) {
        prompt += ` A imagem deve explorar o seguinte conceito abstrato ou narrativo: ${request.conceptual.prompt.trim()}.`;
    }
    if (request.conceptual.sequence.type !== 'none' && request.numberOfImages > 1) {
        prompt += ` Gere uma série de ${request.numberOfImages} imagens como uma sequência narrativa do tipo '${request.conceptual.sequence.type}'.`;
        if (request.conceptual.sequence.description.trim()) {
            prompt += ` Siga esta diretriz para a sequência: ${request.conceptual.sequence.description.trim()}`;
        } else {
             switch (request.conceptual.sequence.type) {
                case 'timeline':
                    prompt += ' Cada imagem deve representar um período de tempo diferente (passado, presente, futuro).';
                    break;
                case 'style_variation':
                    prompt += ' Cada imagem deve ter uma variação de estilo artístico (ex: uma foto, uma pintura, um esboço).';
                    break;
                case 'psychological_states':
                    prompt += ' Cada imagem deve retratar um estado psicológico diferente (ex: calma, ansiedade, alegria).';
                    break;
            }
        }
    }
    return prompt;
};

const getCameraBodyDescription = (camera: string): string => {
    const descriptions: Record<string, string> = {
        'canon_eos_r5': 'uma câmera Canon EOS R5, conhecida por suas cores ricas e realistas (Canon Color Science) e altíssima resolução de 45MP.',
        'sony_a7_iv': 'uma câmera Sony α7 IV, famosa por seu autofoco de ponta e excelente performance em baixa luz.',
        'fujifilm_x_t4': 'uma câmera Fujifilm X-T4, com suas aclamadas simulações de filme e cor característica.',
        'leica_m11': 'uma câmera Leica M11, conhecida por seu design icônico, operação manual (rangefinder) e a "Leica look" com microcontraste único.',
        'hasselblad_x1d_ii': 'uma câmera de médio formato Hasselblad X1D II, que produz imagens com profundidade de cor incrível e transições de tons suaves.',
        'polaroid_sx70': 'uma câmera instantânea Polaroid SX-70, resultando em uma imagem com cores suaves, sonhadoras e a clássica moldura branca.',
        'apple_iphone_15_pro': 'um Apple iPhone 15 Pro, simulando fotografia computacional com Deep Fusion e Smart HDR, resultando em imagens nítidas e bem expostas.',
        'holga_120n': 'uma toy camera Holga 120N, resultando em uma imagem de baixa fidelidade (lo-fi) com vinhetas fortes, vazamentos de luz e foco suave.',
    };
    return descriptions[camera] || `uma câmera ${camera.replace(/_/g, ' ')}`;
};

const getLensDescription = (lens: LensType): string => `Usando uma lente ${lens.replace(/_/g, ' ')}.`;
const getSensorDescription = (sensor: SensorType): string => `Com um sensor ${sensor.replace(/_/g, ' ')}.`;

const getCameraAngleDescription = (angle: CameraAngle): string => {
    const descriptions: Record<CameraAngle, string> = {
        'eye_level': 'A câmera está no nível dos olhos do sujeito, criando uma perspectiva neutra e direta.',
        'shoulder_level': 'A câmera está no nível dos ombros do sujeito, uma perspectiva comum e ligeiramente elevada.',
        'hip_level': 'A câmera está posicionada na altura do quadril, frequentemente usada para enquadrar ações ou posturas.',
        'knee_level': 'A câmera está no nível dos joelhos, útil para capturar movimento ou dar uma sensação de superioridade ao sujeito.',
        'ground_level': 'A câmera está no chão, olhando para cima, para uma perspectiva dramática e exagerada.',
        'low_angle': 'Um ângulo baixo (contrapicada), com a câmera olhando para cima, fazendo o sujeito parecer poderoso e imponente.',
        'high_angle': 'Um ângulo alto (picada), com a câmera olhando para baixo, fazendo o sujeito parecer vulnerável ou pequeno.',
        'dutch_angle': 'Um ângulo holandês, com a câmera inclinada para criar uma sensação de desorientação ou tensão.',
        'over_the_shoulder': 'Um plano sobre o ombro (OTS), mostrando a cena da perspectiva de trás de um personagem.',
        'over_the_hip': 'Um plano sobre o quadril, similar ao OTS, mas de uma posição mais baixa.',
        'establishing_shot': 'Um plano de estabelecimento, mostrando a localização geral antes de focar nos detalhes.',
        'extreme_wide_shot': 'Um plano geral extremo (EWS), onde o sujeito é pequeno em um vasto cenário.',
        'wide_shot': 'Um plano geral (WS), mostrando o sujeito por inteiro, com amplo espaço ao redor.',
        'full_shot': 'Um plano inteiro (FS), enquadrando o sujeito da cabeça aos pés.',
        'medium_wide_shot': 'Um plano americano (MWS), enquadrando dos joelhos para cima.',
        'cowboy_shot': 'Um plano cowboy, enquadrando do meio da coxa para cima, clássico de westerns.',
        'medium_shot': 'Um plano médio (MS), da cintura para cima, equilibrando sujeito e cenário.',
        'medium_close_up': 'Um plano médio próximo (MCU), do peito para cima, focando mais nas expressões.',
        'close_up': 'Um primeiro plano (CU), focado no rosto para capturar emoções intensas.',
        'extreme_close_up': 'Um primeiríssimo plano (ECU), focando em um detalhe específico, como os olhos.',
        'pov_shot': 'Um plano de ponto de vista (POV), mostrando a cena através dos olhos de um personagem.',
        'birds_eye_view': 'Uma visão de pássaro (top-down), diretamente de cima, como um mapa.',
        'aerial_shot': 'Um plano aéreo, capturado de grande altura (drone, helicóptero) para mostrar a escala.',
        'arc_shot': 'Um plano em arco, onde a câmera se move em um arco ao redor do sujeito.',
        'dolly_zoom': 'Um dolly zoom (efeito Vertigo), onde a câmera se move e o zoom muda simultaneamente, distorcendo a perspectiva.'
    };
    return descriptions[angle] || '';
};

const getPhotographicStyleDescription = (style: PhotographicStyle): string => {
    const styles: Record<PhotographicStyle, string> = {
        'nenhum': '',
        'fotografia_de_rua': 'No estilo de fotografia de rua, espontânea e crua.',
        'moda_editorial': 'No estilo de moda editorial, com poses dramáticas e iluminação de alta qualidade.',
        'retrato_natural': 'No estilo de retrato com luz natural, suave e lisonjeiro.',
        'glamour_hollywood': 'No estilo de glamour clássico de Hollywood, com iluminação contrastada e poses elegantes.',
        'lifestyle': 'No estilo lifestyle, capturando momentos autênticos e casuais.',
        'cinematografico': 'Com uma estética cinematográfica, usando color grading e proporção widescreen.',
    };
    return styles[style] || '';
};


export const generateImageFromText = async (prompt: string, config: GenerationConfig): Promise<string[]> => {
  return handleApiCall(async () => {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-ultra-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: config.numberOfImages,
        outputMimeType: config.outputMimeType,
        aspectRatio: config.aspectRatio,
      },
    });
    
    return response.generatedImages.map(img => `data:${config.outputMimeType};base64,${img.image.imageBytes}`);
  });
};

export const generateText = async (prompt: string): Promise<string> => {
  return handleApiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text;
  });
};

export const generateTextWithGoogleSearch = async (prompt: string): Promise<{ text: string, sources: { title: string, uri: string }[] }> => {
  return handleApiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks?.map((chunk: any) => chunk.web).filter(Boolean) || [];
    
    return { text: response.text, sources };
  });
};

export const editImageWithConsistency = async (prompt: string, profile: ConsistencyProfile): Promise<Partial<ChatMessage>> => {
  return handleApiCall(async () => {
    const parts: Part[] = profile.images.map(fileToGenerativePart);
    const stylePrompt = getStylePrompt(profile.additionalStyle);
    const fullPrompt = `Usando as imagens de referência do perfil '${profile.name}', execute a seguinte ação: ${prompt}. ${stylePrompt}`;
    parts.push({ text: fullPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const images: string[] = [];
    let text = '';
    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                text += part.text;
            } else if (part.inlineData) {
                images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            }
        }
    }
    
    return {
        text: text || `Imagem editada para: "${prompt}"`,
        images: images.length > 0 ? images : undefined,
    };
  });
};

export const editImageWithProfessionalConsistency = async (prompt: string, profile: ConsistencyProfile): Promise<Partial<ChatMessage>> => {
    const proPrompt = `Gere uma imagem com qualidade de estúdio profissional, iluminação perfeita, alta nitidez e detalhes fotorrealistas. ${prompt}`;
    return editImageWithConsistency(proPrompt, profile);
};

export const editImageWithAmateurConsistency = async (prompt: string, profile: ConsistencyProfile): Promise<Partial<ChatMessage>> => {
    const amateurLevel = profile.amateurLevel || 3;
    const amateurDescriptions: { [key: number]: string } = {
        1: 'Simule uma foto tirada por um semi-profissional com um smartphone topo de linha. A imagem deve ser nítida, com bom HDR, mas pode ter uma composição ligeiramente imperfeita.',
        2: 'Simule uma foto casual bem tirada, com bom foco e iluminação, mas com uma composição simples e sem tratamento de cor profissional.',
        3: 'Simule uma foto casual típica, com composição centralizada, talvez um pouco de ruído, e iluminação ambiente normal, sem flash.',
        4: 'Simule uma foto mal tirada, com flash direto criando sombras duras, enquadramento cortando partes importantes e foco impreciso.',
        5: 'Simule uma foto muito ruim, com borrões de movimento, trepidação da câmera, baixo contraste e cores dessaturadas.'
    };
    const amateurPrompt = `Simule uma foto de amador (nível ${amateurLevel}). ${amateurDescriptions[amateurLevel]} Ação: ${prompt}`;
    return editImageWithConsistency(amateurPrompt, profile);
};

export const advancedImageEdit = async (request: AdvancedEditRequest, profiles: ConsistencyProfile[]): Promise<Partial<ChatMessage>> => {
  return handleApiCall(async () => {
    const parts: Part[] = [fileToGenerativePart(request.baseImage)];
    let profileImages: UploadedImage[] = [];
    if (request.profileId) {
        const profile = profiles.find(p => p.id === request.profileId);
        if (profile) {
            profileImages = profile.images;
            profile.images.forEach(img => parts.push(fileToGenerativePart(img)));
        }
    }
    
    let prompt = `Considerando a imagem base`;
    if (profileImages.length > 0) {
        prompt += ` e as imagens de referência do perfil`;
    }
    prompt += `, modifique`;
    if (request.subject) {
        prompt += ` '${request.subject}'`;
    }
    prompt += ` para '${request.action}'.`;
    if (request.style) {
        prompt += ` O estilo final deve ser: '${request.style}'.`;
    }
    if (request.negativePrompt) {
        prompt += ` Evite o seguinte: '${request.negativePrompt}'.`;
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const images: string[] = [];
    let text = '';
    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                text += part.text;
            } else if (part.inlineData) {
                images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            }
        }
    }
    
    return {
        text: text || `Imagem editada para: "${request.action}"`,
        images: images.length > 0 ? images : undefined,
    };
  });
};

export const photorealisticGeneration = async (request: PhotorealisticRequest, profileName: string | null): Promise<string[]> => {
  return handleApiCall(async () => {
    let finalPrompt = `**Master Prompt: Geração de Imagem Fotorrealista de Alta Qualidade**

**Objetivo:** Criar uma imagem digital com o máximo de realismo, simulando uma fotografia profissional. A atenção aos detalhes é crucial.

**Instrução Principal:** ${request.prompt}

**Ambiente e Contexto:** A cena se passa em/no ${request.environment}.`;

    if (profileName) {
        finalPrompt += `\n\n**Consistência de Perfil:** O sujeito principal deve ser renderizado com a aparência e características consistentes com o perfil de referência '${profileName}'.`;
    }

    if (request.autoEquip) {
        finalPrompt += '\n\n**Equipamento (Automático):** A IA deve selecionar a combinação ideal de câmera, lente e configurações para alcançar um resultado fotorrealista de nível profissional, otimizado para a cena descrita.';
    } else {
        finalPrompt += `\n\n**Configuração de Câmera e Lente:**`;
        finalPrompt += `\n- **Câmera:** Capturado com ${getCameraBodyDescription(request.camera.cameraBody)}.`;
        finalPrompt += `\n- **Ângulo da Câmera:** ${getCameraAngleDescription(request.camera.cameraAngle)}.`;
        finalPrompt += `\n- **Lente:** ${getLensDescription(request.camera.lens)}.`;
        finalPrompt += `\n- **Sensor:** ${getSensorDescription(request.camera.sensor)}.`;
        finalPrompt += `\n- **Parâmetros:** Abertura ${request.camera.aperture}, Velocidade do Obturador ${request.camera.shutterSpeed}, ISO ${request.camera.iso}.`;
        if(request.camera.lensDistortion !== 'none') finalPrompt += `\n- **Distorção da Lente:** Incluir distorção do tipo ${request.camera.lensDistortion}.`;
        if(request.camera.chromaticAberration !== 'none') finalPrompt += `\n- **Aberração Cromática:** Incluir ${request.camera.chromaticAberration} aberração cromática nas bordas de alto contraste.`;
    }

    finalPrompt += `\n\n**Iluminação e Atmosfera:**`;
    finalPrompt += `\n- **Iluminação Principal:** ${getAdvancedLightingDescription(request.lighting)}`;
    finalPrompt += getAtmosphericAndMaterialPrompt(request);

    finalPrompt += `\n\n**Profundidade de Campo e Foco:**`;
    finalPrompt += `\n- **Ponto de Foco:** O foco nítido deve estar em '${request.depthOfField.focusPoint}'.`;
    finalPrompt += `\n- **Bokeh:** O desfoque de fundo (bokeh) deve ter intensidade ${request.depthOfField.bokehIntensity} e uma qualidade ${request.depthOfField.bokehQuality}, com orbs suaves e agradáveis.`;

    const conceptualPrompt = getConceptualPrompt(request);
    if (conceptualPrompt) {
        finalPrompt += `\n\n**Conceito e Narrativa:** ${conceptualPrompt}`;
    }

    const styleDesc = getPhotographicStyleDescription(request.style.base);
    if (styleDesc || request.style.customMix) {
      finalPrompt += `\n\n**Estilo Fotográfico:**`;
      if (styleDesc) finalPrompt += `\n- **Base:** ${styleDesc}`;
      if (request.style.customMix) finalPrompt += `\n- **Mistura Customizada:** ${request.style.customMix}`;
    }

    const filmAndDefectsPrompt = getFilmAndDefectsPrompt(request.film);
    if (filmAndDefectsPrompt) {
        finalPrompt += `\n\n**Emulação de Filme e Defeitos Ópticos:** ${filmAndDefectsPrompt}`;
    }

    if (request.negativePrompt) {
        finalPrompt += `\n\n**Prompt Negativo (Exclusões):** Evitar estritamente os seguintes elementos: ${request.negativePrompt}.`;
    }

    finalPrompt += `\n\n**Qualidade de Saída:** A imagem final deve ser renderizada em ultra-alta definição (UHD 8K), simulando uma resolução de ${request.output.resolution} e ${request.output.steps} passos de renderização para garantir detalhes finos e ausência de artefatos.`;

    const modelToUse = request.generationEngine === 'nano_experimental' ? 'gemini-2.5-pro' : 'imagen-4.0-ultra-generate-001';
    const numberOfImages = request.baseImages && request.baseImages.length > 0 ? 1 : request.numberOfImages;

    if (request.baseImages && request.baseImages.length > 0) {
        const parts: Part[] = request.baseImages.map(fileToGenerativePart);
        parts.push({ text: finalPrompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            }
        });

        const images: string[] = [];
        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                }
            }
        }
        return images;

    } else {
         const response = await ai.models.generateImages({
            model: modelToUse,
            prompt: finalPrompt,
            config: {
                numberOfImages: numberOfImages,
                outputMimeType: 'image/jpeg',
            },
        });

        return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
    }
  });
};

export const generateImageWithMultipleProfiles = async (prompt: string, profiles: ConsistencyProfile[]): Promise<Partial<ChatMessage>> => {
    return handleApiCall(async () => {
        const parts: Part[] = [];
        let profileNames = [];
        for (const profile of profiles) {
            profile.images.forEach(img => parts.push(fileToGenerativePart(img)));
            profileNames.push(`'${profile.name}'`);
        }

        const fullPrompt = `Usando as imagens de referência para os perfis ${profileNames.join(' e ')}, execute a seguinte ação: ${prompt}.`;
        parts.push({ text: fullPrompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const images: string[] = [];
        let text = '';
        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    text += part.text;
                } else if (part.inlineData) {
                    images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                }
            }
        }
        
        return {
            text: text || `Imagem editada para: "${prompt}"`,
            images: images.length > 0 ? images : undefined,
        };
    });
};

export const editImageWithPhotographicReality = async (prompt: string, profile: ConsistencyProfile, previousShot?: UploadedImage): Promise<Partial<ChatMessage>> => {
    return handleApiCall(async () => {
        const parts: Part[] = profile.images.map(fileToGenerativePart);
        if (previousShot) {
            parts.push(fileToGenerativePart(previousShot));
        }
        
        const amateurStyle = (profile.photographicRealityStyle === 'amateur' && profile.amateurLevel)
            ? `Simule uma foto de amador (nível ${profile.amateurLevel}).`
            : 'Gere uma imagem com qualidade de estúdio profissional.';
        
        let fullPrompt = `Modo Ensaio Fotográfico. Mantenha a consistência do sujeito do perfil '${profile.name}', suas roupas e o cenário. ${amateurStyle} Ação para esta foto: ${prompt}.`;
        if (previousShot) {
            fullPrompt += ` Esta foto deve ser uma variação da foto anterior, com uma pose ou ângulo de câmera diferente.`;
        }

        parts.push({ text: fullPrompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const images: string[] = [];
        let text = '';
         if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    text += part.text;
                } else if (part.inlineData) {
                    images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                }
            }
        }

        return { text: text || `Foto do ensaio para: "${prompt}"`, images };
    });
};

export const generatePhotoshootVariationPrompt = async (previousShot: UploadedImage, originalPrompt: string): Promise<string> => {
    return handleApiCall(async () => {
        const parts: Part[] = [
            fileToGenerativePart(previousShot),
            { text: `A imagem fornecida é de um ensaio fotográfico. O prompt original era: "${originalPrompt}". Crie um prompt curto e direto para a PRÓXIMA foto do ensaio. Varie a pose, expressão ou ângulo da câmera. Responda apenas com o novo prompt.`}
        ];
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts },
        });
        return response.text.trim();
    });
};

export const analyzeImageStyle = async (image: UploadedImage): Promise<string> => {
    return handleApiCall(async () => {
        const parts: Part[] = [
            fileToGenerativePart(image),
            { text: `Analise esta imagem em detalhes. Descreva a composição, o tipo de iluminação (natural, artificial, dura, suave), o ângulo e a perspectiva da câmera (ex: close-up, plano médio, plongée), as configurações prováveis da câmera (distância focal, abertura), o estilo de cor e a atmosfera geral. Forneça a descrição como um prompt detalhado que poderia ser usado para recriar uma imagem semelhante.`}
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts },
        });
        
        return response.text.trim();
    });
};

export const getCameraScenePreview = async (request: PhotorealisticRequest): Promise<string> => {
    return handleApiCall(async () => {
         let finalPrompt = `Descreva em uma frase como seria uma foto com as seguintes características: ${request.prompt} no seguinte ambiente: ${request.environment}.`;
         finalPrompt += ` ${getAdvancedLightingDescription(request.lighting)}`;
         finalPrompt += ` Capturado com ${getCameraBodyDescription(request.camera.cameraBody)}.`;
         finalPrompt += ` ${getLensDescription(request.camera.lens)}.`;
         finalPrompt += getConceptualPrompt(request);
         finalPrompt += getAtmosphericAndMaterialPrompt(request);
         finalPrompt += getFilmAndDefectsPrompt(request.film);
         const styleDesc = getPhotographicStyleDescription(request.style.base);
         if (styleDesc) {
             finalPrompt += ` ${styleDesc}`;
         }
         if (request.style.customMix) {
             finalPrompt += ` ${request.style.customMix}.`;
         }
         finalPrompt += ' Responda apenas com a descrição da cena.';

         const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: finalPrompt,
         });

         return response.text.trim();
    });
};

export const rerenderFromAngle = async (image: UploadedImage, anglePrompt: string): Promise<Partial<ChatMessage>> => {
  return handleApiCall(async () => {
    const parts: Part[] = [
      fileToGenerativePart(image),
      { text: `Análise volumétrica da imagem fornecida. Reconstrua a cena com base na geometria implícita e renderize uma nova fotografia a partir de uma perspectiva dramaticamente diferente: ${anglePrompt}. O objetivo é simular uma mudança real da posição da câmera no espaço 3D, mantendo a identidade do sujeito, a iluminação original e o estilo artístico. A nova imagem deve parecer uma foto tirada de um novo ponto de vista, não uma distorção 2D.` }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const images: string[] = [];
    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        }
      }
    }

    return {
      text: `Imagem re-renderizada a partir do ângulo: "${anglePrompt}"`,
      images: images.length > 0 ? images : undefined,
    };
  });
};

const getAspectRatioDescription = (aspectRatio: AspectRatio): string => {
    switch (aspectRatio) {
        case '1:1':
            return "Forme uma imagem perfeitamente quadrada (1:1). A imagem original é o centro da composição. Sua tarefa é preencher as áreas ausentes (sejam elas laterais ou superior/inferior) para completar o quadrado. A expansão deve dar continuidade lógica e natural a todos os elementos da cena: objetos, pessoas, texturas e iluminação. Mantenha a proporção dos elementos originais sem distorcer nada.";
        case '16:9':
            return "Crie uma imagem panorâmica de paisagem (16:9), como uma cena de cinema. A imagem original é o ponto focal. Você deve expandir o campo de visão horizontalmente, preenchendo as laterais esquerda e direita. Imagine que a câmera se afastou, revelando mais do ambiente. Continue a cena, objetos e pessoas de forma coesa, mantendo o estilo fotográfico original.";
        case '9:16':
            return "Gere uma imagem alta, no formato de retrato vertical (9:16), ideal para stories. A imagem original deve permanecer centralizada. Sua tarefa é preencher o espaço vertical, adicionando conteúdo acima e abaixo da imagem original. Expanda a cena de forma lógica, mostrando mais do céu, do chão, ou completando o corpo de uma pessoa. A continuidade visual é crucial.";
        case '4:3':
            return "Expanda a imagem para o formato clássico de paisagem (4:3), como uma fotografia tradicional. Mantenha a imagem original no centro e preencha as laterais para atingir a proporção. A expansão deve ser uma continuação natural da cena, preservando a composição, iluminação e os detalhes dos objetos e pessoas existentes.";
        case '3:4':
            return "Transforme a imagem em um formato de retrato clássico (3:4). A imagem original é o elemento central. Você deve preencher as áreas superior e inferior para criar a composição vertical. Dê continuidade à cena, objetos e pessoas de maneira fotorrealista, mantendo a integridade e o estilo da imagem original sem cortes ou duplicações.";
        default:
            return `uma imagem na proporção de ${aspectRatio}, dando continuidade natural à cena.`;
    }
};

export const expandImage = async (request: ExpandImageRequest): Promise<Partial<ChatMessage>> => {
    return handleApiCall(async () => {
        const aspectRatioDescription = getAspectRatioDescription(request.aspectRatio);

        const prompt = `Missão Crítica de Expansão de Imagem (Outpainting) - MODO DE PRECISÃO MÁXIMA

**Cenário:** A imagem fornecida é um recorte de alta qualidade de uma cena fotográfica maior. Considere-a como a "verdade absoluta" do centro da composição.

**Sua Tarefa Imperativa:** Você deve expandir o canvas da imagem para ${aspectRatioDescription}. Sua função é preencher as áreas ausentes de forma tão perfeita que seja impossível distinguir o conteúdo original do conteúdo gerado. O resultado final deve ser uma única imagem, 100% coesa e completa.

**DIRETRIZES NÃO-NEGOCIÁVEIS:**

1.  **FIDELIDADE FOTOGRÁFICA TOTAL (100%):** A expansão DEVE ser uma continuação exata e indistinguível da imagem original. Isso inclui, mas não se limita a:
    *   **Iluminação e Sombras:** A direção, qualidade (dura/suave) e cor da luz devem ser perfeitamente consistentes. Sombras projetadas devem continuar com o ângulo e a nitidez corretos.
    *   **Paleta de Cores e Gradação:** A gradação de cores (color grading) e o balanço de branco devem ser idênticos.
    *   **Texturas e Materiais:** Continue as texturas de superfícies (pele, tecido, madeira, etc.) de forma realista.
    *   **Características da Lente:** Replique a profundidade de campo (bokeh), a nitidez, a vinheta, a distorção da lente e quaisquer aberrações cromáticas presentes na imagem original.
    *   **Ruído/Granulação:** O ruído do sensor ou a granulação do filme devem ser uniformes em toda a imagem, incluindo as novas áreas. A transição deve ser invisível.

2.  **TOLERÂNCIA ZERO PARA DUPLICAÇÃO:** É estritamente proibido copiar, clonar, espelhar ou repetir qualquer objeto, padrão ou elemento distinto da imagem original nas áreas expandidas. A IA deve gerar conteúdo completamente novo e original que continue a cena de forma lógica e criativa. A detecção de qualquer duplicação resultará em falha da missão.

3.  **COMPOSIÇÃO COMPLETA E SEM CORTES:** A imagem final não deve conter elementos que pareçam cortados ou que terminem abruptamente nas bordas do novo enquadramento. Se um objeto (como um braço de uma pessoa ou o topo de uma árvore) se estende para a nova área, ele deve ser renderizado em sua totalidade de uma maneira que faça sentido composicional e contextual. A composição final deve parecer intencional e completa.

4.  **DIREÇÃO CRIATIVA (Contexto):** Para guiar o preenchimento das áreas expandidas, use a seguinte instrução: "${request.prompt || 'Continue a cena de forma natural e fotorrealista. Expanda o ambiente, os elementos e as pessoas existentes de maneira lógica e esteticamente agradável, completando a história visual da imagem.'}".

**VERIFICAÇÃO FINAL:** Antes de finalizar, revise a imagem gerada em relação a todas as diretrizes acima. O resultado deve ser uma única fotografia impecável, expandida, que parece ter sido capturada originalmente na proporção final solicitada.`;
        
        const parts: Part[] = [
            fileToGenerativePart(request.image),
            { text: prompt }
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const images: string[] = [];
        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                }
            }
        }
        return {
            text: `Imagem expandida para ${request.aspectRatio}.`,
            images: images.length > 0 ? images : undefined,
        };
    });
};

export const generateImageLabComposition = async (request: ImageLabRequest): Promise<Partial<ChatMessage>> => {
    return handleApiCall(async () => {
        const parts: Part[] = [];
        let prompt = `Crie uma nova e coesa imagem fotorrealista combinando os seguintes elementos. A imagem final deve ter ${request.numberOfImages} variações. \n`;

        if (request.subject.images.length > 0 || request.subject.prompt) {
            prompt += `\n**1. Personagem/Objeto Principal:**\n`;
            if (request.subject.images.length > 0) {
                prompt += `- Use as imagens de referência fornecidas para o sujeito principal. Mantenha sua aparência fiel.\n`;
                request.subject.images.forEach(img => parts.push(fileToGenerativePart(img)));
            }
            if (request.subject.prompt) prompt += `- Descrição textual do sujeito: ${request.subject.prompt}\n`;
        }

        if (request.scenery.images.length > 0 || request.scenery.prompt) {
            prompt += `\n**2. Cenário e Ambiente:**\n`;
            if (request.scenery.images.length > 0) {
                prompt += `- O cenário deve ser inspirado nas imagens de referência de cenário.\n`;
                request.scenery.images.forEach(img => parts.push(fileToGenerativePart(img)));
            }
            if (request.scenery.prompt) prompt += `- Descrição textual do cenário: ${request.scenery.prompt}\n`;
        }
        
        if (request.style.images.length > 0 || request.style.prompt) {
            prompt += `\n**3. Estilo Visual e Iluminação:**\n`;
            if (request.style.images.length > 0) {
                prompt += `- O estilo artístico, a paleta de cores e a iluminação devem ser baseados nas imagens de referência de estilo.\n`;
                request.style.images.forEach(img => parts.push(fileToGenerativePart(img)));
            }
            if (request.style.prompt) prompt += `- Descrição textual do estilo: ${request.style.prompt}\n`;
        }
        
        if (request.extra.images.length > 0 || request.extra.prompt) {
            prompt += `\n**4. Elementos Extras:**\n`;
            if (request.extra.images.length > 0) {
                prompt += `- Inclua objetos ou elementos inspirados nas imagens de referência extras.\n`;
                request.extra.images.forEach(img => parts.push(fileToGenerativePart(img)));
            }
            if (request.extra.prompt) prompt += `- Descrição textual dos extras: ${request.extra.prompt}\n`;
        }
        
        prompt += `\n**5. Composição e Qualidade Final:**\n`;
        if(request.perspective) prompt += `- A perspectiva da câmera deve ser: ${request.perspective}.\n`;
        
        if (request.mode === 'professional') {
            prompt += `- A qualidade final deve ser de estúdio profissional: alta nitidez, iluminação perfeita, e detalhes fotorrealistas.\n`;
        } else if (request.mode === 'amateur') {
            prompt += `- A qualidade final deve simular uma foto de amador (nível ${request.amateurLevel || 3}), com imperfeições realistas.\n`;
        }
        
        if (request.isPhotoshoot) {
            prompt += `- Gere uma série de ${request.numberOfImages} fotos como se fosse um ensaio fotográfico, variando a pose e o ângulo sutilmente entre cada imagem.\n`;
        }

        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const images: string[] = [];
        let text = '';
        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    text += part.text;
                } else if (part.inlineData) {
                    images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                }
            }
        }
        return {
            text: text || "Resultado da composição do Laboratório de Imagens.",
            images: images.length > 0 ? images : undefined,
        };
    });
};