'use client';

import { useEffect, useRef } from 'react';
import { drawWaveformToCanvas } from '@/lib/audio-processor';

interface AudioWaveformProps {
  audioBuffer: AudioBuffer | null;
  currentTime: number;
  duration:    number;
  color?:      string;
  height?:     number;
  onSeek?:     (time: number) => void;
}

export default function AudioWaveform({
  audioBuffer, currentTime, duration, color = '#5263f5', height = 80, onSeek,
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;
    canvas.width  = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    drawWaveformToCanvas(canvas, audioBuffer, color);
  }, [audioBuffer, color, height]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="relative w-full rounded-lg overflow-hidden bg-surface-muted cursor-pointer"
      style={{ height }}
      onClick={e => {
        if (!onSeek || duration === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        onSeek(((e.clientX - rect.left) / rect.width) * duration);
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* Playhead overlay */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none"
        style={{ left: `${progress}%` }}
      />
      {/* Progress tint */}
      <div
        className="absolute inset-y-0 left-0 bg-brand-500/10 pointer-events-none transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
