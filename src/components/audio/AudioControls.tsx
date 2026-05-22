'use client';

import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Scissors } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatTime } from '@/utils/format';

interface AudioControlsProps {
  isPlaying:      boolean;
  currentTime:    number;
  duration:       number;
  masterVolume:   number;
  muted:          boolean;
  onPlay:         () => void;
  onPause:        () => void;
  onSeek:         (t: number) => void;
  onSkip:         (delta: number) => void;
  onVolumeChange: (v: number) => void;
  onMuteToggle:   () => void;
  onSplit?:       () => void;
}

export default function AudioControls({
  isPlaying, currentTime, duration, masterVolume, muted,
  onPlay, onPause, onSeek, onSkip, onVolumeChange, onMuteToggle, onSplit,
}: AudioControlsProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-2">
      {/* Scrubber */}
      <div
        className="relative h-1.5 rounded-full bg-surface-border cursor-pointer group"
        onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          onSeek(((e.clientX - rect.left) / rect.width) * duration);
        }}
      >
        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${progress}%` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      {/* Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="xs" onClick={() => onSkip(-5)}><SkipBack className="w-4 h-4" /></Button>
          <Button variant="primary" size="xs" onClick={isPlaying ? onPause : onPlay} className="w-8 h-8 !p-0">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="xs" onClick={() => onSkip(5)}><SkipForward className="w-4 h-4" /></Button>
          <span className="ml-2 text-xs font-mono text-gray-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onSplit && (
            <Button variant="ghost" size="xs" onClick={onSplit} title="Split here">
              <Scissors className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="xs" onClick={onMuteToggle}>
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <input type="range" min="0" max="150" value={masterVolume}
            onChange={e => onVolumeChange(Number(e.target.value))}
            className="w-20 h-1 accent-brand-500 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
