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
        <h1 className="text-[28px] font-semibold text-white tracking-tight">Investasi</h1>
        <InvestmentFormModal />
      </div>

      {/* Summary Card */}
      <div className="ios-card p-6 md:p-8">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[13px] text-white/50">Total Investasi (IDR)</p>
          <TrendingUp size={16} className="text-white/40" />
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-1">{rupiah(totalInvestment)}</h2>
        <p className="text-[11px] text-white/50 mb-6">{rows.length} snapshot tercatat</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[11px] text-white/50 mb-1 flex items-center gap-1"><Briefcase size={12} /> Kategori</p>
            <p className="text-[13px] font-semibold" style={{ color: '#64D2FF' }}>{Object.keys(byCategory).length} kategori</p>
          </div>
          <div className="p-4" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[11px] text-white/50 mb-1 flex items-center gap-1">{totalGrowth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} Pertumbuhan</p>
            <p className={`text-[13px] font-semibold ${totalGrowth >= 0 ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
              {totalGrowth >= 0 ? '+' : ''}{growthPercent.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* By Category */}
      {Object.entries(byCategory).length === 0 ? (
        <div className="ios-card p-12 text-center">
          <Briefcase size={40} className="text-white/30 mx-auto mb-4" />
          <p className="text-white font-medium text-[13px]">Belum ada investasi</p>
          <p className="text-[11px] text-white/50 mt-2">Tambahkan snapshot investasi untuk tracking pertumbuhan aset</p>
        </div>
      ) : (
        Object.entries(byCategory).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-[11px] font-medium text-white/50 mb-3 flex items-center gap-2 tracking-wide uppercase">
              <Briefcase size={14} style={{ color: '#64D2FF' }} /> {category}
            </h2>
            <div className="space-y-2">
              {items.map((r, idx) => {
                const prevItem = items[idx + 1];
                const growth = prevItem ? Number(r.balance) - Number(prevItem.balance) : 0;
                const growthPct = prevItem ? (growth / Number(prevItem.balance)) * 100 : 0;

                return (
                  <div key={r.id} className="ios-card p-4 flex items-center gap-4 active-scale" style={{ border: '0.5px solid rgba(100,210,255,0.12)' }}>
                    <div className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(100,210,255,0.12)' }}>
                      <TrendingUp size={20} style={{ color: '#64D2FF' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-white">{r.month}</p>
                        {prevItem && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{
                            background: growth >= 0 ? 'rgba(48,209,88,0.12)' : 'rgba(255,69,58,0.12)',
                            color: growth >= 0 ? '#30D158' : '#FF453A'
                          }}>
                            {growth >= 0 ? '+' : ''}{growthPct.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      {r.notes && <p className="text-[11px] text-white/50 mt-0.5">{r.notes}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-semibold" style={{ color: '#64D2FF' }}>{rupiah(Number(r.balance))}</p>
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
