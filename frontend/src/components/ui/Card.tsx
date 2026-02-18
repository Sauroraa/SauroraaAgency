import { cn } from '@/lib/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div className={cn(
      'rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6',
      hover && 'transition-all duration-300 hover:border-aurora-cyan/30 hover:shadow-lg hover:shadow-aurora-cyan/5',
      className,
    )}>
      {children}
    </div>
  );
}
