'use client';

import type { AudioEffects, EQBand } from '@/types/audio';

export class AudioProcessor {
  private ctx: AudioContext;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode;
  private panNode: StereoPannerNode;
  private eqNodes: BiquadFilterNode[] = [];
  private reverbNode: ConvolverNode;
  private compressor: DynamicsCompressorNode;
  private delayNode: DelayNode;
  private delayFeedback: GainNode;
  private delayMix: GainNode;
  private masterGain: GainNode;

  constructor() {
    this.ctx         = new AudioContext();
    this.gainNode    = this.ctx.createGain();
    this.panNode     = this.ctx.createStereoPanner();
    this.reverbNode  = this.ctx.createConvolver();
    this.compressor  = this.ctx.createDynamicsCompressor();
    this.delayNode   = this.ctx.createDelay(5.0);
    this.delayFeedback = this.ctx.createGain();
    this.delayMix    = this.ctx.createGain();
    this.masterGain  = this.ctx.createGain();
    this._buildChain();
  }

  private _buildChain(): void {
    this.gainNode
      .connect(this.panNode)
      .connect(this.compressor)
      .connect(this.masterGain)
      .connect(this.ctx.destination);

    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.delayMix);
    this.delayMix.connect(this.masterGain);
  }

  applyEffects(effects: AudioEffects, volume: number, pan: number): void {
    this.gainNode.gain.setTargetAtTime(volume / 100, this.ctx.currentTime, 0.01);
    this.panNode.pan.setTargetAtTime(pan, this.ctx.currentTime, 0.01);

    this.compressor.threshold.value = effects.compressionThreshold;
    this.compressor.ratio.value     = effects.compressionRatio;

    this.delayNode.delayTime.value    = effects.delayTime;
    this.delayFeedback.gain.value     = effects.delayFeedback;
    this.delayMix.gain.value          = effects.delayTime > 0 ? 0.4 : 0;

    this._applyEQ(effects.eq);
  }

  private _applyEQ(bands: EQBand[]): void {
    this.eqNodes.forEach(n => n.disconnect());
    this.eqNodes = bands.map(band => {
      const node     = this.ctx.createBiquadFilter();
      node.type      = band.type;
      node.frequency.value = band.frequency;
      node.gain.value      = band.gain;
      node.Q.value         = band.Q;
      return node;
    });
  }

  resume(): void { this.ctx.resume(); }
  suspend(): void { this.ctx.suspend(); }

  destroy(): void {
    this.source?.stop();
    this.ctx.close();
  }
}

export function drawWaveformToCanvas(
  canvas: HTMLCanvasElement,
  audioBuffer: AudioBuffer,
  color = '#5263f5',
): void {
  const ctx    = canvas.getContext('2d');
  if (!ctx) return;
  const data   = audioBuffer.getChannelData(0);
  const step   = Math.ceil(data.length / canvas.width);
  const amp    = canvas.height / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = color;
  ctx.lineWidth   = 1;
  ctx.beginPath();

  for (let i = 0; i < canvas.width; i++) {
    let min = 1, max = -1;
    for (let j = 0; j < step; j++) {
      const val = data[i * step + j] ?? 0;
      if (val < min) min = val;
      if (val > max) max = val;
    }
    ctx.moveTo(i, (1 + min) * amp);
    ctx.lineTo(i, (1 + max) * amp);
  }
  ctx.stroke();
}
