import type { TimeRange, Marker } from './project';

export type VideoEffect =
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'invert'
  | 'blur'
  | 'sharpen'
  | 'vintage'
  | 'vivid';

export type TransitionType = 'cut' | 'fade' | 'dissolve' | 'wipe';

export interface VideoAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  sharpness: number;
  blur: number;
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
  timeRange: TimeRange;
}

export interface VideoClip {
  id: string;
  file: File;
  url: string;
  name: string;
  duration: number;
  trimRange: TimeRange;
  effect: VideoEffect;
  adjustments: VideoAdjustments;
  overlays: TextOverlay[];
  transition: TransitionType;
  volume: number;
  muted: boolean;
  startOnTimeline: number;
}

export interface VideoEditorState {
  clips: VideoClip[];
  activeClipId: string | null;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  zoom: number;
  markers: Marker[];
}

export const DEFAULT_ADJUSTMENTS: VideoAdjustments = {
  brightness: 100,
  contrast:   100,
  saturation: 100,
  hue:        0,
  sharpness:  0,
  blur:       0,
};
