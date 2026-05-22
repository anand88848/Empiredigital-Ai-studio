import type { TimeRange, Marker } from './project';

export interface EQBand {
  frequency: number;
  gain: number;
  Q: number;
  type: BiquadFilterType;
}

export interface AudioEffects {
  eq: EQBand[];
  reverbAmount: number;
  compressionThreshold: number;
  compressionRatio: number;
  delayTime: number;
  delayFeedback: number;
  pitchShift: number;
  noiseReduction: number;
}

export interface AudioClip {
  id: string;
  file: File;
  url: string;
  name: string;
  duration: number;
  trimRange: TimeRange;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  effects: AudioEffects;
  startOnTimeline: number;
  trackIndex: number;
  color: string;
}

export interface AudioTrack {
  id: string;
  name: string;
  clips: AudioClip[];
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  color: string;
}

export interface AudioEditorState {
  tracks: AudioTrack[];
  activeClipId: string | null;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  isRecording: boolean;
  zoom: number;
  markers: Marker[];
  masterVolume: number;
  bpm: number;
}

export const DEFAULT_AUDIO_EFFECTS: AudioEffects = {
  eq: [
    { frequency: 60,   gain: 0, Q: 1, type: 'lowshelf'  },
    { frequency: 250,  gain: 0, Q: 1, type: 'peaking'   },
    { frequency: 1000, gain: 0, Q: 1, type: 'peaking'   },
    { frequency: 4000, gain: 0, Q: 1, type: 'peaking'   },
    { frequency: 8000, gain: 0, Q: 1, type: 'peaking'   },
    { frequency: 16000,gain: 0, Q: 1, type: 'highshelf' },
  ],
  reverbAmount:          0,
  compressionThreshold: -24,
  compressionRatio:      4,
  delayTime:             0,
  delayFeedback:         0,
  pitchShift:            0,
  noiseReduction:        0,
};

export const TRACK_COLORS = [
  '#5263f5', '#f55252', '#52f57a', '#f5d252',
  '#52d4f5', '#f552c8', '#52f5e8', '#f5a452',
];
