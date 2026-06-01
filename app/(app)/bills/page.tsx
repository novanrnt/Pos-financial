import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { payBill } from '@/lib/actions';
import { SubmitButton } from '@/components/ui';
import { rupiah } from '@/lib/utils';
import { Receipt, Plus, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
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
        <h1 className="text-2xl font-black text-premium-text">Tagihan Rutin</h1>
        <BillFormModal accounts={accounts} />
      </div>

      {/* Summary Card */}
      <div className="rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #3a1a0a 0%, #1a0a3a 50%, #0a3a2a 100%)' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-emerald-500/10 pointer-events-none" />
        <div className="relative p-6 md:p-8">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-white/60">Total Tagihan Belum Bayar (IDR)</p>
            <Receipt size={16} className="text-white/40" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">{rupiah(totalUnpaid)}</h2>
          <p className="text-xs text-white/50 mb-6">{unpaidBills.length} tagihan menunggu pembayaran</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[.08] rounded-2xl p-4 border border-white/[.10]">
              <p className="text-xs text-white/50 mb-1 flex items-center gap-1"><Clock size={12} /> Belum Bayar</p>
              <p className="text-base font-black text-orange-300">{rupiah(totalUnpaid)}</p>
            </div>
            <div className="bg-white/[.08] rounded-2xl p-4 border border-white/[.10]">
              <p className="text-xs text-white/50 mb-1 flex items-center gap-1"><CheckCircle2 size={12} /> Sudah Bayar</p>
              <p className="text-base font-black text-emerald-300">{rupiah(totalPaid)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Unpaid Bills */}
      {unpaidBills.length > 0 && (
        <div>
          <h2 className="text-base font-black text-premium-text mb-3 flex items-center gap-2">
            <Clock size={18} className="text-orange-400" /> Belum Dibayar
          </h2>
          <div className="space-y-2">
            {unpaidBills.map(bill => {
              const today = new Date().getDate();
              const isOverdue = today > bill.dueDay;
              const isDueSoon = !isOverdue && (bill.dueDay - today) <= 3;

              return (
                <div key={bill.id} className={`glass-premium rounded-2xl p-4 border ${
                  isOverdue ? 'border-rose-500/30' : isDueSoon ? 'border-amber-500/30' : 'border-orange-500/20'
                } flex items-center gap-4`}>
                  <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                    isOverdue ? 'bg-rose-500/20 text-rose-400' : 
                    isDueSoon ? 'bg-amber-500/20 text-amber-400' : 
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {isOverdue ? <AlertCircle size={20} /> : <Receipt size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-premium-text truncate">{bill.name}</h3>
                      {isOverdue && <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full shrink-0">Terlambat</span>}
                      {isDueSoon && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full shrink-0">Segera</span>}
                    </div>
                    <p className="text-xs text-premium-text-muted mt-0.5">Jatuh tempo tanggal {bill.dueDay} • {bill.account.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-orange-400">{rupiah(Number(bill.amount))}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <form action={payBill}>
                      <input type="hidden" name="id" value={bill.id} />
                      <button type="submit" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-premium-income/10 text-premium-text-muted hover:text-premium-income transition">
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
          <h2 className="text-base font-black text-premium-text mb-3 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" /> Sudah Dibayar
          </h2>
          <div className="space-y-2">
            {paidBills.map(bill => (
              <div key={bill.id} className="glass-premium rounded-2xl p-4 border border-emerald-500/20 flex items-center gap-4 opacity-60">
                <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-premium-text truncate">{bill.name}</h3>
                  <p className="text-xs text-premium-text-muted mt-0.5">Dibayar • {bill.account.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-emerald-400">{rupiah(Number(bill.amount))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {bills.length === 0 && (
        <div className="glass-premium rounded-3xl p-12 text-center">
          <Receipt size={40} className="text-premium-text-muted opacity-30 mx-auto mb-4" />
          <p className="text-premium-text font-black">Belum ada tagihan rutin</p>
          <p className="text-xs text-premium-text-muted mt-2">Tambahkan tagihan rutin seperti listrik, internet, dll</p>
        </div>
      )}

      {/* Add Bill Form */}
      {/* Removed - now using modal */}
    </div>
  );
}
