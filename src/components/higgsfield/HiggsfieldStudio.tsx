'use client';

import { useState, useRef } from 'react';
import { Loader2, Sparkles, Download, AlertCircle, CheckCircle2, Clock, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { KNOWN_MODELS, ASPECT_RATIOS } from '@/types/higgsfield';
import type { HiggsfieldJob } from '@/types/higgsfield';

export default function HiggsfieldStudio() {
  const [model, setModel]           = useState<string>(KNOWN_MODELS[0].value);
  const [customModel, setCustomModel] = useState('');
  const [useCustom, setUseCustom]   = useState(false);
  const [prompt, setPrompt]         = useState('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [extraParams, setExtraParams] = useState('');

  const [loading, setLoading]       = useState(false);
  const [job, setJob]               = useState<HiggsfieldJob | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const pollRef                     = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeModel = useCustom ? customModel.trim() : model;

  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  async function pollStatus(jobId: string) {
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`/api/higgsfield/status/${jobId}`);
        const data: HiggsfieldJob = await res.json();
        setJob(data);

        const done = data.result_url || data.status === 'failed' || data.status === 'completed';
        if (done) { stopPolling(); setLoading(false); }
      } catch { /* keep polling */ }
    }, 4000);
  }

  async function handleGenerate() {
    if (!activeModel) return;
    setError(null);
    setJob(null);
    setLoading(true);
    stopPolling();

    // Build extra params from the JSON textarea
    let extra: Record<string, unknown> = {};
    if (extraParams.trim()) {
      try { extra = JSON.parse(extraParams); }
      catch { setError('Extra params must be valid JSON'); setLoading(false); return; }
    }

    try {
      const res = await fetch('/api/higgsfield/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_set_type:  activeModel,
          prompt:        prompt || undefined,
          aspect_ratio:  aspectRatio,
          ...extra,
        }),
      });

      const data: HiggsfieldJob & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');

      setJob(data);
      if (data.id && !data.result_url) pollStatus(data.id);
      else setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }

  const isVideo = KNOWN_MODELS.find(m => m.value === activeModel)?.type === 'video';
  const canSubmit = activeModel.length > 0 && !loading;

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-6">
      {/* Controls */}
      <aside className="flex flex-col gap-4">

        {/* Model */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 flex flex-col gap-3">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Model</label>

          <div className="flex flex-col gap-1.5">
            {KNOWN_MODELS.map(m => (
              <button
                key={m.value}
                onClick={() => { setModel(m.value); setUseCustom(false); }}
                className={clsx(
                  'text-left px-3 py-2.5 rounded-lg text-sm transition-all border',
                  !useCustom && model === m.value
                    ? 'bg-fuchsia-600/20 border-fuchsia-600/40 text-fuchsia-300'
                    : 'text-gray-400 hover:text-white hover:bg-surface-muted border-transparent',
                )}
              >
                <span className="font-medium block">{m.label}</span>
                <span className="text-xs text-gray-500">{m.description}</span>
              </button>
            ))}
          </div>

          {/* Custom model toggle */}
          <button
            onClick={() => setUseCustom(v => !v)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', useCustom && 'rotate-180')} />
            Custom model name
          </button>
          {useCustom && (
            <input
              type="text"
              value={customModel}
              onChange={e => setCustomModel(e.target.value)}
              placeholder="e.g. nano_banana_2"
              className="w-full rounded-lg bg-surface-muted border border-surface-border text-sm text-white placeholder-gray-600 px-3 py-2 focus:outline-none focus:border-fuchsia-600/60"
            />
          )}
          <p className="text-xs text-gray-600">
            Run <code className="bg-surface-muted px-1 rounded text-gray-400">higgsfield model list</code> locally to see all models.
          </p>
        </div>

        {/* Prompt */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 flex flex-col gap-3">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Prompt</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
            placeholder="Describe what you want to generate…"
            className="w-full rounded-lg bg-surface-muted border border-surface-border text-sm text-white placeholder-gray-600 px-3 py-2 resize-none focus:outline-none focus:border-fuchsia-600/60"
          />
        </div>

        {/* Settings */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 flex flex-col gap-3">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</label>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Aspect Ratio</label>
            <div className="flex flex-wrap gap-1">
              {ASPECT_RATIOS.map(r => (
                <button
                  key={r}
                  onClick={() => setAspectRatio(r)}
                  className={clsx(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                    aspectRatio === r
                      ? 'bg-fuchsia-600/20 border-fuchsia-600/40 text-fuchsia-300'
                      : 'bg-surface-muted text-gray-500 border-transparent hover:text-white',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Extra params <span className="text-gray-600">(JSON, optional)</span>
            </label>
            <textarea
              value={extraParams}
              onChange={e => setExtraParams(e.target.value)}
              rows={3}
              placeholder={'{\n  "quality": "high"\n}'}
              className="w-full rounded-lg bg-surface-muted border border-surface-border text-xs text-white placeholder-gray-700 px-3 py-2 resize-none font-mono focus:outline-none focus:border-fuchsia-600/60"
            />
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
      <section className="rounded-xl border border-surface-border bg-surface-card p-6 flex flex-col gap-4 min-h-[420px]">
        {!job && !error && (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-600">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Pick a model and hit Generate</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-lg bg-red-950/40 border border-red-800/50 p-4 text-sm text-red-300">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {job && (
          <div className="flex flex-col gap-4">
            {/* Status */}
            <div className={clsx(
              'flex items-center gap-3 rounded-lg border p-3 text-sm',
              job.result_url || job.status === 'completed'
                ? 'bg-green-950/40 border-green-800/50 text-green-300'
                : job.status === 'failed'
                  ? 'bg-red-950/40 border-red-800/50 text-red-300'
                  : 'bg-fuchsia-950/40 border-fuchsia-800/50 text-fuchsia-300',
            )}>
              {job.result_url || job.status === 'completed'
                ? <CheckCircle2 className="w-4 h-4" />
                : job.status === 'failed'
                  ? <AlertCircle className="w-4 h-4" />
                  : <Clock className="w-4 h-4 animate-pulse" />}
              <span className="font-medium capitalize">
                {job.result_url ? 'Completed' : job.status ?? 'Processing'}
              </span>
              {!job.result_url && job.status !== 'failed' && (
                <Loader2 className="w-4 h-4 ml-auto animate-spin" />
              )}
            </div>

            {/* Media output */}
            {job.result_url && (
              <div className="flex flex-col gap-3">
                {isVideo ? (
                  <video src={job.result_url} controls className="w-full rounded-lg border border-surface-border" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={job.result_url} alt="Generated" className="w-full rounded-lg border border-surface-border" />
                )}
                <a
                  href={job.result_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start flex items-center gap-2 px-4 py-2 rounded-lg bg-fuchsia-600/20 border border-fuchsia-600/40 text-fuchsia-300 text-sm font-medium hover:bg-fuchsia-600/30 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            )}

            {job.error && <p className="text-sm text-red-400">{job.error}</p>}

            <div className="text-xs text-gray-600 font-mono">
              Job: {job.id}{job.job_set_type ? ` · ${job.job_set_type}` : ''}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
