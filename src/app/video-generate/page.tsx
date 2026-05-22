'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, Film, Wand2, Download, AlertCircle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import type {
  AspectRatio,
  HiggsfieldModel,
  JobStatusResponse,
} from '@/lib/higgsfield';

const MODELS: { value: HiggsfieldModel; label: string; desc: string }[] = [
  { value: 'lite',     label: 'Lite',     desc: 'Fast preview' },
  { value: 'standard', label: 'Standard', desc: 'Balanced quality' },
  { value: 'turbo',    label: 'Turbo',    desc: 'Speed-optimised' },
  { value: 'cinema',   label: 'Cinema',   desc: 'Highest fidelity' },
];

const ASPECTS: { value: AspectRatio; label: string }[] = [
  { value: '16:9', label: '16:9 Landscape' },
  { value: '9:16', label: '9:16 Vertical'  },
  { value: '1:1',  label: '1:1 Square'     },
  { value: '4:3',  label: '4:3 Classic'    },
];

export default function VideoGeneratePage() {
  const [prompt, setPrompt]           = useState('');
  const [model, setModel]             = useState<HiggsfieldModel>('standard');
  const [aspect, setAspect]           = useState<AspectRatio>('16:9');
  const [durationSec, setDurationSec] = useState(5);

  const [refining, setRefining]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob]             = useState<JobStatusResponse | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function handleRefine() {
    if (!prompt.trim()) return;
    setRefining(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Refinement failed');
      if (data.refined) setPrompt(data.refined);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Refinement failed');
    } finally {
      setRefining(false);
    }
  }

  async function pollStatus(jobId: string) {
    try {
      const res = await fetch(`/api/higgsfield/status/${encodeURIComponent(jobId)}`);
      const data = (await res.json()) as JobStatusResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Status check failed');

      setJob(data);

      if (data.status === 'succeeded' || data.status === 'failed') {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        if (data.status === 'failed') {
          setError(data.error ?? 'Generation failed');
        }
      }
    } catch (e: unknown) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      setError(e instanceof Error ? e.message : 'Status check failed');
    }
  }

  async function handleGenerate() {
    if (!prompt.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    setJob(null);

    try {
      const res = await fetch('/api/higgsfield/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model,
          aspectRatio: aspect,
          durationSec,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');

      const jobId: string = data.jobId;
      setJob({ jobId, status: 'queued' });

      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => pollStatus(jobId), 3000);
      pollStatus(jobId);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setSubmitting(false);
    }
  }

  const isRunning = job?.status === 'queued' || job?.status === 'processing';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
          <Film className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Video Generation</h1>
          <p className="text-sm text-gray-500">Powered by Higgsfield · Refined by Claude</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        {/* Left: form */}
        <div className="space-y-5 rounded-xl border border-surface-border bg-surface-card p-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="A cinematic shot of a vintage car driving through neon-lit rainy streets at night, slow dolly forward, anamorphic lens flare..."
              rows={6}
              className="w-full rounded-lg bg-surface border border-surface-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm text-white p-3 resize-none"
            />
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefine}
                loading={refining}
                disabled={!prompt.trim()}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Refine with Claude
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Model
              </label>
              <select
                value={model}
                onChange={e => setModel(e.target.value as HiggsfieldModel)}
                className="w-full rounded-lg bg-surface border border-surface-border text-sm text-white p-2"
              >
                {MODELS.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label} — {m.desc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Aspect ratio
              </label>
              <select
                value={aspect}
                onChange={e => setAspect(e.target.value as AspectRatio)}
                className="w-full rounded-lg bg-surface border border-surface-border text-sm text-white p-2"
              >
                {ASPECTS.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Duration: {durationSec}s
            </label>
            <input
              type="range"
              min={2}
              max={15}
              step={1}
              value={durationSec}
              onChange={e => setDurationSec(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleGenerate}
            loading={submitting || isRunning}
            disabled={!prompt.trim()}
            icon={<Wand2 className="w-4 h-4" />}
            className="w-full"
          >
            {isRunning ? 'Generating…' : 'Generate Video'}
          </Button>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="break-words">{error}</div>
            </div>
          )}
        </div>

        {/* Right: result */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-5 flex flex-col">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Result
          </h2>

          <div className="flex-1 rounded-lg bg-surface border border-surface-border flex items-center justify-center min-h-[300px] overflow-hidden">
            {!job && (
              <div className="text-center px-6">
                <Film className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Your generated video will appear here.
                </p>
              </div>
            )}

            {job && isRunning && (
              <div className="text-center px-6">
                <Loader2 className="w-10 h-10 text-brand-500 mx-auto mb-3 animate-spin" />
                <p className="text-sm text-white capitalize">{job.status}…</p>
                {typeof job.progress === 'number' && (
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(job.progress * 100)}%
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-3 font-mono">
                  Job: {job.jobId}
                </p>
              </div>
            )}

            {job?.status === 'succeeded' && job.videoUrl && (
              <video
                src={job.videoUrl}
                poster={job.thumbnailUrl}
                controls
                className="w-full h-full object-contain"
              />
            )}

            {job?.status === 'failed' && (
              <div className="text-center px-6">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <p className="text-sm text-red-300">Generation failed</p>
              </div>
            )}
          </div>

          {job?.status === 'succeeded' && job.videoUrl && (
            <a
              href={job.videoUrl}
              download
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg border border-surface-border hover:border-brand-500 px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-6 text-center">
        Set <code className="bg-surface-muted px-1.5 py-0.5 rounded text-brand-400">HIGGSFIELD_API_KEY</code>{' '}
        and <code className="bg-surface-muted px-1.5 py-0.5 rounded text-brand-400">ANTHROPIC_API_KEY</code>{' '}
        in <code className="bg-surface-muted px-1.5 py-0.5 rounded text-gray-300">.env.local</code> to enable this page.
      </p>
    </div>
  );
}
