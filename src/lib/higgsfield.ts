const BASE_URL = process.env.HIGGSFIELD_API_URL ?? 'https://fnf.higgsfield.ai';

function authHeader(): string {
  const key = process.env.HIGGSFIELD_API_KEY ?? '';
  if (!key) throw new Error('HIGGSFIELD_API_KEY is not set');
  return `Bearer ${key}`;
}

function headers() {
  return {
    'Authorization': authHeader(),
    'Content-Type': 'application/json',
  };
}

export interface CreateJobRequest {
  job_set_type: string;
  prompt?: string;
  aspect_ratio?: string;
  [key: string]: unknown;
}

export interface HiggsfieldJob {
  id: string;
  status?: string;
  result_url?: string;
  thumbnail_url?: string;
  job_set_type?: string;
  error?: string;
}

export async function createJob(params: CreateJobRequest): Promise<HiggsfieldJob> {
  const res = await fetch(`${BASE_URL}/agents/jobs`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Higgsfield ${res.status}: ${text}`);
  }

  return res.json();
}

export async function getJob(jobId: string): Promise<HiggsfieldJob> {
  const res = await fetch(`${BASE_URL}/agents/jobs/${jobId}`, {
    headers: headers(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Higgsfield ${res.status}: ${text}`);
  }

  return res.json();
}

export async function listModels(): Promise<unknown[]> {
  const res = await fetch(`${BASE_URL}/agents/models`, {
    headers: headers(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Higgsfield ${res.status}: ${text}`);
  }

  return res.json();
}
