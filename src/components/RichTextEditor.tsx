import { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  textClassName?: string;
}

const FORMAT_BUTTONS = [
  { command: 'bold', icon: Bold, label: 'Bold' },
  { command: 'italic', icon: Italic, label: 'Italic' },
  { command: 'underline', icon: Underline, label: 'Underline' },
  { command: 'strikeThrough', icon: Strikethrough, label: 'Strikethrough' },
  { command: 'insertUnorderedList', icon: List, label: 'Bullet list' },
  { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered list' },
] as const;

export function RichTextEditor({ value, onChange, placeholder, textClassName }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  // Keep DOM in sync if value changes externally (e.g. import)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  const exec = (command: string) => {
    document.execCommand(command);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  return (
    <div className="relative">
      {focused && (
        <div
          className="mb-1 flex items-center gap-0.5 rounded-lg border border-neutral-200 bg-white/95 p-1 shadow-sm dark:border-neutral-700 dark:bg-neutral-800/95 animate-fade-in"
          // prevent mousedown from blurring the editable area before click fires
          onMouseDown={(e) => e.preventDefault()}
        >
          {FORMAT_BUTTONS.map(({ command, icon: Icon, label }) => (
            <button
              key={command}
              title={label}
              onClick={() => exec(command)}
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      )}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className={cn('note-content text-sm leading-snug', textClassName)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          onChange(e.currentTarget.innerHTML);
        }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onMouseDown={(e) => e.stopPropagation()}
      />
    </div>
  );
}
