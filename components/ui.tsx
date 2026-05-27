import { cn, rupiah } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

/* ============ CARD COMPONENTS ============ */

export function Card({ 
  children, 
  className,
  variant = 'default'
}: { 
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'premium' | 'gradient' | 'accent'
}) {
  const variants = {
    default: 'glass',
    premium: 'glass-premium',
    gradient: 'glass-premium bg-gradient-premium',
    accent: 'glass-premium border-l-4 border-l-violet-500'
  };
  
  return <div className={cn(variants[variant], 'rounded-2xl p-5 md:p-6', className)}>{children}</div>;
}

export function PageTitle({ 
  title, 
  desc, 
  action 
}: { 
  title: string
  desc?: string
  action?: React.ReactNode 
}) {
  return (
    <div className="mb-6 md:mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-premium-text">{title}</h1>
        {desc && <p className="text-sm text-premium-text-muted mt-2">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function SubmitButton({ children = 'Simpan' }: { children?: React.ReactNode }) {
  return (
    <button className="btn btn-primary w-full md:w-auto" type="submit">
      {children}
    </button>
  );
}

export function Empty({ text = 'Belum ada data' }: { text?: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-premium-border-medium p-8 text-center">
      <div className="text-4xl mb-3">📭</div>
      <p className="text-premium-text-muted">{text}</p>
    </div>
  );
}

/* ============ STAT CARD ============ */

export function StatCard({ 
  label, 
  value, 
  hint, 
  tone = 'neutral',
  trend,
  icon: Icon
}: { 
  label: string
  value: number
  hint?: string
  tone?: 'green' | 'red' | 'blue' | 'purple' | 'neutral'
  trend?: 'up' | 'down'
  icon?: React.ReactNode
}) {
  const tones = {
    green: 'text-premium-income bg-premium-income/10 border-premium-income/20',
    red: 'text-premium-expense bg-premium-expense/10 border-premium-expense/20',
    blue: 'text-premium-savings bg-premium-savings/10 border-premium-savings/20',
    purple: 'text-violet-300 bg-violet-500/10 border-violet-500/20',
    neutral: 'text-premium-text-secondary bg-premium-border-soft/10 border-premium-border-soft'
  } as const;

  const toneClass = tones[tone];
  const [textColor] = toneClass.split(' ');

  return (
    <div className={cn('soft-card rounded-2xl p-4 md:p-5 min-h-[100px] md:min-h-[110px] flex flex-col justify-between border', toneClass)}>
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs md:text-sm font-black text-premium-text-muted uppercase tracking-wide">{label}</p>
          {trend && (
            <div className={cn('flex items-center gap-1', trend === 'up' ? 'text-premium-income' : 'text-premium-expense')}>
              {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            </div>
          )}
        </div>
        <h3 className={cn('mt-3 text-lg md:text-xl font-black tracking-tight line-clamp-2', textColor)}>
          {rupiah(value)}
        </h3>
      </div>
      {hint && <p className="mt-2 text-xs text-premium-text-muted">{hint}</p>}
    </div>
  );
}

/* ============ SECTION HEADER ============ */

export function SectionHeader({ 
  title, 
  desc, 
  right 
}: { 
  title: string
  desc?: string
  right?: React.ReactNode 
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg md:text-xl font-black tracking-tight text-premium-text">{title}</h2>
        {desc && <p className="text-xs text-premium-text-muted mt-1">{desc}</p>}
      </div>
      {right}
    </div>
  );
}

/* ============ METRIC CARD ============ */

export function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  color = 'violet'
}: {
  label: string
  value: string | number
  subtext?: string
  icon?: React.ReactNode
  color?: 'violet' | 'emerald' | 'rose' | 'blue' | 'orange'
}) {
  const colors = {
    violet: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    emerald: 'bg-premium-income/10 text-premium-income border-premium-income/20',
    rose: 'bg-premium-expense/10 text-premium-expense border-premium-expense/20',
    blue: 'bg-premium-savings/10 text-premium-savings border-premium-savings/20',
    orange: 'bg-premium-orange/10 text-premium-orange border-premium-orange/20'
  };

  return (
    <div className={cn('soft-card rounded-2xl p-4 border', colors[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-lg md:text-xl font-black">{value}</p>
          {subtext && <p className="mt-1 text-xs text-premium-text-muted">{subtext}</p>}
        </div>
        {Icon && <div className="text-2xl opacity-50">{Icon}</div>}
      </div>
    </div>
  );
}

/* ============ GRADIENT TEXT ============ */

export function GradientText({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <span className={cn('bg-gradient-to-r from-violet-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent', className)}>
      {children}
    </span>
  );
}

/* ============ BADGE ============ */

export function Badge({
  children,
  variant = 'default',
  className
}: {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info'
  className?: string
}) {
  const variants = {
    default: 'bg-premium-border-soft/20 text-premium-text-secondary border-premium-border-medium',
    success: 'bg-premium-income/10 text-premium-income border-premium-income/30',
    danger: 'bg-premium-expense/10 text-premium-expense border-premium-expense/30',
    warning: 'bg-premium-orange/10 text-premium-orange border-premium-orange/30',
    info: 'bg-premium-savings/10 text-premium-savings border-premium-savings/30'
  };

  return (
    <span className={cn('badge border', variants[variant], className)}>
      {children}
    </span>
  );
}

/* ============ LOADING SKELETON ============ */

export function SkeletonCard({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="soft-card rounded-2xl p-4 md:p-5 min-h-[100px] md:min-h-[110px] animate-pulse">
          <div className="h-4 bg-premium-border-soft/30 rounded w-1/3 mb-3"></div>
          <div className="h-6 bg-premium-border-soft/30 rounded w-2/3"></div>
        </div>
      ))}
    </>
  );
}
