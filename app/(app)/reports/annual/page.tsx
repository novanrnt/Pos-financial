import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { closeAnnual } from '@/lib/actions';
import { ym } from '@/lib/utils';
import { PageTitle, Badge } from '@/components/ui';
import { Download, LockKeyhole } from 'lucide-react';

export default async function AnnualClosingPage() {
  const u = await requireUser();
  const closings = await prisma.annualClosing.findMany({
    where: { userId: u!.id },
    orderBy: { year: 'desc' },
    take: 5,
  });

  const currentYear = new Date().getFullYear();
  const defaultMonthStr = ym();
  const defaultYear = currentYear;
  const latestClosing = closings[0];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageTitle
        title="Closing Tahunan"
        desc="Kunci rekap tahunan, lalu download laporan PDF dari periode yang dipilih."
      />

      <div className="glass-premium rounded-3xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black text-premium-text-muted uppercase">
              Status
            </p>
            <p className="text-sm font-black text-premium-text mt-1">
              {latestClosing ? `Terakhir closing ${latestClosing.year}` : 'Belum ada closing tahunan'}
            </p>
          </div>
          <Badge variant={latestClosing ? 'success' : 'default'} className="text-xs flex items-center gap-1">
            <LockKeyhole size={12} /> {latestClosing ? 'Sudah Ada Data' : 'Belum Closing'}
          </Badge>
        </div>

        <div className="mt-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
          <p className="text-xs font-black text-amber-400 uppercase">Catatan</p>
          <p className="text-xs text-premium-text-muted mt-2">
            PDF hanya bisa didownload setelah tahun tersebut di-closing. API:
            <br />
            <span className="font-mono text-premium-text">/api/export/annual?year=YYYY</span>
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide">
            Tahun
          </label>

          <form action={closeAnnual} className="flex items-end gap-3">
            <div className="flex-1">
              <input
                name="year"
                type="number"
                defaultValue={defaultYear}
                className="input w-full"
                min={2000}
                max={2100}
                required
              />
              <p className="text-[10px] text-premium-text-muted mt-1">
                Default: {defaultYear}
              </p>
            </div>

            <button className="btn btn-primary rounded-lg" type="submit">
              <LockKeyhole size={14} /> Closing Tahunan
            </button>
          </form>

          <form
            action="/api/export/annual"
            method="get"
            className="flex items-end gap-3"
          >
            <div className="flex-1">
              <input
                name="year"
                type="number"
                defaultValue={defaultYear}
                className="input w-full"
                min={2000}
                max={2100}
                required
              />
              <p className="text-[10px] text-premium-text-muted mt-1">
                Default: {defaultYear}
              </p>
            </div>

            <button className="btn btn-primary rounded-lg" type="submit">
              <Download size={14} /> Download PDF Tahunan
            </button>
          </form>

          <p className="text-[11px] text-premium-text-muted pt-2">
            Current: {defaultMonthStr} (digunakan di reports bulanan).
          </p>
        </div>
      </div>

      {closings.length > 0 && (
        <div className="glass-premium rounded-3xl p-6 md:p-8">
          <h2 className="text-lg font-black text-premium-text mb-4">Riwayat Closing Tahunan</h2>
          <div className="space-y-3">
            {closings.map(c => (
              <div key={c.id} className="flex items-center justify-between gap-3 border border-white/10 rounded-2xl p-4">
                <div>
                  <p className="text-sm font-black text-premium-text">{c.year}</p>
                  <p className="text-xs text-premium-text-muted">
                    Update: {c.updatedAt.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <Link className="btn btn-soft rounded-lg" href={`/api/export/annual?year=${c.year}`}>
                  <Download size={14} /> PDF
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

