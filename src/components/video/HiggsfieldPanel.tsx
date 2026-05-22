'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Wand2, Image, Film, Sparkles, Upload,
  Loader2, CheckCircle2, XCircle, Download, RefreshCw,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { HIGGSFIELD_EFFECTS } from '@/lib/higgsfield';
import type { GenerationResult, HiggsfieldEffect } from '@/lib/higgsfield';

type Mode = 'text-to-video' | 'image-to-video' | 'effect';

interface HiggsfieldPanelProps {
  activeVideoUrl?: string;
  onGenerated?: (videoUrl: string, name: string) => void;
}

const ASPECT_RATIOS = [
  { label: '16:9',  width: 1280, height: 720  },
  { label: '9:16',  width: 720,  height: 1280 },
  { label: '1:1',   width: 1024, height: 1024 },
  { label: '4:3',   width: 1024, height: 768  },
];

const DURATIONS = [2, 4, 6, 8];

export default function HiggsfieldPanel({ activeVideoUrl, onGenerated }: HiggsfieldPanelProps) {
  const [mode,          setMode]          = useState<Mode>('text-to-video');
  const [prompt,        setPrompt]        = useState('');
  const [negativePrompt,setNegativePrompt]= useState('');
  const [imageUrl,      setImageUrl]      = useState('');
  const [selectedEffect,setSelectedEffect]= useState<HiggsfieldEffect>(HIGGSFIELD_EFFECTS[0].id);
  const [effectStrength,setEffectStrength]= useState(0.8);
  const [aspectIdx,     setAspectIdx]     = useState(0);
  const [duration,      setDuration]      = useState(4);
  const [job,           setJob]           = useState<GenerationResult | null>(null);
  const [polling,       setPolling]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(async (jobId: string) => {
    try {
      const res  = await fetch(`/api/higgsfield/status/${jobId}`);
      const data = await res.json() as GenerationResult & { error?: string };
      if (!res.ok) { setError(data.error ?? 'Status check failed'); setPolling(false); return; }

      setJob(data);

      if (data.status === 'completed') {
        setPolling(false);
        if (data.video_url && onGenerated) {
          onGenerated(data.video_url, `higgsfield-${jobId.slice(0, 8)}.mp4`);
        }
      } else if (data.status === 'failed') {
        setPolling(false);
        setError(data.error ?? 'Generation failed');
      } else {
        pollingRef.current = setTimeout(() => pollStatus(jobId), 3000);
      }
    } catch {
      pollingRef.current = setTimeout(() => pollStatus(jobId), 5000);
    }
  }, [onGenerated]);

  const generate = useCallback(async () => {
    setError(null);
    setJob(null);
    stopPolling();

    const { width, height } = ASPECT_RATIOS[aspectIdx];

    const body =
      mode === 'text-to-video'   ? { mode, prompt, negative_prompt: negativePrompt, duration, width, height } :
      mode === 'image-to-video'  ? { mode, image_url: imageUrl, prompt, duration } :
      /* effect */                 { mode: 'effect' as const, video_url: activeVideoUrl, effect: selectedEffect, effect_strength: effectStrength };

    try {
      const res  = await fetch('/api/higgsfield/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json() as GenerationResult & { error?: string };
      if (!res.ok) { setError(data.error ?? 'Request failed'); return; }

      setJob(data);
      if (data.status !== 'completed' && data.status !== 'failed') {
        setPolling(true);
        pollStatus(data.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  }, [mode, prompt, negativePrompt, imageUrl, duration, aspectIdx, selectedEffect, effectStrength, activeVideoUrl, pollStatus, stopPolling]);

  const handleImageFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  }, []);

  const canGenerate =
    (mode === 'text-to-video'  && prompt.trim().length > 0) ||
    (mode === 'image-to-video' && imageUrl.length > 0)      ||
    (mode === 'effect'         && !!activeVideoUrl);

  const isRunning = polling || job?.status === 'processing' || job?.status === 'pending';

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-yellow-500/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
        </div>
        <span className="text-sm font-semibold text-white">Higgsfield AI</span>
      </div>

      {/* Mode tabs */}
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-surface-muted p-1">
        {([
          { id: 'text-to-video',  icon: Wand2,  label: 'Text' },
          { id: 'image-to-video', icon: Image,  label: 'Image' },
          { id: 'effect',         icon: Film,   label: 'Effect' },
        ] as const).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex items-center justify-center gap-1 rounded px-2 py-1.5 text-xs font-medium transition-colors
              ${mode === id ? 'bg-surface-card text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-0.5">
        {/* Prompt */}
        {(mode === 'text-to-video' || mode === 'image-to-video') && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">
              {mode === 'text-to-video' ? 'Prompt *' : 'Motion prompt (optional)'}
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={
                mode === 'text-to-video'
                  ? 'A cinematic drone shot over a neon-lit city at night...'
                  : 'Slowly pan left with wind in the trees...'
              }
              rows={3}
              className="w-full rounded-lg bg-surface-muted border border-surface-border px-3 py-2 text-xs text-white
                placeholder:text-gray-600 resize-none focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30"
            />
          </div>
        )}

        {/* Negative prompt (text-to-video only) */}
        {mode === 'text-to-video' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Negative prompt</label>
            <input
              value={negativePrompt}
              onChange={e => setNegativePrompt(e.target.value)}
              placeholder="blurry, low quality, watermark..."
              className="w-full rounded-lg bg-surface-muted border border-surface-border px-3 py-1.5 text-xs text-white
                placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30"
            />
          </div>
        )}

        {/* Image input */}
        {mode === 'image-to-video' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Source image *</label>
            {imageUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-surface-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="source" className="w-full h-28 object-cover" />
                <button
                  onClick={() => setImageUrl('')}
                  className="absolute top-1 right-1 rounded bg-black/60 p-0.5 text-gray-300 hover:text-white"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-surface-border bg-surface-muted
                  py-5 text-gray-500 hover:border-yellow-500/40 hover:text-gray-300 transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span className="text-xs">Click to upload image</span>
              </button>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={e => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]); }}
            />
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-xs text-gray-400">or paste image URL</label>
              <input
                value={imageUrl.startsWith('blob:') ? '' : imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg bg-surface-muted border border-surface-border px-3 py-1.5 text-xs text-white
                  placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30"
              />
            </div>
          </div>
        )}

        {/* Effect selector */}
        {mode === 'effect' && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Effect</label>
              <select
                value={selectedEffect}
                onChange={e => setSelectedEffect(e.target.value as HiggsfieldEffect)}
                className="w-full rounded-lg bg-surface-muted border border-surface-border px-3 py-1.5 text-xs text-white
                  focus:outline-none focus:border-yellow-500/50"
              >
                {HIGGSFIELD_EFFECTS.map(({ id, label }) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Strength — {Math.round(effectStrength * 100)}%</label>
              <input
                type="range" min={0.1} max={1} step={0.05}
                value={effectStrength}
                onChange={e => setEffectStrength(Number(e.target.value))}
                className="w-full accent-yellow-400"
              />
            </div>

            {!activeVideoUrl && (
              <p className="text-xs text-gray-500 italic">
                Load a video clip in the editor to apply an effect.
              </p>
            )}
          </>
        )}

        {/* Aspect ratio (text-to-video only) */}
        {mode === 'text-to-video' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Aspect ratio</label>
            <div className="grid grid-cols-4 gap-1">
              {ASPECT_RATIOS.map(({ label }, i) => (
                <button
                  key={label}
                  onClick={() => setAspectIdx(i)}
                  className={`rounded px-2 py-1 text-xs font-medium transition-colors
                    ${aspectIdx === i ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' : 'bg-surface-muted text-gray-400 hover:text-gray-200 border border-transparent'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Duration */}
        {mode !== 'effect' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Duration</label>
            <div className="grid grid-cols-4 gap-1">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`rounded px-2 py-1 text-xs font-medium transition-colors
                    ${duration === d ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' : 'bg-surface-muted text-gray-400 hover:text-gray-200 border border-transparent'}`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-950/40 border border-red-800/40 px-3 py-2">
          <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* Job status */}
      {job && (
        <div className={`rounded-lg border px-3 py-2 ${
          job.status === 'completed' ? 'bg-green-950/30 border-green-800/40' :
          job.status === 'failed'    ? 'bg-red-950/30 border-red-800/40' :
                                       'bg-yellow-950/30 border-yellow-800/40'
        }`}>
          <div className="flex items-center gap-2">
            {job.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> :
             job.status === 'failed'    ? <XCircle      className="w-3.5 h-3.5 text-red-400" />   :
                                          <Loader2      className="w-3.5 h-3.5 text-yellow-400 animate-spin" />}
            <span className="text-xs font-medium capitalize text-white">{job.status}</span>
          </div>

          {job.status === 'completed' && job.video_url && (
            <div className="mt-2 flex flex-col gap-2">
              <video
                src={job.video_url}
                controls
                className="w-full rounded aspect-video bg-black"
              />
              <a
                href={job.video_url}
                download
                className="flex items-center gap-1.5 justify-center rounded-lg bg-green-600 hover:bg-green-500
                  px-3 py-1.5 text-xs font-medium text-white transition-colors"
              >
                <Download className="w-3 h-3" />
                Download video
              </a>
            </div>
          )}
        </div>
      )}

      {/* Generate button */}
      <Button
        variant="primary"
        size="sm"
        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-md shadow-yellow-900/30"
        icon={isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        onClick={isRunning ? stopPolling : generate}
        disabled={!canGenerate && !isRunning}
      >
        {isRunning ? 'Cancel' : 'Generate'}
      </Button>

      {isRunning && (
        <div className="flex items-center gap-2 justify-center">
          <RefreshCw className="w-3 h-3 text-yellow-400 animate-spin" />
          <span className="text-xs text-gray-400">Polling for result…</span>
        </div>
      )}
    </div>
  );
}
