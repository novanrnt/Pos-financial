import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { addDebt, payDebt, deleteDebt, deleteDebtPayment } from '@/lib/actions';
import { Card, PageTitle, SubmitButton } from '@/components/ui';
import { rupiah, todayInput } from '@/lib/utils';

export default async function Debts() {
  const u = await requireUser();
  const uid = u!.id;
  const [debts, accounts] = await Promise.all([
    prisma.debt.findMany({ where: { userId: uid, status: 'ACTIVE' }, include: { payments: true, account: true }, orderBy: { createdAt: 'desc' } }),
    prisma.account.findMany({ where: { userId: uid } })
  ]);

  return (
    <>
      <PageTitle title="Hutang Piutang" desc="Cicilan, pelunasan, status, dan integrasi rekening." />
      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {debts.length === 0 ? (
            <Card className="sm:col-span-2">
              <p className="text-center text-slate-400">Tidak ada hutang/piutang aktif</p>
            </Card>
          ) : (
            debts.map(d => (
              <Card key={d.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-lg md:text-xl">{d.name}</h3>
                    <span className={`text-xs ${d.type === 'DEBT' ? 'text-rose-300' : 'text-emerald-300'}`}>{d.type}</span>
                  </div>
                  <form action={deleteDebt}>
                    <input type="hidden" name="debtId" value={d.id} />
                    <button type="submit" className="text-rose-300 text-xs hover:text-rose-200">Hapus</button>
                  </form>
                </div>
                <p className="text-slate-400 text-sm mt-2">Sisa {rupiah(d.remainingAmount)} dari {rupiah(d.amount)}</p>
                <p className="text-xs text-slate-500">Jatuh tempo: {d.dueDate?.toISOString().slice(0, 10) || '-'} • {d.status}</p>
                {d.account && <p className="text-xs text-violet-300 mt-1">Rekening: {d.account.name}</p>}
                
                {d.payments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs font-black text-slate-400 mb-2">Riwayat Pembayaran:</p>
                    <div className="space-y-1">
                      {d.payments.map(p => (
                        <div key={p.id} className="flex justify-between items-center text-xs bg-white/[.04] p-2 rounded-lg">
                          <span>{p.date.toISOString().slice(0, 10)} - {rupiah(p.amount)}</span>
                          <form action={deleteDebtPayment}>
                            <input type="hidden" name="paymentId" value={p.id} />
                            <button type="submit" className="text-rose-300 hover:text-rose-200">Hapus</button>
                          </form>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <form action={payDebt} className="mt-4 grid gap-2">
                  <input type="hidden" name="debtId" value={d.id} />
                  {!d.account && (
                    <select name="accountId">
                      <option value="">Pilih Rekening</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  )}
                  <input name="amount" placeholder="Nominal bayar/terima" />
                  <input name="date" type="date" defaultValue={todayInput()} />
                  <button className="btn btn-primary text-sm">Proses Cicilan</button>
                </form>
              </Card>
            ))
          )}
        </div>
        <Card>
          <h2 className="font-black mb-4">Tambah Hutang/Piutang</h2>
          <form action={addDebt} className="space-y-3">
            <select name="type">
              <option value="DEBT">Hutang</option>
              <option value="RECEIVABLE">Piutang</option>
            </select>
            <input name="name" placeholder="Nama" required />
            <input name="amount" placeholder="Nominal" required />
            <select name="accountId" required>
              <option value="">Pilih Rekening</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <input name="dueDate" type="date" />
            <textarea name="notes" placeholder="Catatan" />
            <SubmitButton />
          </form>
        </Card>
      </div>
    </>
  );
}
