import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { ChecklistItem } from '@/types';
import { uid } from '@/lib/utils';

interface ChecklistEditorProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

export function ChecklistEditor({ items, onChange }: ChecklistEditorProps) {
  const [draft, setDraft] = useState('');

  const toggle = (id: string) => {
    onChange(items.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  };

  const updateText = (id: string, text: string) => {
    onChange(items.map((it) => (it.id === id ? { ...it, text } : it)));
  };

  const remove = (id: string) => {
    onChange(items.filter((it) => it.id !== id));
  };

  const addItem = () => {
    const text = draft.trim();
    if (!text) return;
    onChange([...items, { id: uid('item_'), text, done: false }]);
    setDraft('');
  };

  return (
    <div className="mt-1 space-y-0.5" onMouseDown={(e) => e.stopPropagation()}>
      {items.map((item) => (
        <div key={item.id} className="group flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={item.done}
            onChange={() => toggle(item.id)}
            className="h-3.5 w-3.5 cursor-pointer accent-current"
          />
          <input
            value={item.text}
            onChange={(e) => updateText(item.id, e.target.value)}
            className={`flex-1 bg-transparent text-sm outline-none ${item.done ? 'text-current/50 line-through' : ''}`}
          />
          <button
            onClick={() => remove(item.id)}
            className="opacity-0 transition-opacity group-hover:opacity-60 hover:!opacity-100"
            aria-label="Remove item"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-1.5 pt-0.5">
        <Plus className="h-3.5 w-3.5 opacity-50" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
          onBlur={addItem}
          placeholder="Add item..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-50"
        />
      </div>
    </div>
  );
}
