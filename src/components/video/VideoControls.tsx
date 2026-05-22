'use client';

import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Maximize2, Scissors,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatTime } from '@/utils/format';

interface VideoControlsProps {
  isPlaying:    boolean;
  currentTime:  number;
  duration:     number;
  volume:       number;
  muted:        boolean;
  onPlay:       () => void;
  onPause:      () => void;
  onSeek:       (time: number) => void;
  onSkip:       (delta: number) => void;
  onVolumeChange: (v: number) => void;
  onMuteToggle: () => void;
  onSplit?:     () => void;
  onFullscreen?:() => void;
}

export default function VideoControls({
  isPlaying, currentTime, duration, volume, muted,
  onPlay, onPause, onSeek, onSkip, onVolumeChange, onMuteToggle,
  onSplit, onFullscreen,
}: VideoControlsProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-2 px-3 py-2 bg-surface-card border-t border-surface-border">
      {/* Scrubber */}
      <div className="group relative h-1.5 rounded-full bg-surface-border cursor-pointer"
        onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          onSeek(((e.clientX - rect.left) / rect.width) * duration);
        }}
      >
        <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      {/* Buttons row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="xs" onClick={() => onSkip(-5)} title="Back 5s">
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button variant="primary" size="xs" onClick={isPlaying ? onPause : onPlay} className="w-8 h-8 !p-0">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="xs" onClick={() => onSkip(5)} title="Forward 5s">
            <SkipForward className="w-4 h-4" />
          </Button>
          <span className="ml-2 text-xs font-mono text-gray-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onSplit && (
            <Button variant="ghost" size="xs" onClick={onSplit} title="Split clip">
              <Scissors className="w-4 h-4" />
            </Button>
          )}
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="xs" onClick={onMuteToggle}>
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <input
              type="range" min="0" max="100" value={volume}
              onChange={e => onVolumeChange(Number(e.target.value))}
              className="w-16 h-1 accent-brand-500 cursor-pointer"
            />
          </div>
          {onFullscreen && (
            <Button variant="ghost" size="xs" onClick={onFullscreen}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
