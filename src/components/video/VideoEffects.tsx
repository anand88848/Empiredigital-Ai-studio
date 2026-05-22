'use client';

import { clsx } from 'clsx';
import type { VideoEffect, VideoAdjustments } from '@/types/video';
import Slider from '@/components/ui/Slider';

const EFFECTS: { id: VideoEffect; label: string }[] = [
  { id: 'none',      label: 'Original' },
  { id: 'vivid',     label: 'Vivid'    },
  { id: 'vintage',   label: 'Vintage'  },
  { id: 'grayscale', label: 'B&W'      },
  { id: 'sepia',     label: 'Sepia'    },
  { id: 'invert',    label: 'Invert'   },
];

interface VideoEffectsProps {
  effect:      VideoEffect;
  adjustments: VideoAdjustments;
  onEffect:    (e: VideoEffect) => void;
  onAdjustment:(key: keyof VideoAdjustments, value: number) => void;
}

export default function VideoEffects({ effect, adjustments, onEffect, onAdjustment }: VideoEffectsProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Presets */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">Presets</p>
        <div className="grid grid-cols-3 gap-1.5">
          {EFFECTS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onEffect(id)}
              className={clsx(
                'px-2 py-1.5 rounded-lg text-xs font-medium transition-all',
                effect === id
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-muted text-gray-400 hover:text-white hover:bg-surface-border',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Adjustments */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Adjustments</p>
        <Slider label="Brightness" unit="%" min={0} max={200} value={adjustments.brightness}
          onChange={e => onAdjustment('brightness', Number(e.target.value))} />
        <Slider label="Contrast"   unit="%" min={0} max={200} value={adjustments.contrast}
          onChange={e => onAdjustment('contrast',   Number(e.target.value))} />
        <Slider label="Saturation" unit="%" min={0} max={200} value={adjustments.saturation}
          onChange={e => onAdjustment('saturation', Number(e.target.value))} />
        <Slider label="Hue"        unit="°" min={-180} max={180} value={adjustments.hue}
          onChange={e => onAdjustment('hue',        Number(e.target.value))} />
        <Slider label="Blur"       unit="px" min={0} max={20}   value={adjustments.blur}
          onChange={e => onAdjustment('blur',       Number(e.target.value))} />
      </div>
    </div>
  );
}
