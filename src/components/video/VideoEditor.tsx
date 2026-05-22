'use client';

import { useRef, useState, useCallback } from 'react';
import {
  Plus, Trash2, ZoomIn, ZoomOut, Download,
  Sparkles, Layers, Settings2,
} from 'lucide-react';

import Button from '@/components/ui/Button';
import FileUpload from '@/components/ui/FileUpload';
import VideoPlayer from './VideoPlayer';
import VideoControls from './VideoControls';
import VideoEffects from './VideoEffects';
import VideoTimeline from './VideoTimeline';

import type { VideoClip, VideoEditorState, VideoEffect, VideoAdjustments } from '@/types/video';
import { DEFAULT_ADJUSTMENTS } from '@/types/video';
import { generateId, clamp } from '@/utils/format';
import { getMediaDuration, ACCEPTED_VIDEO_TYPES } from '@/lib/media-utils';

const INITIAL_STATE: VideoEditorState = {
  clips: [], activeClipId: null, currentTime: 0,
  totalDuration: 0, isPlaying: false, zoom: 1, markers: [],
};

type Panel = 'effects' | 'clips' | null;

export default function VideoEditor() {
  const [state,    setState]    = useState<VideoEditorState>(INITIAL_STATE);
  const [panel,    setPanel]    = useState<Panel>(null);
  const [aiLoading,setAILoading]= useState(false);
  const [aiResult, setAIResult] = useState<string | null>(null);
  const playerRef = useRef<HTMLVideoElement | null>(null);

  const activeClip = state.clips.find(c => c.id === state.activeClipId) ?? state.clips[0] ?? null;

  const addClips = useCallback(async (files: File[]) => {
    const newClips: VideoClip[] = await Promise.all(
      files.filter(f => f.type.startsWith('video/')).map(async file => {
        const duration = await getMediaDuration(file);
        const url      = URL.createObjectURL(file);
        const startOnTimeline = state.clips.reduce((acc, c) => Math.max(acc, c.startOnTimeline + c.duration), 0);
        return {
          id: generateId(), file, url, name: file.name, duration,
          trimRange: { start: 0, end: duration },
          effect: 'none' as VideoEffect,
          adjustments: { ...DEFAULT_ADJUSTMENTS },
          overlays: [], transition: 'cut' as const,
          volume: 100, muted: false, startOnTimeline,
        };
      }),
    );
    setState(s => {
      const clips         = [...s.clips, ...newClips];
      const totalDuration = clips.reduce((acc, c) => Math.max(acc, c.startOnTimeline + c.duration), 0);
      return { ...s, clips, totalDuration, activeClipId: newClips[0]?.id ?? s.activeClipId };
    });
  }, [state.clips]);

  const updateActiveClip = useCallback((patch: Partial<VideoClip>) => {
    setState(s => ({
      ...s,
      clips: s.clips.map(c => c.id === s.activeClipId ? { ...c, ...patch } : c),
    }));
  }, []);

  const deleteClip = useCallback((id: string) => {
    setState(s => {
      const clips         = s.clips.filter(c => c.id !== id);
      const totalDuration = clips.reduce((acc, c) => Math.max(acc, c.startOnTimeline + c.duration), 0);
      return { ...s, clips, totalDuration, activeClipId: clips[0]?.id ?? null };
    });
  }, []);

  const seek = useCallback((time: number) => {
    const t = clamp(time, 0, state.totalDuration);
    setState(s => ({ ...s, currentTime: t }));
    if (playerRef.current) playerRef.current.currentTime = t;
  }, [state.totalDuration]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (state.isPlaying) { playerRef.current.pause(); setState(s => ({ ...s, isPlaying: false })); }
    else                  { playerRef.current.play();  setState(s => ({ ...s, isPlaying: true  })); }
  }, [state.isPlaying]);

  const analyseWithAI = useCallback(async () => {
    if (!activeClip) return;
    setAILoading(true); setAIResult(null);
    try {
      const res  = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: activeClip.name, duration: activeClip.duration, type: 'video' }),
      });
      const data = await res.json();
      setAIResult(data.result);
    } catch {
      setAIResult('Unable to connect to AI. Please check your ANTHROPIC_API_KEY.');
    } finally {
      setAILoading(false);
    }
  }, [activeClip]);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Top toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}
            onClick={() => document.getElementById('video-upload-input')?.click()}>
            Add Clip
          </Button>
          <input id="video-upload-input" type="file" accept="video/*" multiple hidden
            onChange={e => { if (e.target.files) addClips(Array.from(e.target.files)); }} />
          <Button variant="ghost" size="sm" icon={<ZoomOut className="w-4 h-4" />}
            onClick={() => setState(s => ({ ...s, zoom: Math.max(0.5, s.zoom - 0.25) }))}>
            Zoom Out
          </Button>
          <Button variant="ghost" size="sm" icon={<ZoomIn className="w-4 h-4" />}
            onClick={() => setState(s => ({ ...s, zoom: Math.min(4, s.zoom + 0.25) }))}>
            Zoom In
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={<Sparkles className="w-4 h-4 text-brand-400" />}
            onClick={analyseWithAI} loading={aiLoading}>
            AI Analyse
          </Button>
          <Button variant="ghost" size="sm"
            icon={<Settings2 className="w-4 h-4" />}
            onClick={() => setPanel(p => p === 'effects' ? null : 'effects')}>
            Effects
          </Button>
          <Button variant="ghost" size="sm"
            icon={<Layers className="w-4 h-4" />}
            onClick={() => setPanel(p => p === 'clips' ? null : 'clips')}>
            Clips
          </Button>
          <Button variant="primary" size="sm" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Preview */}
        <div className="flex flex-1 flex-col gap-0 rounded-xl overflow-hidden border border-surface-border min-w-0">
          {activeClip ? (
            <>
              <VideoPlayer
                src={activeClip.url}
                effect={activeClip.effect}
                adjustments={activeClip.adjustments}
                volume={activeClip.volume}
                muted={activeClip.muted}
                playerRef={playerRef}
                onTimeUpdate={t => setState(s => ({ ...s, currentTime: t }))}
                onEnded={() => setState(s => ({ ...s, isPlaying: false }))}
                className="flex-1"
              />
              <VideoControls
                isPlaying={state.isPlaying}
                currentTime={state.currentTime}
                duration={activeClip.duration}
                volume={activeClip.volume}
                muted={activeClip.muted}
                onPlay={togglePlay} onPause={togglePlay}
                onSeek={seek}
                onSkip={d => seek(state.currentTime + d)}
                onVolumeChange={v => updateActiveClip({ volume: v })}
                onMuteToggle={() => updateActiveClip({ muted: !activeClip.muted })}
                onFullscreen={() => playerRef.current?.requestFullscreen()}
              />
            </>
          ) : (
            <FileUpload
              onFiles={addClips}
              accept={ACCEPTED_VIDEO_TYPES}
              multiple
              className="flex-1 m-4"
              label="Drop video files here"
              sublabel="MP4, MOV, WebM, MKV up to 2 GB"
            />
          )}
        </div>

        {/* Side panel */}
        {panel === 'effects' && activeClip && (
          <div className="w-64 shrink-0 rounded-xl border border-surface-border bg-surface-card p-4 overflow-y-auto">
            <h3 className="mb-4 text-sm font-semibold text-white">Effects & Adjustments</h3>
            <VideoEffects
              effect={activeClip.effect}
              adjustments={activeClip.adjustments}
              onEffect={e => updateActiveClip({ effect: e })}
              onAdjustment={(key, val) =>
                updateActiveClip({ adjustments: { ...activeClip.adjustments, [key]: val } as VideoAdjustments })
              }
            />
          </div>
        )}

        {panel === 'clips' && (
          <div className="w-64 shrink-0 rounded-xl border border-surface-border bg-surface-card p-4 overflow-y-auto">
            <h3 className="mb-4 text-sm font-semibold text-white">Clips ({state.clips.length})</h3>
            {state.clips.length === 0
              ? <p className="text-xs text-gray-500">No clips added yet.</p>
              : state.clips.map(c => (
                <div key={c.id}
                  onClick={() => setState(s => ({ ...s, activeClipId: c.id }))}
                  className={`flex items-center justify-between p-2 rounded-lg mb-1 cursor-pointer transition-colors
                    ${state.activeClipId === c.id ? 'bg-brand-600/20 text-brand-400' : 'hover:bg-surface-muted text-gray-300'}`}>
                  <span className="text-xs truncate">{c.name}</span>
                  <Button variant="ghost" size="xs" onClick={e => { e.stopPropagation(); deleteClip(c.id); }}>
                    <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-400" />
                  </Button>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* Timeline */}
      <VideoTimeline
        clips={state.clips}
        markers={state.markers}
        currentTime={state.currentTime}
        totalDuration={state.totalDuration}
        zoom={state.zoom}
        activeClipId={state.activeClipId}
        onClipSelect={id => setState(s => ({ ...s, activeClipId: id }))}
        onSeek={seek}
      />

      {/* AI Result */}
      {aiResult && (
        <div className="rounded-xl border border-brand-800/50 bg-brand-950/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span className="text-sm font-semibold text-brand-300">AI Analysis</span>
          </div>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{aiResult}</p>
        </div>
      )}
    </div>
  );
}
