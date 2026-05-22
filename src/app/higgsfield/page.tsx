import { Sparkles } from 'lucide-react';
import HiggsfieldStudio from '@/components/higgsfield/HiggsfieldStudio';

export const metadata = {
  title: 'Higgsfield AI — Empiredigital AI Studio',
  description: 'Generate stunning images and cinematic videos using Higgsfield AI.',
};

export default function HiggsfieldPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-600/40">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Higgsfield AI Generator</h1>
        </div>
        <p className="text-sm text-gray-500 ml-10">
          Generate ultra-realistic images and cinematic videos powered by Higgsfield AI.
          Set <code className="bg-surface-muted px-1 rounded text-brand-400">HIGGSFIELD_CREDENTIALS</code> in{' '}
          <code className="bg-surface-muted px-1 rounded text-gray-300">.env.local</code> to activate.
        </p>
      </div>
      <HiggsfieldStudio />
    </div>
  );
}
