import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-9 w-full rounded-lg border border-neutral-200 bg-white/90 px-3 text-sm outline-none',
        'placeholder:text-neutral-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100',
        'dark:bg-neutral-800 dark:border-neutral-700 dark:focus:ring-blue-900/40 dark:text-neutral-100',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-neutral-200 bg-white/90 px-3 py-2 text-sm outline-none resize-none',
        'placeholder:text-neutral-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100',
        'dark:bg-neutral-800 dark:border-neutral-700 dark:focus:ring-blue-900/40 dark:text-neutral-100',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-black/[0.06] px-2 py-0.5 text-[11px] font-medium text-neutral-600',
        'dark:bg-white/10 dark:text-neutral-300',
        className
      )}
      {...props}
    />
  );
}
