export type HiggsfieldModel =
  | 'higgsfield/aurora'
  | 'higgsfield/video-enhance'
  | 'higgsfield/img2video'
  | 'higgsfield/virality'
  | 'higgsfield/angles'
  | 'higgsfield/shots'
  | 'higgsfield/expand';

export type HiggsfieldCategory =
  | 'text-to-video'
  | 'image-to-video'
  | 'video-effects'
  | 'professional';

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface HiggsfieldGenerationRequest {
  model: HiggsfieldModel;
  prompt: string;
  image_url?: string;
  duration?: number;
  resolution?: '480p' | '720p' | '1080p';
  aspect_ratio?: '16:9' | '9:16' | '1:1' | '4:3';
  style?: string;
}

export interface HiggsfieldGeneration {
  id: string;
  status: GenerationStatus;
  model: HiggsfieldModel;
  prompt: string;
  video_url?: string;
  thumbnail_url?: string;
  error?: string;
  created_at: string;
  completed_at?: string;
}

export interface EffectDefinition {
  id: HiggsfieldModel;
  label: string;
  category: HiggsfieldCategory;
  description: string;
  supportsImage: boolean;
  supportsText: boolean;
  badge?: 'NEW' | 'PRO';
}
