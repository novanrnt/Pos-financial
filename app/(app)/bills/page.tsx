import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { addBill, payBill } from '@/lib/actions';
import { Card, PageTitle, SubmitButton } from '@/components/ui';
import { rupiah } from '@/lib/utils';

export default async function Bills() {
  const u = await requireUser();
  const uid = u!.id;
  const [bills, accounts] = await Promise.all([
    prisma.recurringBill.findMany({ where: { userId: uid }, include: { account: true }, orderBy: { dueDay: 'asc' } }),
    prisma.account.findMany({ where: { userId: uid } })
  ]);

  return (
    <>
      <PageTitle title="Tagihan Rutin" desc="Tagihan bulanan, jatuh tempo, dan bayar dari rekening." />
      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <Card>
          <div className="space-y-3">
            {bills.map(b => (
              <div key={b.id} className="rounded-2xl bg-white/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <b className="block truncate">{b.name}</b>
                  <p className="text-xs text-slate-400">Jatuh tempo tgl {b.dueDay} • {b.account.name} • {b.status}</p>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                  <div className="font-black text-sm">{rupiah(b.amount)}</div>
                  <form action={payBill}>
                    <input type="hidden" name="id" value={b.id} />
                    <button className="text-sm text-emerald-300">Bayar</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-black mb-4">Tambah Tagihan</h2>
          <form action={addBill} className="space-y-3">
            <input name="name" placeholder="Internet, listrik, cicilan" />
            <input name="amount" placeholder="Nominal" />
            <input name="dueDay" placeholder="Tanggal jatuh tempo: 1-31" />
            <select name="accountId">
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <textarea name="notes" placeholder="Catatan" />
            <SubmitButton />
          </form>
        </Card>
      </div>
    </>
  );
}
