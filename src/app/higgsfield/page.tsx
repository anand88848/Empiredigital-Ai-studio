import { Sparkles } from 'lucide-react';
import HiggsfieldStudio from '@/components/higgsfield/HiggsfieldStudio';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Higgsfield AI — Empiredigital AI Studio',
  description: 'Generate cinematic videos with Higgsfield AI',
};

export default function HiggsfieldPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-700 shadow-lg shadow-fuchsia-900/40">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Higgsfield AI Studio</h1>
          <p className="text-xs text-gray-500">Cinematic video generation with state-of-the-art AI</p>
        </div>
      </div>

      <HiggsfieldStudio />
    </div>
  );
}
