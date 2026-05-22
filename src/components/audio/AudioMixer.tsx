'use client';

import { Volume2, VolumeX, Headphones } from 'lucide-react';
import { clsx } from 'clsx';
import type { AudioTrack } from '@/types/audio';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';

interface AudioMixerProps {
  tracks:        AudioTrack[];
  masterVolume:  number;
  onTrackUpdate: (id: string, patch: Partial<AudioTrack>) => void;
  onMasterVolume:(v: number) => void;
}

export default function AudioMixer({ tracks, masterVolume, onTrackUpdate, onMasterVolume }: AudioMixerProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Master */}
      <div className="rounded-lg border border-surface-border bg-surface-muted/50 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Master</span>
          <span className="text-xs font-mono text-gray-300">{masterVolume}%</span>
        </div>
        <Slider
          min={0} max={150} value={masterVolume}
          onChange={e => onMasterVolume(Number(e.target.value))}
          showValue={false}
        />
      </div>

      {/* Tracks */}
      {tracks.map(track => (
        <div
          key={track.id}
          className="rounded-lg border border-surface-border bg-surface-card p-3"
          style={{ borderLeftColor: track.color, borderLeftWidth: 3 }}
        >
          <div className="flex items-center justify-between mb-2 gap-2">
            <span className="text-xs font-medium text-gray-200 truncate">{track.name}</span>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost" size="xs"
                onClick={() => onTrackUpdate(track.id, { muted: !track.muted })}
                className={clsx(track.muted && 'text-red-400')}
              >
                {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost" size="xs"
                onClick={() => onTrackUpdate(track.id, { solo: !track.solo })}
                className={clsx(track.solo && 'text-yellow-400')}
              >
                <Headphones className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <Slider
            label="Vol" unit="%" min={0} max={150}
            value={track.volume}
            onChange={e => onTrackUpdate(track.id, { volume: Number(e.target.value) })}
          />
          <div className="mt-1.5" />
          <Slider
            label="Pan" unit="" min={-100} max={100}
            value={Math.round(track.pan * 100)}
            onChange={e => onTrackUpdate(track.id, { pan: Number(e.target.value) / 100 })}
          />
        </div>
      ))}

      {tracks.length === 0 && (
        <p className="text-xs text-center text-gray-600 py-4">Add audio clips to see mixer tracks.</p>
      )}
    </div>
  );
}
