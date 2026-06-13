import { ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface MenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Menu({ trigger, children, align = 'left', open: controlledOpen, onOpenChange }: MenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    onOpenChange?.(v);
  };
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 min-w-[180px] rounded-xl border border-neutral-200 bg-white p-1.5 shadow-panel animate-pop-in',
            'dark:border-neutral-700 dark:bg-neutral-800',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  children,
  onClick,
  className,
  icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm text-neutral-700 transition-colors',
        'hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10',
        className
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <div className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{children}</div>;
}

export function MenuSeparator() {
  return <div className="my-1 h-px bg-neutral-200 dark:bg-neutral-700" />;
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div
        className={cn(
          'pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-[11px] text-white opacity-0',
          'transition-opacity duration-150 group-hover:opacity-100'
        )}
      >
        {label}
      </div>
    </div>
  );
}
