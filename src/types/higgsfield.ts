export type HiggsfieldEndpoint = 'image2video' | 'text2image' | 'soul';

export type HiggsfieldCategory =
  | 'text-to-video'
  | 'image-to-video'
  | 'video-effects'
  | 'professional';

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface EffectDefinition {
  endpoint: HiggsfieldEndpoint;
  label: string;
  category: HiggsfieldCategory;
  description: string;
  supportsImage: boolean;
  supportsText: boolean;
  badge?: 'NEW' | 'PRO';
}
