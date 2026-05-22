import { HiggsfieldClient } from '@higgsfield/client';
import type { InputImage } from '@higgsfield/client';

let _client: HiggsfieldClient | null = null;

export function getHiggsfieldClient(): HiggsfieldClient {
  if (!_client) {
    const apiKey    = process.env.HF_API_KEY;
    const apiSecret = process.env.HF_SECRET;
    if (!apiKey) throw new Error('HF_API_KEY environment variable is not set. Get your key at https://cloud.higgsfield.ai/api-keys');
    _client = new HiggsfieldClient({ apiKey: apiKey ?? '', apiSecret: apiSecret ?? '' });
  }
  return _client;
}

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface GenerationResult {
  id: string;
  status: GenerationStatus;
  video_url?: string;
  image_url?: string;
  thumbnail_url?: string;
  error?: string;
  prompt?: string;
}

export interface TextToVideoParams {
  prompt: string;
  model?: 'lite' | 'turbo' | 'standard';
  motion_id?: string;
  duration?: number;
  seed?: number;
}

export interface ImageToVideoParams {
  image_url: string;
  prompt?: string;
  model?: 'lite' | 'turbo' | 'standard';
  motion_id?: string;
  seed?: number;
}

export interface TextToImageParams {
  prompt: string;
  style_id?: string;
  width_and_height?: '512x512' | '768x512' | '512x768' | '1024x768' | '768x1024';
  quality?: 'normal' | 'high';
  batch_size?: number;
  seed?: number;
}

export async function generateTextToVideo(params: TextToVideoParams): Promise<GenerationResult> {
  const client  = getHiggsfieldClient();
  const motions = await client.getMotions();
  const motion  = params.motion_id
    ? motions.find((m: { id: string }) => m.id === params.motion_id)
    : motions[0];

  const jobSet = await client.generate('/v1/image2video/dop', {
    model: params.model ?? 'turbo',
    prompt: params.prompt,
    input_images: [],
    motions: motion ? [{ motion_id: motion.id, motion_strength: 0.8 }] : [],
    ...(params.seed !== undefined && { seed: params.seed }),
  });

  const job = jobSet.jobs?.[0];
  return {
    id: job?.id ?? jobSet.id ?? '',
    status: (job?.status ?? 'pending') as GenerationStatus,
    video_url: job?.results?.raw?.url ?? job?.results?.min?.url ?? undefined,
    prompt: params.prompt,
  };
}

export async function generateImageToVideo(params: ImageToVideoParams): Promise<GenerationResult> {
  const client  = getHiggsfieldClient();
  const motions = await client.getMotions();
  const motion  = params.motion_id
    ? motions.find((m: { id: string }) => m.id === params.motion_id)
    : motions[0];

  const inputImage = { type: 'image_url', image_url: params.image_url } as InputImage;

  const jobSet = await client.generate('/v1/image2video/dop', {
    model: params.model ?? 'turbo',
    prompt: params.prompt ?? '',
    input_images: [inputImage],
    motions: motion ? [{ motion_id: motion.id, motion_strength: 0.8 }] : [],
  });

  const job = jobSet.jobs?.[0];
  return {
    id: job?.id ?? jobSet.id ?? '',
    status: (job?.status ?? 'pending') as GenerationStatus,
    video_url: job?.results?.raw?.url ?? job?.results?.min?.url ?? undefined,
  };
}

export async function generateImage(params: TextToImageParams): Promise<GenerationResult> {
  const client = getHiggsfieldClient();
  const jobSet = await client.generate('/v1/text2image/soul', {
    prompt: params.prompt,
    width_and_height: params.width_and_height ?? '768x512',
    quality: params.quality ?? 'normal',
    batch_size: params.batch_size ?? 1,
    ...(params.style_id && { style_id: params.style_id }),
    ...(params.seed !== undefined && { seed: params.seed }),
  });

  const job = jobSet.jobs?.[0];
  return {
    id: job?.id ?? jobSet.id ?? '',
    status: (job?.status ?? 'pending') as GenerationStatus,
    image_url: job?.results?.raw?.url ?? job?.results?.min?.url ?? undefined,
    prompt: params.prompt,
  };
}

export async function getMotions() {
  return getHiggsfieldClient().getMotions();
}

export async function getStyles() {
  return getHiggsfieldClient().getSoulStyles();
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
