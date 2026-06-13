import { useState } from 'react';
import { Plus, Trash2, PanelLeftClose, PanelLeftOpen, Pencil, Check } from 'lucide-react';
import { Board } from '@/types';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  boards: Board[];
  activeBoardId: string;
  open: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({ boards, activeBoardId, open, onToggle, onSelect, onAdd, onRename, onDelete }: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  if (!open) {
    return (
      <div className="absolute left-3 top-3 z-40">
        <Button variant="outline" size="icon" onClick={onToggle} title="Show boards" className="shadow-panel">
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute left-3 top-3 z-40 flex max-h-[calc(100%-1.5rem)] w-60 flex-col rounded-2xl border border-neutral-200 bg-white/90 shadow-panel backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/90">
      <div className="flex items-center justify-between border-b border-neutral-200/70 px-3 py-2.5 dark:border-neutral-700/70">
        <span className="text-sm font-semibold">Boards</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onAdd} title="New board">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggle} title="Hide boards">
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto p-1.5">
        {boards.map((board) => {
          const active = board.id === activeBoardId;
          const editing = editingId === board.id;
          return (
            <div
              key={board.id}
              className={cn(
                'group flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm cursor-pointer transition-colors',
                active ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100' : 'hover:bg-black/[0.04] dark:hover:bg-white/5'
              )}
              onClick={() => !editing && onSelect(board.id)}
            >
              <span className="text-base leading-none">{board.emoji}</span>
              {editing ? (
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onRename(board.id, draft.trim() || 'Untitled');
                      setEditingId(null);
                    }
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="flex-1 rounded border border-neutral-300 bg-white px-1 text-sm outline-none dark:border-neutral-600 dark:bg-neutral-800"
                />
              ) : (
                <span className="flex-1 truncate">{board.name}</span>
              )}
              <span className="text-[11px] text-neutral-400">{board.notes.length}</span>

              {editing ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename(board.id, draft.trim() || 'Untitled');
                    setEditingId(null);
                  }}
                  className="opacity-60 hover:opacity-100"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDraft(board.name);
                    setEditingId(board.id);
                  }}
                  className="opacity-0 transition-opacity group-hover:opacity-50 hover:!opacity-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {boards.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete board "${board.name}"? This cannot be undone.`)) onDelete(board.id);
                  }}
                  className="opacity-0 transition-opacity group-hover:opacity-50 hover:!opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
