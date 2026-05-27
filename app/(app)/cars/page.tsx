import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { addCar, addCarCost, sellCar } from '@/lib/actions';
import { Card, PageTitle, SubmitButton, SectionHeader, Badge } from '@/components/ui';
import { DeleteCarButton } from '@/components/delete-car-button';
import { rupiah, todayInput } from '@/lib/utils';
import { Car, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export default async function Cars() {
  const u = await requireUser();
  const uid = u!.id;
  const [cars, accounts] = await Promise.all([
    prisma.car.findMany({ where: { userId: uid }, include: { costs: true, debts: true }, orderBy: { createdAt: 'desc' } }),
    prisma.account.findMany({ where: { userId: uid } })
  ]);

  const availableCars = cars.filter(c => c.status === 'AVAILABLE');
  const soldCars = cars.filter(c => c.status === 'SOLD');

  return (
    <>
      <PageTitle title="Stok Mobil" desc="Modal, biaya, foto URL, profit/rugi, dan jual mobil otomatis masuk rekening." />
      
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Cars List */}
        <div className="space-y-6">
          {/* Available Cars */}
          {availableCars.length > 0 && (
            <div>
              <div className="px-1 mb-4">
                <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide">🚗 Stok Tersedia ({availableCars.length})</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableCars.map(c => {
                  const cost = c.costs.reduce((a, k) => a + Number(k.amount), 0);
                  const modal = Number(c.purchasePrice) + cost;
                  const profit = c.sellPrice ? Number(c.sellPrice) - modal : null;
                  const estimatedProfit = Number(c.estimatedSellPrice) - modal;

                  return (
                    <Card key={c.id} className="p-5 hover:border-premium-border-medium transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-black text-premium-text">{c.name}</h3>
                          <p className="text-xs text-premium-text-muted mt-1">{c.brand} {c.model} • {c.year}</p>
                          {c.licensePlate && <p className="text-xs text-premium-text-muted">{c.licensePlate}</p>}
                        </div>
                        <Badge variant="success" className="text-xs">Tersedia</Badge>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-premium-border-soft">
                        <div>
                          <p className="text-xs text-premium-text-muted font-black uppercase">Modal</p>
                          <p className="text-sm font-black text-premium-text mt-1">{rupiah(modal)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-premium-text-muted font-black uppercase">Est. Jual</p>
                          <p className="text-sm font-black text-premium-text mt-1">{rupiah(c.estimatedSellPrice)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-premium-text-muted font-black uppercase">Biaya</p>
                          <p className="text-sm font-black text-premium-expense mt-1">{rupiah(cost)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-premium-text-muted font-black uppercase">Est. Profit</p>
                          <p className={`text-sm font-black mt-1 ${estimatedProfit >= 0 ? 'text-premium-income' : 'text-premium-expense'}`}>
                            {estimatedProfit >= 0 ? '+' : ''}{rupiah(estimatedProfit)}
                          </p>
                        </div>
                      </div>

                      {/* Debts */}
                      {c.debts && c.debts.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-premium-border-soft">
                          <p className="text-xs font-black text-premium-text-muted uppercase mb-2">Hutang Terkait</p>
                          <div className="space-y-1">
                            {c.debts.map(d => (
                              <div key={d.id} className="flex items-center justify-between text-xs bg-premium-expense/10 p-2 rounded-lg border border-premium-expense/20">
                                <span className="text-premium-text">{d.name}</span>
                                <span className={d.status === 'PAID' ? 'text-premium-income' : 'text-premium-expense'}>
                                  {d.status === 'PAID' ? 'Lunas' : rupiah(d.remainingAmount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <details className="mt-4 pt-4 border-t border-premium-border-soft">
                        <summary className="cursor-pointer text-xs font-black text-violet-300 hover:text-violet-200 transition-colors">
                          ⚙️ Aksi
                        </summary>
                        <div className="mt-3 space-y-3">
                          {/* Add Cost */}
                          <form action={addCarCost} className="space-y-2">
                            <input type="hidden" name="carId" value={c.id} />
                            <p className="text-xs font-black text-premium-text-muted uppercase">Tambah Biaya</p>
                            <select name="accountId" className="w-full text-sm">
                              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                            <input name="amount" placeholder="Nominal biaya" type="number" className="w-full text-sm" />
                            <input name="description" placeholder="Detail biaya" className="w-full text-sm" />
                            <input name="date" type="date" defaultValue={todayInput()} className="w-full text-sm" />
                            <button type="submit" className="w-full btn btn-ghost text-sm">Simpan Biaya</button>
                          </form>

                          {/* Sell Car */}
                          <form action={sellCar} className="space-y-2 pt-3 border-t border-premium-border-soft">
                            <input type="hidden" name="carId" value={c.id} />
                            <p className="text-xs font-black text-premium-text-muted uppercase">Jual Mobil</p>
                            <select name="accountId" className="w-full text-sm">
                              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                            <input name="sellPrice" placeholder="Harga jual aktual" type="number" className="w-full text-sm" />
                            <input name="date" type="date" defaultValue={todayInput()} className="w-full text-sm" />
                            <button type="submit" className="w-full btn btn-primary text-sm">Jual Mobil</button>
                          </form>

                          {/* Delete */}
                          <div className="pt-3 border-t border-premium-border-soft">
                            <DeleteCarButton carId={c.id} />
                          </div>
                        </div>
                      </details>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sold Cars */}
          {soldCars.length > 0 && (
            <div>
              <div className="px-1 mb-4">
                <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide">✅ Terjual ({soldCars.length})</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {soldCars.map(c => {
                  const cost = c.costs.reduce((a, k) => a + Number(k.amount), 0);
                  const modal = Number(c.purchasePrice) + cost;
                  const profit = c.sellPrice ? Number(c.sellPrice) - modal : null;

                  return (
                    <Card key={c.id} className="p-5 opacity-75">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-black text-premium-text">{c.name}</h3>
                          <p className="text-xs text-premium-text-muted mt-1">{c.brand} {c.model} • {c.year}</p>
                        </div>
                        <Badge variant="danger" className="text-xs">Terjual</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-premium-border-soft">
                        <div>
                          <p className="text-xs text-premium-text-muted font-black uppercase">Modal</p>
                          <p className="text-sm font-black text-premium-text mt-1">{rupiah(modal)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-premium-text-muted font-black uppercase">Jual</p>
                          <p className="text-sm font-black text-premium-text mt-1">{rupiah(c.sellPrice)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-premium-text-muted font-black uppercase">Profit/Rugi</p>
                          <p className={`text-lg font-black mt-1 ${profit && profit >= 0 ? 'text-premium-income' : 'text-premium-expense'}`}>
                            {profit && profit >= 0 ? '+' : ''}{rupiah(profit || 0)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {cars.length === 0 && (
            <Card className="text-center py-12">
              <div className="text-4xl mb-3">🚗</div>
              <p className="text-premium-text-muted">Belum ada mobil</p>
              <p className="text-xs text-premium-text-muted mt-2">Tambahkan mobil pertama kamu untuk mulai tracking stok.</p>
            </Card>
          )}
        </div>

        {/* Add Car Form */}
        <div className="lg:sticky lg:top-24 h-fit">
          <Card variant="premium" className="p-6">
            <SectionHeader title="Tambah Mobil" />
            <form action={addCar} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Nama Mobil</label>
                <input name="name" placeholder="Honda CR-V 2.4 AT 2010" required className="w-full" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input name="brand" placeholder="Merek" className="w-full" />
                <input name="model" placeholder="Tipe" className="w-full" />
                <input name="year" placeholder="Tahun" type="number" className="w-full" />
                <input name="color" placeholder="Warna" className="w-full" />
                <input name="transmission" placeholder="Transmisi" className="w-full" />
                <input name="licensePlate" placeholder="Nopol" className="w-full" />
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Harga Beli</label>
                <input name="purchasePrice" placeholder="0" type="number" required className="w-full" />
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Est. Harga Jual</label>
                <input name="estimatedSellPrice" placeholder="0" type="number" className="w-full" />
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Rekening Pembayaran</label>
                <select name="accountId" className="w-full">
                  <option value="">Pilih rekening</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div className="bg-premium-income/10 border border-premium-income/20 rounded-2xl p-4">
                <p className="text-xs font-black text-premium-income uppercase mb-2">💰 Modal Saya</p>
                <input name="myMoney" placeholder="Uang saya untuk beli mobil" type="number" className="w-full" />
                <p className="text-[10px] text-premium-text-muted mt-2">Nominal ini akan dipotong dari rekening</p>
              </div>

              <div className="bg-premium-expense/10 border border-premium-expense/20 rounded-2xl p-4">
                <p className="text-xs font-black text-premium-expense uppercase mb-2">🏦 Pinjaman (Opsional)</p>
                <input name="debtName" placeholder="Nama pemberi pinjaman" className="w-full" />
                <input name="debtAmount" placeholder="Nominal pinjaman" type="number" className="w-full mt-2" />
                <p className="text-[10px] text-premium-text-muted mt-2">Total modal = Uang saya + Pinjaman</p>
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Catatan</label>
                <textarea name="notes" placeholder="Catatan tambahan" className="w-full" />
              </div>

              <SubmitButton>Tambah Mobil</SubmitButton>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
