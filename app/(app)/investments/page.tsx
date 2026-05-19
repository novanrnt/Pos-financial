import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { addInvestment } from '@/lib/actions';
import { Card, PageTitle, SubmitButton } from '@/components/ui';
import { rupiah, ym } from '@/lib/utils';

export default async function Investments() {
  const u = await requireUser();
  const rows = await prisma.investmentSnapshot.findMany({ where: { userId: u!.id }, orderBy: { month: 'desc' } });

  return (
    <>
      <PageTitle title="Investasi" desc="Snapshot saldo bulanan sederhana." />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          {/* Mobile: card list */}
          <div className="space-y-3 md:hidden">
            {rows.map(r => (
              <div key={r.id} className="rounded-2xl bg-white/[.04] p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-black text-sm">{r.category}</span>
                    <p className="text-[11px] text-slate-500">{r.month}</p>
                  </div>
                  <div className="text-sm font-black text-emerald-300">{rupiah(r.balance)}</div>
                </div>
                {r.notes && <p className="mt-1 text-xs text-slate-500 truncate">{r.notes}</p>}
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block table-wrap">
            <table className="table">
              <thead><tr><th>Bulan</th><th>Kategori</th><th>Saldo</th><th>Catatan</th></tr></thead>
              <tbody>{rows.map(r => (
                <tr key={r.id}>
                  <td>{r.month}</td>
                  <td>{r.category}</td>
                  <td>{rupiah(r.balance)}</td>
                  <td>{r.notes}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
        <Card>
          <h2 className="font-black mb-4">Update Snapshot</h2>
          <form action={addInvestment} className="space-y-3">
            <select name="category">
              <option>Saham</option>
              <option>Crypto</option>
              <option>Reksa Dana</option>
              <option>R&D / Eksperimen</option>
              <option>Lainnya</option>
            </select>
            <input name="month" defaultValue={ym()} />
            <input name="balance" placeholder="Saldo bulan ini" />
            <textarea name="notes" placeholder="Catatan" />
            <SubmitButton />
          </form>
        </Card>
      </div>
    </>
  );
}
