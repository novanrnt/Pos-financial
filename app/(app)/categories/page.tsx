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
        <h1 className="text-[28px] font-semibold text-white tracking-tight">Kategori</h1>
        <CategoryFormModal />
      </div>

      {/* Summary Card */}
      <div className="ios-card p-6 md:p-8">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[13px] text-white/50">Total Kategori</p>
          <Layers size={16} className="text-white/40" />
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-1">{categories.length}</h2>
        <p className="text-[11px] text-white/50 mb-6">{activeCategories.length} kategori aktif</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[11px] text-white/50 mb-1 flex items-center gap-1"><ArrowUpRight size={12} style={{ color: '#30D158' }} /> Pemasukan</p>
            <p className="text-[13px] font-semibold" style={{ color: '#30D158' }}>{incomeCategories.length} kategori</p>
          </div>
          <div className="p-4" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[11px] text-white/50 mb-1 flex items-center gap-1"><ArrowDownRight size={12} style={{ color: '#FF453A' }} /> Pengeluaran</p>
            <p className="text-[13px] font-semibold" style={{ color: '#FF453A' }}>{expenseCategories.length} kategori</p>
          </div>
        </div>
      </div>

      {/* Income Categories */}
      {incomeCategories.length > 0 && (
        <div>
          <h2 className="text-[11px] font-medium text-white/50 mb-3 flex items-center gap-2 tracking-wide uppercase">
            <ArrowUpRight size={14} style={{ color: '#30D158' }} /> Kategori Pemasukan
          </h2>
          <div className="space-y-2">
            {incomeCategories.map(category => (
              <div key={category.id} className="ios-card p-4 flex items-center gap-4 active-scale" style={{ border: '0.5px solid rgba(48,209,88,0.12)' }}>
                <div className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(48,209,88,0.12)' }}>
                  <ArrowUpRight size={20} style={{ color: '#30D158' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-white truncate">{category.name}</p>
                    <Badge variant={category.isActive ? 'success' : 'default'} className="text-[11px]">
                      {category.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-white/50 mt-0.5">Kategori Pemasukan</p>
                </div>
                <form action={toggleCategory}>
                  <input type="hidden" name="id" value={category.id} />
                  <button type="submit" className="shrink-0 grid h-8 w-8 place-items-center rounded-xl active-scale transition" style={{ color: 'rgba(255,255,255,0.5)' }}>
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
          <h2 className="text-[11px] font-medium text-white/50 mb-3 flex items-center gap-2 tracking-wide uppercase">
            <ArrowDownRight size={14} style={{ color: '#FF453A' }} /> Kategori Pengeluaran
          </h2>
          <div className="space-y-2">
            {expenseCategories.map(category => (
              <div key={category.id} className="ios-card p-4 flex items-center gap-4 active-scale" style={{ border: '0.5px solid rgba(255,69,58,0.12)' }}>
                <div className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,69,58,0.12)' }}>
                  <ArrowDownRight size={20} style={{ color: '#FF453A' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-white truncate">{category.name}</p>
                    <Badge variant={category.isActive ? 'success' : 'default'} className="text-[11px]">
                      {category.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-white/50 mt-0.5">Kategori Pengeluaran</p>
                </div>
                <form action={toggleCategory}>
                  <input type="hidden" name="id" value={category.id} />
                  <button type="submit" className="shrink-0 grid h-8 w-8 place-items-center rounded-xl active-scale transition" style={{ color: 'rgba(255,255,255,0.5)' }}>
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
        <div className="ios-card p-12 text-center">
          <Layers size={40} className="text-white/30 mx-auto mb-4" />
          <p className="text-white font-medium text-[13px]">Belum ada kategori</p>
          <p className="text-[11px] text-white/50 mt-2">Tambahkan kategori untuk mengorganisir transaksi</p>
        </div>
      )}

      {/* Add Category Form */}
      {/* Removed - now using modal */}
    </div>
  );
}
