'use client';

import { useState, useRef, useCallback } from 'react';
import { Plus, Trash2, SlidersHorizontal, Layers, Sparkles, Download } from 'lucide-react';

import Button from '@/components/ui/Button';
import FileUpload from '@/components/ui/FileUpload';
import AudioWaveform from './AudioWaveform';
import AudioControls from './AudioControls';
import AudioEffects from './AudioEffects';
import AudioMixer from './AudioMixer';

import type { AudioClip, AudioTrack, AudioEditorState, AudioEffects as AudioEffectsType } from '@/types/audio';
import { DEFAULT_AUDIO_EFFECTS, TRACK_COLORS } from '@/types/audio';
import { generateId, clamp } from '@/utils/format';
import { getMediaDuration, ACCEPTED_AUDIO_TYPES } from '@/lib/media-utils';

const INITIAL_STATE: AudioEditorState = {
  tracks: [], activeClipId: null, currentTime: 0,
  totalDuration: 0, isPlaying: false, isRecording: false,
  zoom: 1, markers: [], masterVolume: 100, bpm: 120,
};

type Panel = 'effects' | 'mixer' | null;

export default function AudioEditor() {
  const [state,     setState]    = useState<AudioEditorState>(INITIAL_STATE);
  const [panel,     setPanel]    = useState<Panel>(null);
  const [audioBufs, setAudioBufs]= useState<Record<string, AudioBuffer>>({});
  const [aiLoading, setAILoading]= useState(false);
  const [aiResult,  setAIResult] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRefs  = useRef<Record<string, AudioBufferSourceNode>>({});

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    return audioCtxRef.current;
  }, []);

  const activeClip = useCallback(() => {
    for (const track of state.tracks) {
      const clip = track.clips.find(c => c.id === state.activeClipId);
      if (clip) return { clip, track };
    }
    return null;
  }, [state.tracks, state.activeClipId])();

  const addAudioFiles = useCallback(async (files: File[]) => {
    const ctx = getAudioCtx();
    await ctx.resume();

    const newClips: { trackId: string; clip: AudioClip }[] = await Promise.all(
      files.filter(f => f.type.startsWith('audio/')).map(async (file, i) => {
        const duration  = await getMediaDuration(file);
        const url       = URL.createObjectURL(file);
        const arrBuf    = await file.arrayBuffer();
        const audioBuf  = await ctx.decodeAudioData(arrBuf);
        const clipId    = generateId();
        setAudioBufs(prev => ({ ...prev, [clipId]: audioBuf }));

        const trackIdx  = state.tracks.length + i;
        const trackId   = generateId();
        const clip: AudioClip = {
          id: clipId, file, url, name: file.name, duration,
          trimRange: { start: 0, end: duration },
          volume: 100, pan: 0, muted: false, solo: false,
          effects: { ...DEFAULT_AUDIO_EFFECTS },
          startOnTimeline: 0, trackIndex: trackIdx,
          color: TRACK_COLORS[trackIdx % TRACK_COLORS.length],
        };
        return { trackId, clip };
      }),
    );

    setState(s => {
      const newTracks: AudioTrack[] = newClips.map(({ trackId, clip }, idx) => ({
        id: trackId,
        name: clip.name.replace(/\.[^.]+$/, ''),
        clips: [clip],
        volume: 100, pan: 0, muted: false, solo: false,
        color: TRACK_COLORS[(s.tracks.length + idx) % TRACK_COLORS.length],
      }));
      const tracks        = [...s.tracks, ...newTracks];
      const totalDuration = tracks.flatMap(t => t.clips)
        .reduce((acc, c) => Math.max(acc, c.startOnTimeline + c.duration), 0);
      return { ...s, tracks, totalDuration, activeClipId: newClips[0]?.clip.id ?? s.activeClipId };
    });
  }, [state.tracks.length, getAudioCtx]);

  const updateActiveClipEffects = useCallback((patch: Partial<AudioEffectsType>) => {
    if (!activeClip) return;
    setState(s => ({
      ...s,
      tracks: s.tracks.map(t => ({
        ...t,
        clips: t.clips.map(c => c.id === s.activeClipId
          ? { ...c, effects: { ...c.effects, ...patch } }
          : c),
      })),
    }));
  }, [activeClip]);

  const updateTrack = useCallback((id: string, patch: Partial<AudioTrack>) => {
    setState(s => ({ ...s, tracks: s.tracks.map(t => t.id === id ? { ...t, ...patch } : t) }));
  }, []);

  const deleteTrack = useCallback((id: string) => {
    setState(s => {
      const tracks        = s.tracks.filter(t => t.id !== id);
      const totalDuration = tracks.flatMap(t => t.clips)
        .reduce((acc, c) => Math.max(acc, c.startOnTimeline + c.duration), 0);
      return { ...s, tracks, totalDuration };
    });
  }, []);

  const seek = useCallback((time: number) => {
    const t = clamp(time, 0, state.totalDuration);
    setState(s => ({ ...s, currentTime: t }));
  }, [state.totalDuration]);

  const togglePlay = useCallback(() => {
    const ctx = getAudioCtx();
    if (state.isPlaying) {
      ctx.suspend();
      Object.values(sourceRefs.current).forEach(s => { try { s.stop(); } catch {} });
      sourceRefs.current = {};
      setState(s => ({ ...s, isPlaying: false }));
    } else {
      ctx.resume();
      setState(s => ({ ...s, isPlaying: true }));
    }
  }, [state.isPlaying, getAudioCtx]);

  const analyseWithAI = useCallback(async () => {
    if (!activeClip) return;
    setAILoading(true); setAIResult(null);
    try {
      const res  = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: activeClip.clip.name, duration: activeClip.clip.duration, type: 'audio' }),
      });
      const data = await res.json();
      setAIResult(data.result);
    } catch {
      setAIResult('Unable to connect to AI. Please check your ANTHROPIC_API_KEY.');
    } finally {
      setAILoading(false);
    }
  }, [activeClip]);

  const allClips = state.tracks.flatMap(t => t.clips);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}
            onClick={() => document.getElementById('audio-upload-input')?.click()}>
            Add Audio
          </Button>
          <input id="audio-upload-input" type="file" accept="audio/*" multiple hidden
            onChange={e => { if (e.target.files) addAudioFiles(Array.from(e.target.files)); }} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={<Sparkles className="w-4 h-4 text-brand-400" />}
            onClick={analyseWithAI} loading={aiLoading}>
            AI Analyse
          </Button>
          <Button variant="ghost" size="sm" icon={<SlidersHorizontal className="w-4 h-4" />}
            onClick={() => setPanel(p => p === 'effects' ? null : 'effects')}>
            Effects
          </Button>
          <Button variant="ghost" size="sm" icon={<Layers className="w-4 h-4" />}
            onClick={() => setPanel(p => p === 'mixer' ? null : 'mixer')}>
            Mixer
          </Button>
          <Button variant="primary" size="sm" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Track list */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto min-w-0">
          {allClips.length === 0 ? (
            <FileUpload onFiles={addAudioFiles} accept={ACCEPTED_AUDIO_TYPES} multiple
              label="Drop audio files here"
              sublabel="MP3, WAV, FLAC, OGG, AAC, M4A up to 2 GB"
              className="h-48" />
          ) : (
            state.tracks.map(track => {
              const clip = track.clips[0];
              const buf  = clip ? audioBufs[clip.id] : null;
              return (
                <div
                  key={track.id}
                  className="rounded-xl border border-surface-border bg-surface-card p-3"
                  style={{ borderLeftColor: track.color, borderLeftWidth: 3 }}
                  onClick={() => clip && setState(s => ({ ...s, activeClipId: clip.id }))}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-200 truncate">{track.name}</span>
                    <Button variant="ghost" size="xs"
                      onClick={e => { e.stopPropagation(); deleteTrack(track.id); }}>
                      <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-400" />
                    </Button>
                  </div>
                  {clip && (
                    <AudioWaveform
                      audioBuffer={buf ?? null}
                      currentTime={state.currentTime}
                      duration={clip.duration}
                      color={track.color}
                      height={60}
                      onSeek={seek}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Side panel */}
        {panel === 'effects' && activeClip && (
          <div className="w-64 shrink-0 rounded-xl border border-surface-border bg-surface-card p-4 overflow-y-auto">
            <h3 className="mb-4 text-sm font-semibold text-white">Effects — {activeClip.clip.name}</h3>
            <AudioEffects effects={activeClip.clip.effects} onChange={updateActiveClipEffects} />
          </div>
        )}
        {panel === 'mixer' && (
          <div className="w-64 shrink-0 rounded-xl border border-surface-border bg-surface-card p-4 overflow-y-auto">
            <h3 className="mb-4 text-sm font-semibold text-white">Mixer</h3>
            <AudioMixer
              tracks={state.tracks}
              masterVolume={state.masterVolume}
              onTrackUpdate={updateTrack}
              onMasterVolume={v => setState(s => ({ ...s, masterVolume: v }))}
            />
          </div>
        )}
      </div>

      {/* Transport */}
      {allClips.length > 0 && (
        <div className="rounded-xl border border-surface-border bg-surface-card p-3">
          <AudioControls
            isPlaying={state.isPlaying}
            currentTime={state.currentTime}
            duration={state.totalDuration}
            masterVolume={state.masterVolume}
            muted={false}
            onPlay={togglePlay} onPause={togglePlay}
            onSeek={seek}
            onSkip={d => seek(state.currentTime + d)}
            onVolumeChange={v => setState(s => ({ ...s, masterVolume: v }))}
            onMuteToggle={() => {}}
          />
        </div>
      )}

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
