import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { deleteAccount } from '@/lib/actions';
import { rupiah } from '@/lib/utils';
import { Wallet, Building2, Smartphone, Banknote, Package, Star, Trash2, Plus, ArrowDownRight, PiggyBank, CreditCard, Receipt } from 'lucide-react';
import { AccountFormModal } from '@/components/account-form-modal';

const typeConfig = {
  BANK:    { label: 'Akun Bank',        icon: Building2,   color: 'bg-blue-500/20 text-blue-400',    border: 'border-blue-500/20' },
  EWALLET: { label: 'E-Wallet',         icon: Smartphone,  color: 'bg-violet-500/20 text-violet-400', border: 'border-violet-500/20' },
  CASH:    { label: 'Kantong Tunai',    icon: Banknote,    color: 'bg-emerald-500/20 text-emerald-400', border: 'border-emerald-500/20' },
  OTHER:   { label: 'Lainnya',          icon: Package,     color: 'bg-orange-500/20 text-orange-400', border: 'border-orange-500/20' },
} as const;

export default async function Accounts() {
  const u = await requireUser();
  const uid = u!.id;

  const [rows, debts, bills, savingsGoals] = await Promise.all([
    prisma.account.findMany({ where: { userId: uid }, orderBy: { isPrimary: 'desc' } }),
    prisma.debt.findMany({ where: { userId: uid, status: 'ACTIVE' } }),
    prisma.recurringBill.findMany({ where: { userId: uid, status: 'UNPAID' }, orderBy: { dueDay: 'asc' }, take: 3 }),
    prisma.savingsGoal.findMany({ where: { userId: uid, isCompleted: false } }),
  ]);

  const totalBalance = rows.reduce((a, x) => a + Number(x.balance), 0);
  const totalDebt = debts.filter(d => d.type === 'DEBT').reduce((a, d) => a + Number(d.remainingAmount), 0);
  const totalSavings = savingsGoals.reduce((a, g) => a + Number(g.savedAmount), 0);
  const totalBills = bills.reduce((a, b) => a + Number(b.amount), 0);
  const netBalance = totalBalance - totalDebt;

  const typeOrder: Array<keyof typeof typeConfig> = ['BANK', 'EWALLET', 'CASH', 'OTHER'];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-premium-text">Dompet Saya</h1>
        <AccountFormModal />
      </div>

      {/* Hero Summary Card */}
      <div className="rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #0f4c3a 0%, #0a2a4a 50%, #1a0a3a 100%)' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-violet-500/10 pointer-events-none" />
        <div className="relative p-6 md:p-8">
          {/* Top */}
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-white/60">Sisa Belanja (IDR)</p>
            <ArrowDownRight size={16} className="text-white/40" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">{rupiah(netBalance)}</h2>
          <p className="text-xs text-white/50 mb-6">Total saldo dikurangi hutang aktif</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[.08] rounded-2xl p-4 border border-white/[.10]">
              <p className="text-xs text-white/50 mb-1">Saldo Bersih</p>
              <p className="text-base font-black text-white">{rupiah(totalBalance)}</p>
            </div>
            <div className="bg-white/[.08] rounded-2xl p-4 border border-white/[.10]">
              <p className="text-xs text-white/50 mb-1">Hutang Aktif</p>
              <p className="text-base font-black text-rose-300">{rupiah(totalDebt)}</p>
            </div>
            <div className="bg-white/[.08] rounded-2xl p-4 border border-white/[.10]">
              <p className="text-xs text-white/50 mb-1">Tabungan Aktif</p>
              <p className="text-base font-black text-emerald-300">{rupiah(totalSavings)}</p>
            </div>
            <div className="bg-white/[.08] rounded-2xl p-4 border border-white/[.10]">
              <p className="text-xs text-white/50 mb-1">Tagihan Mendatang</p>
              <p className="text-base font-black text-amber-300">{rupiah(totalBills)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts grouped by type */}
      {rows.length === 0 ? (
        <div className="glass-premium rounded-3xl p-12 text-center">
          <Wallet size={40} className="text-premium-text-muted opacity-30 mx-auto mb-4" />
          <p className="text-premium-text font-black">Belum ada rekening</p>
          <p className="text-xs text-premium-text-muted mt-2">Tambahkan rekening pertama kamu</p>
        </div>
      ) : (
        typeOrder.map(type => {
          const group = rows.filter(a => a.type === type);
          if (group.length === 0) return null;
          const cfg = typeConfig[type];
          const Icon = cfg.icon;
          return (
            <div key={type}>
              <h2 className="text-base font-black text-premium-text mb-3">{cfg.label}</h2>
              <div className="space-y-2">
                {group.map(a => (
                  <div key={a.id} className={`glass-premium rounded-2xl p-4 border ${cfg.border} flex items-center gap-4`}>
                    {/* Icon */}
                    <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${cfg.color}`}>
                      <Icon size={20} />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-premium-text">{a.name}</p>
                        {a.isPrimary && <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />}
                      </div>
                      <p className="text-xs text-premium-text-muted mt-0.5">{a.type} • IDR</p>
                    </div>
                    {/* Balance */}
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-premium-text-muted mb-0.5">Saldo Saat Ini</p>
                      <p className="text-sm font-black text-premium-income">{rupiah(Number(a.balance))}</p>
                    </div>
                    {/* Delete */}
                    <form action={deleteAccount}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="shrink-0 grid h-8 w-8 place-items-center rounded-lg hover:bg-premium-expense/10 text-premium-text-muted hover:text-premium-expense transition">
                        <Trash2 size={14} />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Savings Goals as "Kantong Tabungan" */}
      {savingsGoals.length > 0 && (
        <div>
          <h2 className="text-base font-black text-premium-text mb-3">Kantong Tabungan</h2>
          <div className="space-y-2">
            {savingsGoals.map(g => {
              const pct = Math.min((Number(g.savedAmount) / Number(g.targetAmount)) * 100, 100);
              return (
                <div key={g.id} className="glass-premium rounded-2xl p-4 border border-emerald-500/20 flex items-center gap-4">
                  <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-500/20 text-emerald-400">
                    <PiggyBank size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-premium-text truncate">{g.name}</p>
                      <span className="text-[10px] text-emerald-400 shrink-0">{Math.round(pct)}%</span>
                    </div>
                    <div className="mt-1.5 h-1 bg-white/[.06] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-premium-text-muted mb-0.5">Terkumpul</p>
                    <p className="text-sm font-black text-emerald-400">{rupiah(Number(g.savedAmount))}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Account Form */}
      {/* Removed - now using modal */}
    </div>
  );
}
