import { Sparkles } from 'lucide-react';
import HiggsfieldStudio from '@/components/higgsfield/HiggsfieldStudio';

export const metadata = {
  title: 'Higgsfield AI — Empiredigital AI Studio',
  description: 'AI video generation and effects powered by Higgsfield',
};

export default function HiggsfieldPage() {
  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-9rem)]">
      <div className="flex items-start justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-higgsfield-600 to-purple-700 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Higgsfield AI</h1>
          </div>
          <p className="text-xs text-gray-500">
            AI video generation, effects, and professional tools — powered by Higgsfield
          </p>
        </div>
        <a
          href="https://higgsfield.ai/apps"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-higgsfield-400 hover:text-higgsfield-300 underline underline-offset-2"
        >
          Browse all effects ↗
        </a>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <HiggsfieldStudio />
      </div>
    </div>
  );
}
