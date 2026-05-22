'use client';

import { useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import type { VideoClip } from '@/types/video';
import type { Marker } from '@/types/project';
import { formatTime } from '@/utils/format';

interface VideoTimelineProps {
  clips:         VideoClip[];
  markers:       Marker[];
  currentTime:   number;
  totalDuration: number;
  zoom:          number;
  activeClipId:  string | null;
  onClipSelect:  (id: string) => void;
  onSeek:        (time: number) => void;
}

export default function VideoTimeline({
  clips, markers, currentTime, totalDuration, zoom, activeClipId, onClipSelect, onSeek,
}: VideoTimelineProps) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const tickCount = Math.ceil(totalDuration / 5) + 1;

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    onSeek(((e.clientX - rect.left) / rect.width) * totalDuration);
  }, [totalDuration, onSeek]);

  const timeToPercent = (t: number) => totalDuration > 0 ? (t / totalDuration) * 100 : 0;

  return (
    <div className="flex flex-col bg-surface-card rounded-xl overflow-hidden border border-surface-border">
      {/* Ruler */}
      <div className="relative h-6 border-b border-surface-border bg-surface overflow-hidden select-none">
        {Array.from({ length: tickCount }).map((_, i) => {
          const t = i * 5;
          const left = `${timeToPercent(t)}%`;
          return (
            <div key={i} className="absolute top-0 h-full flex flex-col items-start" style={{ left }}>
              <div className="w-px h-3 bg-surface-border" />
              <span className="text-[10px] text-gray-600 ml-1">{formatTime(t)}</span>
            </div>
          );
        })}
      </div>

      {/* Clip track */}
      <div
        ref={trackRef}
        className="relative h-16 cursor-pointer"
        onClick={handleTrackClick}
        style={{ minWidth: `${100 * zoom}%` }}
      >
        <div className="absolute inset-0 bg-surface-muted/40" />

        {/* Clips */}
        {clips.map(clip => {
          const left  = timeToPercent(clip.startOnTimeline);
          const width = timeToPercent(clip.duration - (clip.trimRange.end - (clip.duration - clip.trimRange.start)));
          return (
            <div
              key={clip.id}
              onClick={e => { e.stopPropagation(); onClipSelect(clip.id); }}
              className={clsx(
                'absolute top-2 h-12 rounded-md overflow-hidden border transition-all cursor-pointer',
                activeClipId === clip.id
                  ? 'border-brand-500 shadow-lg shadow-brand-900/40'
                  : 'border-surface-border hover:border-brand-600',
              )}
              style={{ left: `${left}%`, width: `${Math.max(width, 1)}%` }}
            >
              <div className="h-full bg-brand-700/50 flex items-center px-2">
                <span className="text-[11px] font-medium text-white truncate">{clip.name}</span>
              </div>
            </div>
          );
        })}

        {/* Markers */}
        {markers.map(m => (
          <div
            key={m.id}
            className="absolute top-0 bottom-0 w-px pointer-events-none"
            style={{ left: `${timeToPercent(m.time)}%`, background: m.color }}
          >
            <div
              className="absolute top-0 -translate-x-1/2 px-1 py-0.5 rounded text-[10px] text-white"
              style={{ background: m.color }}
            >
              {m.label}
            </div>
          </div>
        ))}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/90 pointer-events-none shadow"
          style={{ left: `${timeToPercent(currentTime)}%` }}
        >
          <div className="absolute -top-0.5 -translate-x-1/2 w-2 h-2 bg-white rounded-sm" />
        </div>
      </div>
    </div>
  );
}
