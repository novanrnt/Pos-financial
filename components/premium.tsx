'use client';

import { cn, rupiah } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

/* ============ BALANCE CARD ============ */

export function BalanceCard({
  total,
  income,
  expense,
  profit,
  hidden = false
}: {
  total: number
  income: number
  expense: number
  profit: number
  hidden?: boolean
}) {
  const [showBalance, setShowBalance] = useState(!hidden);

  return (
    <div className="glass-premium rounded-3xl p-6 md:p-8 overflow-hidden relative">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-premium opacity-20 pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs md:text-sm font-black text-premium-text-muted uppercase tracking-wide">Total Saldo</p>
            <div className="flex items-center gap-3 mt-2">
              <h2 className="text-2xl md:text-3xl font-black text-premium-text tracking-tight">
                {showBalance ? rupiah(total) : 'Rp••••••••'}
              </h2>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                {showBalance ? (
                  <Eye size={18} className="text-premium-text-muted" />
                ) : (
                  <EyeOff size={18} className="text-premium-text-muted" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {/* Income */}
          <div className="bg-white/[.04] border border-premium-income/20 rounded-2xl p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight size={16} className="text-premium-income" />
              <p className="text-xs font-black text-premium-text-muted uppercase">Pemasukan</p>
            </div>
            <p className="text-base md:text-lg font-black text-premium-income">
              {showBalance ? rupiah(income) : 'Rp••••'}
            </p>
          </div>

          {/* Expense */}
          <div className="bg-white/[.04] border border-premium-expense/20 rounded-2xl p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownLeft size={16} className="text-premium-expense" />
              <p className="text-xs font-black text-premium-text-muted uppercase">Pengeluaran</p>
            </div>
            <p className="text-base md:text-lg font-black text-premium-expense">
              {showBalance ? rupiah(expense) : 'Rp••••'}
            </p>
          </div>

          {/* Profit */}
          <div className={cn(
            'bg-white/[.04] border rounded-2xl p-3 md:p-4',
            profit >= 0 ? 'border-premium-income/20' : 'border-premium-expense/20'
          )}>
            <p className="text-xs font-black text-premium-text-muted uppercase mb-2">Profit</p>
            <p className={cn(
              'text-base md:text-lg font-black',
              profit >= 0 ? 'text-premium-income' : 'text-premium-expense'
            )}>
              {showBalance ? rupiah(profit) : 'Rp••••'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ TRANSACTION CARD ============ */

export function TransactionCard({
  icon: Icon,
  title,
  account,
  amount,
  type,
  date,
  category,
  onDelete
}: {
  icon?: React.ReactNode
  title: string
  account: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  date: string
  category?: string
  onDelete?: () => void
}) {
  const typeColor = {
    income: 'text-premium-income',
    expense: 'text-premium-expense',
    transfer: 'text-premium-savings'
  };

  const typeSign = {
    income: '+',
    expense: '-',
    transfer: '→'
  };

  return (
    <div className="soft-card rounded-2xl p-4 border border-premium-border-soft hover:border-premium-border-medium transition">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {Icon && <div className="text-2xl shrink-0">{Icon}</div>}
          <div className="min-w-0 flex-1">
            <p className="font-black text-premium-text truncate">{title}</p>
            <p className="text-xs text-premium-text-muted mt-1 truncate">
              {date} • {account} {category && `• ${category}`}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={cn('text-sm md:text-base font-black', typeColor[type])}>
            {typeSign[type]}{rupiah(amount)}
          </p>
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-xs text-premium-expense hover:text-premium-expense/80 mt-1 transition"
            >
              Hapus
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ ACCOUNT CARD ============ */

export function AccountCard({
  name,
  type,
  balance,
  icon: Icon,
  color = 'violet',
  onClick
}: {
  name: string
  type: string
  balance: number
  icon?: React.ReactNode
  color?: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'soft-card rounded-2xl p-4 md:p-5 border border-premium-border-soft hover:border-premium-border-medium transition cursor-pointer',
        onClick && 'hover:bg-white/[.06]'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide">{type}</p>
          <h3 className="text-lg md:text-xl font-black text-premium-text mt-2">{name}</h3>
          <p className="text-sm md:text-base font-black text-premium-income mt-3">{rupiah(balance)}</p>
        </div>
        {Icon && <div className="text-3xl opacity-60">{Icon}</div>}
      </div>
    </div>
  );
}

/* ============ STAT ROW ============ */

export function StatRow({
  label,
  value,
  subtext,
  color = 'neutral'
}: {
  label: string
  value: string | number
  subtext?: string
  color?: 'income' | 'expense' | 'neutral' | 'savings'
}) {
  const colors = {
    income: 'text-premium-income',
    expense: 'text-premium-expense',
    savings: 'text-premium-savings',
    neutral: 'text-premium-text'
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-premium-border-soft last:border-0">
      <div>
        <p className="text-sm font-black text-premium-text">{label}</p>
        {subtext && <p className="text-xs text-premium-text-muted mt-1">{subtext}</p>}
      </div>
      <p className={cn('text-lg md:text-xl font-black', colors[color])}>
        {typeof value === 'number' ? rupiah(value) : value}
      </p>
    </div>
  );
}

/* ============ PERIOD TABS ============ */

export function PeriodTabs({
  periods,
  active
}: {
  periods: string[]
  active: string
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {periods.map((period) => (
        <div
          key={period}
          className={cn(
            'shrink-0 rounded-full px-4 py-2 text-sm font-black transition',
            active === period
              ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
              : 'bg-white/[.04] text-premium-text-muted'
          )}
        >
          {period}
        </div>
      ))}
    </div>
  );
}

/* ============ EMPTY STATE ============ */

export function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="glass-premium rounded-3xl p-8 md:p-12 text-center">
      {icon && <div className="text-5xl md:text-6xl mb-4 opacity-50">{icon}</div>}
      <h3 className="text-lg md:text-xl font-black text-premium-text">{title}</h3>
      {description && <p className="text-sm text-premium-text-muted mt-2">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ============ LOADING SPINNER ============ */

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-premium-border-medium" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 animate-spin" />
      </div>
    </div>
  );
}

/* ============ PROGRESS BAR ============ */

export function ProgressBar({
  value,
  max = 100,
  color = 'violet',
  label,
  showPercent = true
}: {
  value: number
  max?: number
  color?: 'violet' | 'emerald' | 'rose' | 'blue'
  label?: string
  showPercent?: boolean
}) {
  const percent = (value / max) * 100;
  const colors = {
    violet: 'bg-violet-500',
    emerald: 'bg-premium-income',
    rose: 'bg-premium-expense',
    blue: 'bg-premium-savings'
  };

  return (
    <div>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-2">
          {label && <p className="text-sm font-black text-premium-text">{label}</p>}
          {showPercent && <p className="text-xs font-black text-premium-text-muted">{Math.round(percent)}%</p>}
        </div>
      )}
      <div className="h-2 bg-white/[.04] rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', colors[color])}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

/* ============ CHART CARD ============ */

export function ChartCard({
  title,
  children,
  footer
}: {
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="glass-premium rounded-3xl p-6 md:p-8">
      <h3 className="text-lg md:text-xl font-black text-premium-text mb-6">{title}</h3>
      <div className="min-h-[250px] md:min-h-[300px]">
        {children}
      </div>
      {footer && <div className="mt-6 pt-6 border-t border-premium-border-soft">{footer}</div>}
    </div>
  );
}
