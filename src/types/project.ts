export type ProjectType = 'video' | 'audio';

export type ExportFormat = 'mp4' | 'webm' | 'mov' | 'mp3' | 'wav' | 'flac' | 'ogg';

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  createdAt: Date;
  updatedAt: Date;
  duration: number;
  thumbnail?: string;
  exportFormat: ExportFormat;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface Marker {
  id: string;
  time: number;
  label: string;
  color: string;
}

export interface AIAnalysis {
  summary: string;
  tags: string[];
  suggestions: string[];
  transcript?: string;
  chapters?: { time: number; title: string }[];
}
