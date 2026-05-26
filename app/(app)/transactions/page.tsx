import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { addTransaction, deleteTransaction } from '@/lib/actions';
import { Card, PageTitle, SubmitButton } from '@/components/ui';
import { rupiah, todayInput } from '@/lib/utils';

export default async function Transactions() {
  const u = await requireUser();
  const uid = u!.id;
  const [tx, accounts, cats, debts] = await Promise.all([
    prisma.transaction.findMany({ where: { userId: uid }, include: { account: true, category: true, transferToAccount: true }, orderBy: { date: 'desc' }, take: 100 }),
    prisma.account.findMany({ where: { userId: uid } }),
    prisma.category.findMany({ where: { userId: uid, isActive: true } }),
    prisma.debt.findMany({ where: { userId: uid }, include: { payments: { include: { account: true } }, account: true }, orderBy: { createdAt: 'desc' } })
  ]);

  // Combine transactions with debt/receivable entries
  const allEntries = [
    ...tx.map(t => ({ type: 'transaction' as const, data: t, date: t.date })),
    ...debts.flatMap(d => [
      { type: 'debt_created' as const, data: d, date: d.createdAt },
      ...d.payments.map(p => ({ type: 'debt_payment' as const, data: { debt: d, payment: p }, date: p.date }))
    ])
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 150);

  return (
    <>
      <PageTitle title="Transaksi" desc="Pemasukan, pengeluaran, transfer, hutang/piutang, dan saldo otomatis." />
      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <Card>
          {/* Mobile: card list */}
          <div className="space-y-3 md:hidden">
            {allEntries.map((entry, idx) => {
              if (entry.type === 'transaction') {
                const t = entry.data;
                return (
                  <div key={`tx-${t.id}`} className="rounded-2xl bg-white/[.04] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${t.type === 'EXPENSE' ? 'bg-rose-400' : t.type === 'INCOME' ? 'bg-emerald-400' : 'bg-violet-400'}`} />
                          <span className="font-black text-sm truncate">{t.description || t.type}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 truncate">
                          {t.date.toISOString().slice(0, 10)} • {t.account.name} {t.transferToAccount ? `→ ${t.transferToAccount.name}` : ''} • {t.category?.name || '-'}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className={`text-sm font-black ${t.type === 'EXPENSE' ? 'text-rose-300' : 'text-emerald-300'}`}>
                          {t.type === 'EXPENSE' ? '- ' : '+ '}{rupiah(t.amount)}
                        </div>
                        <form action={deleteTransaction}>
                          <input type="hidden" name="id" value={t.id} />
                          <button className="text-[10px] text-rose-300">Hapus</button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              } else if (entry.type === 'debt_created') {
                const d = entry.data;
                return (
                  <div key={`debt-${d.id}`} className="rounded-2xl bg-white/[.04] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${d.type === 'DEBT' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                          <span className="font-black text-sm truncate">{d.type === 'DEBT' ? 'Hutang' : 'Piutang'}: {d.name}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 truncate">
                          {d.createdAt.toISOString().slice(0, 10)} • {d.account?.name || '-'} • Dibuat
                        </p>
                      </div>
                      <div className={`shrink-0 text-sm font-black ${d.type === 'DEBT' ? 'text-rose-300' : 'text-emerald-300'}`}>
                        {d.type === 'DEBT' ? '+ ' : '- '}{rupiah(d.amount)}
                      </div>
                    </div>
                  </div>
                );
              } else if (entry.type === 'debt_payment') {
                const { debt: d, payment: p } = entry.data;
                return (
                  <div key={`payment-${p.id}`} className="rounded-2xl bg-white/[.04] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${d.type === 'DEBT' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                          <span className="font-black text-sm truncate">{d.type === 'DEBT' ? 'Bayar Hutang' : 'Terima Piutang'}: {d.name}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 truncate">
                          {p.date.toISOString().slice(0, 10)} • {p.account?.name || '-'} • Pembayaran
                        </p>
                      </div>
                      <div className={`shrink-0 text-sm font-black ${d.type === 'DEBT' ? 'text-rose-300' : 'text-emerald-300'}`}>
                        {d.type === 'DEBT' ? '- ' : '+ '}{rupiah(p.amount)}
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block table-wrap">
            <table className="table">
              <thead><tr><th>Tanggal</th><th>Tipe</th><th>Deskripsi</th><th>Nominal</th></tr></thead>
              <tbody>{allEntries.map((entry) => {
                if (entry.type === 'transaction') {
                  const t = entry.data;
                  return (
                    <tr key={`tx-${t.id}`}>
                      <td>{t.date.toISOString().slice(0, 10)}</td>
                      <td>{t.type}</td>
                      <td>{t.description}<div className="text-xs text-slate-400">{t.account.name} {t.transferToAccount ? `→ ${t.transferToAccount.name}` : ''} • {t.category?.name || '-'}</div></td>
                      <td>{rupiah(t.amount)}</td>
                    </tr>
                  );
                } else if (entry.type === 'debt_created') {
                  const d = entry.data;
                  return (
                    <tr key={`debt-${d.id}`}>
                      <td>{d.createdAt.toISOString().slice(0, 10)}</td>
                      <td>{d.type === 'DEBT' ? 'Hutang' : 'Piutang'}</td>
                      <td>{d.name}<div className="text-xs text-slate-400">{d.account?.name || '-'} • Dibuat</div></td>
                      <td className={d.type === 'DEBT' ? 'text-rose-300' : 'text-emerald-300'}>{d.type === 'DEBT' ? '+ ' : '- '}{rupiah(d.amount)}</td>
                    </tr>
                  );
                } else if (entry.type === 'debt_payment') {
                  const { debt: d, payment: p } = entry.data;
                  return (
                    <tr key={`payment-${p.id}`}>
                      <td>{p.date.toISOString().slice(0, 10)}</td>
                      <td>{d.type === 'DEBT' ? 'Bayar Hutang' : 'Terima Piutang'}</td>
                      <td>{d.name}<div className="text-xs text-slate-400">{p.account?.name || '-'} • Pembayaran</div></td>
                      <td className={d.type === 'DEBT' ? 'text-rose-300' : 'text-emerald-300'}>{d.type === 'DEBT' ? '- ' : '+ '}{rupiah(p.amount)}</td>
                    </tr>
                  );
                }
              })}</tbody>
            </table>
          </div>
        </Card>
        <Card>
          <h2 className="font-black mb-4">Tambah Transaksi</h2>
          <form action={addTransaction} className="space-y-3">
            <select name="type">
              <option value="INCOME">Pemasukan</option>
              <option value="EXPENSE">Pengeluaran</option>
              <option value="TRANSFER">Transfer</option>
            </select>
            <select name="accountId" required>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select name="transferToAccountId">
              <option value="">Tujuan transfer</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select name="categoryId">
              <option value="">Pilih kategori</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.type} - {c.name}</option>)}
            </select>
            <input name="amount" placeholder="Nominal" required />
            <input name="date" type="date" defaultValue={todayInput()} required />
            <textarea name="description" placeholder="Catatan" />
            <SubmitButton />
          </form>
        </Card>
      </div>
    </>
  );
}

  // Combine transactions with debt/receivable entries
  const allEntries = [
    ...tx.map(t => ({ type: 'transaction' as const, data: t, date: t.date })),
    ...debts.flatMap(d => [
      { type: 'debt_created' as const, data: d, date: d.createdAt },
      ...d.payments.map(p => ({ type: 'debt_payment' as const, data: { debt: d, payment: p }, date: p.date }))
    ])
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 150);

  return (
    <>
      <PageTitle title="Transaksi" desc="Pemasukan, pengeluaran, transfer, hutang/piutang, dan saldo otomatis." />
      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <Card>
          {/* Mobile: card list */}
          <div className="space-y-3 md:hidden">
            {allEntries.map((entry, idx) => {
              if (entry.type === 'transaction') {
                const t = entry.data;
                return (
                  <div key={`tx-${t.id}`} className="rounded-2xl bg-white/[.04] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${t.type === 'EXPENSE' ? 'bg-rose-400' : t.type === 'INCOME' ? 'bg-emerald-400' : 'bg-violet-400'}`} />
                          <span className="font-black text-sm truncate">{t.description || t.type}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 truncate">
                          {t.date.toISOString().slice(0, 10)} • {t.account.name} {t.transferToAccount ? `→ ${t.transferToAccount.name}` : ''} • {t.category?.name || '-'}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className={`text-sm font-black ${t.type === 'EXPENSE' ? 'text-rose-300' : 'text-emerald-300'}`}>
                          {t.type === 'EXPENSE' ? '- ' : '+ '}{rupiah(t.amount)}
                        </div>
                        <form action={deleteTransaction}>
                          <input type="hidden" name="id" value={t.id} />
                          <button className="text-[10px] text-rose-300">Hapus</button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              } else if (entry.type === 'debt_created') {
                const d = entry.data;
                return (
                  <div key={`debt-${d.id}`} className="rounded-2xl bg-white/[.04] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${d.type === 'DEBT' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                          <span className="font-black text-sm truncate">{d.type === 'DEBT' ? 'Hutang' : 'Piutang'}: {d.name}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 truncate">
                          {d.createdAt.toISOString().slice(0, 10)} • {d.account?.name || '-'} • Dibuat
                        </p>
                      </div>
                      <div className={`shrink-0 text-sm font-black ${d.type === 'DEBT' ? 'text-rose-300' : 'text-emerald-300'}`}>
                        {d.type === 'DEBT' ? '+ ' : '- '}{rupiah(d.amount)}
                      </div>
                    </div>
                  </div>
                );
              } else if (entry.type === 'debt_payment') {
                const { debt: d, payment: p } = entry.data;
                return (
                  <div key={`payment-${p.id}`} className="rounded-2xl bg-white/[.04] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${d.type === 'DEBT' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                          <span className="font-black text-sm truncate">{d.type === 'DEBT' ? 'Bayar Hutang' : 'Terima Piutang'}: {d.name}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 truncate">
                          {p.date.toISOString().slice(0, 10)} • {p.account?.name || '-'} • Pembayaran
                        </p>
                      </div>
                      <div className={`shrink-0 text-sm font-black ${d.type === 'DEBT' ? 'text-rose-300' : 'text-emerald-300'}`}>
                        {d.type === 'DEBT' ? '- ' : '+ '}{rupiah(p.amount)}
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block table-wrap">
            <table className="table">
              <thead><tr><th>Tanggal</th><th>Tipe</th><th>Deskripsi</th><th>Nominal</th></tr></thead>
              <tbody>{allEntries.map((entry) => {
                if (entry.type === 'transaction') {
                  const t = entry.data;
                  return (
                    <tr key={`tx-${t.id}`}>
                      <td>{t.date.toISOString().slice(0, 10)}</td>
                      <td>{t.type}</td>
                      <td>{t.description}<div className="text-xs text-slate-400">{t.account.name} {t.transferToAccount ? `→ ${t.transferToAccount.name}` : ''} • {t.category?.name || '-'}</div></td>
                      <td>{rupiah(t.amount)}</td>
                    </tr>
                  );
                } else if (entry.type === 'debt_created') {
                  const d = entry.data;
                  return (
                    <tr key={`debt-${d.id}`}>
                      <td>{d.createdAt.toISOString().slice(0, 10)}</td>
                      <td>{d.type === 'DEBT' ? 'Hutang' : 'Piutang'}</td>
                      <td>{d.name}<div className="text-xs text-slate-400">{d.account?.name || '-'} • Dibuat</div></td>
                      <td className={d.type === 'DEBT' ? 'text-rose-300' : 'text-emerald-300'}>{d.type === 'DEBT' ? '+ ' : '- '}{rupiah(d.amount)}</td>
                    </tr>
                  );
                } else if (entry.type === 'debt_payment') {
                  const { debt: d, payment: p } = entry.data;
                  return (
                    <tr key={`payment-${p.id}`}>
                      <td>{p.date.toISOString().slice(0, 10)}</td>
                      <td>{d.type === 'DEBT' ? 'Bayar Hutang' : 'Terima Piutang'}</td>
                      <td>{d.name}<div className="text-xs text-slate-400">{p.account?.name || '-'} • Pembayaran</div></td>
                      <td className={d.type === 'DEBT' ? 'text-rose-300' : 'text-emerald-300'}>{d.type === 'DEBT' ? '- ' : '+ '}{rupiah(p.amount)}</td>
                    </tr>
                  );
                }
              })}</tbody>
            </table>
          </div>
        </Card>
        <Card>
          <h2 className="font-black mb-4">Tambah Transaksi</h2>
          <form action={addTransaction} className="space-y-3">
            <select name="type">
              <option value="INCOME">Pemasukan</option>
              <option value="EXPENSE">Pengeluaran</option>
              <option value="TRANSFER">Transfer</option>
            </select>
            <select name="accountId" required>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select name="transferToAccountId">
              <option value="">Tujuan transfer</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select name="categoryId">
              <option value="">Pilih kategori</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.type} - {c.name}</option>)}
            </select>
            <input name="amount" placeholder="Nominal" required />
            <input name="date" type="date" defaultValue={todayInput()} required />
            <textarea name="description" placeholder="Catatan" />
            <SubmitButton />
          </form>
        </Card>
      </div>
    </>
  );
}
