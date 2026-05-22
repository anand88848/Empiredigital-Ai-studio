import type { HiggsfieldGenerateRequest, HiggsfieldJob } from '@/types/higgsfield';

const BASE_URL = 'https://platform.higgsfield.ai';

function authHeader(): string {
  const key = process.env.HIGGSFIELD_API_KEY ?? '';
  if (!key) throw new Error('HIGGSFIELD_API_KEY is not set');
  return key.includes(':') ? `Key ${key}` : `Bearer ${key}`;
}

function headers() {
  return {
    'Authorization': authHeader(),
    'Content-Type': 'application/json',
  };
}

// Map our effect names to Higgsfield endpoint paths
const EFFECT_ENDPOINTS: Record<string, string> = {
  aurora:          '/v1/aurora',
  image2video:     '/v1/image2video/dop',
  'video-enhance': '/v1/video/enhance',
  angles:          '/v1/angles',
  shots:           '/v1/shots',
  'expand-image':  '/v1/expand-image',
  virality:        '/v1/virality',
};

export async function createGeneration(req: HiggsfieldGenerateRequest): Promise<{ job_id: string }> {
  const endpoint = EFFECT_ENDPOINTS[req.effect];
  if (!endpoint) throw new Error(`Unknown effect: ${req.effect}`);

  const body: Record<string, unknown> = {};
  if (req.prompt)       body.prompt       = req.prompt;
  if (req.image_url)    body.image_url    = req.image_url;
  if (req.video_url)    body.video_url    = req.video_url;
  if (req.duration)     body.duration     = req.duration;
  if (req.aspect_ratio) body.aspect_ratio = req.aspect_ratio;
  if (req.quality)      body.quality      = req.quality;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Higgsfield API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return { job_id: data.job_id ?? data.id };
}

export async function getJobStatus(jobId: string): Promise<HiggsfieldJob> {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
    headers: headers(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Higgsfield API error ${res.status}: ${text}`);
  }

  return res.json();
}
