'use client';

export async function getMediaDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url     = URL.createObjectURL(file);
    const el      = file.type.startsWith('video') ? document.createElement('video') : document.createElement('audio');
    el.preload    = 'metadata';
    el.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(el.duration); };
    el.onerror          = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load media')); };
    el.src              = url;
  });
}

export async function generateVideoThumbnail(file: File, time = 1): Promise<string> {
  return new Promise((resolve, reject) => {
    const url    = URL.createObjectURL(file);
    const video  = document.createElement('video');
    const canvas = document.createElement('canvas');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(time, video.duration * 0.1);
    };
    video.onseeked = () => {
      canvas.width  = 320;
      canvas.height = 180;
      canvas.getContext('2d')?.drawImage(video, 0, 0, 320, 180);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Thumbnail failed')); };
    video.src = url;
  });
}

export function buildVideoFilterString(adj: {
  brightness: number; contrast: number; saturation: number; hue: number; blur: number;
}): string {
  const filters: string[] = [];
  if (adj.blur > 0) filters.push(`blur(${adj.blur}px)`);
  filters.push(`brightness(${adj.brightness}%)`);
  filters.push(`contrast(${adj.contrast}%)`);
  filters.push(`saturate(${adj.saturation}%)`);
  filters.push(`hue-rotate(${adj.hue}deg)`);
  return filters.join(' ');
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/');
}

export const ACCEPTED_VIDEO_TYPES: Record<string, string[]> = {
  'video/mp4':       ['.mp4'],
  'video/webm':      ['.webm'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
  'video/x-matroska':['.mkv'],
};

export const ACCEPTED_AUDIO_TYPES: Record<string, string[]> = {
  'audio/mpeg':  ['.mp3'],
  'audio/wav':   ['.wav'],
  'audio/flac':  ['.flac'],
  'audio/ogg':   ['.ogg'],
  'audio/aac':   ['.aac'],
  'audio/x-m4a': ['.m4a'],
};
