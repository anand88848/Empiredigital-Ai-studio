'use client';

import { type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  unit?: string;
  showValue?: boolean;
}

export default function Slider({ label, unit, showValue = true, className, ...props }: SliderProps) {
  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-xs text-gray-400">{label}</span>}
          {showValue && (
            <span className="text-xs font-mono text-gray-300">
              {props.value}{unit}
            </span>
          )}
        </div>
      )}
      <input
        type="range"
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer
          bg-surface-border
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3.5
          [&::-webkit-slider-thumb]:h-3.5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-brand-500
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-125
          focus:outline-none"
        {...props}
      />
    </div>
  );
}
