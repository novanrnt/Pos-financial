import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { deleteDebt, payDebt } from '@/lib/actions';
import { SubmitButton } from '@/components/ui';
import { rupiah } from '@/lib/utils';
import { CreditCard, Plus, Trash2, ArrowDownRight, ArrowUpRight, Calendar, AlertCircle, CheckCircle2, Banknote, Coins } from 'lucide-react';
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
  const totalDebt = activeDebts.reduce((a, d) => a + Number(d.remainingAmount), 0);
  const totalReceivable = activeReceivables.reduce((a, d) => a + Number(d.remainingAmount), 0);
  const netPosition = totalReceivable - totalDebt;

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF', margin: 0 }}>Hutang & Piutang</h1>
        <DebtFormModal accounts={accounts} />
      </div>

      {/* Summary Card - iOS 26 Liquid Glass */}
      <div className="ios-card" style={{ padding: 24, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,69,58,0.12), transparent, rgba(10,132,255,0.08))', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Net Position (IDR)</p>
            <CreditCard size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>
          <h2 style={{
            fontSize: 36, fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 4px 0',
            color: netPosition >= 0 ? '#30D158' : '#FF453A'
          }}>
            {netPosition >= 0 ? '+' : ''}{rupiah(netPosition)}
          </h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px 0' }}>
            {activeDebts.length + activeReceivables.length} item aktif
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{
              background: 'rgba(255,255,255,0.06)', borderRadius: 16,
              border: '0.5px solid rgba(255,255,255,0.08)', padding: 16
            }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ArrowDownRight size={12} /> Hutang
              </p>
              <p style={{ fontSize: 16, fontWeight: 900, color: '#FF453A', margin: 0 }}>{rupiah(totalDebt)}</p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.06)', borderRadius: 16,
              border: '0.5px solid rgba(255,255,255,0.08)', padding: 16
            }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ArrowUpRight size={12} /> Piutang
              </p>
              <p style={{ fontSize: 16, fontWeight: 900, color: '#30D158', margin: 0 }}>{rupiah(totalReceivable)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Debts */}
      {activeDebts.length > 0 && (
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 900, color: '#FFFFFF', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowDownRight size={18} style={{ color: '#FF453A' }} /> Hutang Aktif
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeDebts.map(debt => {
              const isOverdue = debt.dueDate && debt.dueDate < new Date();
              return (
                <div key={debt.id} style={{
                  borderRadius: 16, padding: 16,
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(40px) saturate(200%)',
                  border: isOverdue ? '0.5px solid rgba(255,69,58,0.4)' : '0.5px solid rgba(255,69,58,0.2)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isOverdue ? 'rgba(255,69,58,0.3)' : 'rgba(255,69,58,0.2)',
                    flexShrink: 0
                  }}>
                    {isOverdue ? <AlertCircle size={20} style={{ color: '#FF453A' }} /> : <ArrowDownRight size={20} style={{ color: '#FF453A' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 14, fontWeight: 900, color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{debt.name}</p>
                      {isOverdue && (
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                          background: 'rgba(255,69,58,0.2)', color: '#FF453A',
                          border: '0.5px solid rgba(255,69,58,0.3)'
                        }}>Overdue</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                        {debt.dueDate ? debt.dueDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Tanpa jatuh tempo'}
                      </p>
                      {debt.notes && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>&bull; {debt.notes}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 900, color: '#FF453A', margin: 0 }}>{rupiah(Number(debt.remainingAmount))}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>dari {rupiah(Number(debt.amount))}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <DebtPaymentModal
                      debt={{
                        id: debt.id,
                        name: debt.name,
                        type: debt.type,
                        remainingAmount: debt.remainingAmount,
                        amount: debt.amount,
                        accountId: debt.accountId,
                      }}
                      accounts={accounts.map(a => ({ id: a.id, name: a.name, type: a.type }))}
                      mode="cicil"
                      trigger={<Coins size={14} />}
                    />
                    <DebtPaymentModal
                      debt={{
                        id: debt.id,
                        name: debt.name,
                        type: debt.type,
                        remainingAmount: debt.remainingAmount,
                        amount: debt.amount,
                        accountId: debt.accountId,
                      }}
                      accounts={accounts.map(a => ({ id: a.id, name: a.name, type: a.type }))}
                      mode="lunasi"
                      trigger={<Banknote size={14} />}
                    />
                    <form action={deleteDebt}>
                      <input type="hidden" name="debtId" value={debt.id} />
                      <button type="submit" className="active-scale" style={{
                        width: 32, height: 32, display: 'grid', placeItems: 'center',
                        borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'transparent', color: 'rgba(255,255,255,0.4)',
                        transition: 'all 0.2s'
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
          <h2 style={{ fontSize: 15, fontWeight: 900, color: '#FFFFFF', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowUpRight size={18} style={{ color: '#30D158' }} /> Piutang Aktif
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeReceivables.map(receivable => {
              const isOverdue = receivable.dueDate && receivable.dueDate < new Date();
              return (
                <div key={receivable.id} style={{
                  borderRadius: 16, padding: 16,
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(40px) saturate(200%)',
                  border: isOverdue ? '0.5px solid rgba(255,159,10,0.4)' : '0.5px solid rgba(48,209,88,0.2)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isOverdue ? 'rgba(255,159,10,0.2)' : 'rgba(48,209,88,0.2)',
                    flexShrink: 0
                  }}>
                    {isOverdue ? <AlertCircle size={20} style={{ color: '#FF9F0A' }} /> : <ArrowUpRight size={20} style={{ color: '#30D158' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 14, fontWeight: 900, color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{receivable.name}</p>
                      {isOverdue && (
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                          background: 'rgba(255,159,10,0.2)', color: '#FF9F0A',
                          border: '0.5px solid rgba(255,159,10,0.3)'
                        }}>Overdue</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                        {receivable.dueDate ? receivable.dueDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Tanpa jatuh tempo'}
                      </p>
                      {receivable.notes && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>&bull; {receivable.notes}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 900, color: '#30D158', margin: 0 }}>{rupiah(Number(receivable.remainingAmount))}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>dari {rupiah(Number(receivable.amount))}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <DebtPaymentModal
                      debt={{
                        id: receivable.id,
                        name: receivable.name,
                        type: receivable.type,
                        remainingAmount: receivable.remainingAmount,
                        amount: receivable.amount,
                        accountId: receivable.accountId,
                      }}
                      accounts={accounts.map(a => ({ id: a.id, name: a.name, type: a.type }))}
                      mode="cicil"
                      trigger={<Coins size={14} />}
                    />
                    <DebtPaymentModal
                      debt={{
                        id: receivable.id,
                        name: receivable.name,
                        type: receivable.type,
                        remainingAmount: receivable.remainingAmount,
                        amount: receivable.amount,
                        accountId: receivable.accountId,
                      }}
                      accounts={accounts.map(a => ({ id: a.id, name: a.name, type: a.type }))}
                      mode="lunasi"
                      trigger={<Banknote size={14} />}
                    />
                    <form action={deleteDebt}>
                      <input type="hidden" name="debtId" value={receivable.id} />
                      <button type="submit" className="active-scale" style={{
                        width: 32, height: 32, display: 'grid', placeItems: 'center',
                        borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'transparent', color: 'rgba(255,255,255,0.4)',
                        transition: 'all 0.2s'
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

      {/* Empty State */}
      {debts.length === 0 && (
        <div className="ios-card" style={{ textAlign: 'center', padding: 48 }}>
          <CreditCard size={40} style={{ color: 'rgba(255,255,255,0.3)', margin: '0 auto 16px auto', opacity: 0.5 }} />
          <p style={{ color: '#FFFFFF', fontWeight: 900, fontSize: 15, margin: 0 }}>Belum ada hutang & piutang</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 8, margin: '8px 0 0 0' }}>
            Tambahkan hutang atau piutang untuk tracking keuangan
          </p>
        </div>
      )}

      {/* Add Debt Form */}
      {/* Removed - now using modal */}
    </div>
  );
}
