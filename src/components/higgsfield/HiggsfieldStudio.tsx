'use client';

import { useState } from 'react';
import { Image, Video, Sparkles, Download, Copy, Loader2, AlertCircle, CheckCircle2, Wand2 } from 'lucide-react';
import { clsx } from 'clsx';
import { SOUL_SIZES } from '@/lib/higgsfield';

type Tab = 'image' | 'video';
type Quality = '720p' | '1080p';
type DoPModel = 'dop-lite' | 'dop-turbo' | 'dop-standard';

interface GenResult {
  status: string;
  request_id: string;
  images?: { url: string }[];
  video?: { url: string };
}

const DOP_MODELS: { value: DoPModel; label: string; hint: string }[] = [
  { value: 'dop-lite',     label: 'Lite',     hint: 'Fastest' },
  { value: 'dop-turbo',    label: 'Turbo',    hint: 'Balanced' },
  { value: 'dop-standard', label: 'Standard', hint: 'Best quality' },
];

export default function HiggsfieldStudio() {
  const [tab, setTab] = useState<Tab>('image');

  // Image state
  const [imgPrompt, setImgPrompt]     = useState('');
  const [imgSize, setImgSize]         = useState('1536x1536');
  const [imgQuality, setImgQuality]   = useState<Quality>('1080p');
  const [imgLoading, setImgLoading]   = useState(false);
  const [imgResult, setImgResult]     = useState<GenResult | null>(null);
  const [imgError, setImgError]       = useState<string | null>(null);

  // Video state
  const [vidPrompt, setVidPrompt]     = useState('');
  const [vidImageUrl, setVidImageUrl] = useState('');
  const [vidModel, setVidModel]       = useState<DoPModel>('dop-standard');
  const [vidLoading, setVidLoading]   = useState(false);
  const [vidResult, setVidResult]     = useState<GenResult | null>(null);
  const [vidError, setVidError]       = useState<string | null>(null);

  // Claude prompt state
  const [claudeIdea, setClaudeIdea]     = useState('');
  const [claudeLoading, setClaudeLoading] = useState(false);

  async function generateImage() {
    if (!imgPrompt.trim()) return;
    setImgLoading(true);
    setImgError(null);
    setImgResult(null);
    try {
      const res = await fetch('/api/higgsfield/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imgPrompt, size: imgSize, quality: imgQuality }),
      });
      const data = await res.json() as GenResult & { error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? 'Generation failed');
      setImgResult(data);
    } catch (e) {
      setImgError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setImgLoading(false);
    }
  }

  async function generateVideo() {
    if (!vidPrompt.trim() || !vidImageUrl.trim()) return;
    setVidLoading(true);
    setVidError(null);
    setVidResult(null);
    try {
      const res = await fetch('/api/higgsfield/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: vidPrompt, imageUrl: vidImageUrl, model: vidModel }),
      });
      const data = await res.json() as GenResult & { error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? 'Generation failed');
      setVidResult(data);
    } catch (e) {
      setVidError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setVidLoading(false);
    }
  }

  async function generatePromptWithClaude() {
    if (!claudeIdea.trim()) return;
    setClaudeLoading(true);
    try {
      const res = await fetch('/api/higgsfield/suggest-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: claudeIdea, type: tab }),
      });
      const data = await res.json() as { prompt?: string; error?: string };
      if (data.prompt) {
        if (tab === 'image') setImgPrompt(data.prompt);
        else setVidPrompt(data.prompt);
        setClaudeIdea('');
      }
    } catch {
      // silently fail — user can still type manually
    } finally {
      setClaudeLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).catch(() => undefined);
  }

  const imgUrl  = imgResult?.images?.[0]?.url;
  const vidUrl  = vidResult?.video?.url;

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-muted w-fit">
        {(['image', 'video'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t
                ? 'bg-brand-600 text-white shadow'
                : 'text-gray-400 hover:text-white',
            )}
          >
            {t === 'image' ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            {t === 'image' ? 'Image Generation' : 'Video Generation'}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form panel */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-6 flex flex-col gap-5">
          {tab === 'image' ? (
            <>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                Text → Image (Higgsfield Soul)
              </h2>

              <ClaudePromptBox
                idea={claudeIdea}
                loading={claudeLoading}
                onChange={setClaudeIdea}
                onGenerate={generatePromptWithClaude}
                type="image"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400">Prompt</label>
                <textarea
                  rows={4}
                  value={imgPrompt}
                  onChange={e => setImgPrompt(e.target.value)}
                  placeholder="A cinematic close-up of a woman in a neon-lit city, rain-soaked streets, ultra-detailed..."
                  className="w-full rounded-lg bg-surface-muted border border-surface-border px-3 py-2.5 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-brand-600 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-400">Size</label>
                  <select
                    value={imgSize}
                    onChange={e => setImgSize(e.target.value)}
                    className="rounded-lg bg-surface-muted border border-surface-border px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-600"
                  >
                    {Object.entries(SOUL_SIZES).map(([label, value]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-400">Quality</label>
                  <div className="flex gap-2">
                    {(['720p', '1080p'] as Quality[]).map(q => (
                      <button
                        key={q}
                        onClick={() => setImgQuality(q)}
                        className={clsx(
                          'flex-1 py-2 rounded-lg text-xs font-semibold border transition-all',
                          imgQuality === q
                            ? 'bg-brand-600/20 border-brand-600 text-brand-300'
                            : 'bg-surface-muted border-surface-border text-gray-400 hover:text-white',
                        )}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={generateImage}
                disabled={imgLoading || !imgPrompt.trim()}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
              >
                {imgLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating image…</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Image</>
                )}
              </button>

              {imgLoading && (
                <p className="text-center text-xs text-gray-500">
                  Higgsfield Soul is working — usually 15–40 seconds.
                </p>
              )}
            </>
          ) : (
            <>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                Image → Video (Higgsfield DoP)
              </h2>

              <ClaudePromptBox
                idea={claudeIdea}
                loading={claudeLoading}
                onChange={setClaudeIdea}
                onGenerate={generatePromptWithClaude}
                type="video"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400">Reference Image URL</label>
                <input
                  type="url"
                  value={vidImageUrl}
                  onChange={e => setVidImageUrl(e.target.value)}
                  placeholder="https://example.com/your-image.jpg"
                  className="w-full rounded-lg bg-surface-muted border border-surface-border px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-600 transition-colors"
                />
                {imgUrl && (
                  <button
                    onClick={() => setVidImageUrl(imgUrl)}
                    className="self-start text-xs text-brand-400 hover:underline"
                  >
                    ← Use last generated image
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400">Motion Prompt</label>
                <textarea
                  rows={3}
                  value={vidPrompt}
                  onChange={e => setVidPrompt(e.target.value)}
                  placeholder="Slow cinematic pan to the right, shallow depth of field, golden hour lighting..."
                  className="w-full rounded-lg bg-surface-muted border border-surface-border px-3 py-2.5 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-brand-600 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400">Model</label>
                <div className="flex gap-2">
                  {DOP_MODELS.map(({ value, label, hint }) => (
                    <button
                      key={value}
                      onClick={() => setVidModel(value)}
                      className={clsx(
                        'flex-1 py-2 rounded-lg text-xs font-semibold border transition-all',
                        vidModel === value
                          ? 'bg-brand-600/20 border-brand-600 text-brand-300'
                          : 'bg-surface-muted border-surface-border text-gray-400 hover:text-white',
                      )}
                    >
                      {label}
                      <span className="block font-normal text-gray-500 text-[10px]">{hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateVideo}
                disabled={vidLoading || !vidPrompt.trim() || !vidImageUrl.trim()}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
              >
                {vidLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating video…</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Video</>
                )}
              </button>

              {vidLoading && (
                <p className="text-center text-xs text-gray-500">
                  DoP model is animating your image — typically 30–120 seconds.
                </p>
              )}
            </>
          )}
        </div>

        {/* Result panel */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-6 flex flex-col gap-4 min-h-[320px]">
          <h3 className="text-sm font-semibold text-gray-400">Result</h3>

          {tab === 'image' && (
            <>
              {imgError && <ErrorBanner message={imgError} />}
              {imgLoading && <GeneratingPlaceholder type="image" />}
              {imgUrl && !imgLoading && (
                <ImageResult
                  url={imgUrl}
                  requestId={imgResult!.request_id}
                  onCopy={() => copyToClipboard(imgUrl)}
                  onUseForVideo={() => { setTab('video'); setVidImageUrl(imgUrl); }}
                />
              )}
              {!imgUrl && !imgLoading && !imgError && <EmptyState type="image" />}
            </>
          )}

          {tab === 'video' && (
            <>
              {vidError && <ErrorBanner message={vidError} />}
              {vidLoading && <GeneratingPlaceholder type="video" />}
              {vidUrl && !vidLoading && (
                <VideoResult
                  url={vidUrl}
                  requestId={vidResult!.request_id}
                  onCopy={() => copyToClipboard(vidUrl)}
                />
              )}
              {!vidUrl && !vidLoading && !vidError && <EmptyState type="video" />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ClaudePromptBox({ idea, loading, onChange, onGenerate, type }: {
  idea: string;
  loading: boolean;
  onChange: (v: string) => void;
  onGenerate: () => void;
  type: Tab;
}) {
  return (
    <div className="rounded-lg border border-brand-800/50 bg-brand-950/30 p-3 flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-300">
        <Wand2 className="w-3.5 h-3.5" />
        Claude AI — describe your idea
      </div>
      <div className="flex gap-2">
        <input
          value={idea}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onGenerate(); }}
          placeholder={type === 'image'
            ? 'e.g. "a fashion model in Tokyo rain at night"'
            : 'e.g. "slow dramatic zoom into the subject\'s face"'}
          className="flex-1 rounded-lg bg-surface-muted border border-surface-border px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-600 transition-colors"
        />
        <button
          onClick={onGenerate}
          disabled={loading || !idea.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all whitespace-nowrap"
        >
          {loading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Writing…</>
            : <><Wand2 className="w-3.5 h-3.5" /> Write prompt</>}
        </button>
      </div>
      <p className="text-[10px] text-gray-600">Claude will craft a detailed {type === 'image' ? 'image' : 'motion'} prompt and fill it below automatically.</p>
    </div>
  );
}

function EmptyState({ type }: { type: Tab }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-10">
      {type === 'image'
        ? <Image className="w-10 h-10 text-gray-700" />
        : <Video className="w-10 h-10 text-gray-700" />}
      <p className="text-sm text-gray-600">
        {type === 'image'
          ? 'Enter a prompt and click Generate to create an image.'
          : 'Provide an image URL, a motion prompt, and click Generate.'}
      </p>
    </div>
  );
}

function GeneratingPlaceholder({ type }: { type: Tab }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-10">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-brand-900" />
        <div className="absolute inset-0 rounded-full border-4 border-brand-400 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-gray-500">
        {type === 'image' ? 'Rendering image with Higgsfield Soul…' : 'Animating clip with DoP model…'}
      </p>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-red-950/40 border border-red-800/50 px-4 py-3 text-sm text-red-300">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function ImageResult({
  url, requestId, onCopy, onUseForVideo,
}: {
  url: string;
  requestId: string;
  onCopy: () => void;
  onUseForVideo: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3 animate-fade-in">
      <div className="rounded-lg overflow-hidden border border-surface-border bg-surface-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Generated" className="w-full object-contain max-h-80" />
      </div>
      <p className="text-[10px] text-gray-600 font-mono truncate">ID: {requestId}</p>
      <div className="flex gap-2 flex-wrap">
        <a
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-muted border border-surface-border text-xs text-white hover:bg-brand-600/20 hover:border-brand-600 transition-all"
        >
          <Download className="w-3.5 h-3.5" /> Download
        </a>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-muted border border-surface-border text-xs text-white hover:bg-brand-600/20 hover:border-brand-600 transition-all"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy URL'}
        </button>
        <button
          onClick={onUseForVideo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600/20 border border-brand-600/60 text-xs text-brand-300 hover:bg-brand-600/30 transition-all"
        >
          <Video className="w-3.5 h-3.5" /> Animate this image
        </button>
      </div>
    </div>
  );
}

function VideoResult({
  url, requestId, onCopy,
}: {
  url: string;
  requestId: string;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3 animate-fade-in">
      <div className="rounded-lg overflow-hidden border border-surface-border bg-surface-muted">
        <video
          src={url}
          controls
          loop
          className="w-full max-h-72"
        />
      </div>
      <p className="text-[10px] text-gray-600 font-mono truncate">ID: {requestId}</p>
      <div className="flex gap-2 flex-wrap">
        <a
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-muted border border-surface-border text-xs text-white hover:bg-brand-600/20 hover:border-brand-600 transition-all"
        >
          <Download className="w-3.5 h-3.5" /> Download
        </a>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-muted border border-surface-border text-xs text-white hover:bg-brand-600/20 hover:border-brand-600 transition-all"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy URL'}
        </button>
      </div>
    </div>
  );
}
