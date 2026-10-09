import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeClasses = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
};

export function LoadingSpinner({
  className,
  size = 'sm',
  label = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center shrink-0 animate-spin', sizeClasses[size], className)}
    >
      <Loader2 className="size-full" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export const InlineSpinner = LoadingSpinner;
export const ButtonSpinner = LoadingSpinner;
