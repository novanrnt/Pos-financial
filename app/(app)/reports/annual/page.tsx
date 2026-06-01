import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { ym } from '@/lib/utils';
import { PageTitle, Badge } from '@/components/ui';
import { Download } from 'lucide-react';

export default async function AnnualClosingPage() {
  const u = await requireUser();
  // if not authenticated, requireUser should handle it
  void u;

  const currentYear = new Date().getFullYear();
  const defaultMonthStr = ym();
  const defaultYear = currentYear;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageTitle
        title="Closing Tahunan"
        desc="Download laporan PDF tahunan dari periode yang dipilih."
      />

      <div className="glass-premium rounded-3xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black text-premium-text-muted uppercase">
              Status
            </p>
            <p className="text-sm font-black text-premium-text mt-1">
              Endpoint siap digunakan
            </p>
          </div>
          <Badge variant="success" className="text-xs flex items-center gap-1">
            <Download size={12} /> Siap Download
          </Badge>
        </div>

        <div className="mt-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
          <p className="text-xs font-black text-amber-400 uppercase">Catatan</p>
          <p className="text-xs text-premium-text-muted mt-2">
            Gunakan parameter <span className="font-mono">year</span> pada URL:
            <br />
            <span className="font-mono text-premium-text">/api/export/annual?year=YYYY</span>
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide">
            Tahun
          </label>

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
    </div>
  );
}

