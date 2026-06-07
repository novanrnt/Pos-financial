import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { deleteTransaction } from '@/lib/actions';
import { rupiah, todayInput } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft, Trash2 } from 'lucide-react';
import { TransactionFormButton } from '@/components/transaction-form';

export default async function Transactions() {
  const u = await requireUser();
  const uid = u!.id;
  const [tx, accounts, cats, debts] = await Promise.all([
    prisma.transaction.findMany({ where: { userId: uid }, include: { account: true, category: true, transferToAccount: true }, orderBy: { date: 'desc' }, take: 100 }),
    prisma.account.findMany({ where: { userId: uid } }),
    prisma.category.findMany({ where: { userId: uid, isActive: true } }),
    prisma.debt.findMany({ where: { userId: uid }, include: { payments: { include: { account: true } }, account: true }, orderBy: { createdAt: 'desc' } })
  ]);

  const allEntries: Array<{ type: 'transaction' | 'debt_created' | 'debt_payment'; data: any; date: Date }> = [
    ...tx.map(t => ({ type: 'transaction' as const, data: t, date: t.date })),
    ...debts.flatMap(d => [
      { type: 'debt_created' as const, data: d, date: d.createdAt },
    ])
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 150);

  const groupedEntries = allEntries.reduce((acc, entry) => {
    const localDate = new Date(entry.date.getTime() + 7 * 60 * 60 * 1000);
    const dateKey = localDate.toISOString().slice(0, 10);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, Array<{ type: 'transaction' | 'debt_created' | 'debt_payment'; data: any; date: Date }>>);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-white" style={{ letterSpacing: -0.2 }}>Transaksi</h1>
          <p className="text-[13px] text-white/50 mt-0.5">Pemasukan, pengeluaran, transfer, hutang/piutang</p>
        </div>
        <TransactionFormButton accounts={accounts} categories={cats} label="+ Tambah" />
      </div>

      <div className="space-y-6">
        {Object.entries(groupedEntries).length === 0 ? (
          <div className="ios-card text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-[15px] font-semibold text-white/90">Belum ada transaksi</p>
            <p className="text-[13px] text-white/40 mt-1">Tekan tombol + untuk menambahkan transaksi pertama.</p>
          </div>
        ) : (
          Object.entries(groupedEntries).map(([dateKey, entries]) => {
            const dailyExpense = entries.reduce((sum, entry) => {
              if (entry.type === 'transaction' && entry.data.type === 'EXPENSE' && !entry.data.sourceType?.startsWith('debt_')) return sum + Number(entry.data.amount);
              return sum;
            }, 0);
            const dailyIncome = entries.reduce((sum, entry) => {
              if (entry.type === 'transaction' && entry.data.type === 'INCOME' && !entry.data.sourceType?.startsWith('debt_')) return sum + Number(entry.data.amount);
              return sum;
            }, 0);

            return (
              <div key={dateKey}>
                <div className="px-2 mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wide">
                    {new Date(dateKey).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <div className="flex gap-3">
                    {dailyIncome > 0 && (
                      <p className="text-[11px] font-semibold text-[#30D158]/70 uppercase tracking-wide">
                        +{rupiah(dailyIncome)}
                      </p>
                    )}
                    {dailyExpense > 0 && (
                      <p className="text-[11px] font-semibold text-[#FF453A]/70 uppercase tracking-wide">
                        −{rupiah(dailyExpense)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {entries.map((entry) => {
                    if (entry.type === 'transaction') {
                      const t = entry.data;
                      const isExpense = t.type === 'EXPENSE';
                      const isIncome = t.type === 'INCOME';
                      const isTransfer = t.type === 'TRANSFER';

                      return (
                        <div key={`tx-${t.id}`} className="ios-card p-4 active-scale">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="flex-shrink-0 w-10 h-10 rounded-[14px] flex items-center justify-center" style={{
                                background: isExpense ? 'rgba(255,69,58,0.15)' : isIncome ? 'rgba(48,209,88,0.15)' : 'rgba(191,90,242,0.15)'
                              }}>
                                {isExpense ? <ArrowDownRight size={18} style={{ color: '#FF453A' }} /> : isIncome ? <ArrowUpRight size={18} style={{ color: '#30D158' }} /> : <ArrowRightLeft size={18} style={{ color: '#BF5AF2' }} />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[15px] font-semibold text-white truncate">{t.description || t.type}</p>
                                <p className="text-[13px] text-white/40 mt-0.5 truncate">
                                  {t.account.name} {t.transferToAccount ? `→ ${t.transferToAccount.name}` : ''} • {t.category?.name || '-'}
                                </p>
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <p className="text-[15px] font-semibold" style={{ color: isExpense ? '#FF453A' : '#30D158' }}>
                                {isExpense ? '−' : '+'}{rupiah(t.amount)}
                              </p>
                              <form action={deleteTransaction} className="mt-1">
                                <input type="hidden" name="id" value={t.id} />
                                <button type="submit" className="text-[11px] text-white/40 hover:text-[#FF453A] transition-colors">
                                  Hapus
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (entry.type === 'debt_created') {
                      const d = entry.data;
                      return (
                        <div key={`debt-${d.id}`} className="ios-card p-4 active-scale">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="flex-shrink-0 w-10 h-10 rounded-[14px] flex items-center justify-center" style={{
                                background: d.type === 'DEBT' ? 'rgba(255,69,58,0.15)' : 'rgba(48,209,88,0.15)'
                              }}>
                                {d.type === 'DEBT' ? <ArrowDownRight size={18} style={{ color: '#FF453A' }} /> : <ArrowUpRight size={18} style={{ color: '#30D158' }} />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[15px] font-semibold text-white truncate">{d.type === 'DEBT' ? 'Hutang' : 'Piutang'}: {d.name}</p>
                                <p className="text-[13px] text-white/40 mt-0.5">{d.account?.name || '-'} • Dibuat</p>
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <p className="text-[15px] font-semibold" style={{ color: d.type === 'DEBT' ? '#FF453A' : '#30D158' }}>
                                {d.type === 'DEBT' ? '+' : '−'}{rupiah(d.amount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (entry.type === 'debt_payment') {
                      const { debt: d, payment: p } = entry.data;
                      return (
                        <div key={`payment-${p.id}`} className="ios-card p-4 active-scale">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="flex-shrink-0 w-10 h-10 rounded-[14px] flex items-center justify-center" style={{
                                background: d.type === 'DEBT' ? 'rgba(255,69,58,0.15)' : 'rgba(48,209,88,0.15)'
                              }}>
                                {d.type === 'DEBT' ? <ArrowDownRight size={18} style={{ color: '#FF453A' }} /> : <ArrowUpRight size={18} style={{ color: '#30D158' }} />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[15px] font-semibold text-white truncate">{d.type === 'DEBT' ? 'Bayar Hutang' : 'Terima Piutang'}: {d.name}</p>
                                <p className="text-[13px] text-white/40 mt-0.5">{p.account?.name || '-'} • Pembayaran</p>
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <p className="text-[15px] font-semibold" style={{ color: d.type === 'DEBT' ? '#FF453A' : '#30D158' }}>
                                {d.type === 'DEBT' ? '−' : '+'}{rupiah(p.amount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
