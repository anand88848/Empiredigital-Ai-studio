'use client';

import { useRef, useEffect, type RefObject } from 'react';
import { clsx } from 'clsx';
import type { VideoAdjustments, VideoEffect } from '@/types/video';
import { buildVideoFilterString } from '@/lib/media-utils';

const EFFECT_CLASSES: Record<VideoEffect, string> = {
  none:      '',
  grayscale: 'grayscale',
  sepia:     'sepia',
  invert:    'invert',
  blur:      '',
  sharpen:   '',
  vintage:   'sepia contrast-75 saturate-50',
  vivid:     'saturate-200 contrast-110',
};

interface VideoPlayerProps {
  src: string;
  effect?: VideoEffect;
  adjustments?: VideoAdjustments;
  volume?: number;
  muted?: boolean;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
  onDurationChange?: (duration: number) => void;
  playerRef?: RefObject<HTMLVideoElement | null>;
  className?: string;
}

export default function VideoPlayer({
  src,
  effect = 'none',
  adjustments,
  volume = 100,
  muted = false,
  onTimeUpdate,
  onEnded,
  onDurationChange,
  playerRef,
  className,
}: VideoPlayerProps) {
  const internalRef = useRef<HTMLVideoElement>(null);
  const ref = playerRef ?? internalRef;

  useEffect(() => {
    if (ref.current) {
      ref.current.volume = volume / 100;
      ref.current.muted  = muted;
    }
  }, [volume, muted, ref]);

  const filterStyle = adjustments
    ? buildVideoFilterString(adjustments)
    : undefined;

  return (
    <div className={clsx('relative w-full bg-black rounded-xl overflow-hidden', className)}>
      <video
        ref={ref}
        src={src}
        className={clsx('w-full h-full object-contain', EFFECT_CLASSES[effect])}
        style={filterStyle ? { filter: filterStyle } : undefined}
        onTimeUpdate={e => onTimeUpdate?.((e.target as HTMLVideoElement).currentTime)}
        onEnded={onEnded}
        onDurationChange={e => onDurationChange?.((e.target as HTMLVideoElement).duration)}
        playsInline
      />
    </div>
  );
}
