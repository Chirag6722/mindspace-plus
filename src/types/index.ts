export type NoteColor =
  | 'yellow'
  | 'blue'
  | 'pink'
  | 'green'
  | 'purple'
  | 'orange'
  | 'gray';

export type NoteTemplate = 'note' | 'todo' | 'idea' | 'reminder';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Note {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: NoteColor;
  template: NoteTemplate;
  title: string;
  /** Rich text HTML content */
  content: string;
  checklist: ChecklistItem[];
  tags: string[];
  starred: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  label: string;
  color: string;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface Board {
  id: string;
  name: string;
  emoji: string;
  notes: Note[];
  connections: Connection[];
  viewport: Viewport;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  version: number;
  boards: Board[];
  activeBoardId: string;
}

export interface FilterState {
  searchTerm: string;
  selectedTags: string[];
  showStarred: boolean;
  activeFilter: 'all' | 'tasks' | 'starred' | 'due';
}

export const NOTE_COLORS: NoteColor[] = [
  'yellow',
  'blue',
  'pink',
  'green',
  'purple',
  'orange',
  'gray',
];

export const TEMPLATE_LABELS: Record<NoteTemplate, string> = {
  note: 'Note',
  todo: 'To-do',
  idea: 'Idea',
  reminder: 'Reminder',
};
