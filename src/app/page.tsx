import Link from 'next/link';
import {
  Video, Music, Sparkles, Zap, Scissors, SlidersHorizontal,
  Wand2, FileAudio, Film, ArrowRight, ImageIcon,
} from 'lucide-react';

const FEATURES = [
  { icon: Film,             title: 'Multi-Clip Video Timeline', desc: 'Import multiple video clips, arrange them on a drag-friendly timeline.' },
  { icon: Scissors,         title: 'Trim, Cut & Split',         desc: 'Precise frame-level trimming with keyboard shortcuts.' },
  { icon: Wand2,            title: 'Effects & Colour Grade',    desc: '6 presets + full brightness, contrast, saturation, hue controls.' },
  { icon: FileAudio,        title: 'Multi-Track Audio Mixer',   desc: 'Layer unlimited audio tracks with per-track volume, pan, and solo.' },
  { icon: SlidersHorizontal,title: '6-Band Equalizer',          desc: 'Boost or cut any frequency range with precision controls.' },
  { icon: Sparkles,         title: 'Claude AI Integration',     desc: 'Instant analysis, smart suggestions, auto-tagging & transcripts.' },
  { icon: ImageIcon,        title: 'Higgsfield AI Generator',   desc: 'Generate ultra-realistic images & cinematic videos from a prompt.' },
];

const QUICK_ACTIONS = [
  { href: '/video-editor', icon: Video,     label: 'Open Video Editor', color: 'from-blue-600 to-brand-600' },
  { href: '/audio-editor', icon: Music,     label: 'Open Audio Editor', color: 'from-purple-600 to-pink-600' },
  { href: '/higgsfield',   icon: Sparkles,  label: 'AI Generator',      color: 'from-purple-700 to-fuchsia-600' },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <section className="text-center pt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-950/60 border border-brand-800/60 text-xs font-medium text-brand-300 mb-6">
          <Zap className="w-3.5 h-3.5" />
          Powered by Claude AI
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight text-balance">
          Professional Editing,<br />
          <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            AI-Supercharged
          </span>
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-base text-gray-400 text-balance">
          Empiredigital AI Studio brings studio-grade video and audio editing to your browser,
          with Claude AI providing instant suggestions, auto-transcription, and smart enhancement.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {QUICK_ACTIONS.map(({ href, icon: Icon, label, color }) => (
            <Link
              key={href}
              href={href}
              className={`group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-white text-sm
                bg-gradient-to-r ${color} shadow-lg hover:shadow-xl transition-all hover:scale-105`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-gray-500 mb-8">
          Everything you need
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-surface-border bg-surface-card p-5 hover:border-brand-700/60 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-950 border border-brand-800/50 flex items-center justify-center mb-3 group-hover:bg-brand-900 transition-colors">
                <Icon className="w-4 h-4 text-brand-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Callout */}
      <section className="rounded-2xl border border-brand-800/40 bg-gradient-to-br from-brand-950/60 to-surface-card p-8 text-center">
        <Sparkles className="w-8 h-8 text-brand-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Claude AI Built Right In</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
          Analyse your media, get instant edit suggestions, generate titles and tags, and chat
          with your AI co-editor — all without leaving the studio.
        </p>
        <p className="text-xs text-gray-600">
          Set <code className="bg-surface-muted px-1.5 py-0.5 rounded text-brand-400">ANTHROPIC_API_KEY</code> in{' '}
          <code className="bg-surface-muted px-1.5 py-0.5 rounded text-gray-300">.env.local</code> to activate AI features.
        </p>
      </section>
    </div>
  );
}
