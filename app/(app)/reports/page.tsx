import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { closeMonth } from '@/lib/actions';
import { Card, PageTitle, SubmitButton, SectionHeader, Badge } from '@/components/ui';
import { ym, rupiah } from '@/lib/utils';
import { Lock, Download, AlertCircle, TrendingUp, TrendingDown, Wallet, Car, PiggyBank, CreditCard, Receipt, BarChart3 } from 'lucide-react';

export default async function Reports() {
  const u = await requireUser();
  const closings = await prisma.monthlyClosing.findMany({ where: { userId: u!.id }, orderBy: { month: 'desc' } });
  const currentMonthStr = ym();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageTitle title="Laporan & Monthly Closing" desc="Kunci bulan, download laporan PDF lengkap." />

      {/* Closing History */}
      {closings.length === 0 ? (
        <div className="glass-premium rounded-3xl p-12 text-center">
          <BarChart3 size={40} className="text-premium-text-muted opacity-30 mx-auto mb-4" />
          <p className="text-premium-text font-black">Belum ada monthly closing</p>
          <p className="text-xs text-premium-text-muted mt-2">Lakukan closing bulan pertama untuk mulai tracking laporan.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {closings.map(c => {
            const s = c.summaryJson as any;
            return (
              <div key={c.id} className="glass-premium rounded-3xl p-6 md:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-black text-premium-text">{c.month}</h3>
                    <p className="text-xs text-premium-text-muted mt-1">
                      Dikunci: {c.closedAt.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <Badge variant="success" className="text-xs flex items-center gap-1">
                    <Lock size={12} /> Terkunci
                  </Badge>
                </div>

                {/* Cashflow Summary */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="soft-card rounded-2xl p-4 border border-premium-income/20">
                    <p className="text-[10px] font-black text-premium-text-muted uppercase">Pemasukan</p>
                    <p className="text-base font-black text-premium-income mt-1">{rupiah(s.income || 0)}</p>
                  </div>
                  <div className="soft-card rounded-2xl p-4 border border-premium-expense/20">
                    <p className="text-[10px] font-black text-premium-text-muted uppercase">Pengeluaran</p>
                    <p className="text-base font-black text-premium-expense mt-1">{rupiah(s.expense || 0)}</p>
                  </div>
                  <div className="soft-card rounded-2xl p-4 border border-violet-500/20">
                    <p className="text-[10px] font-black text-premium-text-muted uppercase">Profit</p>
                    <p className={`text-base font-black mt-1 ${(s.profit||0)>=0?'text-premium-income':'text-premium-expense'}`}>{rupiah(s.profit || 0)}</p>
                  </div>
                </div>

                {/* Detail Sections */}
                <div className="space-y-4">
                  {/* Rekening */}
                  {s.accounts && s.accounts.length > 0 && (
                    <div className="border-t border-premium-border-soft pt-4">
                      <p className="text-xs font-black text-premium-text-muted uppercase mb-3 flex items-center gap-2"><Wallet size={14} /> Saldo Rekening</p>
                      <div className="space-y-1.5">
                        {s.accounts.map((a: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <span className="text-sm text-premium-text">{a.name} <span className="text-xs text-premium-text-muted">({a.type || ''})</span></span>
                            <span className="text-sm font-black text-premium-income">{rupiah(Number(a.balance))}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 border-t border-premium-border-soft">
                          <span className="text-xs font-black text-premium-text-muted">Total</span>
                          <span className="text-sm font-black text-premium-income">{rupiah(s.totalCash || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pemasukan per Kategori */}
                  {s.incomeByCategory && s.incomeByCategory.length > 0 && (
                    <div className="border-t border-premium-border-soft pt-4">
                      <p className="text-xs font-black text-premium-text-muted uppercase mb-3 flex items-center gap-2"><TrendingUp size={14} /> Pemasukan per Kategori</p>
                      <div className="space-y-1.5">
                        {s.incomeByCategory.map((c: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <span className="text-sm text-premium-text">{c.name}</span>
                            <span className="text-sm font-black text-premium-income">{rupiah(c.total)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pengeluaran per Kategori */}
                  {s.expenseByCategory && s.expenseByCategory.length > 0 && (
                    <div className="border-t border-premium-border-soft pt-4">
                      <p className="text-xs font-black text-premium-text-muted uppercase mb-3 flex items-center gap-2"><TrendingDown size={14} /> Pengeluaran per Kategori</p>
                      <div className="space-y-1.5">
                        {s.expenseByCategory.map((c: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <span className="text-sm text-premium-text">{c.name}</span>
                            <span className="text-sm font-black text-premium-expense">{rupiah(c.total)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aset Mobil */}
                  {s.cars && s.cars.length > 0 && (
                    <div className="border-t border-premium-border-soft pt-4">
                      <p className="text-xs font-black text-premium-text-muted uppercase mb-3 flex items-center gap-2"><Car size={14} /> Aset Mobil (Total Modal)</p>
                      <div className="space-y-1.5">
                        {s.cars.map((c: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <div>
                              <span className="text-sm text-premium-text">{c.name}</span>
                              <span className="text-xs text-premium-text-muted ml-2">(Beli: {rupiah(c.purchasePrice)} + Biaya: {rupiah(c.totalCosts)})</span>
                            </div>
                            <span className="text-sm font-black text-premium-text">{rupiah(c.totalModal)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 border-t border-premium-border-soft">
                          <span className="text-xs font-black text-premium-text-muted">Total Modal</span>
                          <span className="text-sm font-black text-premium-text">{rupiah(s.totalCarModal || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hutang & Piutang */}
                  {((s.debts && s.debts.length > 0) || (s.receivables && s.receivables.length > 0)) && (
                    <div className="border-t border-premium-border-soft pt-4">
                      <p className="text-xs font-black text-premium-text-muted uppercase mb-3 flex items-center gap-2"><CreditCard size={14} /> Hutang & Piutang</p>
                      {s.debts && s.debts.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-rose-400 mb-1.5">Hutang</p>
                          {s.debts.map((d: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-1.5">
                              <span className="text-sm text-premium-text">{d.name}</span>
                              <span className="text-sm font-black text-rose-400">{rupiah(d.remaining)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {s.receivables && s.receivables.length > 0 && (
                        <div>
                          <p className="text-xs text-emerald-400 mb-1.5">Piutang</p>
                          {s.receivables.map((d: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-1.5">
                              <span className="text-sm text-premium-text">{d.name}</span>
                              <span className="text-sm font-black text-emerald-400">{rupiah(d.remaining)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-premium-border-soft mt-2">
                        <div><p className="text-xs text-premium-text-muted">Total Hutang</p><p className="text-sm font-black text-rose-400">{rupiah(s.totalDebt || 0)}</p></div>
                        <div><p className="text-xs text-premium-text-muted">Total Piutang</p><p className="text-sm font-black text-emerald-400">{rupiah(s.totalReceivable || 0)}</p></div>
                      </div>
                    </div>
                  )}

                  {/* Investasi */}
                  {s.investments && s.investments.length > 0 && (
                    <div className="border-t border-premium-border-soft pt-4">
                      <p className="text-xs font-black text-premium-text-muted uppercase mb-3 flex items-center gap-2"><TrendingUp size={14} /> Investasi</p>
                      <div className="space-y-1.5">
                        {s.investments.map((inv: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <span className="text-sm text-premium-text">{inv.category}</span>
                            <span className="text-sm font-black text-premium-savings">{rupiah(inv.balance)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 border-t border-premium-border-soft">
                          <span className="text-xs font-black text-premium-text-muted">Total</span>
                          <span className="text-sm font-black text-premium-savings">{rupiah(s.totalInvestment || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tabungan */}
                  {s.savings && s.savings.length > 0 && (
                    <div className="border-t border-premium-border-soft pt-4">
                      <p className="text-xs font-black text-premium-text-muted uppercase mb-3 flex items-center gap-2"><PiggyBank size={14} /> Tabungan</p>
                      <div className="space-y-1.5">
                        {s.savings.map((g: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <span className="text-sm text-premium-text">{g.name} {g.isCompleted && '✅'}</span>
                            <span className="text-sm font-black text-emerald-400">{rupiah(g.savedAmount)} / {rupiah(g.targetAmount)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 border-t border-premium-border-soft">
                          <span className="text-xs font-black text-premium-text-muted">Total Tabungan</span>
                          <span className="text-sm font-black text-emerald-400">{rupiah(s.totalSavings || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Net Worth */}
                  {s.netWorth !== undefined && (
                    <div className="border-t border-premium-border-soft pt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-black text-premium-text">Net Worth Snapshot</p>
                        <p className="text-lg font-black text-violet-300">{rupiah(s.netWorth)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Download PDF */}
                <a
                  href={`/api/export/monthly?month=${c.month}`}
                  className="mt-6 w-full flex items-center justify-center gap-2 btn btn-ghost text-sm"
                >
                  <Download size={14} /> Download PDF Lengkap
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Close Month Form */}
      <div className="glass-premium rounded-3xl p-6 md:p-8">
        <h2 className="text-lg font-black text-premium-text mb-4">Closing Bulan</h2>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-amber-400 uppercase">Perhatian</p>
              <p className="text-xs text-premium-text-muted mt-1">Setelah closing, transaksi bulan tersebut tidak dapat diubah. Pastikan semua data sudah benar.</p>
            </div>
          </div>
        </div>

        <form action={closeMonth} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Pilih Bulan</label>
            <input name="month" type="month" defaultValue={currentMonthStr} className="input w-full" />
          </div>
          <SubmitButton>Kunci Bulan Ini</SubmitButton>
        </form>
      </div>
    </div>
  );
}
