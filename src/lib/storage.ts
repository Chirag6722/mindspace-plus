import { AppData } from '@/types';

const STORAGE_KEY = 'mindspace-plus:data';
const CURRENT_VERSION = 1;

export function loadAppData(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed || !Array.isArray(parsed.boards)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save MindSpace+ data:', err);
  }
}

export function makeAppData(boards: AppData['boards'], activeBoardId: string): AppData {
  return { version: CURRENT_VERSION, boards, activeBoardId };
}
