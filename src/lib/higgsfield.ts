import type { EffectDefinition } from '@/types/higgsfield';

// Correct base URL from official higgsfield-ai/higgsfield-js SDK
const BASE_URL = 'https://platform.higgsfield.ai';

function getCredentials(): string {
  const key = process.env.HIGGSFIELD_API_KEY;
  if (!key) throw new Error('HIGGSFIELD_API_KEY environment variable is not set.');
  return key;
}

// Auth format: "Key KEY_ID:KEY_SECRET"
function headers() {
  return {
    'Authorization': `Key ${getCredentials()}`,
    'Content-Type': 'application/json',
  };
}

export interface HiggsfieldJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: { raw: { url: string } };
  error?: string;
  created_at?: string;
}

export interface ImageToVideoRequest {
  model: 'dop-turbo' | 'dop';
  prompt: string;
  input_images: Array<{ type: 'image_url'; image_url: string }>;
}

export interface TextToImageRequest {
  aspect_ratio: '1:1' | '16:9' | '9:16' | '4:3';
  prompt: string;
  safety_tolerance?: number;
  seed?: number;
}

export async function createImageToVideo(request: ImageToVideoRequest): Promise<HiggsfieldJob> {
  const res = await fetch(`${BASE_URL}/v1/image2video/dop`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ input: request }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Higgsfield API ${res.status}: ${text}`);
  }
  return res.json() as Promise<HiggsfieldJob>;
}

export async function createTextToImage(request: TextToImageRequest): Promise<HiggsfieldJob> {
  const res = await fetch(`${BASE_URL}/flux-pro/kontext/max/text-to-image`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ input: request }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Higgsfield API ${res.status}: ${text}`);
  }
  return res.json() as Promise<HiggsfieldJob>;
}

export async function createSoulImage(request: TextToImageRequest): Promise<HiggsfieldJob> {
  const res = await fetch(`${BASE_URL}/v1/text2image/soul`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ input: request }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Higgsfield API ${res.status}: ${text}`);
  }
  return res.json() as Promise<HiggsfieldJob>;
}

export async function getJob(id: string): Promise<HiggsfieldJob> {
  const res = await fetch(`${BASE_URL}/jobs/${id}`, {
    headers: headers(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Higgsfield API ${res.status}: ${text}`);
  }
  return res.json() as Promise<HiggsfieldJob>;
}

export type HiggsfieldEndpoint = 'image2video' | 'text2image' | 'soul';

export const HIGGSFIELD_EFFECTS: EffectDefinition[] = [
  {
    endpoint: 'image2video',
    label: 'DoP — Image to Video',
    category: 'image-to-video',
    description: 'Animate any still image into a cinematic video clip using the DoP model.',
    supportsImage: true,
    supportsText: true,
    badge: 'NEW',
  },
  {
    endpoint: 'text2image',
    label: 'Flux Pro — Text to Image',
    category: 'text-to-video',
    description: 'Generate high-quality images from a text prompt using Flux Pro Kontext Max.',
    supportsImage: false,
    supportsText: true,
  },
  {
    endpoint: 'soul',
    label: 'Soul — Styled Image',
    category: 'text-to-video',
    description: 'Create stylised artistic images from text with the Soul model.',
    supportsImage: false,
    supportsText: true,
  },
];
