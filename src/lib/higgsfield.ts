const BASE_URL = 'https://api.higgsfield.ai/v1';

function getApiKey(): string {
  const key = process.env.HIGGSFIELD_API_KEY;
  if (!key) throw new Error('HIGGSFIELD_API_KEY environment variable is not set.');
  return key;
}

function headers() {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    'Content-Type': 'application/json',
  };
}

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface GenerationResult {
  id: string;
  status: GenerationStatus;
  video_url?: string;
  thumbnail_url?: string;
  error?: string;
  created_at: string;
  prompt?: string;
}

export interface TextToVideoParams {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  duration?: number;
  seed?: number;
  negative_prompt?: string;
}

export interface ImageToVideoParams {
  image_url: string;
  prompt?: string;
  model?: string;
  duration?: number;
  seed?: number;
}

export interface VideoEffectParams {
  video_url: string;
  effect: string;
  strength?: number;
}

export async function createTextToVideo(params: TextToVideoParams): Promise<GenerationResult> {
  const res = await fetch(`${BASE_URL}/generations`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      type: 'text-to-video',
      prompt: params.prompt,
      model: params.model ?? 'higgsfield-1',
      width: params.width ?? 1280,
      height: params.height ?? 720,
      duration: params.duration ?? 4,
      ...(params.seed !== undefined && { seed: params.seed }),
      ...(params.negative_prompt && { negative_prompt: params.negative_prompt }),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Higgsfield API error: ${res.status}`);
  }
  return res.json() as Promise<GenerationResult>;
}

export async function createImageToVideo(params: ImageToVideoParams): Promise<GenerationResult> {
  const res = await fetch(`${BASE_URL}/generations`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      type: 'image-to-video',
      image_url: params.image_url,
      model: params.model ?? 'higgsfield-1',
      duration: params.duration ?? 4,
      ...(params.prompt && { prompt: params.prompt }),
      ...(params.seed !== undefined && { seed: params.seed }),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Higgsfield API error: ${res.status}`);
  }
  return res.json() as Promise<GenerationResult>;
}

export async function applyVideoEffect(params: VideoEffectParams): Promise<GenerationResult> {
  const res = await fetch(`${BASE_URL}/effects`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      video_url: params.video_url,
      effect: params.effect,
      strength: params.strength ?? 0.8,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Higgsfield API error: ${res.status}`);
  }
  return res.json() as Promise<GenerationResult>;
}

export async function getGeneration(id: string): Promise<GenerationResult> {
  const res = await fetch(`${BASE_URL}/generations/${id}`, {
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Higgsfield API error: ${res.status}`);
  }
  return res.json() as Promise<GenerationResult>;
}

export const HIGGSFIELD_EFFECTS = [
  { id: 'virality-predictor', label: 'Virality Predictor' },
  { id: 'similarity-score',   label: 'Similarity Score'   },
  { id: 'angles-2',           label: 'Angles 2.0'         },
  { id: 'shots',              label: 'Shots'               },
  { id: 'expand',             label: 'Expand Image'        },
  { id: 'style-transfer',     label: 'Style Transfer'      },
  { id: 'face-identity',      label: 'Face & Identity'     },
  { id: 'video-enhance',      label: 'Video Enhance'       },
] as const;

export type HiggsfieldEffect = (typeof HIGGSFIELD_EFFECTS)[number]['id'];
