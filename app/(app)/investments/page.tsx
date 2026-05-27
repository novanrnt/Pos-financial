import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { addInvestment } from '@/lib/actions';
import { Card, PageTitle, SubmitButton, SectionHeader, Badge } from '@/components/ui';
import { rupiah, ym } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

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

  return (
    <>
      <PageTitle title="Investasi" desc="Snapshot saldo bulanan sederhana." />
      
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Investments List */}
        <div className="space-y-6">
          {/* Summary */}
          <Card className="p-5 border-l-4 border-l-premium-savings">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black text-premium-text-muted uppercase">Total Investasi</p>
                <p className="text-3xl font-black text-premium-savings mt-2">{rupiah(totalInvestment)}</p>
                <p className="text-xs text-premium-text-muted mt-2">{rows.length} snapshot</p>
              </div>
              <TrendingUp size={24} className="text-premium-savings opacity-50" />
            </div>
          </Card>

          {/* By Category */}
          {Object.entries(byCategory).length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-premium-text-muted">Belum ada investasi</p>
              <p className="text-xs text-premium-text-muted mt-2">Tambahkan snapshot investasi kamu untuk tracking pertumbuhan aset.</p>
            </Card>
          ) : (
            Object.entries(byCategory).map(([category, items]) => (
              <div key={category}>
                <div className="px-1 mb-4">
                  <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide">💼 {category}</p>
                </div>
                <div className="space-y-2">
                  {items.map(r => {
                    const prevItem = items[items.indexOf(r) + 1];
                    const growth = prevItem ? Number(r.balance) - Number(prevItem.balance) : 0;
                    const growthPct = prevItem ? (growth / Number(prevItem.balance)) * 100 : 0;

                    return (
                      <Card key={r.id} className="p-4 hover:border-premium-border-medium transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-black text-premium-text">{r.month}</p>
                            <p className="text-xs text-premium-text-muted mt-1">{r.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-premium-savings">{rupiah(r.balance)}</p>
                            {prevItem && (
                              <p className={`text-xs font-black mt-1 ${growth >= 0 ? 'text-premium-income' : 'text-premium-expense'}`}>
                                {growth >= 0 ? '+' : ''}{growthPct.toFixed(1)}%
                              </p>
                            )}
                          </div>
                        </div>
                        {r.notes && (
                          <p className="text-xs text-premium-text-muted mt-3 pt-3 border-t border-premium-border-soft">
                            {r.notes}
                          </p>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Investment Form */}
        <div className="lg:sticky lg:top-24 h-fit">
          <Card variant="premium" className="p-6">
            <SectionHeader title="Update Snapshot" />
            <form action={addInvestment} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Kategori</label>
                <select name="category" required className="w-full">
                  <option value="">Pilih Kategori</option>
                  <option value="Saham">Saham</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Reksa Dana">Reksa Dana</option>
                  <option value="Emas">Emas</option>
                  <option value="Properti">Properti</option>
                  <option value="R&D / Eksperimen">R&D / Eksperimen</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Bulan</label>
                <input name="month" type="month" defaultValue={ym()} required className="w-full" />
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Saldo Bulan Ini</label>
                <input name="balance" placeholder="0" type="number" required className="w-full" />
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Catatan (Opsional)</label>
                <textarea name="notes" placeholder="Catatan tambahan" className="w-full" />
              </div>

              <SubmitButton>Simpan Snapshot</SubmitButton>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
