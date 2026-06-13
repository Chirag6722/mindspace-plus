import { NoteColor } from '@/types';

interface ColorClasses {
  bg: string;
  border: string;
  text: string;
  swatch: string;
}

export const NOTE_COLOR_CLASSES: Record<NoteColor, ColorClasses> = {
  yellow: { bg: 'bg-note-yellow-bg', border: 'border-note-yellow-border', text: 'text-note-yellow-text', swatch: 'bg-[#fef6d8]' },
  blue: { bg: 'bg-note-blue-bg', border: 'border-note-blue-border', text: 'text-note-blue-text', swatch: 'bg-[#dbeefe]' },
  pink: { bg: 'bg-note-pink-bg', border: 'border-note-pink-border', text: 'text-note-pink-text', swatch: 'bg-[#fde2ef]' },
  green: { bg: 'bg-note-green-bg', border: 'border-note-green-border', text: 'text-note-green-text', swatch: 'bg-[#def7e6]' },
  purple: { bg: 'bg-note-purple-bg', border: 'border-note-purple-border', text: 'text-note-purple-text', swatch: 'bg-[#ece4fb]' },
  orange: { bg: 'bg-note-orange-bg', border: 'border-note-orange-border', text: 'text-note-orange-text', swatch: 'bg-[#fde6d2]' },
  gray: { bg: 'bg-note-gray-bg', border: 'border-note-gray-border', text: 'text-note-gray-text', swatch: 'bg-[#eceef1]' },
};
