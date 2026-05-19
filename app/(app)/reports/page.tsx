import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { closeMonth } from '@/lib/actions';
import { Card, PageTitle, SubmitButton } from '@/components/ui';
import { ym } from '@/lib/utils';

export default async function Reports() {
  const u = await requireUser();
  const closings = await prisma.monthlyClosing.findMany({ where: { userId: u!.id }, orderBy: { month: 'desc' } });

  return (
    <>
      <PageTitle title="Laporan & Monthly Closing" desc="Kunci bulan, download laporan PDF/print." />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <h2 className="font-black mb-4">Closing Bulan</h2>
          <form action={closeMonth} className="space-y-3">
            <input name="month" defaultValue={ym()} placeholder="YYYY-MM" />
            <SubmitButton>Closing Bulan</SubmitButton>
          </form>
          <p className="text-xs text-slate-400 mt-3">Setelah closing, transaksi bulan tersebut ditolak oleh server action.</p>
        </Card>
        <Card>
          <h2 className="font-black mb-4">Daftar Closing</h2>
          <div className="space-y-2">
            {closings.map(c => (
              <div key={c.id} className="rounded-2xl bg-white/5 p-4 flex justify-between items-center">
                <div>
                  <b>{c.month}</b>
                  <p className="text-xs text-slate-400">{c.closedAt.toISOString().slice(0, 10)}</p>
                </div>
                <a className="text-emerald-300 text-sm" href={`/api/export/monthly?month=${c.month}`}>PDF</a>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
