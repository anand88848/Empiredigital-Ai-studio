export interface HiggsfieldJob {
  id: string;
  status?: string;
  result_url?: string;
  thumbnail_url?: string;
  job_set_type?: string;
  error?: string;
}

// Known models from the Higgsfield CLI — run `higgsfield model list` to see all
export const KNOWN_MODELS = [
  { value: 'nano_banana_2',   label: 'Nano Banana 2',    type: 'image', description: 'Fast product & lifestyle image generation' },
  { value: 'soul_cinematic',  label: 'Soul Cinematic',   type: 'video', description: 'Cinematic video generation from text/image' },
] as const;

export const ASPECT_RATIOS = ['1:1', '4:3', '16:9', '9:16', '3:4'] as const;
export type AspectRatio = typeof ASPECT_RATIOS[number];
