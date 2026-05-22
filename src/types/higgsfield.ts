export type HiggsfieldEffect =
  | 'aurora'
  | 'image2video'
  | 'video-enhance'
  | 'angles'
  | 'shots'
  | 'expand-image'
  | 'virality';

export interface HiggsfieldGenerateRequest {
  effect: HiggsfieldEffect;
  prompt?: string;
  image_url?: string;
  video_url?: string;
  duration?: number;
  aspect_ratio?: '16:9' | '9:16' | '1:1' | '4:3';
  quality?: 'standard' | 'high';
}

export interface HiggsfieldJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  output_url?: string;
  thumbnail_url?: string;
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface HiggsfieldGenerateResponse {
  job_id: string;
  status: string;
}

export const HIGGSFIELD_EFFECTS: Record<HiggsfieldEffect, { label: string; description: string; requiresImage: boolean; requiresVideo: boolean; requiresPrompt: boolean }> = {
  aurora: {
    label: 'Aurora (Text → Video)',
    description: 'Generate cinematic video from a text prompt.',
    requiresImage: false,
    requiresVideo: false,
    requiresPrompt: true,
  },
  image2video: {
    label: 'Image → Video',
    description: 'Animate a still image into smooth video.',
    requiresImage: true,
    requiresVideo: false,
    requiresPrompt: false,
  },
  'video-enhance': {
    label: 'Video Enhance',
    description: 'Upscale and denoise an existing video.',
    requiresImage: false,
    requiresVideo: true,
    requiresPrompt: false,
  },
  angles: {
    label: 'Angles 2.0',
    description: 'Generate multi-angle shots from one image.',
    requiresImage: true,
    requiresVideo: false,
    requiresPrompt: false,
  },
  shots: {
    label: 'Shots',
    description: 'Create dynamic camera movements around a subject.',
    requiresImage: true,
    requiresVideo: false,
    requiresPrompt: true,
  },
  'expand-image': {
    label: 'Expand Image',
    description: 'Outpaint an image to a wider canvas.',
    requiresImage: true,
    requiresVideo: false,
    requiresPrompt: false,
  },
  virality: {
    label: 'Virality Predictor',
    description: 'Score and optimise a video for social reach.',
    requiresImage: false,
    requiresVideo: true,
    requiresPrompt: false,
  },
};
