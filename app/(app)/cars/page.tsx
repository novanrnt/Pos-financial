import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { addCarCost, sellCar, payDebt } from '@/lib/actions';
import { SubmitButton } from '@/components/ui';
import { DeleteCarButton } from '@/components/delete-car-button';
import { rupiah, todayInput } from '@/lib/utils';
import { Car, TrendingUp, TrendingDown, AlertCircle, Plus, Settings, CheckCircle } from 'lucide-react';
import { CarFormModal } from '@/components/car-form-modal';

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
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#FFFFFF', margin: 0 }}>Stok Mobil</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4, marginBottom: 0 }}>
            Beli mobil = aset. Saat jual, profit (harga jual − modal) otomatis masuk kategori "Jual Mobil" & rekening.
          </p>
        </div>
        <CarFormModal accounts={accounts} />
      </div>

      {/* Available Cars */}
      {availableCars.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingLeft: 4 }}>
            <Car size={14} style={{ color: '#30D158' }} />
            <span style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Stok Tersedia ({availableCars.length})
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {availableCars.map(c => {
              const cost = c.costs.reduce((a, k) => a + Number(k.amount), 0);
              const modal = Number(c.purchasePrice) + cost;
              const profit = c.sellPrice ? Number(c.sellPrice) - modal : null;
              const estimatedProfit = Number(c.estimatedSellPrice) - modal;

              return (
                <div key={c.id} className="ios-card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF', margin: 0 }}>{c.name}</h3>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0' }}>{c.brand} {c.model} &bull; {c.year}</p>
                      {c.licensePlate && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{c.licensePlate}</p>}
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                      background: 'rgba(48,209,88,0.2)', color: '#30D158',
                      border: '0.5px solid rgba(48,209,88,0.3)',
                      whiteSpace: 'nowrap'
                    }}>Tersedia</span>
                  </div>

                  {/* Stats Grid */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
                    marginTop: 16, paddingTop: 16,
                    borderTop: '0.5px solid rgba(255,255,255,0.08)'
                  }}>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: 0 }}>Modal</p>
                      <p style={{ fontSize: 14, fontWeight: 900, color: '#FFFFFF', marginTop: 4, margin: '4px 0 0 0' }}>{rupiah(modal)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: 0 }}>Est. Jual</p>
                      <p style={{ fontSize: 14, fontWeight: 900, color: '#FFFFFF', marginTop: 4, margin: '4px 0 0 0' }}>{rupiah(c.estimatedSellPrice)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: 0 }}>Biaya</p>
                      <p style={{ fontSize: 14, fontWeight: 900, color: '#FF453A', marginTop: 4, margin: '4px 0 0 0' }}>{rupiah(cost)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: 0 }}>Est. Profit</p>
                      <p style={{
                        fontSize: 14, fontWeight: 900, marginTop: 4, margin: '4px 0 0 0',
                        color: estimatedProfit >= 0 ? '#30D158' : '#FF453A'
                      }}>
                        {estimatedProfit >= 0 ? '+' : ''}{rupiah(estimatedProfit)}
                      </p>
                    </div>
                  </div>

                  {/* Debts */}
                  {c.debts && c.debts.length > 0 && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
                      <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8, margin: '0 0 8px 0' }}>Hutang Terkait</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {c.debts.map(d => (
                          <div key={d.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            fontSize: 12, padding: '8px 12px',
                            background: 'rgba(255,69,58,0.1)',
                            borderRadius: 12, border: '0.5px solid rgba(255,69,58,0.2)'
                          }}>
                            <span style={{ color: 'rgba(255,255,255,0.8)' }}>{d.name}</span>
                            <span style={{ color: d.status === 'PAID' ? '#30D158' : '#FF453A', fontWeight: 700 }}>
                              {d.status === 'PAID' ? 'Lunas' : rupiah(d.remainingAmount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <details style={{ marginTop: 16, paddingTop: 16, borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
                    <summary style={{
                      cursor: 'pointer', fontSize: 11, fontWeight: 900,
                      color: '#BF5AF2', transition: 'color 0.2s',
                      listStyle: 'none', display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      <Settings size={12} style={{ color: '#BF5AF2' }} />
                      Aksi
                    </summary>
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Add Cost */}
                      <form action={addCarCost} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <input type="hidden" name="carId" value={c.id} />
                        <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: 0 }}>Tambah Biaya</p>
                        <select name="accountId" className="w-full text-sm" style={{
                          background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
                          borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
                        }}>
                          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <input name="amount" placeholder="Nominal biaya" type="number" style={{
                          background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
                          borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
                        }} />
                        <input name="description" placeholder="Detail biaya" style={{
                          background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
                          borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
                        }} />
                        <input name="date" type="date" defaultValue={todayInput()} style={{
                          background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
                          borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
                        }} />
                        <button type="submit" className="active-scale" style={{
                          width: '100%', padding: '10px 16px',
                          background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)',
                          borderRadius: 14, color: 'rgba(255,255,255,0.8)', fontSize: 13,
                          fontWeight: 600, cursor: 'pointer'
                        }}>Simpan Biaya</button>
                      </form>

                      {/* Bayar DP / Pelunasan */}
                      {c.debts && c.debts.filter(d => d.status !== 'PAID').map(debt => (
                        <form key={debt.id} action={payDebt} style={{
                          display: 'flex', flexDirection: 'column', gap: 8,
                          paddingTop: 12, borderTop: '0.5px solid rgba(255,255,255,0.08)'
                        }} onSubmit={(e) => {
                          // Prevent double submit
                          const btn = e.currentTarget.querySelector('button[type="submit"]');
                          if (btn) { btn.setAttribute('disabled', 'true'); btn.style.opacity = '0.5'; }
                        }}>
                          <input type="hidden" name="debtId" value={debt.id} />
                          <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: 0 }}>
                            Bayar DP / Pelunasan
                          </p>
                          <p style={{ fontSize: 12, color: '#FF9F0A', margin: 0 }}>
                            Sisa: <strong>{rupiah(debt.remainingAmount)}</strong>
                          </p>
                          <select name="accountId" style={{
                            background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
                            borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
                          }}>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </select>
                          <input name="amount" placeholder="Nominal bayar" type="number" style={{
                            background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
                            borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
                          }} required />
                          <input name="date" type="date" defaultValue={todayInput()} style={{
                            background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
                            borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
                          }} />
                          <input name="notes" placeholder="Catatan (DP 1, DP 2, dll)" style={{
                            background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
                            borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
                          }} />
                          <button type="submit" className="active-scale" style={{
                            width: '100%', padding: '10px 16px',
                            background: 'rgba(255,159,10,0.2)', border: '0.5px solid rgba(255,159,10,0.3)',
                            borderRadius: 14, color: '#FF9F0A', fontSize: 13,
                            fontWeight: 600, cursor: 'pointer'
                          }}>Bayar Rp {new Intl.NumberFormat('id-ID').format(Number(debt.remainingAmount))}</button>
                        </form>
                      ))}

                      {/* Sell Car */}
                      <form action={sellCar} style={{
                        display: 'flex', flexDirection: 'column', gap: 8,
                        paddingTop: 12, borderTop: '0.5px solid rgba(255,255,255,0.08)'
                      }}>
                        <input type="hidden" name="carId" value={c.id} />
                        <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: 0 }}>Jual Mobil</p>
                        <select name="accountId" style={{
                          background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
                          borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
                        }}>
                          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <input name="sellPrice" placeholder="Harga jual aktual" type="number" style={{
                          background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
                          borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
                        }} />
                        <input name="date" type="date" defaultValue={todayInput()} style={{
                          background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
                          borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
                        }} />
                        <button type="submit" className="active-scale" style={{
                          width: '100%', padding: '10px 16px',
                          background: '#0A84FF', border: 'none',
                          borderRadius: 14, color: '#FFFFFF', fontSize: 13,
                          fontWeight: 600, cursor: 'pointer'
                        }}>Jual Mobil</button>
                      </form>

                      {/* Delete / Cancel */}
                      <div style={{ paddingTop: 12, borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
                        <DeleteCarButton car={{
                          id: c.id,
                          name: c.name,
                          accountId: c.debts?.[0]?.accountId || '',
                          dpAmount: c.debts?.[0]?.accountId ? Number(c.purchasePrice) - (c.debts?.reduce((a: number, d: any) => a + Number(d.amount), 0) || 0) : 0,
                          debts: c.debts?.map((d: any) => ({ id: d.id, remainingAmount: Number(d.remainingAmount) })) || [],
                        }} accounts={accounts} />
                      </div>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sold Cars */}
      {soldCars.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingLeft: 4 }}>
            <CheckCircle size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Terjual ({soldCars.length})
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {soldCars.map(c => {
              const cost = c.costs.reduce((a, k) => a + Number(k.amount), 0);
              const modal = Number(c.purchasePrice) + cost;
              const profit = c.sellPrice ? Number(c.sellPrice) - modal : null;

              return (
                <div key={c.id} className="ios-card" style={{ padding: 20, opacity: 0.75 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF', margin: 0 }}>{c.name}</h3>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0' }}>{c.brand} {c.model} &bull; {c.year}</p>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                      background: 'rgba(255,69,58,0.2)', color: '#FF453A',
                      border: '0.5px solid rgba(255,69,58,0.3)',
                      whiteSpace: 'nowrap'
                    }}>Terjual</span>
                  </div>

                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
                    marginTop: 16, paddingTop: 16,
                    borderTop: '0.5px solid rgba(255,255,255,0.08)'
                  }}>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: 0 }}>Modal</p>
                      <p style={{ fontSize: 14, fontWeight: 900, color: '#FFFFFF', marginTop: 4, margin: '4px 0 0 0' }}>{rupiah(modal)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: 0 }}>Jual</p>
                      <p style={{ fontSize: 14, fontWeight: 900, color: '#FFFFFF', marginTop: 4, margin: '4px 0 0 0' }}>{rupiah(c.sellPrice)}</p>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: 0 }}>Profit/Rugi</p>
                      <p style={{
                        fontSize: 20, fontWeight: 900, marginTop: 4, margin: '4px 0 0 0',
                        color: profit && profit >= 0 ? '#30D158' : '#FF453A'
                      }}>
                        {profit && profit >= 0 ? '+' : ''}{rupiah(profit || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {cars.length === 0 && (
        <div className="ios-card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ marginBottom: 12 }}>
            <Car size={40} style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: 600, margin: 0 }}>Belum ada mobil</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 8, margin: '8px 0 0 0' }}>
            Tambahkan mobil pertama kamu untuk mulai tracking stok.
          </p>
        </div>
      )}
    </div>
  );
}
