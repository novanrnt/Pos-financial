import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { rupiah } from '@/lib/utils';
import { Wallet, Building2, Smartphone, Banknote, Package, Star, ArrowDownRight, PiggyBank } from 'lucide-react';
import { AccountFormModal } from '@/components/account-form-modal';
import { AccountAdjustModal } from '@/components/account-adjust-modal';
import { AccountDeleteModal } from '@/components/account-delete-modal';

const typeConfig = {
  BANK:    { label: 'Akun Bank',     icon: Building2,   color: '#0A84FF', bg: 'rgba(10,132,255,0.15)' },
  EWALLET: { label: 'E-Wallet',      icon: Smartphone,  color: '#BF5AF2', bg: 'rgba(191,90,242,0.15)' },
  CASH:    { label: 'Kantong Tunai', icon: Banknote,    color: '#30D158', bg: 'rgba(48,209,88,0.15)' },
  OTHER:   { label: 'Lainnya',       icon: Package,     color: '#FF9F0A', bg: 'rgba(255,159,10,0.15)' },
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
        <h1 className="text-[17px] font-semibold text-white" style={{ letterSpacing: -0.2 }}>Dompet Saya</h1>
        <AccountFormModal />
      </div>

      {/* Hero Summary Card */}
      <div className="ios-glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="relative">
          {/* Top */}
          <div className="flex items-center justify-between mb-1">
            <p className="text-[13px] text-white/50">Sisa Belanja (IDR)</p>
            <ArrowDownRight size={16} className="text-white/40" />
          </div>
          <h2 className="text-[32px] md:text-[40px] font-semibold text-white tracking-tight mb-1" style={{ letterSpacing: -0.5 }}>{rupiah(netBalance)}</h2>
          <p className="text-[11px] text-white/40 mb-6">Total saldo dikurangi hutang aktif</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[11px] text-white/40 mb-0.5">Saldo Bersih</p>
              <p className="text-[15px] font-semibold text-white">{rupiah(totalBalance)}</p>
            </div>
            <div className="p-3" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[11px] text-white/40 mb-0.5">Hutang Aktif</p>
              <p className="text-[15px] font-semibold" style={{ color: '#FF453A' }}>{rupiah(totalDebt)}</p>
            </div>
            <div className="p-3" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[11px] text-white/40 mb-0.5">Tabungan Aktif</p>
              <p className="text-[15px] font-semibold" style={{ color: '#30D158' }}>{rupiah(totalSavings)}</p>
            </div>
            <div className="p-3" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[11px] text-white/40 mb-0.5">Tagihan Mendatang</p>
              <p className="text-[15px] font-semibold" style={{ color: '#FF9F0A' }}>{rupiah(totalBills)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts grouped by type */}
      {rows.length === 0 ? (
        <div className="ios-card p-12 text-center">
          <Wallet size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-[15px] font-semibold text-white/90">Belum ada rekening</p>
          <p className="text-[13px] text-white/40 mt-1">Tambahkan rekening pertama kamu</p>
        </div>
      ) : (
        typeOrder.map(type => {
          const group = rows.filter(a => a.type === type);
          if (group.length === 0) return null;
          const cfg = typeConfig[type];
          const Icon = cfg.icon;
          return (
            <div key={type}>
              <h2 className="text-[15px] font-semibold text-white/80 mb-3 px-1">{cfg.label}</h2>
              <div className="space-y-2">
                {group.map(a => (
                  <div key={a.id} className="ios-card p-4 flex items-center gap-4 active-scale">
                    {/* Icon */}
                    <div className="shrink-0 w-11 h-11 rounded-[14px] flex items-center justify-center" style={{ background: cfg.bg }}>
                      <Icon size={20} style={{ color: cfg.color }} />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[15px] font-semibold text-white truncate">{a.name}</p>
                        {a.isPrimary && <Star size={12} className="shrink-0" style={{ color: '#FF9F0A', fill: '#FF9F0A' }} />}
                      </div>
                      <p className="text-[13px] text-white/40 mt-0.5">{a.type} • IDR</p>
                    </div>
                    {/* Balance */}
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-white/40 mb-0.5">Saldo Saat Ini</p>
                      <p className="text-[15px] font-semibold" style={{ color: '#30D158' }}>{rupiah(Number(a.balance))}</p>
                    </div>
                    {/* Actions */}
                    <AccountAdjustModal account={{ id: a.id, name: a.name, balance: Number(a.balance) }} />
                    <AccountDeleteModal account={{ id: a.id, name: a.name, balance: Number(a.balance) }} otherAccounts={rows.filter(r => r.id !== a.id).map(r => ({ id: r.id, name: r.name }))} />
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
          <h2 className="text-[15px] font-semibold text-white/80 mb-3 px-1">Kantong Tabungan</h2>
          <div className="space-y-2">
            {savingsGoals.map(g => {
              const pct = Math.min((Number(g.savedAmount) / Number(g.targetAmount)) * 100, 100);
              return (
                <div key={g.id} className="ios-card p-4 flex items-center gap-4 active-scale">
                  <div className="shrink-0 w-11 h-11 rounded-[14px] flex items-center justify-center" style={{ background: 'rgba(48,209,88,0.15)' }}>
                    <PiggyBank size={20} style={{ color: '#30D158' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold text-white truncate">{g.name}</p>
                      <span className="text-[11px] shrink-0" style={{ color: '#30D158' }}>{Math.round(pct)}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#30D158' }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-white/40 mb-0.5">Terkumpul</p>
                    <p className="text-[15px] font-semibold" style={{ color: '#30D158' }}>{rupiah(Number(g.savedAmount))}</p>
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
