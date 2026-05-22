'use client';

import { useState, useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import { Wand2, Loader2, CheckCircle, XCircle, Download, RefreshCw } from 'lucide-react';
import { HIGGSFIELD_EFFECTS } from '@/lib/higgsfield';
import type { HiggsfieldJob } from '@/lib/higgsfield';
import type { EffectDefinition } from '@/types/higgsfield';
import Button from '@/components/ui/Button';

const CATEGORIES = [
  { id: 'all',           label: 'All'           },
  { id: 'text-to-video', label: 'Text to Image' },
  { id: 'image-to-video',label: 'Image to Video'},
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:3'] as const;

export default function HiggsfieldStudio() {
  const [category, setCategory]       = useState<CategoryId>('all');
  const [selected, setSelected]       = useState<EffectDefinition>(HIGGSFIELD_EFFECTS[0]);
  const [prompt, setPrompt]           = useState('');
  const [imageUrl, setImageUrl]       = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3'>('16:9');
  const [job, setJob]                 = useState<HiggsfieldJob | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const pollRef                        = useRef<ReturnType<typeof setInterval> | null>(null);

  const filtered = category === 'all'
    ? HIGGSFIELD_EFFECTS
    : HIGGSFIELD_EFFECTS.filter(e => e.category === category);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollStatus = useCallback((id: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/higgsfield/status/${id}`);
        const data = await res.json() as HiggsfieldJob & { error?: string };
        if (!res.ok) throw new Error(data.error ?? 'Status check failed');

        setJob(data);

        if (data.status === 'completed' || data.status === 'failed') {
          stopPolling();
          setLoading(false);
        }
      } catch (e) {
        stopPolling();
        setLoading(false);
        setError(e instanceof Error ? e.message : 'Polling failed');
      }
    }, 3000);
  }, [stopPolling]);

  async function handleGenerate() {
    if (selected.supportsText && !prompt.trim() && !imageUrl.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    if (selected.supportsImage && selected.endpoint === 'image2video' && !imageUrl.trim()) {
      setError('Please enter an image URL.');
      return;
    }

    stopPolling();
    setError(null);
    setJob(null);
    setLoading(true);

    try {
      const res = await fetch('/api/higgsfield/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: selected.endpoint,
          prompt: prompt.trim() || undefined,
          image_url: imageUrl.trim() || undefined,
          aspect_ratio: aspectRatio,
        }),
      });

      const data = await res.json() as HiggsfieldJob & { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');

      setJob(data);

      if (data.status !== 'completed' && data.status !== 'failed') {
        pollStatus(data.id);
      } else {
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  }

  function handleReset() {
    stopPolling();
    setJob(null);
    setError(null);
    setLoading(false);
  }

  const resultUrl = job?.results?.raw?.url;

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-0">
      {/* Left — effect picker */}
      <div className="lg:w-72 shrink-0 flex flex-col gap-4">
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-medium transition-all',
                category === c.id
                  ? 'bg-higgsfield-600 text-white'
                  : 'bg-surface-muted text-gray-400 hover:text-white',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-22rem)]">
          {filtered.map(effect => (
            <button
              key={effect.endpoint}
              onClick={() => { setSelected(effect); setError(null); }}
              className={clsx(
                'text-left rounded-xl border p-3 transition-all',
                selected.endpoint === effect.endpoint
                  ? 'border-higgsfield-600 bg-higgsfield-950/60'
                  : 'border-surface-border bg-surface-card hover:border-higgsfield-700/50',
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-sm font-semibold text-white">{effect.label}</span>
                {effect.badge && (
                  <span className={clsx(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0',
                    effect.badge === 'NEW' ? 'bg-green-900/60 text-green-400' : 'bg-amber-900/60 text-amber-400',
                  )}>
                    {effect.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{effect.description}</p>
              <div className="mt-2 flex gap-1.5">
                {effect.supportsText  && <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-muted text-gray-400">Text</span>}
                {effect.supportsImage && <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-muted text-gray-400">Image</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right — generator panel */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">
        <div className="rounded-xl border border-surface-border bg-surface-card p-5">
          <h2 className="text-base font-bold text-white mb-1">{selected.label}</h2>
          <p className="text-xs text-gray-500 mb-4">{selected.description}</p>

          <div className="flex flex-col gap-4">
            {selected.supportsText && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Prompt</label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Describe what you want to generate…"
                  className="w-full rounded-lg bg-surface-muted border border-surface-border text-sm text-white placeholder-gray-600 px-3 py-2 focus:outline-none focus:border-higgsfield-600 resize-none"
                />
              </div>
            )}

            {selected.supportsImage && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Image URL{selected.endpoint === 'image2video' && <span className="text-red-400 ml-1">*</span>}
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg bg-surface-muted border border-surface-border text-sm text-white placeholder-gray-600 px-3 py-2 focus:outline-none focus:border-higgsfield-600"
                />
              </div>
            )}

            <div className="w-40">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={e => setAspectRatio(e.target.value as typeof aspectRatio)}
                className="w-full rounded-lg bg-surface-muted border border-surface-border text-sm text-white px-2 py-1.5 focus:outline-none focus:border-higgsfield-600"
              >
                {ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              variant="primary"
              icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              onClick={handleGenerate}
              disabled={loading}
              className="self-start bg-gradient-to-r from-higgsfield-600 to-purple-600 hover:from-higgsfield-500 hover:to-purple-500"
            >
              {loading ? 'Generating…' : 'Generate'}
            </Button>
          </div>
        </div>

        {job && (
          <div className="rounded-xl border border-surface-border bg-surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Result</h3>
              <button onClick={handleReset} className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> New
              </button>
            </div>

            <StatusBadge status={job.status} />

            {(job.status === 'processing' || job.status === 'pending') && (
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin text-higgsfield-400" />
                Processing — this typically takes 20–60 seconds…
              </div>
            )}

            {job.status === 'completed' && resultUrl && (
              <div className="mt-4 space-y-3">
                {selected.endpoint === 'image2video' ? (
                  <video src={resultUrl} controls className="w-full rounded-lg border border-surface-border" style={{ maxHeight: 360 }} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resultUrl} alt="Generated result" className="w-full rounded-lg border border-surface-border object-contain max-h-96" />
                )}
                <a href={resultUrl} download target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-higgsfield-400 hover:text-higgsfield-300">
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </div>
            )}

            {job.status === 'failed' && (
              <p className="mt-3 text-xs text-red-400">{job.error ?? 'Generation failed. Please try again.'}</p>
            )}

            <p className="mt-3 text-[10px] text-gray-600 font-mono">Job ID: {job.id}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    pending:    { icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, label: 'Pending',    color: 'text-yellow-400 bg-yellow-950/40 border-yellow-900/50' },
    processing: { icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, label: 'Processing', color: 'text-blue-400 bg-blue-950/40 border-blue-900/50' },
    completed:  { icon: <CheckCircle className="w-3.5 h-3.5" />,          label: 'Completed',  color: 'text-green-400 bg-green-950/40 border-green-900/50' },
    failed:     { icon: <XCircle className="w-3.5 h-3.5" />,              label: 'Failed',     color: 'text-red-400 bg-red-950/40 border-red-900/50' },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border', s.color)}>
      {s.icon}{s.label}
    </span>
  );
}
