import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { SubmitButton } from '@/components/ui';
import { rupiah, ym } from '@/lib/utils';
import { TrendingUp, Plus, Briefcase, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { InvestmentFormModal } from '@/components/investment-form-modal';

export default async function Investments() {
  const u = await requireUser();
  const rows = await prisma.investmentSnapshot.findMany({ where: { userId: u!.id }, orderBy: { month: 'desc' } });

  // Group by category
  const byCategory = rows.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {} as Record<string, typeof rows>);

  const totalInvestment = rows.reduce((a, r) => a + Number(r.balance), 0);
  const latestMonth = rows.length > 0 ? rows[0] : null;
  const previousMonth = rows.length > 1 ? rows[1] : null;
  const totalGrowth = latestMonth && previousMonth ? Number(latestMonth.balance) - Number(previousMonth.balance) : 0;
  const growthPercent = previousMonth ? (totalGrowth / Number(previousMonth.balance)) * 100 : 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-premium-text">Investasi</h1>
        <InvestmentFormModal />
      </div>

      {/* Summary Card */}
      <div className="rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #0a2a3a 0%, #1a0a3a 50%, #2a1a0a 100%)' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-orange-500/10 pointer-events-none" />
        <div className="relative p-6 md:p-8">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-white/60">Total Investasi (IDR)</p>
            <TrendingUp size={16} className="text-white/40" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">{rupiah(totalInvestment)}</h2>
          <p className="text-xs text-white/50 mb-6">{rows.length} snapshot tercatat</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[.08] rounded-2xl p-4 border border-white/[.10]">
              <p className="text-xs text-white/50 mb-1 flex items-center gap-1"><Briefcase size={12} /> Kategori</p>
              <p className="text-base font-black text-cyan-300">{Object.keys(byCategory).length} kategori</p>
            </div>
            <div className="bg-white/[.08] rounded-2xl p-4 border border-white/[.10]">
              <p className="text-xs text-white/50 mb-1 flex items-center gap-1">{totalGrowth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} Pertumbuhan</p>
              <p className={`text-base font-black ${totalGrowth >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {totalGrowth >= 0 ? '+' : ''}{growthPercent.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* By Category */}
      {Object.entries(byCategory).length === 0 ? (
        <div className="glass-premium rounded-3xl p-12 text-center">
          <Briefcase size={40} className="text-premium-text-muted opacity-30 mx-auto mb-4" />
          <p className="text-premium-text font-black">Belum ada investasi</p>
          <p className="text-xs text-premium-text-muted mt-2">Tambahkan snapshot investasi untuk tracking pertumbuhan aset</p>
        </div>
      ) : (
        Object.entries(byCategory).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-base font-black text-premium-text mb-3 flex items-center gap-2">
              <Briefcase size={18} className="text-cyan-400" /> {category}
            </h2>
            <div className="space-y-2">
              {items.map((r, idx) => {
                const prevItem = items[idx + 1];
                const growth = prevItem ? Number(r.balance) - Number(prevItem.balance) : 0;
                const growthPct = prevItem ? (growth / Number(prevItem.balance)) * 100 : 0;

                return (
                  <div key={r.id} className="glass-premium rounded-2xl p-4 border border-cyan-500/20 flex items-center gap-4">
                    <div className="shrink-0 w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                      <TrendingUp size={20} className="text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-premium-text">{r.month}</p>
                        {prevItem && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                            growth >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {growth >= 0 ? '+' : ''}{growthPct.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      {r.notes && <p className="text-xs text-premium-text-muted mt-0.5">{r.notes}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-cyan-400">{rupiah(Number(r.balance))}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Add Investment Form */}
      {/* Removed - now using modal */}
    </div>
  );
}
