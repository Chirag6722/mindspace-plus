import { useState } from 'react';
import {
  Star,
  Trash2,
  CheckSquare,
  StickyNote,
  Lightbulb,
  Bell,
  CalendarDays,
  Tag as TagIcon,
  X,
  GripHorizontal,
  ListChecks,
} from 'lucide-react';
import { Note, NoteColor, NoteTemplate, NOTE_COLORS } from '@/types';
import { NOTE_COLOR_CLASSES } from '@/lib/colors';
import { RichTextEditor } from './RichTextEditor';
import { ChecklistEditor } from './ChecklistEditor';
import { cn, formatDate, isOverdue } from '@/lib/utils';
import { Menu } from './ui/Menu';

const TEMPLATE_ICONS: Record<NoteTemplate, typeof StickyNote> = {
  note: StickyNote,
  todo: CheckSquare,
  idea: Lightbulb,
  reminder: Bell,
};

interface NoteCardProps {
  note: Note;
  zoom: number;
  selected: boolean;
  dimmed: boolean;
  connectMode: boolean;
  isConnectSource: boolean;
  onSelect: () => void;
  onConnectClick: () => void;
  onMoveStart: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  onUpdate: (partial: Partial<Note>) => void;
  onDelete: () => void;
}

export function NoteCard({
  note,
  zoom,
  selected,
  dimmed,
  connectMode,
  isConnectSource,
  onSelect,
  onConnectClick,
  onMoveStart,
  onMove,
  onResize,
  onUpdate,
  onDelete,
}: NoteCardProps) {
  const [tagDraft, setTagDraft] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [showChecklist, setShowChecklist] = useState(note.checklist.length > 0 || note.template === 'todo');
  const [showDateInput, setShowDateInput] = useState(!!note.dueDate);

  const colors = NOTE_COLOR_CLASSES[note.color];
  const Icon = TEMPLATE_ICONS[note.template];

  const overdue = isOverdue(note.dueDate) && !(note.checklist.length > 0 && note.checklist.every((c) => c.done));

  const startDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveStart();
    const startClient = { x: e.clientX, y: e.clientY };
    const startPos = { x: note.x, y: note.y };
    const onMouseMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startClient.x) / zoom;
      const dy = (ev.clientY - startClient.y) / zoom;
      onMove(startPos.x + dx, startPos.y + dy);
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const startResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onMoveStart();
    const start = { x: e.clientX, y: e.clientY, w: note.width, h: note.height };
    const onMouseMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - start.x) / zoom;
      const dy = (ev.clientY - start.y) / zoom;
      onResize(Math.max(180, start.w + dx), Math.max(120, start.h + dy));
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const addTag = () => {
    const t = tagDraft.trim().replace(/^#/, '');
    if (t && !note.tags.includes(t)) onUpdate({ tags: [...note.tags, t] });
    setTagDraft('');
    setShowTagInput(false);
  };

  return (
    <div
      data-note-card
      onMouseDownCapture={(e) => {
        if (connectMode) {
          e.preventDefault();
          e.stopPropagation();
          onConnectClick();
        }
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        if (!connectMode) onSelect();
      }}
      className={cn(
        'absolute flex flex-col rounded-xl border-2 shadow-note transition-shadow duration-150',
        colors.bg,
        colors.border,
        colors.text,
        selected && 'note-selected shadow-note-hover z-10',
        dimmed && 'opacity-25',
        connectMode && 'cursor-crosshair',
        isConnectSource && 'ring-2 ring-blue-500 ring-offset-2'
      )}
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        transform: `rotate(${selected ? 0 : note.rotation}deg)`,
      }}
    >
      {/* Header / drag handle */}
      <div className="flex items-center gap-1 px-2 pt-1.5 cursor-grab active:cursor-grabbing" onMouseDown={startDrag}>
        <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" />
        <input
          value={note.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="Untitled"
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:opacity-40"
        />
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => onUpdate({ starred: !note.starred })}
          className="shrink-0 opacity-70 hover:opacity-100"
          aria-label="Toggle star"
        >
          <Star className={cn('h-3.5 w-3.5', note.starred && 'fill-current')} />
        </button>
        <Menu
          align="right"
          trigger={
            <button
              onMouseDown={(e) => e.stopPropagation()}
              className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current/40', NOTE_COLOR_CLASSES[note.color].swatch)}
              aria-label="Change color"
              title="Change color"
            />
          }
        >
          <div className="grid grid-cols-4 gap-1 p-1">
            {NOTE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onUpdate({ color: c as NoteColor })}
                className={cn(
                  'h-6 w-6 rounded-full border-2',
                  NOTE_COLOR_CLASSES[c].swatch,
                  c === note.color ? 'border-neutral-900 dark:border-white' : 'border-transparent'
                )}
                aria-label={c}
              />
            ))}
          </div>
        </Menu>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onDelete}
          className="shrink-0 opacity-50 hover:opacity-100"
          aria-label="Delete note"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="thin-scroll flex-1 overflow-auto px-2.5 py-1">
        <RichTextEditor
          value={note.content}
          onChange={(html) => onUpdate({ content: html })}
          placeholder="Write something..."
        />
        {showChecklist && <ChecklistEditor items={note.checklist} onChange={(checklist) => onUpdate({ checklist })} />}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-1 px-2 pb-1.5 pt-0.5" onMouseDown={(e) => e.stopPropagation()}>
        {note.tags.map((tag) => (
          <span
            key={tag}
            className="group flex items-center gap-0.5 rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[10px] dark:bg-white/10"
          >
            #{tag}
            <button onClick={() => onUpdate({ tags: note.tags.filter((t) => t !== tag) })} aria-label="Remove tag">
              <X className="h-2.5 w-2.5 opacity-50 group-hover:opacity-100" />
            </button>
          </span>
        ))}

        {showTagInput ? (
          <input
            autoFocus
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onBlur={addTag}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTag();
              if (e.key === 'Escape') setShowTagInput(false);
            }}
            placeholder="tag"
            className="w-16 rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[10px] outline-none dark:bg-white/10"
          />
        ) : (
          <button
            onClick={() => setShowTagInput(true)}
            className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] opacity-50 hover:bg-black/[0.06] hover:opacity-100 dark:hover:bg-white/10"
            title="Add tag"
          >
            <TagIcon className="h-2.5 w-2.5" /> tag
          </button>
        )}

        {!showChecklist && (
          <button
            onClick={() => setShowChecklist(true)}
            className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] opacity-50 hover:bg-black/[0.06] hover:opacity-100 dark:hover:bg-white/10"
            title="Add checklist"
          >
            <ListChecks className="h-2.5 w-2.5" /> checklist
          </button>
        )}

        <div className="ml-auto flex items-center gap-1">
          {showDateInput ? (
            <input
              type="date"
              value={note.dueDate ?? ''}
              onChange={(e) => onUpdate({ dueDate: e.target.value || null })}
              onBlur={() => {
                if (!note.dueDate) setShowDateInput(false);
              }}
              className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[10px] outline-none dark:bg-white/10"
            />
          ) : (
            <button
              onClick={() => setShowDateInput(true)}
              className={cn(
                'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] hover:bg-black/[0.06] dark:hover:bg-white/10',
                note.dueDate ? (overdue ? 'text-red-500' : 'opacity-80') : 'opacity-50 hover:opacity-100'
              )}
              title="Set due date"
            >
              <CalendarDays className="h-2.5 w-2.5" /> {note.dueDate ? formatDate(note.dueDate) : 'date'}
            </button>
          )}
        </div>
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={startResize}
        className="absolute bottom-0 right-0 flex h-4 w-4 cursor-nwse-resize items-end justify-end p-0.5 opacity-30 hover:opacity-70"
      >
        <GripHorizontal className="h-3 w-3 rotate-45" />
      </div>
    </div>
  );
}
