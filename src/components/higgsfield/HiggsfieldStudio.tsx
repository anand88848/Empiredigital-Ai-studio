'use client';

import { useState, useRef } from 'react';
import { Loader2, Sparkles, Download, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import type { HiggsfieldEffect, HiggsfieldJob } from '@/types/higgsfield';
import { HIGGSFIELD_EFFECTS } from '@/types/higgsfield';

const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:3'] as const;
const DURATIONS = [3, 5, 8, 10] as const;

export default function HiggsfieldStudio() {
  const [effect, setEffect] = useState<HiggsfieldEffect>('aurora');
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3'>('16:9');
  const [duration, setDuration] = useState(5);
  const [quality, setQuality] = useState<'standard' | 'high'>('standard');

  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState<HiggsfieldJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const meta = HIGGSFIELD_EFFECTS[effect];

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function pollStatus(jobId: string) {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/higgsfield/status/${jobId}`);
        const data: HiggsfieldJob = await res.json();
        setJob(data);
        if (data.status === 'completed' || data.status === 'failed') {
          stopPolling();
          setLoading(false);
        }
      } catch {
        // keep polling
      }
    }, 3000);
  }

  async function handleGenerate() {
    setError(null);
    setJob(null);
    setLoading(true);
    stopPolling();

    try {
      const res = await fetch('/api/higgsfield/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          effect,
          prompt: prompt || undefined,
          image_url: imageUrl || undefined,
          video_url: videoUrl || undefined,
          aspect_ratio: aspectRatio,
          duration,
          quality,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');

      setJob({ id: data.job_id, status: 'pending', created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      pollStatus(data.job_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }

  const canSubmit =
    (!meta.requiresPrompt || prompt.trim().length > 0) &&
    (!meta.requiresImage  || imageUrl.trim().length > 0) &&
    (!meta.requiresVideo  || videoUrl.trim().length > 0) &&
    !loading;

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      {/* Controls */}
      <aside className="flex flex-col gap-4">
        {/* Effect picker */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Effect</label>
          <div className="flex flex-col gap-1.5">
            {(Object.entries(HIGGSFIELD_EFFECTS) as [HiggsfieldEffect, typeof HIGGSFIELD_EFFECTS[HiggsfieldEffect]][]).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setEffect(key)}
                className={clsx(
                  'text-left px-3 py-2.5 rounded-lg text-sm transition-all',
                  effect === key
                    ? 'bg-fuchsia-600/20 border border-fuchsia-600/40 text-fuchsia-300'
                    : 'text-gray-400 hover:text-white hover:bg-surface-muted border border-transparent',
                )}
              >
                <span className="font-medium block">{info.label}</span>
                <span className="text-xs text-gray-500">{info.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 flex flex-col gap-3">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Inputs</label>

          {meta.requiresPrompt && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Prompt</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={3}
                placeholder="Describe the video you want to generate…"
                className="w-full rounded-lg bg-surface-muted border border-surface-border text-sm text-white placeholder-gray-600 px-3 py-2 resize-none focus:outline-none focus:border-fuchsia-600/60"
              />
            </div>
          )}

          {meta.requiresImage && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-lg bg-surface-muted border border-surface-border text-sm text-white placeholder-gray-600 px-3 py-2 focus:outline-none focus:border-fuchsia-600/60"
              />
            </div>
          )}

          {meta.requiresVideo && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Video URL</label>
              <input
                type="url"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-lg bg-surface-muted border border-surface-border text-sm text-white placeholder-gray-600 px-3 py-2 focus:outline-none focus:border-fuchsia-600/60"
              />
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 flex flex-col gap-3">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</label>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Aspect Ratio</label>
            <div className="grid grid-cols-4 gap-1">
              {ASPECT_RATIOS.map(r => (
                <button
                  key={r}
                  onClick={() => setAspectRatio(r)}
                  className={clsx(
                    'py-1.5 rounded-lg text-xs font-medium transition-all',
                    aspectRatio === r ? 'bg-fuchsia-600/20 text-fuchsia-300 border border-fuchsia-600/40' : 'bg-surface-muted text-gray-500 border border-transparent hover:text-white',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Duration: {duration}s</label>
            <div className="grid grid-cols-4 gap-1">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={clsx(
                    'py-1.5 rounded-lg text-xs font-medium transition-all',
                    duration === d ? 'bg-fuchsia-600/20 text-fuchsia-300 border border-fuchsia-600/40' : 'bg-surface-muted text-gray-500 border border-transparent hover:text-white',
                  )}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Quality</label>
            <div className="grid grid-cols-2 gap-1">
              {(['standard', 'high'] as const).map(q => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={clsx(
                    'py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                    quality === q ? 'bg-fuchsia-600/20 text-fuchsia-300 border border-fuchsia-600/40' : 'bg-surface-muted text-gray-500 border border-transparent hover:text-white',
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          disabled={!canSubmit}
          onClick={handleGenerate}
          className={clsx(
            'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all',
            canSubmit
              ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:from-fuchsia-500 hover:to-purple-500 shadow-lg shadow-fuchsia-900/40'
              : 'bg-surface-muted text-gray-600 cursor-not-allowed',
          )}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </aside>

      {/* Output */}
      <section className="flex flex-col gap-4">
        <div className="rounded-xl border border-surface-border bg-surface-card p-6 flex-1 min-h-[400px] flex flex-col items-center justify-center">
          {!job && !error && (
            <div className="text-center text-gray-600">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Choose an effect and hit Generate</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-lg bg-red-950/40 border border-red-800/50 p-4 text-sm text-red-300 max-w-md">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {job && (
            <div className="w-full flex flex-col gap-4">
              {/* Status bar */}
              <div className={clsx(
                'flex items-center gap-3 rounded-lg border p-3 text-sm',
                job.status === 'completed' ? 'bg-green-950/40 border-green-800/50 text-green-300' :
                job.status === 'failed'    ? 'bg-red-950/40 border-red-800/50 text-red-300' :
                                             'bg-fuchsia-950/40 border-fuchsia-800/50 text-fuchsia-300',
              )}>
                {job.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> :
                 job.status === 'failed'    ? <AlertCircle className="w-4 h-4" /> :
                                              <Clock className="w-4 h-4 animate-pulse" />}
                <span className="capitalize font-medium">{job.status}</span>
                {(job.status === 'pending' || job.status === 'processing') && (
                  <Loader2 className="w-4 h-4 ml-auto animate-spin" />
                )}
              </div>

              {/* Preview */}
              {job.output_url && (
                <div className="flex flex-col gap-3">
                  <video
                    src={job.output_url}
                    controls
                    className="w-full rounded-lg border border-surface-border"
                  />
                  <a
                    href={job.output_url}
                    download
                    className="self-start flex items-center gap-2 px-4 py-2 rounded-lg bg-fuchsia-600/20 border border-fuchsia-600/40 text-fuchsia-300 text-sm font-medium hover:bg-fuchsia-600/30 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              )}

              {job.status === 'failed' && job.error && (
                <p className="text-sm text-red-400">{job.error}</p>
              )}

              <div className="text-xs text-gray-600">Job ID: {job.id}</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
