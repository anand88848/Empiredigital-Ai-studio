'use client';

import type { AudioEffects as AudioEffectsType } from '@/types/audio';
import Slider from '@/components/ui/Slider';

interface AudioEffectsProps {
  effects:    AudioEffectsType;
  onChange:   (patch: Partial<AudioEffectsType>) => void;
}

export default function AudioEffects({ effects, onChange }: AudioEffectsProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* EQ */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">Equalizer</p>
        <div className="flex flex-col gap-2">
          {effects.eq.map((band, i) => (
            <Slider
              key={band.frequency}
              label={`${band.frequency >= 1000 ? `${band.frequency / 1000}kHz` : `${band.frequency}Hz`}`}
              unit=" dB"
              min={-15} max={15} step={0.5}
              value={band.gain}
              onChange={e => {
                const eq = effects.eq.map((b, j) =>
                  j === i ? { ...b, gain: Number(e.target.value) } : b,
                );
                onChange({ eq });
              }}
            />
          ))}
        </div>
      </div>

      {/* Dynamics */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">Dynamics</p>
        <Slider label="Compression Threshold" unit=" dB" min={-60} max={0}
          value={effects.compressionThreshold}
          onChange={e => onChange({ compressionThreshold: Number(e.target.value) })} />
        <div className="mt-2" />
        <Slider label="Compression Ratio" unit=":1" min={1} max={20} step={0.5}
          value={effects.compressionRatio}
          onChange={e => onChange({ compressionRatio: Number(e.target.value) })} />
      </div>

      {/* Reverb */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">Space</p>
        <Slider label="Reverb Amount" unit="%" min={0} max={100}
          value={effects.reverbAmount}
          onChange={e => onChange({ reverbAmount: Number(e.target.value) })} />
      </div>

      {/* Delay */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">Delay</p>
        <Slider label="Delay Time" unit=" s" min={0} max={1} step={0.01}
          value={effects.delayTime}
          onChange={e => onChange({ delayTime: Number(e.target.value) })} />
        <div className="mt-2" />
        <Slider label="Delay Feedback" unit="%" min={0} max={90}
          value={effects.delayFeedback * 100}
          onChange={e => onChange({ delayFeedback: Number(e.target.value) / 100 })} />
      </div>

      {/* Noise Reduction */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">AI Noise Reduction</p>
        <Slider label="Strength" unit="%" min={0} max={100}
          value={effects.noiseReduction}
          onChange={e => onChange({ noiseReduction: Number(e.target.value) })} />
      </div>
    </div>
  );
}
