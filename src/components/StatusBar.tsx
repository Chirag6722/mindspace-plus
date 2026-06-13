import { Link2, StickyNote, Star, ListChecks } from 'lucide-react';
import { Board } from '@/types';

interface StatusBarProps {
  board: Board;
  filteredCount: number;
  searchActive: boolean;
}

export function StatusBar({ board, filteredCount, searchActive }: StatusBarProps) {
  const starred = board.notes.filter((n) => n.starred).length;
  const checklistItems = board.notes.flatMap((n) => n.checklist);
  const doneItems = checklistItems.filter((c) => c.done).length;

  return (
    <div className="absolute bottom-3 left-3 z-30 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white/90 px-3 py-1.5 text-xs text-neutral-500 shadow-panel backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-400">
      <span className="font-medium text-neutral-700 dark:text-neutral-200">
        {board.emoji} {board.name}
      </span>
      <span className="flex items-center gap-1">
        <StickyNote className="h-3.5 w-3.5" />
        {searchActive ? `${filteredCount}/${board.notes.length}` : board.notes.length}
      </span>
      {board.connections.length > 0 && (
        <span className="flex items-center gap-1">
          <Link2 className="h-3.5 w-3.5" />
          {board.connections.length}
        </span>
      )}
      {starred > 0 && (
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-current" />
          {starred}
        </span>
      )}
      {checklistItems.length > 0 && (
        <span className="flex items-center gap-1">
          <ListChecks className="h-3.5 w-3.5" />
          {doneItems}/{checklistItems.length}
        </span>
      )}
    </div>
  );
}
