import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { rupiah } from '@/lib/utils';
import { Receipt, Clock, AlertCircle, CheckCircle2, CalendarClock } from 'lucide-react';
import { BillFormModal } from '@/components/bill-form-modal';
import { BillPaymentModal } from '@/components/bill-payment-modal';
import { DeleteBillButton } from '@/components/delete-bill-button';

export default async function Bills() {
  const u = await requireUser();
  const uid = u!.id;
  
  const [bills, accounts] = await Promise.all([
    prisma.recurringBill.findMany({ 
      where: { userId: uid }, 
      include: { account: true }, 
      orderBy: [{ billType: 'asc' }, { dueDay: 'asc' }] 
    }),
    prisma.account.findMany({ where: { userId: uid } })
  ]);

  const monthlyBills = bills.filter(b => b.billType === 'MONTHLY');
  const installmentBills = bills.filter(b => b.billType === 'INSTALLMENT');

  const unpaidMonthly = monthlyBills.filter(b => b.status === 'UNPAID');
  const paidMonthly = monthlyBills.filter(b => b.status === 'PAID');
  const activeInstallments = installmentBills.filter(b => b.status === 'UNPAID');
  const completedInstallments = installmentBills.filter(b => b.status === 'PAID');

  const totalUnpaid = unpaidMonthly.reduce((a, b) => a + Number(b.amount), 0);
  const totalInstallment = activeInstallments.reduce((a, b) => a + Number(b.amount), 0);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-white" style={{ letterSpacing: -0.2 }}>Tagihan</h1>
        <BillFormModal accounts={accounts} />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="ios-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={14} style={{ color: '#FF9F0A' }} />
            <p className="text-[11px] text-white/40 uppercase tracking-wide">Bulanan</p>
          </div>
          <p className="text-[18px] font-semibold" style={{ color: '#FF9F0A' }}>{rupiah(totalUnpaid)}</p>
          <p className="text-[11px] text-white/30 mt-1">{unpaidMonthly.length} belum bayar</p>
        </div>
        <div className="ios-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarClock size={14} style={{ color: '#0A84FF' }} />
            <p className="text-[11px] text-white/40 uppercase tracking-wide">Cicilan</p>
          </div>
          <p className="text-[18px] font-semibold" style={{ color: '#0A84FF' }}>{rupiah(totalInstallment)}</p>
          <p className="text-[11px] text-white/30 mt-1">{activeInstallments.length} aktif</p>
        </div>
      </div>

      {/* Active Installments */}
      {activeInstallments.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-white/80 mb-3 px-1 flex items-center gap-2">
            <CalendarClock size={16} style={{ color: '#0A84FF' }} /> Cicilan Aktif
          </h2>
          <div className="space-y-2">
            {activeInstallments.map(bill => {
              const paid = bill.paidMonths;
              const total = bill.totalMonths || 0;
              const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
              const remaining = total - paid;

              return (
                <div key={bill.id} className="ios-card p-4 active-scale">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 w-11 h-11 rounded-[14px] flex items-center justify-center" style={{ background: 'rgba(10,132,255,0.15)' }}>
                      <CalendarClock size={20} style={{ color: '#0A84FF' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-semibold text-white truncate">{bill.name}</h3>
                      <p className="text-[13px] text-white/40 mt-0.5">
                        {bill.account.name} • Tgl {bill.dueDay}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[15px] font-semibold" style={{ color: '#0A84FF' }}>{rupiah(Number(bill.amount))}</p>
                      <p className="text-[11px] text-white/30">/bulan</p>
                    </div>
                    <BillPaymentModal
                      bill={{ id: bill.id, name: bill.name, amount: Number(bill.amount), dueDay: bill.dueDay, accountId: bill.accountId }}
                      accounts={accounts.map(a => ({ id: a.id, name: a.name, type: a.type }))}
                    />
                    <DeleteBillButton billId={bill.id} name={bill.name} />
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[11px] text-white/40">{paid}/{total} bulan</span>
                      <span className="text-[11px] text-white/40">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0A84FF, #64D2FF)' }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[11px] text-white/30">Sisa {remaining} bulan</span>
                      <span className="text-[11px] text-white/30">Total {rupiah(Number(bill.totalAmount || 0))}</span>
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-[10px] text-white/20">
                        Mulai: {bill.startDate ? new Date(bill.startDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-'}
                      </span>
                      <span className="text-[10px] text-white/20">
                        Selesai: {bill.startDate ? new Date(new Date(bill.startDate).setMonth(new Date(bill.startDate).getMonth() + total)).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unpaid Monthly Bills */}
      {unpaidMonthly.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-white/80 mb-3 px-1 flex items-center gap-2">
            <Clock size={16} style={{ color: '#FF9F0A' }} /> Tagihan Bulanan
          </h2>
          <div className="space-y-2">
            {unpaidMonthly.map(bill => {
              const today = new Date().getDate();
              const isOverdue = today > bill.dueDay;
              const isDueSoon = !isOverdue && (bill.dueDay - today) <= 3;

              return (
                <div key={bill.id} className="ios-card p-4 flex items-center gap-4 active-scale">
                  <div className="shrink-0 w-11 h-11 rounded-[14px] flex items-center justify-center" style={{
                    background: isOverdue ? 'rgba(255,69,58,0.15)' : 'rgba(255,159,10,0.15)'
                  }}>
                    {isOverdue ? <AlertCircle size={20} style={{ color: '#FF453A' }} /> : <Receipt size={20} style={{ color: '#FF9F0A' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-semibold text-white truncate">{bill.name}</h3>
                      {isOverdue && <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(255,69,58,0.15)', color: '#FF453A' }}>Terlambat</span>}
                      {isDueSoon && <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(255,159,10,0.15)', color: '#FF9F0A' }}>Segera</span>}
                    </div>
                    <p className="text-[13px] text-white/40 mt-0.5">Tgl {bill.dueDay} • {bill.account.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[15px] font-semibold" style={{ color: '#FF9F0A' }}>{rupiah(Number(bill.amount))}</p>
                  </div>
                  <BillPaymentModal
                    bill={{ id: bill.id, name: bill.name, amount: Number(bill.amount), dueDay: bill.dueDay, accountId: bill.accountId }}
                    accounts={accounts.map(a => ({ id: a.id, name: a.name, type: a.type }))}
                  />
                  <DeleteBillButton billId={bill.id} name={bill.name} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Installments */}
      {completedInstallments.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-white/80 mb-3 px-1 flex items-center gap-2">
            <CheckCircle2 size={16} style={{ color: '#30D158' }} /> Cicilan Lunas
          </h2>
          <div className="space-y-2">
            {completedInstallments.map(bill => (
              <div key={bill.id} className="ios-card p-4 flex items-center gap-4 opacity-60 active-scale">
                <div className="shrink-0 w-11 h-11 rounded-[14px] flex items-center justify-center" style={{ background: 'rgba(48,209,88,0.15)' }}>
                  <CheckCircle2 size={20} style={{ color: '#30D158' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-white truncate">{bill.name}</h3>
                  <p className="text-[13px] text-white/40 mt-0.5">{bill.totalMonths}/{bill.totalMonths} bulan • Lunas</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[15px] font-semibold" style={{ color: '#30D158' }}>{rupiah(Number(bill.totalAmount || 0))}</p>
                </div>
                <DeleteBillButton billId={bill.id} name={bill.name} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paid Monthly Bills */}
      {paidMonthly.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-white/80 mb-3 px-1 flex items-center gap-2">
            <CheckCircle2 size={16} style={{ color: '#30D158' }} /> Sudah Dibayar
          </h2>
          <div className="space-y-2">
            {paidMonthly.map(bill => (
              <div key={bill.id} className="ios-card p-4 flex items-center gap-4 opacity-60 active-scale">
                <div className="shrink-0 w-11 h-11 rounded-[14px] flex items-center justify-center" style={{ background: 'rgba(48,209,88,0.15)' }}>
                  <CheckCircle2 size={20} style={{ color: '#30D158' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-white truncate">{bill.name}</h3>
                  <p className="text-[13px] text-white/40 mt-0.5">Dibayar • {bill.account.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[15px] font-semibold" style={{ color: '#30D158' }}>{rupiah(Number(bill.amount))}</p>
                </div>
                <DeleteBillButton billId={bill.id} name={bill.name} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {bills.length === 0 && (
        <div className="ios-card p-12 text-center">
          <Receipt size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-[15px] font-semibold text-white/90">Belum ada tagihan</p>
          <p className="text-[13px] text-white/40 mt-1">Tambahkan tagihan bulanan atau cicilan</p>
        </div>
      )}
    </div>
  );
}
