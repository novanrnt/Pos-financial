import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { addAccount, deleteAccount } from '@/lib/actions';
import { Card, PageTitle, SubmitButton, SectionHeader, Badge } from '@/components/ui';
import { rupiah } from '@/lib/utils';
import { Wallet, Plus, Trash2 } from 'lucide-react';

export default async function Accounts() {
  const u = await requireUser();
  const rows = await prisma.account.findMany({ where: { userId: u!.id }, orderBy: { createdAt: 'desc' } });

  const totalBalance = rows.reduce((a, x) => a + Number(x.balance), 0);

  return (
    <>
      <PageTitle title="Dompet Saya" desc="Multi rekening, saldo realtime, dan rekening utama." />
      
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Accounts List */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card variant="gradient" className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-black text-white/60 uppercase tracking-wide">Total Saldo</p>
                <h2 className="text-3xl md:text-4xl font-black text-white mt-2 tracking-tight">{rupiah(totalBalance)}</h2>
              </div>
              <Wallet size={32} className="text-white/40" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                <p className="text-xs font-black text-white/60 uppercase">Rekening</p>
                <p className="text-xl font-black text-white mt-2">{rows.length}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                <p className="text-xs font-black text-white/60 uppercase">Rata-rata</p>
                <p className="text-xl font-black text-white mt-2">{rupiah(rows.length > 0 ? totalBalance / rows.length : 0)}</p>
              </div>
            </div>
          </Card>

          {/* Accounts by Type */}
          {rows.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-4xl mb-3">💼</div>
              <p className="text-premium-text-muted">Belum ada rekening</p>
              <p className="text-xs text-premium-text-muted mt-2">Tambahkan rekening pertama kamu untuk mulai tracking keuangan.</p>
            </Card>
          ) : (
            <>
              {/* Bank Accounts */}
              {rows.filter(a => a.type === 'BANK').length > 0 && (
                <div>
                  <div className="px-1 mb-4">
                    <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide">🏦 Bank</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rows.filter(a => a.type === 'BANK').map(a => (
                      <Card key={a.id} className="p-5 relative group">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-xs text-premium-text-muted font-black uppercase">{a.type}</p>
                            <h3 className="text-lg font-black text-premium-text mt-1">{a.name}</h3>
                          </div>
                          {a.isPrimary && <Badge variant="success" className="text-xs">Utama</Badge>}
                        </div>
                        <div className="mt-4 pt-4 border-t border-premium-border-soft">
                          <p className="text-xs text-premium-text-muted mb-1">Saldo</p>
                          <p className="text-2xl font-black text-premium-income">{rupiah(a.balance)}</p>
                        </div>
                        <form action={deleteAccount} className="mt-4">
                          <input type="hidden" name="id" value={a.id} />
                          <button type="submit" className="text-xs text-premium-text-muted hover:text-premium-expense transition-colors flex items-center gap-1">
                            <Trash2 size={12} /> Hapus
                          </button>
                        </form>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Cash */}
              {rows.filter(a => a.type === 'CASH').length > 0 && (
                <div>
                  <div className="px-1 mb-4">
                    <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide">💵 Cash</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rows.filter(a => a.type === 'CASH').map(a => (
                      <Card key={a.id} className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-xs text-premium-text-muted font-black uppercase">{a.type}</p>
                            <h3 className="text-lg font-black text-premium-text mt-1">{a.name}</h3>
                          </div>
                          {a.isPrimary && <Badge variant="success" className="text-xs">Utama</Badge>}
                        </div>
                        <div className="mt-4 pt-4 border-t border-premium-border-soft">
                          <p className="text-xs text-premium-text-muted mb-1">Saldo</p>
                          <p className="text-2xl font-black text-premium-income">{rupiah(a.balance)}</p>
                        </div>
                        <form action={deleteAccount} className="mt-4">
                          <input type="hidden" name="id" value={a.id} />
                          <button type="submit" className="text-xs text-premium-text-muted hover:text-premium-expense transition-colors flex items-center gap-1">
                            <Trash2 size={12} /> Hapus
                          </button>
                        </form>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* E-Wallet */}
              {rows.filter(a => a.type === 'EWALLET').length > 0 && (
                <div>
                  <div className="px-1 mb-4">
                    <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide">📱 E-Wallet</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rows.filter(a => a.type === 'EWALLET').map(a => (
                      <Card key={a.id} className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-xs text-premium-text-muted font-black uppercase">{a.type}</p>
                            <h3 className="text-lg font-black text-premium-text mt-1">{a.name}</h3>
                          </div>
                          {a.isPrimary && <Badge variant="success" className="text-xs">Utama</Badge>}
                        </div>
                        <div className="mt-4 pt-4 border-t border-premium-border-soft">
                          <p className="text-xs text-premium-text-muted mb-1">Saldo</p>
                          <p className="text-2xl font-black text-premium-income">{rupiah(a.balance)}</p>
                        </div>
                        <form action={deleteAccount} className="mt-4">
                          <input type="hidden" name="id" value={a.id} />
                          <button type="submit" className="text-xs text-premium-text-muted hover:text-premium-expense transition-colors flex items-center gap-1">
                            <Trash2 size={12} /> Hapus
                          </button>
                        </form>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Other */}
              {rows.filter(a => a.type === 'OTHER').length > 0 && (
                <div>
                  <div className="px-1 mb-4">
                    <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide">📦 Lainnya</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rows.filter(a => a.type === 'OTHER').map(a => (
                      <Card key={a.id} className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-xs text-premium-text-muted font-black uppercase">{a.type}</p>
                            <h3 className="text-lg font-black text-premium-text mt-1">{a.name}</h3>
                          </div>
                          {a.isPrimary && <Badge variant="success" className="text-xs">Utama</Badge>}
                        </div>
                        <div className="mt-4 pt-4 border-t border-premium-border-soft">
                          <p className="text-xs text-premium-text-muted mb-1">Saldo</p>
                          <p className="text-2xl font-black text-premium-income">{rupiah(a.balance)}</p>
                        </div>
                        <form action={deleteAccount} className="mt-4">
                          <input type="hidden" name="id" value={a.id} />
                          <button type="submit" className="text-xs text-premium-text-muted hover:text-premium-expense transition-colors flex items-center gap-1">
                            <Trash2 size={12} /> Hapus
                          </button>
                        </form>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Add Account Form */}
        <div className="lg:sticky lg:top-24 h-fit">
          <Card variant="premium" className="p-6">
            <SectionHeader title="Tambah Rekening" />
            <form action={addAccount} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Nama Rekening</label>
                <input name="name" placeholder="BCA Utama" required className="w-full" />
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Tipe</label>
                <select name="type" className="w-full">
                  <option value="BANK">Bank</option>
                  <option value="CASH">Cash</option>
                  <option value="EWALLET">E-Wallet</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Saldo Awal</label>
                <input name="initialBalance" placeholder="0" type="number" required className="w-full" />
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Warna (Opsional)</label>
                <select name="color" className="w-full">
                  <option value="emerald">Emerald</option>
                  <option value="blue">Blue</option>
                  <option value="violet">Violet</option>
                  <option value="rose">Rose</option>
                  <option value="orange">Orange</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isPrimary" className="w-4 h-4" />
                  <span className="text-xs font-black text-premium-text-muted uppercase">Rekening Utama</span>
                </label>
              </div>

              <SubmitButton>Tambah Rekening</SubmitButton>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
