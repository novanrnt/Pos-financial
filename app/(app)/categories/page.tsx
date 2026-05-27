import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { addCategory, toggleCategory } from '@/lib/actions';
import { Card, PageTitle, SubmitButton, SectionHeader, Badge } from '@/components/ui';
import { Layers, Eye, EyeOff } from 'lucide-react';

export default async function Categories() {
  const u = await requireUser();
  const rows = await prisma.category.findMany({ where: { userId: u!.id }, orderBy: [{ type: 'asc' }, { name: 'asc' }] });

  const incomeCategories = rows.filter(c => c.type === 'INCOME');
  const expenseCategories = rows.filter(c => c.type === 'EXPENSE');

  return (
    <>
      <PageTitle title="Kategori" desc="Income & expense category, termasuk Ngopseh." />
      
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Categories List */}
        <div className="space-y-6">
          {/* Income Categories */}
          {incomeCategories.length > 0 && (
            <div>
              <div className="px-1 mb-4">
                <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide">💰 Pemasukan ({incomeCategories.length})</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {incomeCategories.map(c => (
                  <Card key={c.id} className="p-4 hover:border-premium-border-medium transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-black text-premium-text">{c.name}</h3>
                        <p className="text-xs text-premium-text-muted mt-1">Kategori Pemasukan</p>
                      </div>
                      <Badge variant={c.isActive ? 'success' : 'default'} className="text-xs">
                        {c.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>

                    <form action={toggleCategory} className="mt-3 pt-3 border-t border-premium-border-soft">
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="text-xs font-black text-premium-text-muted hover:text-premium-text transition-colors flex items-center gap-1">
                        {c.isActive ? (
                          <>
                            <EyeOff size={12} /> Nonaktifkan
                          </>
                        ) : (
                          <>
                            <Eye size={12} /> Aktifkan
                          </>
                        )}
                      </button>
                    </form>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Expense Categories */}
          {expenseCategories.length > 0 && (
            <div>
              <div className="px-1 mb-4">
                <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide">💸 Pengeluaran ({expenseCategories.length})</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {expenseCategories.map(c => (
                  <Card key={c.id} className="p-4 hover:border-premium-border-medium transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-black text-premium-text">{c.name}</h3>
                        <p className="text-xs text-premium-text-muted mt-1">Kategori Pengeluaran</p>
                      </div>
                      <Badge variant={c.isActive ? 'success' : 'default'} className="text-xs">
                        {c.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>

                    <form action={toggleCategory} className="mt-3 pt-3 border-t border-premium-border-soft">
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="text-xs font-black text-premium-text-muted hover:text-premium-text transition-colors flex items-center gap-1">
                        {c.isActive ? (
                          <>
                            <EyeOff size={12} /> Nonaktifkan
                          </>
                        ) : (
                          <>
                            <Eye size={12} /> Aktifkan
                          </>
                        )}
                      </button>
                    </form>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {rows.length === 0 && (
            <Card className="text-center py-12">
              <div className="text-4xl mb-3">📂</div>
              <p className="text-premium-text-muted">Belum ada kategori</p>
              <p className="text-xs text-premium-text-muted mt-2">Tambahkan kategori untuk mengorganisir transaksi kamu.</p>
            </Card>
          )}
        </div>

        {/* Add Category Form */}
        <div className="lg:sticky lg:top-24 h-fit">
          <Card variant="premium" className="p-6">
            <SectionHeader title="Tambah Kategori" />
            <form action={addCategory} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Nama Kategori</label>
                <input name="name" placeholder="Ngopseh, Bensin, Gaji" required className="w-full" />
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Tipe</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" value="INCOME" defaultChecked className="w-4 h-4" />
                    <span className="text-xs font-black">Pemasukan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" value="EXPENSE" className="w-4 h-4" />
                    <span className="text-xs font-black">Pengeluaran</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Warna (Opsional)</label>
                <select name="color" className="w-full">
                  <option value="emerald">Emerald</option>
                  <option value="blue">Blue</option>
                  <option value="violet">Violet</option>
                  <option value="rose">Rose</option>
                  <option value="orange">Orange</option>
                  <option value="cyan">Cyan</option>
                  <option value="green">Green</option>
                </select>
              </div>

              <SubmitButton>Tambah Kategori</SubmitButton>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
