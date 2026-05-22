'use client';

import { useState, useRef } from 'react';
import { Loader2, Sparkles, Download, AlertCircle, CheckCircle2, Clock, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { KNOWN_MODELS, ASPECT_RATIOS } from '@/types/higgsfield';
import type { HiggsfieldJob } from '@/types/higgsfield';

const HF_BASE = 'https://platform.higgsfield.ai';
const HF_KEY  = process.env.NEXT_PUBLIC_HF_API_KEY ?? '';
const HF_SEC  = process.env.NEXT_PUBLIC_HF_SECRET  ?? '';

function hfHeaders() {
  return {
    'hf-api-key':    HF_KEY,
    'hf-secret':     HF_SEC,
    'Authorization': `Key ${HF_KEY}:${HF_SEC}`,
    'Content-Type':  'application/json',
    'Accept':        'application/json',
  };
}

async function hfPost(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${HF_BASE}${path}`, {
    method:  'POST',
    headers: hfHeaders(),
    body:    JSON.stringify(body),
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`${res.status}: ${t}`); }
  return res.json();
}

async function hfGet(path: string): Promise<unknown> {
  const res = await fetch(`${HF_BASE}${path}`, { headers: hfHeaders() });
  if (!res.ok) { const t = await res.text(); throw new Error(`${res.status}: ${t}`); }
  return res.json();
}

export default function HiggsfieldStudio() {
  const [model,       setModel]       = useState<string>(KNOWN_MODELS[0].value);
  const [customModel, setCustomModel] = useState('');
  const [useCustom,   setUseCustom]   = useState(false);
  const [prompt,      setPrompt]      = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [extraParams, setExtraParams] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [job,         setJob]         = useState<HiggsfieldJob | null>(null);
  const [error,       setError]       = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeModel = useCustom ? customModel.trim() : model;

  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  function startPolling(jobId: string) {
    pollRef.current = setInterval(async () => {
      try {
        // Try new unified API status endpoint first, fall back to old jobs endpoint
        let data: HiggsfieldJob;
        try {
          data = await hfGet(`/requests/${jobId}/status`) as HiggsfieldJob;
        } catch {
          data = await hfGet(`/v1/job-sets/${jobId}`) as HiggsfieldJob;
        }
        setJob(data);
        const done = data.result_url || data.status === 'completed' || data.status === 'failed';
        if (done) { stopPolling(); setLoading(false); }
      } catch { /* keep polling */ }
    }, 4000);
  }

  async function handleGenerate() {
    if (!activeModel) return;
    setError(null); setJob(null); setLoading(true); stopPolling();

    let extra: Record<string, unknown> = {};
    if (extraParams.trim()) {
      try { extra = JSON.parse(extraParams); }
      catch { setError('Extra params must be valid JSON'); setLoading(false); return; }
    }

    try {
      // Try the new unified generate API: POST /{model_id}
      let data: HiggsfieldJob;
      try {
        data = await hfPost(`/${activeModel}`, { prompt, aspect_ratio: aspectRatio, ...extra }) as HiggsfieldJob;
      } catch {
        // Fall back to old agents/jobs endpoint
        data = await hfPost('/agents/jobs', { job_set_type: activeModel, prompt, aspect_ratio: aspectRatio, ...extra }) as HiggsfieldJob;
      }

      setJob(data);
      const jobId = (data as Record<string, string>).request_id ?? (data as Record<string, string>).id;
      if (jobId && !data.result_url) startPolling(jobId);
      else setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }

  const isVideo = KNOWN_MODELS.find(m => m.value === activeModel)?.type === 'video';
  const canSubmit = activeModel.length > 0 && !loading;
  const keysSet = HF_KEY && HF_SEC;

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-6">
      <aside className="flex flex-col gap-4">

        {!keysSet && (
          <div className="rounded-lg bg-yellow-950/40 border border-yellow-800/50 p-3 text-xs text-yellow-300">
            Set <code>NEXT_PUBLIC_HF_API_KEY</code> and <code>NEXT_PUBLIC_HF_SECRET</code> in .env.local to enable generation.
          </div>
        )}

        {/* Model picker */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 flex flex-col gap-3">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Model</label>
          <div className="flex flex-col gap-1.5">
            {KNOWN_MODELS.map(m => (
              <button key={m.value}
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
          <button onClick={() => setUseCustom(v => !v)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', useCustom && 'rotate-180')} />
            Custom model name
          </button>
          {useCustom && (
            <input type="text" value={customModel} onChange={e => setCustomModel(e.target.value)}
              placeholder="e.g. reve/text-to-image"
              className="w-full rounded-lg bg-surface-muted border border-surface-border text-sm text-white placeholder-gray-600 px-3 py-2 focus:outline-none focus:border-fuchsia-600/60" />
          )}
        </div>

        {/* Prompt */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 flex flex-col gap-3">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Prompt</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4}
            placeholder="Describe what you want to generate…"
            className="w-full rounded-lg bg-surface-muted border border-surface-border text-sm text-white placeholder-gray-600 px-3 py-2 resize-none focus:outline-none focus:border-fuchsia-600/60" />
        </div>

        {/* Settings */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 flex flex-col gap-3">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</label>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Aspect Ratio</label>
            <div className="flex flex-wrap gap-1">
              {ASPECT_RATIOS.map(r => (
                <button key={r} onClick={() => setAspectRatio(r)}
                  className={clsx('px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                    aspectRatio === r ? 'bg-fuchsia-600/20 border-fuchsia-600/40 text-fuchsia-300' : 'bg-surface-muted text-gray-500 border-transparent hover:text-white')}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Extra params <span className="text-gray-600">(JSON)</span></label>
            <textarea value={extraParams} onChange={e => setExtraParams(e.target.value)} rows={3}
              placeholder={'{\n  "resolution": "1080p"\n}'}
              className="w-full rounded-lg bg-surface-muted border border-surface-border text-xs text-white placeholder-gray-700 px-3 py-2 resize-none font-mono focus:outline-none focus:border-fuchsia-600/60" />
          </div>
        </div>

        <button disabled={!canSubmit} onClick={handleGenerate}
          className={clsx('w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all',
            canSubmit ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:from-fuchsia-500 hover:to-purple-500 shadow-lg shadow-fuchsia-900/40' : 'bg-surface-muted text-gray-600 cursor-not-allowed')}>
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
            <div className={clsx('flex items-center gap-3 rounded-lg border p-3 text-sm',
              job.result_url || job.status === 'completed' ? 'bg-green-950/40 border-green-800/50 text-green-300' :
              job.status === 'failed' ? 'bg-red-950/40 border-red-800/50 text-red-300' :
              'bg-fuchsia-950/40 border-fuchsia-800/50 text-fuchsia-300')}>
              {job.result_url || job.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> :
               job.status === 'failed' ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4 animate-pulse" />}
              <span className="font-medium capitalize">{job.result_url ? 'Completed' : job.status ?? 'Processing'}</span>
              {!job.result_url && job.status !== 'failed' && <Loader2 className="w-4 h-4 ml-auto animate-spin" />}
            </div>

            {job.result_url && (
              <div className="flex flex-col gap-3">
                {isVideo
                  ? <video src={job.result_url} controls className="w-full rounded-lg border border-surface-border" />
                  // eslint-disable-next-line @next/next/no-img-element
                  : <img src={job.result_url} alt="Generated" className="w-full rounded-lg border border-surface-border" />}
                <a href={job.result_url} download target="_blank" rel="noopener noreferrer"
                  className="self-start flex items-center gap-2 px-4 py-2 rounded-lg bg-fuchsia-600/20 border border-fuchsia-600/40 text-fuchsia-300 text-sm font-medium hover:bg-fuchsia-600/30 transition-colors">
                  <Download className="w-4 h-4" /> Download
                </a>
              </div>
            )}

            {job.error && <p className="text-sm text-red-400">{job.error}</p>}
            <div className="text-xs text-gray-600 font-mono">
              {JSON.stringify(job, null, 2).slice(0, 300)}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
