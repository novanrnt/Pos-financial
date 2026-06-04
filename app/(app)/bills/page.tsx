import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { payBill } from '@/lib/actions';
import { rupiah } from '@/lib/utils';
import { Receipt, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BillFormModal } from '@/components/bill-form-modal';

export default async function Bills() {
  const u = await requireUser();
  const uid = u!.id;
  
  const [bills, accounts] = await Promise.all([
    prisma.recurringBill.findMany({ 
      where: { userId: uid }, 
      include: { account: true }, 
      orderBy: { dueDay: 'asc' } 
    }),
    prisma.account.findMany({ where: { userId: uid } })
  ]);

  const unpaidBills = bills.filter(b => b.status === 'UNPAID');
  const paidBills = bills.filter(b => b.status === 'PAID');
  const totalUnpaid = unpaidBills.reduce((a, b) => a + Number(b.amount), 0);
  const totalPaid = paidBills.reduce((a, b) => a + Number(b.amount), 0);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-white" style={{ letterSpacing: -0.2 }}>Tagihan Rutin</h1>
        <BillFormModal accounts={accounts} />
      </div>

      {/* Summary Card */}
      <div className="ios-glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[13px] text-white/50">Total Tagihan Belum Bayar (IDR)</p>
            <Receipt size={16} className="text-white/40" />
          </div>
          <h2 className="text-[32px] md:text-[40px] font-semibold text-white tracking-tight mb-1" style={{ letterSpacing: -0.5 }}>{rupiah(totalUnpaid)}</h2>
          <p className="text-[11px] text-white/40 mb-6">{unpaidBills.length} tagihan menunggu pembayaran</p>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[11px] text-white/40 mb-0.5 flex items-center gap-1"><Clock size={12} /> Belum Bayar</p>
              <p className="text-[15px] font-semibold" style={{ color: '#FF9F0A' }}>{rupiah(totalUnpaid)}</p>
            </div>
            <div className="p-3" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[11px] text-white/40 mb-0.5 flex items-center gap-1"><CheckCircle2 size={12} /> Sudah Bayar</p>
              <p className="text-[15px] font-semibold" style={{ color: '#30D158' }}>{rupiah(totalPaid)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Unpaid Bills */}
      {unpaidBills.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-white/80 mb-3 px-1 flex items-center gap-2">
            <Clock size={16} style={{ color: '#FF9F0A' }} /> Belum Dibayar
          </h2>
          <div className="space-y-2">
            {unpaidBills.map(bill => {
              const today = new Date().getDate();
              const isOverdue = today > bill.dueDay;
              const isDueSoon = !isOverdue && (bill.dueDay - today) <= 3;

              return (
                <div key={bill.id} className="ios-card p-4 flex items-center gap-4 active-scale">
                  <div className="shrink-0 w-11 h-11 rounded-[14px] flex items-center justify-center" style={{
                    background: isOverdue ? 'rgba(255,69,58,0.15)' : isDueSoon ? 'rgba(255,159,10,0.15)' : 'rgba(255,159,10,0.15)'
                  }}>
                    {isOverdue ? <AlertCircle size={20} style={{ color: '#FF453A' }} /> : <Receipt size={20} style={{ color: '#FF9F0A' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-semibold text-white truncate">{bill.name}</h3>
                      {isOverdue && <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(255,69,58,0.15)', color: '#FF453A' }}>Terlambat</span>}
                      {isDueSoon && <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(255,159,10,0.15)', color: '#FF9F0A' }}>Segera</span>}
                    </div>
                    <p className="text-[13px] text-white/40 mt-0.5">Jatuh tempo tanggal {bill.dueDay} • {bill.account.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[15px] font-semibold" style={{ color: '#FF9F0A' }}>{rupiah(Number(bill.amount))}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <form action={payBill}>
                      <input type="hidden" name="id" value={bill.id} />
                      <button type="submit" className="grid h-8 w-8 place-items-center rounded-xl active-scale text-white/40 hover:text-[#30D158] transition" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <CheckCircle2 size={14} />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Paid Bills */}
      {paidBills.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-white/80 mb-3 px-1 flex items-center gap-2">
            <CheckCircle2 size={16} style={{ color: '#30D158' }} /> Sudah Dibayar
          </h2>
          <div className="space-y-2">
            {paidBills.map(bill => (
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {bills.length === 0 && (
        <div className="ios-card p-12 text-center">
          <Receipt size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-[15px] font-semibold text-white/90">Belum ada tagihan rutin</p>
          <p className="text-[13px] text-white/40 mt-1">Tambahkan tagihan rutin seperti listrik, internet, dll</p>
        </div>
      )}

      {/* Add Bill Form */}
      {/* Removed - now using modal */}
    </div>
  );
}
