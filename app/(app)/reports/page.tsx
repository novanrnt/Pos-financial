import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { closeMonth } from '@/lib/actions';
import { Card, PageTitle, SubmitButton, SectionHeader, Badge } from '@/components/ui';
import { ym, rupiah } from '@/lib/utils';
import { Lock, Download, AlertCircle, TrendingUp, TrendingDown, Wallet, Car, PiggyBank, CreditCard, Receipt, BarChart3 } from 'lucide-react';

export default async function Reports() {
  const u = await requireUser();
  const closings = await prisma.monthlyClosing.findMany({ where: { userId: u!.id }, orderBy: { month: 'desc' } });

  // Annual closing cards/section UI belum dibuat.
  // Report tahunan PDF sudah tersedia via: /api/export/annual?year=YYYY



  const currentMonthStr = ym();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-[28px] font-semibold text-white tracking-tight">Laporan & Monthly Closing</h1>
        <p className="text-[13px] text-white/50 mt-2">Kunci bulan, download laporan PDF lengkap.</p>
      </div>

      {/* Closing History */}
      {closings.length === 0 ? (
        <div className="ios-card p-12 text-center">
          <BarChart3 size={40} className="text-white/30 mx-auto mb-4" />
          <p className="text-white font-medium text-[13px]">Belum ada monthly closing</p>
          <p className="text-[11px] text-white/50 mt-2">Lakukan closing bulan pertama untuk mulai tracking laporan.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {closings.map(c => {
            const s = c.summaryJson as any;
            return (
              <div key={c.id} className="ios-card p-6 md:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{c.month}</h3>
                    <p className="text-[11px] text-white/50 mt-1">
                      Dikunci: {c.closedAt.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <Badge variant="success" className="text-[11px] flex items-center gap-1">
                    <Lock size={12} /> Terkunci
                  </Badge>
                </div>

                {/* Cashflow Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  <div className="p-4 min-w-0" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '0.5px solid rgba(48,209,88,0.15)' }}>
                    <p className="text-[11px] font-medium text-white/50 uppercase">Pemasukan</p>
                    <p className="text-[13px] font-semibold mt-1 break-words leading-tight" style={{ color: '#30D158' }}>{rupiah(s.income || 0)}</p>
                  </div>
                  <div className="p-4 min-w-0" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '0.5px solid rgba(255,69,58,0.15)' }}>
                    <p className="text-[11px] font-medium text-white/50 uppercase">Pengeluaran</p>
                    <p className="text-[13px] font-semibold mt-1 break-words leading-tight" style={{ color: '#FF453A' }}>{rupiah(s.expense || 0)}</p>
                  </div>
                  <div className="p-4 min-w-0" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '0.5px solid rgba(191,90,242,0.15)' }}>
                    <p className="text-[11px] font-medium text-white/50 uppercase">Cashflow</p>
                    <p className={`text-[13px] font-semibold mt-1 break-words leading-tight ${(s.profit||0)>=0?'text-[#30D158]':'text-[#FF453A]'}`}>{rupiah(s.profit || 0)}</p>
                  </div>
                </div>

                {/* Detail Sections */}
                <div className="space-y-4">
                  {/* Rekening */}
                  {s.accounts && s.accounts.length > 0 && (
                    <div className="border-t border-white/[0.07] pt-4">
                      <p className="text-[11px] font-medium text-white/50 uppercase mb-3 flex items-center gap-2"><Wallet size={14} /> Saldo Rekening</p>
                      <div className="space-y-1.5">
                        {s.accounts.map((a: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <span className="text-[13px] text-white">{a.name} <span className="text-[11px] text-white/50">({a.type || ''})</span></span>
                            <span className="text-[13px] font-semibold" style={{ color: '#30D158' }}>{rupiah(Number(a.balance))}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.07]">
                          <span className="text-[11px] font-medium text-white/50">Total</span>
                          <span className="text-[13px] font-semibold" style={{ color: '#30D158' }}>{rupiah(s.totalCash || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pemasukan per Kategori */}
                  {s.incomeByCategory && s.incomeByCategory.length > 0 && (
                    <div className="border-t border-white/[0.07] pt-4">
                      <p className="text-[11px] font-medium text-white/50 uppercase mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2"><TrendingUp size={14} /> Pemasukan per Kategori</span>
                        <span className="text-[13px] font-semibold" style={{ color: '#30D158' }}>{rupiah(s.incomeByCategory.reduce((a: number, c: any) => a + c.total, 0))}</span>
                      </p>
                      <div className="space-y-1.5">
                        {s.incomeByCategory.map((c: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <span className="text-[13px] text-white">{c.name}</span>
                            <span className="text-[13px] font-semibold" style={{ color: '#30D158' }}>{rupiah(c.total)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pengeluaran per Kategori */}
                  {s.expenseByCategory && s.expenseByCategory.length > 0 && (
                    <div className="border-t border-white/[0.07] pt-4">
                      <p className="text-[11px] font-medium text-white/50 uppercase mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2"><TrendingDown size={14} /> Pengeluaran per Kategori</span>
                        <span className="text-[13px] font-semibold" style={{ color: '#FF453A' }}>{rupiah(s.expenseByCategory.reduce((a: number, c: any) => a + c.total, 0))}</span>
                      </p>
                      <div className="space-y-1.5">
                        {s.expenseByCategory.map((c: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <span className="text-[13px] text-white">{c.name}</span>
                            <span className="text-[13px] font-semibold" style={{ color: '#FF453A' }}>{rupiah(c.total)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aset Mobil */}
                  {s.cars && s.cars.length > 0 && (
                    <div className="border-t border-white/[0.07] pt-4">
                      <p className="text-[11px] font-medium text-white/50 uppercase mb-3 flex items-center gap-2"><Car size={14} /> Aset Mobil (Total Modal)</p>
                      <div className="space-y-1.5">
                        {s.cars.map((c: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <div>
                              <span className="text-[13px] text-white">{c.name}</span>
                              <span className="text-[11px] text-white/50 ml-2">(Beli: {rupiah(c.purchasePrice)} + Biaya: {rupiah(c.totalCosts)})</span>
                            </div>
                            <span className="text-[13px] font-semibold text-white">{rupiah(c.totalModal)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.07]">
                          <span className="text-[11px] font-medium text-white/50">Total Modal</span>
                          <span className="text-[13px] font-semibold text-white">{rupiah(s.totalCarModal || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hutang & Piutang */}
                  {((s.debts && s.debts.length > 0) || (s.receivables && s.receivables.length > 0)) && (
                    <div className="border-t border-white/[0.07] pt-4">
                      <p className="text-[11px] font-medium text-white/50 uppercase mb-3 flex items-center gap-2"><CreditCard size={14} /> Hutang & Piutang</p>
                      {s.debts && s.debts.length > 0 && (
                        <div className="mb-3">
                          <p className="text-[11px] font-medium mb-1.5" style={{ color: '#FF453A' }}>Hutang</p>
                          {s.debts.map((d: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-1.5">
                              <span className="text-[13px] text-white">{d.name}</span>
                              <span className="text-[13px] font-semibold" style={{ color: '#FF453A' }}>{rupiah(d.remaining)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {s.receivables && s.receivables.length > 0 && (
                        <div>
                          <p className="text-[11px] font-medium mb-1.5" style={{ color: '#30D158' }}>Piutang</p>
                          {s.receivables.map((d: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-1.5">
                              <span className="text-[13px] text-white">{d.name}</span>
                              <span className="text-[13px] font-semibold" style={{ color: '#30D158' }}>{rupiah(d.remaining)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.07] mt-2">
                        <div><p className="text-[11px] text-white/50">Total Hutang</p><p className="text-[13px] font-semibold" style={{ color: '#FF453A' }}>{rupiah(s.totalDebt || 0)}</p></div>
                        <div><p className="text-[11px] text-white/50">Total Piutang</p><p className="text-[13px] font-semibold" style={{ color: '#30D158' }}>{rupiah(s.totalReceivable || 0)}</p></div>
                      </div>
                    </div>
                  )}

                  {/* Investasi */}
                  {s.investments && s.investments.length > 0 && (
                    <div className="border-t border-white/[0.07] pt-4">
                      <p className="text-[11px] font-medium text-white/50 uppercase mb-3 flex items-center gap-2"><TrendingUp size={14} /> Investasi</p>
                      <div className="space-y-1.5">
                        {s.investments.map((inv: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <span className="text-[13px] text-white">{inv.category}</span>
                            <span className="text-[13px] font-semibold" style={{ color: '#BF5AF2' }}>{rupiah(inv.balance)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.07]">
                          <span className="text-[11px] font-medium text-white/50">Total</span>
                          <span className="text-[13px] font-semibold" style={{ color: '#BF5AF2' }}>{rupiah(s.totalInvestment || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tabungan */}
                  {s.savings && s.savings.length > 0 && (
                    <div className="border-t border-white/[0.07] pt-4">
                      <p className="text-[11px] font-medium text-white/50 uppercase mb-3 flex items-center gap-2"><PiggyBank size={14} /> Tabungan</p>
                      <div className="space-y-1.5">
                        {s.savings.map((g: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <span className="text-[13px] text-white">{g.name} {g.isCompleted && '✅'}</span>
                            <span className="text-[13px] font-semibold" style={{ color: '#30D158' }}>{rupiah(g.savedAmount)} / {rupiah(g.targetAmount)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.07]">
                          <span className="text-[11px] font-medium text-white/50">Total Tabungan</span>
                          <span className="text-[13px] font-semibold" style={{ color: '#30D158' }}>{rupiah(s.totalSavings || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Net Worth */}
                  {s.netWorth !== undefined && (
                    <div className="border-t border-white/[0.07] pt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] font-medium text-white">Net Worth Snapshot</p>
                        <p className="text-lg font-semibold" style={{ color: '#BF5AF2' }}>{rupiah(s.netWorth)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Download PDF */}
                <a
                  href={`/api/export/monthly?month=${c.month}`}
                  className="mt-6 w-full flex items-center justify-center gap-2 btn btn-ghost text-[13px] active-scale"
                >
                  <Download size={14} /> Download PDF Lengkap
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Close Month Form */}
      <div className="ios-card p-6 md:p-8">
        <h2 className="text-lg font-semibold text-white mb-4">Closing Bulan</h2>

        <div className="p-4 mb-5" style={{ background: 'rgba(255,159,10,0.08)', borderRadius: 16, border: '0.5px solid rgba(255,159,10,0.15)' }}>
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#FF9F0A' }} />
            <div>
              <p className="text-[11px] font-medium uppercase" style={{ color: '#FF9F0A' }}>Perhatian</p>
              <p className="text-[13px] text-white/50 mt-1">Setelah closing, transaksi bulan tersebut tidak dapat diubah. Pastikan semua data sudah benar.</p>
            </div>
          </div>
        </div>

        <form action={closeMonth} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wide mb-2">Pilih Bulan</label>
            <input name="month" type="month" defaultValue={currentMonthStr} className="input w-full" />
          </div>
          <SubmitButton>Kunci Bulan Ini</SubmitButton>
        </form>
      </div>
    </div>
  );
}
