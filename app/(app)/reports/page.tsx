import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { closeMonth } from '@/lib/actions';
import { Card, PageTitle, SubmitButton, SectionHeader, Badge } from '@/components/ui';
import { ym } from '@/lib/utils';
import { Lock, Download, AlertCircle } from 'lucide-react';

export default async function Reports() {
  const u = await requireUser();
  const closings = await prisma.monthlyClosing.findMany({ where: { userId: u!.id }, orderBy: { month: 'desc' } });

  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const currentMonth = new Date();
  const currentMonthStr = ym();

  return (
    <>
      <PageTitle title="Laporan & Monthly Closing" desc="Kunci bulan, download laporan PDF/print." />
      
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Closing History */}
        <div className="space-y-6">
          {closings.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-premium-text-muted">Belum ada monthly closing</p>
              <p className="text-xs text-premium-text-muted mt-2">Lakukan closing bulan pertama kamu untuk mulai tracking laporan bulanan.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {closings.map(c => {
                const summary = c.summaryJson as any;
                return (
                  <Card key={c.id} className="p-5 hover:border-premium-border-medium transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-premium-text">{c.month}</h3>
                        <p className="text-xs text-premium-text-muted mt-1">
                          Dikunci: {c.closedAt.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <Badge variant="success" className="text-xs flex items-center gap-1">
                        <Lock size={12} /> Terkunci
                      </Badge>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-premium-border-soft">
                      <div>
                        <p className="text-xs text-premium-text-muted font-black uppercase">Pemasukan</p>
                        <p className="text-sm font-black text-premium-income mt-1">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(summary.income || 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-premium-text-muted font-black uppercase">Pengeluaran</p>
                        <p className="text-sm font-black text-premium-expense mt-1">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(summary.expense || 0)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-premium-text-muted font-black uppercase">Net Profit</p>
                        <p className={`text-lg font-black mt-1 ${(summary.profit || 0) >= 0 ? 'text-premium-income' : 'text-premium-expense'}`}>
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(summary.profit || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Download */}
                    <a 
                      href={`/api/export/monthly?month=${c.month}`}
                      className="mt-4 w-full flex items-center justify-center gap-2 btn btn-ghost text-sm"
                    >
                      <Download size={14} /> Download PDF
                    </a>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Close Month Form */}
        <div className="lg:sticky lg:top-24 h-fit">
          <Card variant="premium" className="p-6">
            <SectionHeader title="Closing Bulan" />
            
            <div className="mt-4 bg-premium-orange/10 border border-premium-orange/20 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-premium-orange flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-premium-orange uppercase">Perhatian</p>
                  <p className="text-xs text-premium-text-muted mt-1">Setelah closing, transaksi bulan tersebut tidak dapat diubah. Pastikan semua data sudah benar.</p>
                </div>
              </div>
            </div>

            <form action={closeMonth} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Pilih Bulan</label>
                <input 
                  name="month" 
                  type="month"
                  defaultValue={currentMonthStr} 
                  className="w-full"
                />
              </div>

              <div className="bg-premium-card-soft rounded-2xl p-4 border border-premium-border-soft">
                <p className="text-xs font-black text-premium-text-muted uppercase mb-3">Ringkasan Sebelum Closing</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-premium-text-muted">Pemasukan</span>
                    <span className="font-black text-premium-income">Rp0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-premium-text-muted">Pengeluaran</span>
                    <span className="font-black text-premium-expense">Rp0</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-premium-border-soft">
                    <span className="text-premium-text-muted">Net Profit</span>
                    <span className="font-black text-premium-income">Rp0</span>
                  </div>
                </div>
              </div>

              <SubmitButton>Kunci Bulan</SubmitButton>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
