import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { deleteDebt, payDebt } from '@/lib/actions';
import { Badge, SubmitButton } from '@/components/ui';
import { rupiah } from '@/lib/utils';
import { CreditCard, Plus, Trash2, ArrowDownRight, ArrowUpRight, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DebtFormModal } from '@/components/debt-form-modal';

export default async function Debts() {
  const u = await requireUser();
  const uid = u!.id;

  const [debts, accounts] = await Promise.all([
    prisma.debt.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.account.findMany({ where: { userId: uid }, orderBy: { isPrimary: 'desc' } })
  ]);

  const activeDebts = debts.filter(d => d.status === 'ACTIVE' && d.type === 'DEBT');
  const activeReceivables = debts.filter(d => d.status === 'ACTIVE' && d.type === 'RECEIVABLE');
  const totalDebt = activeDebts.reduce((a, d) => a + Number(d.remainingAmount), 0);
  const totalReceivable = activeReceivables.reduce((a, d) => a + Number(d.remainingAmount), 0);
  const netPosition = totalReceivable - totalDebt;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-premium-text">Hutang & Piutang</h1>
        <DebtFormModal accounts={accounts} />
      </div>

      {/* Summary Card */}
      <div className="rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #3a0a1a 0%, #1a2a0a 50%, #0a1a3a 100%)' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-blue-500/10 pointer-events-none" />
        <div className="relative p-6 md:p-8">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-white/60">Net Position (IDR)</p>
            <CreditCard size={16} className="text-white/40" />
          </div>
          <h2 className={`text-3xl md:text-4xl font-black tracking-tight mb-1 ${netPosition >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {netPosition >= 0 ? '+' : ''}{rupiah(netPosition)}
          </h2>
          <p className="text-xs text-white/50 mb-6">{activeDebts.length + activeReceivables.length} item aktif</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[.08] rounded-2xl p-4 border border-white/[.10]">
              <p className="text-xs text-white/50 mb-1 flex items-center gap-1"><ArrowDownRight size={12} /> Hutang</p>
              <p className="text-base font-black text-rose-300">{rupiah(totalDebt)}</p>
            </div>
            <div className="bg-white/[.08] rounded-2xl p-4 border border-white/[.10]">
              <p className="text-xs text-white/50 mb-1 flex items-center gap-1"><ArrowUpRight size={12} /> Piutang</p>
              <p className="text-base font-black text-emerald-300">{rupiah(totalReceivable)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Debts */}
      {activeDebts.length > 0 && (
        <div>
          <h2 className="text-base font-black text-premium-text mb-3 flex items-center gap-2">
            <ArrowDownRight size={18} className="text-rose-400" /> Hutang Aktif
          </h2>
          <div className="space-y-2">
            {activeDebts.map(debt => {
              const isOverdue = debt.dueDate && debt.dueDate < new Date();
              return (
                <div key={debt.id} className={`glass-premium rounded-2xl p-4 border ${isOverdue ? 'border-rose-500/30' : 'border-rose-500/20'} flex items-center gap-4`}>
                  <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${isOverdue ? 'bg-rose-500/30' : 'bg-rose-500/20'}`}>
                    {isOverdue ? <AlertCircle size={20} className="text-rose-400" /> : <ArrowDownRight size={20} className="text-rose-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-premium-text truncate">{debt.name}</p>
                      {isOverdue && <Badge variant="danger" className="text-xs">Overdue</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-premium-text-muted">
                        {debt.dueDate ? debt.dueDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Tanpa jatuh tempo'}
                      </p>
                      {debt.notes && <span className="text-xs text-premium-text-muted">• {debt.notes}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-rose-400">{rupiah(Number(debt.remainingAmount))}</p>
                    <p className="text-xs text-premium-text-muted">dari {rupiah(Number(debt.originalAmount))}</p>
                  </div>
                  <form action={deleteDebt}>
                    <input type="hidden" name="id" value={debt.id} />
                    <button type="submit" className="shrink-0 grid h-8 w-8 place-items-center rounded-lg hover:bg-premium-expense/10 text-premium-text-muted hover:text-premium-expense transition">
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Receivables */}
      {activeReceivables.length > 0 && (
        <div>
          <h2 className="text-base font-black text-premium-text mb-3 flex items-center gap-2">
            <ArrowUpRight size={18} className="text-emerald-400" /> Piutang Aktif
          </h2>
          <div className="space-y-2">
            {activeReceivables.map(receivable => {
              const isOverdue = receivable.dueDate && receivable.dueDate < new Date();
              return (
                <div key={receivable.id} className={`glass-premium rounded-2xl p-4 border ${isOverdue ? 'border-amber-500/30' : 'border-emerald-500/20'} flex items-center gap-4`}>
                  <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${isOverdue ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
                    {isOverdue ? <AlertCircle size={20} className="text-amber-400" /> : <ArrowUpRight size={20} className="text-emerald-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-premium-text truncate">{receivable.name}</p>
                      {isOverdue && <Badge variant="warning" className="text-xs">Overdue</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-premium-text-muted">
                        {receivable.dueDate ? receivable.dueDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Tanpa jatuh tempo'}
                      </p>
                      {receivable.notes && <span className="text-xs text-premium-text-muted">• {receivable.notes}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-emerald-400">{rupiah(Number(receivable.remainingAmount))}</p>
                    <p className="text-xs text-premium-text-muted">dari {rupiah(Number(receivable.originalAmount))}</p>
                  </div>
                  <form action={deleteDebt}>
                    <input type="hidden" name="id" value={receivable.id} />
                    <button type="submit" className="shrink-0 grid h-8 w-8 place-items-center rounded-lg hover:bg-premium-expense/10 text-premium-text-muted hover:text-premium-expense transition">
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {debts.length === 0 && (
        <div className="glass-premium rounded-3xl p-12 text-center">
          <CreditCard size={40} className="text-premium-text-muted opacity-30 mx-auto mb-4" />
          <p className="text-premium-text font-black">Belum ada hutang & piutang</p>
          <p className="text-xs text-premium-text-muted mt-2">Tambahkan hutang atau piutang untuk tracking keuangan</p>
        </div>
      )}

      {/* Add Debt Form */}
      {/* Removed - now using modal */}
    </div>
  );
}
