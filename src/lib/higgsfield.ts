/**
 * Higgsfield API client.
 *
 * NOTE: Higgsfield does not publish a stable public REST API at the time of
 * writing. The endpoint paths below are placeholders modelled on common
 * video-generation APIs (job submit + poll). When you obtain real Higgsfield
 * API docs, update `BASE_URL` and the three request shapes (submit, status,
 * result mapping). Everything else — routes, UI, polling — will keep working.
 */

const BASE_URL = process.env.HIGGSFIELD_API_BASE ?? 'https://api.higgsfield.ai/v1';

export type HiggsfieldModel = 'lite' | 'standard' | 'turbo' | 'cinema';
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';

export interface GenerateVideoInput {
  prompt: string;
  model?: HiggsfieldModel;
  durationSec?: number;
  aspectRatio?: AspectRatio;
  seed?: number;
  imageUrl?: string;
}

export interface GenerateVideoResponse {
  jobId: string;
}

export type JobStatus = 'queued' | 'processing' | 'succeeded' | 'failed';

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  progress?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

function getApiKey(): string {
  const key = process.env.HIGGSFIELD_API_KEY;
  if (!key) {
    throw new Error(
      'HIGGSFIELD_API_KEY is not set. Add it to .env.local to enable video generation.',
    );
  }
  return key;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Higgsfield ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function submitGeneration(
  input: GenerateVideoInput,
): Promise<GenerateVideoResponse> {
  return request<GenerateVideoResponse>('/videos/generate', {
    method: 'POST',
    body: JSON.stringify({
      prompt: input.prompt,
      model: input.model ?? 'standard',
      duration_sec: input.durationSec ?? 5,
      aspect_ratio: input.aspectRatio ?? '16:9',
      seed: input.seed,
      image_url: input.imageUrl,
    }),
  });
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  return request<JobStatusResponse>(`/videos/jobs/${encodeURIComponent(jobId)}`, {
    method: 'GET',
  });
}
