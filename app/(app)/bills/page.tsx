import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { addBill, payBill } from '@/lib/actions';
import { Card, PageTitle, SubmitButton, SectionHeader, Badge } from '@/components/ui';
import { rupiah } from '@/lib/utils';
import { Receipt, AlertCircle, CheckCircle } from 'lucide-react';

export default async function Bills() {
  const u = await requireUser();
  const uid = u!.id;
  const [bills, accounts] = await Promise.all([
    prisma.recurringBill.findMany({ where: { userId: uid }, include: { account: true }, orderBy: { dueDay: 'asc' } }),
    prisma.account.findMany({ where: { userId: uid } })
  ]);

  const unpaidBills = bills.filter(b => b.status === 'UNPAID');
  const paidBills = bills.filter(b => b.status === 'PAID');
  const totalUnpaid = unpaidBills.reduce((a, b) => a + Number(b.amount), 0);

  return (
    <>
      <PageTitle title="Tagihan Rutin" desc="Tagihan bulanan, jatuh tempo, dan bayar dari rekening." />
      
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Bills List */}
        <div className="space-y-6">
          {/* Summary */}
          {unpaidBills.length > 0 && (
            <Card className="p-5 border-l-4 border-l-premium-orange">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-black text-premium-text-muted uppercase">Total Tagihan Belum Dibayar</p>
                  <p className="text-2xl font-black text-premium-orange mt-2">{rupiah(totalUnpaid)}</p>
                  <p className="text-xs text-premium-text-muted mt-2">{unpaidBills.length} tagihan menunggu</p>
                </div>
                <AlertCircle size={24} className="text-premium-orange opacity-50" />
              </div>
            </Card>
          )}

          {/* Unpaid Bills */}
          {unpaidBills.length > 0 && (
            <div>
              <div className="px-1 mb-4">
                <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide">📋 Tagihan Belum Dibayar</p>
              </div>
              <div className="space-y-3">
                {unpaidBills.map(b => (
                  <Card key={b.id} className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-premium-text">{b.name}</h3>
                        <p className="text-xs text-premium-text-muted mt-1">
                          Jatuh tempo tgl {b.dueDay} • {b.account.name}
                        </p>
                      </div>
                      <Badge variant="warning" className="text-xs">Belum Bayar</Badge>
                    </div>

                    <div className="mt-4 pt-4 border-t border-premium-border-soft">
                      <p className="text-xs text-premium-text-muted font-black uppercase mb-2">Nominal</p>
                      <p className="text-2xl font-black text-premium-orange">{rupiah(b.amount)}</p>
                    </div>

                    {b.notes && (
                      <div className="mt-3 text-xs text-premium-text-muted">
                        <p className="font-black uppercase mb-1">Catatan</p>
                        <p>{b.notes}</p>
                      </div>
                    )}

                    <form action={payBill} className="mt-4 pt-4 border-t border-premium-border-soft">
                      <input type="hidden" name="id" value={b.id} />
                      <button type="submit" className="w-full btn btn-primary text-sm">Bayar Sekarang</button>
                    </form>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Paid Bills */}
          {paidBills.length > 0 && (
            <div>
              <div className="px-1 mb-4">
                <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide">✅ Sudah Dibayar</p>
              </div>
              <div className="space-y-3">
                {paidBills.map(b => (
                  <Card key={b.id} className="p-5 opacity-75">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-premium-text">{b.name}</h3>
                        <p className="text-xs text-premium-text-muted mt-1">
                          Dibayar: {b.lastPaidAt?.toLocaleDateString('id-ID')} • {b.account.name}
                        </p>
                      </div>
                      <Badge variant="success" className="text-xs flex items-center gap-1">
                        <CheckCircle size={12} /> Dibayar
                      </Badge>
                    </div>

                    <div className="mt-4 pt-4 border-t border-premium-border-soft">
                      <p className="text-xs text-premium-text-muted font-black uppercase mb-2">Nominal</p>
                      <p className="text-2xl font-black text-premium-income">{rupiah(b.amount)}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {bills.length === 0 && (
            <Card className="text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-premium-text-muted">Belum ada tagihan rutin</p>
              <p className="text-xs text-premium-text-muted mt-2">Tambahkan tagihan rutin kamu untuk tracking pembayaran bulanan.</p>
            </Card>
          )}
        </div>

        {/* Add Bill Form */}
        <div className="lg:sticky lg:top-24 h-fit">
          <Card variant="premium" className="p-6">
            <SectionHeader title="Tambah Tagihan" />
            <form action={addBill} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Nama Tagihan</label>
                <input name="name" placeholder="Internet, listrik, cicilan" required className="w-full" />
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Nominal</label>
                <input name="amount" placeholder="0" type="number" required className="w-full" />
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Jatuh Tempo (Tanggal)</label>
                <input name="dueDay" placeholder="1-31" type="number" min="1" max="31" required className="w-full" />
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Rekening Pembayaran</label>
                <select name="accountId" required className="w-full">
                  <option value="">Pilih Rekening</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Catatan (Opsional)</label>
                <textarea name="notes" placeholder="Catatan tambahan" className="w-full" />
              </div>

              <SubmitButton>Tambah Tagihan</SubmitButton>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
