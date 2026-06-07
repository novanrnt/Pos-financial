import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { deleteDebt } from '@/lib/actions';
import { rupiah } from '@/lib/utils';
import { CreditCard, Trash2, ArrowDownRight, ArrowUpRight, AlertCircle, CheckCircle2, Coins, Banknote } from 'lucide-react';
import { DebtFormModal } from '@/components/debt-form-modal';
import { DebtPaymentModal } from '@/components/debt-payment-modal';

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
  const paidDebts = debts.filter(d => d.status === 'PAID');
  const totalDebt = activeDebts.reduce((a, d) => a + Number(d.remainingAmount), 0);
  const totalReceivable = activeReceivables.reduce((a, d) => a + Number(d.remainingAmount), 0);
  const netPosition = totalReceivable - totalDebt;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-white" style={{ letterSpacing: -0.2 }}>Hutang & Piutang</h1>
        <DebtFormModal accounts={accounts} />
      </div>

      {/* Summary Card */}
      <div className="ios-card p-5 relative overflow-hidden">
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,69,58,0.12), transparent, rgba(10,132,255,0.08))', pointerEvents: 'none' }} />
        <div className="relative">
          <p className="text-[13px] text-white/50 mb-1">Net Position</p>
          <h2 className="text-[28px] font-semibold tracking-tight mb-4" style={{ color: netPosition >= 0 ? '#30D158' : '#FF453A' }}>
            {netPosition >= 0 ? '+' : ''}{rupiah(netPosition)}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[11px] text-white/40 flex items-center gap-1 mb-1"><ArrowDownRight size={12} /> Hutang</p>
              <p className="text-[15px] font-semibold" style={{ color: '#FF453A' }}>{rupiah(totalDebt)}</p>
            </div>
            <div className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[11px] text-white/40 flex items-center gap-1 mb-1"><ArrowUpRight size={12} /> Piutang</p>
              <p className="text-[15px] font-semibold" style={{ color: '#30D158' }}>{rupiah(totalReceivable)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Debts */}
      {activeDebts.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-white/80 mb-3 px-1 flex items-center gap-2">
            <ArrowDownRight size={16} style={{ color: '#FF453A' }} /> Hutang Aktif
          </h2>
          <div className="space-y-2">
            {activeDebts.map(debt => {
              const isOverdue = debt.dueDate && debt.dueDate < new Date();
              return (
                <div key={debt.id} className="ios-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{
                      background: isOverdue ? 'rgba(255,69,58,0.2)' : 'rgba(255,69,58,0.15)'
                    }}>
                      {isOverdue ? <AlertCircle size={18} style={{ color: '#FF453A' }} /> : <ArrowDownRight size={18} style={{ color: '#FF453A' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-semibold text-white truncate">{debt.name}</p>
                        {isOverdue && <span className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(255,69,58,0.15)', color: '#FF453A' }}>Lewat</span>}
                      </div>
                      <p className="text-[12px] text-white/40 mt-0.5 truncate">
                        {debt.dueDate ? debt.dueDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : 'Tanpa tempo'}
                        {debt.notes && ` • ${debt.notes}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[14px] font-semibold" style={{ color: '#FF453A' }}>{rupiah(Number(debt.remainingAmount))}</p>
                      <p className="text-[11px] text-white/30">dari {rupiah(Number(debt.amount))}</p>
                    </div>
                  </div>
                  {/* Action buttons row */}
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3" style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                    <DebtPaymentModal
                      debt={{ id: debt.id, name: debt.name, type: debt.type, remainingAmount: debt.remainingAmount, amount: debt.amount, accountId: debt.accountId }}
                      accounts={accounts.map(a => ({ id: a.id, name: a.name, type: a.type }))}
                      mode="cicil"
                      trigger={<Coins size={14} />}
                    />
                    <DebtPaymentModal
                      debt={{ id: debt.id, name: debt.name, type: debt.type, remainingAmount: debt.remainingAmount, amount: debt.amount, accountId: debt.accountId }}
                      accounts={accounts.map(a => ({ id: a.id, name: a.name, type: a.type }))}
                      mode="lunasi"
                      trigger={<Banknote size={14} />}
                    />
                    <form action={deleteDebt}>
                      <input type="hidden" name="debtId" value={debt.id} />
                      <button type="submit" className="active-scale" style={{
                        width: 32, height: 32, display: 'grid', placeItems: 'center',
                        borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)',
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Receivables */}
      {activeReceivables.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-white/80 mb-3 px-1 flex items-center gap-2">
            <ArrowUpRight size={16} style={{ color: '#30D158' }} /> Piutang Aktif
          </h2>
          <div className="space-y-2">
            {activeReceivables.map(rec => {
              const isOverdue = rec.dueDate && rec.dueDate < new Date();
              return (
                <div key={rec.id} className="ios-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{
                      background: isOverdue ? 'rgba(255,159,10,0.15)' : 'rgba(48,209,88,0.15)'
                    }}>
                      {isOverdue ? <AlertCircle size={18} style={{ color: '#FF9F0A' }} /> : <ArrowUpRight size={18} style={{ color: '#30D158' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-semibold text-white truncate">{rec.name}</p>
                        {isOverdue && <span className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(255,159,10,0.15)', color: '#FF9F0A' }}>Lewat</span>}
                      </div>
                      <p className="text-[12px] text-white/40 mt-0.5 truncate">
                        {rec.dueDate ? rec.dueDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : 'Tanpa tempo'}
                        {rec.notes && ` • ${rec.notes}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[14px] font-semibold" style={{ color: '#30D158' }}>{rupiah(Number(rec.remainingAmount))}</p>
                      <p className="text-[11px] text-white/30">dari {rupiah(Number(rec.amount))}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3" style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                    <DebtPaymentModal
                      debt={{ id: rec.id, name: rec.name, type: rec.type, remainingAmount: rec.remainingAmount, amount: rec.amount, accountId: rec.accountId }}
                      accounts={accounts.map(a => ({ id: a.id, name: a.name, type: a.type }))}
                      mode="cicil"
                      trigger={<Coins size={14} />}
                    />
                    <DebtPaymentModal
                      debt={{ id: rec.id, name: rec.name, type: rec.type, remainingAmount: rec.remainingAmount, amount: rec.amount, accountId: rec.accountId }}
                      accounts={accounts.map(a => ({ id: a.id, name: a.name, type: a.type }))}
                      mode="lunasi"
                      trigger={<Banknote size={14} />}
                    />
                    <form action={deleteDebt}>
                      <input type="hidden" name="debtId" value={rec.id} />
                      <button type="submit" className="active-scale" style={{
                        width: 32, height: 32, display: 'grid', placeItems: 'center',
                        borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)',
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Paid Debts */}
      {paidDebts.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-white/80 mb-3 px-1 flex items-center gap-2">
            <CheckCircle2 size={16} style={{ color: '#30D158' }} /> Sudah Lunas
          </h2>
          <div className="space-y-2">
            {paidDebts.map(d => (
              <div key={d.id} className="ios-card p-4 flex items-center gap-3 opacity-60">
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(48,209,88,0.15)' }}>
                  <CheckCircle2 size={18} style={{ color: '#30D158' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-white truncate">{d.name}</p>
                  <p className="text-[12px] text-white/40">{d.type === 'DEBT' ? 'Hutang' : 'Piutang'} • Lunas</p>
                </div>
                <p className="text-[14px] font-semibold shrink-0" style={{ color: '#30D158' }}>{rupiah(Number(d.amount))}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {debts.length === 0 && (
        <div className="ios-card p-12 text-center">
          <CreditCard size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-[15px] font-semibold text-white/90">Belum ada hutang & piutang</p>
          <p className="text-[13px] text-white/40 mt-1">Tambahkan hutang atau piutang untuk tracking</p>
        </div>
      )}
    </div>
  );
}
