import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'solid' | 'ghost' | 'outline' | 'subtle';
type Size = 'sm' | 'md' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  active?: boolean;
}

const variantClasses: Record<Variant, string> = {
  solid: 'bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200',
  ghost: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200',
  outline: 'bg-white/80 border border-neutral-200 hover:bg-white dark:bg-neutral-800/80 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200',
  subtle: 'bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1',
  md: 'h-9 px-3 text-sm gap-1.5',
  icon: 'h-8 w-8 p-0 justify-center',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'ghost', size = 'md', active, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-lg font-medium transition-colors duration-100 select-none whitespace-nowrap',
          'disabled:opacity-40 disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          active && 'ring-2 ring-blue-400/70 bg-blue-50 dark:bg-blue-900/30',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
