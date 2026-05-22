import type {
  HiggsfieldGenerationRequest,
  HiggsfieldGeneration,
  EffectDefinition,
} from '@/types/higgsfield';

const BASE_URL = 'https://api.higgsfield.ai/v1';

function getApiKey(): string {
  const key = process.env.HIGGSFIELD_API_KEY;
  if (!key) throw new Error('HIGGSFIELD_API_KEY environment variable is not set.');
  return key;
}

function headers() {
  return {
    'Authorization': `Bearer ${getApiKey()}`,
    'Content-Type': 'application/json',
  };
}

export async function createGeneration(
  request: HiggsfieldGenerationRequest,
): Promise<HiggsfieldGeneration> {
  const res = await fetch(`${BASE_URL}/video/generations`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Higgsfield API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<HiggsfieldGeneration>;
}

export async function getGeneration(id: string): Promise<HiggsfieldGeneration> {
  const res = await fetch(`${BASE_URL}/video/generations/${id}`, {
    headers: headers(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Higgsfield API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<HiggsfieldGeneration>;
}

export const HIGGSFIELD_EFFECTS: EffectDefinition[] = [
  {
    id: 'higgsfield/aurora',
    label: 'Aurora',
    category: 'text-to-video',
    description: 'Generate stunning cinematic videos from a text prompt.',
    supportsImage: false,
    supportsText: true,
  },
  {
    id: 'higgsfield/img2video',
    label: 'Image to Video',
    category: 'image-to-video',
    description: 'Animate any still image into a dynamic video clip.',
    supportsImage: true,
    supportsText: true,
    badge: 'NEW',
  },
  {
    id: 'higgsfield/video-enhance',
    label: 'Video Enhance',
    category: 'video-effects',
    description: 'Upscale and enhance video quality with AI restoration.',
    supportsImage: true,
    supportsText: false,
  },
  {
    id: 'higgsfield/angles',
    label: 'Angles 2.0',
    category: 'professional',
    description: 'Generate any camera angle or view from a single image.',
    supportsImage: true,
    supportsText: true,
    badge: 'PRO',
  },
  {
    id: 'higgsfield/shots',
    label: 'Shots',
    category: 'professional',
    description: '9 unique cinematic shots from one image in seconds.',
    supportsImage: true,
    supportsText: false,
    badge: 'PRO',
  },
  {
    id: 'higgsfield/expand',
    label: 'Expand Image',
    category: 'professional',
    description: 'Extend any image beyond its borders using AI outpainting.',
    supportsImage: true,
    supportsText: true,
  },
  {
    id: 'higgsfield/virality',
    label: 'Virality Predictor',
    category: 'professional',
    description: 'Predict how viral your video hook will be before you post.',
    supportsImage: true,
    supportsText: true,
  },
];
