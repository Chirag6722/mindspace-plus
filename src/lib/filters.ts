import { Board, FilterState } from '@/types';
import { isOverdue } from './utils';
import { stripHtml } from './exportImport';

/**
 * Returns the set of note ids that match the current search/filter,
 * or null if no filter is active (everything is shown normally).
 */
export function computeVisibleNoteIds(board: Board, filter: FilterState): Set<string> | null {
  const term = filter.searchTerm.trim().toLowerCase();
  const hasSearch = term.length > 0;
  const hasFilter = filter.activeFilter !== 'all';

  if (!hasSearch && !hasFilter) return null;

  const ids = new Set<string>();
  for (const note of board.notes) {
    let matches = true;

    if (hasSearch) {
      const haystack = [note.title, stripHtml(note.content), note.tags.join(' '), ...note.checklist.map((c) => c.text)]
        .join(' ')
        .toLowerCase();
      matches = haystack.includes(term);
    }

    if (matches && hasFilter) {
      switch (filter.activeFilter) {
        case 'tasks':
          matches = note.checklist.length > 0;
          break;
        case 'starred':
          matches = note.starred;
          break;
        case 'due':
          matches = isOverdue(note.dueDate);
          break;
      }
    }

    if (matches) ids.add(note.id);
  }
  return ids;
}
