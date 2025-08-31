

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type Model = 'AUTO' | 'gemini-2.5-flash' | 'imagen-4.0-generate-001' | 'gemini-2.5-flash-image-preview' | 'gemini-2.5-flash-grounded' | 'veo-2.0-generate-001';
export type ConsistencyMode = 'normal' | 'professional' | 'amateur' | 'photographic_reality';
export type AdditionalStyle = 'none' | 'ghibli' | 'anime' | '3d_render' | 'oil_painting' | 'pencil_drawing' | 'cinematic' | 'watercolor' | 'sketch' | 'concept_art' | 'vaporwave';

export interface GenerationConfig {
  numberOfImages: number;
  aspectRatio: AspectRatio;
  model: Model;
  outputMimeType: 'image/jpeg' | 'image/png';
}

export interface UploadedImage {
  base64: string;
  mimeType: string;
  name: string;
}

export interface ConsistencyProfile {
  id: string;
  name: string;
  images: UploadedImage[];
  consistencyMode: ConsistencyMode;
  additionalStyle: AdditionalStyle;
  amateurLevel?: number;
  photographicRealityStyle?: 'professional' | 'amateur';
  photoshootShots?: number;
}

export interface ChatMessage {
  id:string;
  role: 'user' | 'model';
  text: string;
  images?: string[]; // base64 image strings for model response
  status?: 'loading' | 'error' | 'done';
}

export interface AdvancedEditRequest {
  subject: string;
  action: string;
  style: string;
  negativePrompt: string;
  baseImage: UploadedImage;
  profileId?: string;
}

export interface ExpandImageRequest {
  image: UploadedImage;
  aspectRatio: AspectRatio;
  prompt: string;
}

// Tipos para o novo Estúdio Fotográfico
export type LightSource = 'natural_daylight' | 'golden_hour_sun' | 'studio_flash' | 'ring_light' | 'neon_city' | 'dramatic_spotlight' | 'tungsten_bulb' | 'fluorescent_light' | 'led_panel' | 'candlelight';
export type TimeOfDay = 'amanhecer' | 'meio-dia' | 'por_do_sol' | 'hora_azul' | 'noite';
export type LensType = string;
export type SensorType = string;
export type PhotographicStyle = 'nenhum' | 'fotografia_de_rua' | 'moda_editorial' | 'retrato_natural' | 'glamour_hollywood' | 'lifestyle' | 'cinematografico';

export type FilmStock = 'none' | 'kodak_portra_400' | 'fuji_velvia_50' | 'ilford_hp5_400' | 'kodak_ektar_100' | 'cinestill_800t' | 'polaroid_600';

export interface PhotoDefects {
  dustAndScratches: boolean;
  lensFlare: 'none' | 'subtle' | 'dramatic' | 'imperfect';
  cameraShake: 'none' | 'slight' | 'heavy';
  lightLeaks: boolean;
  filmGrain: 'none' | 'fine' | 'medium' | 'heavy';
  sensorSpots: boolean;
  negativeScratches: boolean;
}

export interface PhotorealisticRequest {
  prompt: string;
  profileId?: string;
  useProfileForConsistency?: boolean;
  baseImages?: UploadedImage[];
  baseImageMode?: 'consistency' | 'reference';
  numberOfImages: number;
  autoEquip?: boolean;
  generationEngine?: 'imagen_4' | 'nano_experimental';
  environment: string;
  lighting: {
    timeOfDay: TimeOfDay;
    source: LightSource;
    quality: 'difusa' | 'dura';
    angle: 'frontal' | 'lateral' | 'contra-luz' | 'superior';
    intensity: 'fraca' | 'media' | 'forte';
    fillLight: boolean;
    rimLight: boolean;
  };
  camera: {
    cameraBody: string;
    lens: LensType;
    sensor: SensorType;
    aperture: string;
    shutterSpeed: string;
    iso: string;
    lensDistortion: 'none' | 'barrel' | 'pincushion' | 'fisheye';
    chromaticAberration: 'none' | 'low' | 'high';
    lensTilt: 'none' | 'subtle' | 'strong';
    lensShift: 'none' | 'subtle' | 'strong';
  };
  depthOfField: {
    focusPoint: string;
    bokehQuality: 'cremoso' | 'nervoso' | 'vintage_remolino';
    bokehIntensity: 'subtle' | 'medium' | 'strong';
  };
  style: {
    base: PhotographicStyle;
    customMix: string;
  };
  atmosphere: {
    type: 'none' | 'fog' | 'mist' | 'rain' | 'dust_particles';
    density: 'light' | 'medium' | 'heavy';
    lightPhysics: string;
  };
  materialProperties: string;
  conceptual: {
    prompt: string;
    sequence: {
      type: 'none' | 'timeline' | 'style_variation' | 'psychological_states';
      description: string;
    };
  };
  output: {
    format: string;
    quality: number;
    filter: 'none' | 'vivid';
    steps: 'low' | 'medium' | 'high' | 'ultra';
    resolution: 'hd' | 'qhd' | 'uhd4k' | 'uhd8k';
  };
  film: {
    stock: FilmStock;
    defects: PhotoDefects;
  };
}

export interface ImageLabSlotData {
  images: UploadedImage[];
  prompt: string;
}

export interface ImageLabRequest {
  subject: ImageLabSlotData;
  scenery: ImageLabSlotData;
  style: ImageLabSlotData;
  extra: ImageLabSlotData;
  numberOfImages: number;
  mode: 'normal' | 'professional' | 'amateur';
  amateurLevel?: number;
  isPhotoshoot: boolean;
  perspective?: string;
}

export type ActiveTab = 'profiles' | 'analyzer' | 'advanced' | 'studio' | 'study' | 'manual' | 'lab' | 'motores' | 'expand' | 'volumetrics';