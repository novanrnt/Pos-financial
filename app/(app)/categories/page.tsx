import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { toggleCategory } from '@/lib/actions';
import { Badge, SubmitButton } from '@/components/ui';
import { Layers, Eye, EyeOff, Plus, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { CategoryFormModal } from '@/components/category-form-modal';

export default async function Categories() {
  const u = await requireUser();
  const uid = u!.id;

  const categories = await prisma.category.findMany({ 
    where: { userId: uid }, 
    orderBy: [{ type: 'asc' }, { name: 'asc' }] 
  });

  const incomeCategories = categories.filter(c => c.type === 'INCOME');
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
  const activeCategories = categories.filter(c => c.isActive);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-premium-text">Kategori</h1>
        <CategoryFormModal />
      </div>

      {/* Summary Card */}
      <div className="rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #2a0a3a 0%, #0a3a2a 50%, #3a2a0a 100%)' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-amber-500/10 pointer-events-none" />
        <div className="relative p-6 md:p-8">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-white/60">Total Kategori</p>
            <Layers size={16} className="text-white/40" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">{categories.length}</h2>
          <p className="text-xs text-white/50 mb-6">{activeCategories.length} kategori aktif</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[.08] rounded-2xl p-4 border border-white/[.10]">
              <p className="text-xs text-white/50 mb-1 flex items-center gap-1"><ArrowUpRight size={12} /> Pemasukan</p>
              <p className="text-base font-black text-emerald-300">{incomeCategories.length} kategori</p>
            </div>
            <div className="bg-white/[.08] rounded-2xl p-4 border border-white/[.10]">
              <p className="text-xs text-white/50 mb-1 flex items-center gap-1"><ArrowDownRight size={12} /> Pengeluaran</p>
              <p className="text-base font-black text-rose-300">{expenseCategories.length} kategori</p>
            </div>
          </div>
        </div>
      </div>

      {/* Income Categories */}
      {incomeCategories.length > 0 && (
        <div>
          <h2 className="text-base font-black text-premium-text mb-3 flex items-center gap-2">
            <ArrowUpRight size={18} className="text-emerald-400" /> Kategori Pemasukan
          </h2>
          <div className="space-y-2">
            {incomeCategories.map(category => (
              <div key={category.id} className="glass-premium rounded-2xl p-4 border border-emerald-500/20 flex items-center gap-4">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <ArrowUpRight size={20} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-premium-text truncate">{category.name}</p>
                    <Badge variant={category.isActive ? 'success' : 'default'} className="text-xs">
                      {category.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                  <p className="text-xs text-premium-text-muted mt-0.5">Kategori Pemasukan</p>
                </div>
                <form action={toggleCategory}>
                  <input type="hidden" name="id" value={category.id} />
                  <button type="submit" className="shrink-0 grid h-8 w-8 place-items-center rounded-lg hover:bg-emerald-500/10 text-premium-text-muted hover:text-emerald-400 transition">
                    {category.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense Categories */}
      {expenseCategories.length > 0 && (
        <div>
          <h2 className="text-base font-black text-premium-text mb-3 flex items-center gap-2">
            <ArrowDownRight size={18} className="text-rose-400" /> Kategori Pengeluaran
          </h2>
          <div className="space-y-2">
            {expenseCategories.map(category => (
              <div key={category.id} className="glass-premium rounded-2xl p-4 border border-rose-500/20 flex items-center gap-4">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-rose-500/20 flex items-center justify-center">
                  <ArrowDownRight size={20} className="text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-premium-text truncate">{category.name}</p>
                    <Badge variant={category.isActive ? 'success' : 'default'} className="text-xs">
                      {category.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                  <p className="text-xs text-premium-text-muted mt-0.5">Kategori Pengeluaran</p>
                </div>
                <form action={toggleCategory}>
                  <input type="hidden" name="id" value={category.id} />
                  <button type="submit" className="shrink-0 grid h-8 w-8 place-items-center rounded-lg hover:bg-rose-500/10 text-premium-text-muted hover:text-rose-400 transition">
                    {category.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="glass-premium rounded-3xl p-12 text-center">
          <Layers size={40} className="text-premium-text-muted opacity-30 mx-auto mb-4" />
          <p className="text-premium-text font-black">Belum ada kategori</p>
          <p className="text-xs text-premium-text-muted mt-2">Tambahkan kategori untuk mengorganisir transaksi</p>
        </div>
      )}

      {/* Add Category Form */}
      {/* Removed - now using modal */}
    </div>
  );
}
