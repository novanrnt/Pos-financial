import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { deleteTransaction } from '@/lib/actions';
import { Card, PageTitle, SubmitButton, Badge, SectionHeader } from '@/components/ui';
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

  const allEntries = [
    ...tx.map(t => ({ type: 'transaction' as const, data: t, date: t.date })),
    ...debts.flatMap(d => [
      { type: 'debt_created' as const, data: d, date: d.createdAt },
      ...d.payments.map(p => ({ type: 'debt_payment' as const, data: { debt: d, payment: p }, date: p.date }))
    ])
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 150);

  // Group by date
  const groupedEntries = allEntries.reduce((acc, entry) => {
    const dateKey = entry.date.toISOString().slice(0, 10);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, typeof allEntries>);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Transaksi" desc="Pemasukan, pengeluaran, transfer, hutang/piutang, dan saldo otomatis." />
        <TransactionFormButton accounts={accounts} categories={cats} label="+ Tambah" />
      </div>
      <div className="grid gap-6 lg:grid-cols-1">
        {/* Transactions List */}
        <div className="space-y-6">
          {Object.entries(groupedEntries).length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-premium-text-muted">Belum ada transaksi</p>
              <p className="text-xs text-premium-text-muted mt-2">Tekan tombol + untuk menambahkan transaksi pertama.</p>
            </Card>
          ) : (
            Object.entries(groupedEntries).map(([dateKey, entries]) => (
              <div key={dateKey}>
                <div className="px-1 mb-3">
                  <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide">{new Date(dateKey).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="space-y-2">
                  {entries.map((entry) => {
                    if (entry.type === 'transaction') {
                      const t = entry.data;
                      const isExpense = t.type === 'EXPENSE';
                      const isIncome = t.type === 'INCOME';
                      const isTransfer = t.type === 'TRANSFER';
                      
                      return (
                        <div key={`tx-${t.id}`} className="soft-card rounded-2xl p-4 border border-premium-border-soft hover:border-premium-border-medium transition-all">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                                isExpense ? 'bg-premium-expense/10' : isIncome ? 'bg-premium-income/10' : 'bg-violet-500/10'
                              }`}>
                                {isExpense ? <ArrowDownRight size={18} className="text-premium-expense" /> : isIncome ? <ArrowUpRight size={18} className="text-premium-income" /> : <ArrowRightLeft size={18} className="text-violet-300" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-black text-premium-text truncate">{t.description || t.type}</p>
                                <p className="text-xs text-premium-text-muted mt-1 truncate">
                                  {t.account.name} {t.transferToAccount ? `→ ${t.transferToAccount.name}` : ''} • {t.category?.name || '-'}
                                </p>
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <p className={`text-sm font-black ${isExpense ? 'text-premium-expense' : 'text-premium-income'}`}>
                                {isExpense ? '−' : '+'}{rupiah(t.amount)}
                              </p>
                              <form action={deleteTransaction} className="mt-1">
                                <input type="hidden" name="id" value={t.id} />
                                <button type="submit" className="text-[10px] text-premium-text-muted hover:text-premium-expense transition-colors">
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
                        <div key={`debt-${d.id}`} className="soft-card rounded-2xl p-4 border border-premium-border-soft">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                                d.type === 'DEBT' ? 'bg-premium-expense/10' : 'bg-premium-income/10'
                              }`}>
                                {d.type === 'DEBT' ? <ArrowDownRight size={18} className="text-premium-expense" /> : <ArrowUpRight size={18} className="text-premium-income" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-black text-premium-text truncate">{d.type === 'DEBT' ? 'Hutang' : 'Piutang'}: {d.name}</p>
                                <p className="text-xs text-premium-text-muted mt-1">{d.account?.name || '-'} • Dibuat</p>
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <p className={`text-sm font-black ${d.type === 'DEBT' ? 'text-premium-expense' : 'text-premium-income'}`}>
                                {d.type === 'DEBT' ? '+' : '−'}{rupiah(d.amount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (entry.type === 'debt_payment') {
                      const { debt: d, payment: p } = entry.data;
                      return (
                        <div key={`payment-${p.id}`} className="soft-card rounded-2xl p-4 border border-premium-border-soft">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                                d.type === 'DEBT' ? 'bg-premium-expense/10' : 'bg-premium-income/10'
                              }`}>
                                {d.type === 'DEBT' ? <ArrowDownRight size={18} className="text-premium-expense" /> : <ArrowUpRight size={18} className="text-premium-income" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-black text-premium-text truncate">{d.type === 'DEBT' ? 'Bayar Hutang' : 'Terima Piutang'}: {d.name}</p>
                                <p className="text-xs text-premium-text-muted mt-1">{p.account?.name || '-'} • Pembayaran</p>
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <p className={`text-sm font-black ${d.type === 'DEBT' ? 'text-premium-expense' : 'text-premium-income'}`}>
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
            ))
          )}
        </div>
      </div>
    </>
  );
}
