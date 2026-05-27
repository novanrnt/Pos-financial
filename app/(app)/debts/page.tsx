import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { addDebt, payDebt, deleteDebt, deleteDebtPayment } from '@/lib/actions';
import { Card, PageTitle, SubmitButton, SectionHeader, Badge } from '@/components/ui';
import { rupiah, todayInput } from '@/lib/utils';
import { CreditCard, TrendingDown, TrendingUp, Trash2 } from 'lucide-react';

export default async function Debts() {
  const u = await requireUser();
  const uid = u!.id;
  const [debts, accounts] = await Promise.all([
    prisma.debt.findMany({ where: { userId: uid, status: 'ACTIVE' }, include: { payments: true, account: true }, orderBy: { createdAt: 'desc' } }),
    prisma.account.findMany({ where: { userId: uid } })
  ]);

  const totalDebt = debts.filter(d => d.type === 'DEBT').reduce((a, d) => a + Number(d.remainingAmount), 0);
  const totalReceivable = debts.filter(d => d.type === 'RECEIVABLE').reduce((a, d) => a + Number(d.remainingAmount), 0);

  const debtList = debts.filter(d => d.type === 'DEBT');
  const receivableList = debts.filter(d => d.type === 'RECEIVABLE');

  return (
    <>
      <PageTitle title="Hutang & Piutang" desc="Cicilan, pelunasan, status, dan integrasi rekening." />
      
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Debts & Receivables */}
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5 border-l-4 border-l-premium-expense">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-black text-premium-text-muted uppercase">Total Hutang</p>
                  <p className="text-2xl font-black text-premium-expense mt-2">{rupiah(totalDebt)}</p>
                  <p className="text-xs text-premium-text-muted mt-2">{debtList.length} hutang aktif</p>
                </div>
                <TrendingDown size={24} className="text-premium-expense opacity-50" />
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-premium-income">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-black text-premium-text-muted uppercase">Total Piutang</p>
                  <p className="text-2xl font-black text-premium-income mt-2">{rupiah(totalReceivable)}</p>
                  <p className="text-xs text-premium-text-muted mt-2">{receivableList.length} piutang aktif</p>
                </div>
                <TrendingUp size={24} className="text-premium-income opacity-50" />
              </div>
            </Card>
          </div>

          {/* Hutang */}
          {debtList.length > 0 && (
            <div>
              <div className="px-1 mb-4">
                <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide">💳 Hutang Aktif</p>
              </div>
              <div className="space-y-3">
                {debtList.map(d => (
                  <Card key={d.id} className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-premium-text">{d.name}</h3>
                        <p className="text-xs text-premium-text-muted mt-1">
                          {d.account?.name || 'Tanpa rekening'} • {d.dueDate ? new Date(d.dueDate).toLocaleDateString('id-ID') : 'Tanpa jatuh tempo'}
                        </p>
                      </div>
                      <Badge variant="danger" className="text-xs">Hutang</Badge>
                    </div>

                    {/* Progress */}
                    <div className="mt-4 pt-4 border-t border-premium-border-soft">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-black text-premium-text-muted uppercase">Sisa Hutang</p>
                        <p className="text-sm font-black text-premium-expense">{rupiah(d.remainingAmount)}</p>
                      </div>
                      <div className="w-full h-2 bg-premium-border-soft rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-premium-expense rounded-full transition-all"
                          style={{ width: `${Math.min(100, (Number(d.amount) - Number(d.remainingAmount)) / Number(d.amount) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-premium-text-muted mt-2">
                        {rupiah(Number(d.amount) - Number(d.remainingAmount))} dari {rupiah(d.amount)}
                      </p>
                    </div>

                    {/* Payment History */}
                    {d.payments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-premium-border-soft">
                        <p className="text-xs font-black text-premium-text-muted uppercase mb-2">Riwayat Pembayaran</p>
                        <div className="space-y-1">
                          {d.payments.map(p => (
                            <div key={p.id} className="flex items-center justify-between text-xs bg-premium-border-soft/20 p-2 rounded-lg">
                              <span className="text-premium-text">{p.date.toLocaleDateString('id-ID')} • {rupiah(p.amount)}</span>
                              <form action={deleteDebtPayment}>
                                <input type="hidden" name="paymentId" value={p.id} />
                                <button type="submit" className="text-premium-text-muted hover:text-premium-expense transition-colors">
                                  <Trash2 size={12} />
                                </button>
                              </form>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pay Form */}
                    <form action={payDebt} className="mt-4 pt-4 border-t border-premium-border-soft space-y-2">
                      <input type="hidden" name="debtId" value={d.id} />
                      {!d.account && (
                        <select name="accountId" className="w-full text-sm">
                          <option value="">Pilih Rekening</option>
                          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      )}
                      <input name="amount" placeholder="Nominal bayar" type="number" className="w-full text-sm" />
                      <input name="date" type="date" defaultValue={todayInput()} className="w-full text-sm" />
                      <button type="submit" className="w-full btn btn-primary text-sm">Bayar Hutang</button>
                    </form>

                    {/* Delete */}
                    <form action={deleteDebt} className="mt-2">
                      <input type="hidden" name="debtId" value={d.id} />
                      <button type="submit" className="text-xs text-premium-text-muted hover:text-premium-expense transition-colors flex items-center gap-1">
                        <Trash2 size={12} /> Hapus
                      </button>
                    </form>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Piutang */}
          {receivableList.length > 0 && (
            <div>
              <div className="px-1 mb-4">
                <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide">💰 Piutang Aktif</p>
              </div>
              <div className="space-y-3">
                {receivableList.map(d => (
                  <Card key={d.id} className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-premium-text">{d.name}</h3>
                        <p className="text-xs text-premium-text-muted mt-1">
                          {d.account?.name || 'Tanpa rekening'} • {d.dueDate ? new Date(d.dueDate).toLocaleDateString('id-ID') : 'Tanpa jatuh tempo'}
                        </p>
                      </div>
                      <Badge variant="success" className="text-xs">Piutang</Badge>
                    </div>

                    {/* Progress */}
                    <div className="mt-4 pt-4 border-t border-premium-border-soft">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-black text-premium-text-muted uppercase">Sisa Piutang</p>
                        <p className="text-sm font-black text-premium-income">{rupiah(d.remainingAmount)}</p>
                      </div>
                      <div className="w-full h-2 bg-premium-border-soft rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-premium-income rounded-full transition-all"
                          style={{ width: `${Math.min(100, (Number(d.amount) - Number(d.remainingAmount)) / Number(d.amount) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-premium-text-muted mt-2">
                        {rupiah(Number(d.amount) - Number(d.remainingAmount))} dari {rupiah(d.amount)}
                      </p>
                    </div>

                    {/* Payment History */}
                    {d.payments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-premium-border-soft">
                        <p className="text-xs font-black text-premium-text-muted uppercase mb-2">Riwayat Penerimaan</p>
                        <div className="space-y-1">
                          {d.payments.map(p => (
                            <div key={p.id} className="flex items-center justify-between text-xs bg-premium-border-soft/20 p-2 rounded-lg">
                              <span className="text-premium-text">{p.date.toLocaleDateString('id-ID')} • {rupiah(p.amount)}</span>
                              <form action={deleteDebtPayment}>
                                <input type="hidden" name="paymentId" value={p.id} />
                                <button type="submit" className="text-premium-text-muted hover:text-premium-expense transition-colors">
                                  <Trash2 size={12} />
                                </button>
                              </form>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Receive Form */}
                    <form action={payDebt} className="mt-4 pt-4 border-t border-premium-border-soft space-y-2">
                      <input type="hidden" name="debtId" value={d.id} />
                      {!d.account && (
                        <select name="accountId" className="w-full text-sm">
                          <option value="">Pilih Rekening</option>
                          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      )}
                      <input name="amount" placeholder="Nominal terima" type="number" className="w-full text-sm" />
                      <input name="date" type="date" defaultValue={todayInput()} className="w-full text-sm" />
                      <button type="submit" className="w-full btn btn-primary text-sm">Terima Piutang</button>
                    </form>

                    {/* Delete */}
                    <form action={deleteDebt} className="mt-2">
                      <input type="hidden" name="debtId" value={d.id} />
                      <button type="submit" className="text-xs text-premium-text-muted hover:text-premium-expense transition-colors flex items-center gap-1">
                        <Trash2 size={12} /> Hapus
                      </button>
                    </form>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {debts.length === 0 && (
            <Card className="text-center py-12">
              <div className="text-4xl mb-3">✨</div>
              <p className="text-premium-text-muted">Tidak ada hutang/piutang aktif</p>
              <p className="text-xs text-premium-text-muted mt-2">Kamu bebas hutang! Tambahkan hutang/piutang baru jika diperlukan.</p>
            </Card>
          )}
        </div>

        {/* Add Debt Form */}
        <div className="lg:sticky lg:top-24 h-fit">
          <Card variant="premium" className="p-6">
            <SectionHeader title="Tambah Hutang/Piutang" />
            <form action={addDebt} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Tipe</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" value="DEBT" defaultChecked className="w-4 h-4" />
                    <span className="text-xs font-black">Hutang</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" value="RECEIVABLE" className="w-4 h-4" />
                    <span className="text-xs font-black">Piutang</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Nama</label>
                <input name="name" placeholder="Nama orang/pihak" required className="w-full" />
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Nominal</label>
                <input name="amount" placeholder="0" type="number" required className="w-full" />
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Rekening</label>
                <select name="accountId" required className="w-full">
                  <option value="">Pilih Rekening</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Jatuh Tempo (Opsional)</label>
                <input name="dueDate" type="date" className="w-full" />
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Catatan</label>
                <textarea name="notes" placeholder="Catatan tambahan" className="w-full" />
              </div>

              <SubmitButton>Tambah Hutang/Piutang</SubmitButton>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
