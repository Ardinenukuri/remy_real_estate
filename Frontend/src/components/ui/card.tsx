import React from 'react';
import { cn } from '@/lib/utils';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-6 transition-all duration-300 hover:border-slate-600/50 hover:shadow-xl hover:shadow-brand-500/5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
