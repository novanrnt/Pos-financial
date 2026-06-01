'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { addCategory } from '@/lib/actions';

const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().default('emerald'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export function CategoryFormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { type: 'INCOME', color: 'emerald' },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('type', data.type);
      formData.append('color', data.color);
      
      await addCategory(formData);
      reset();
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-xl bg-white/[.06] hover:bg-white/[.10] transition text-premium-text"
      >
        <Plus size={20} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-premium rounded-3xl p-4 sm:p-6 w-full max-w-md border border-premium-border-soft my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-premium-text flex items-center gap-2">
                <Plus size={18} className="text-violet-400" /> Tambah Kategori
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[.10] transition text-premium-text-muted"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                  Nama Kategori
                </label>
                <input
                  {...register('name')}
                  placeholder="Gaji, Makanan, Transport, dll..."
                  className="input w-full"
                />
                {errors.name && (
                  <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-3">
                  Tipe Kategori
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 cursor-pointer soft-card rounded-2xl p-4 border border-emerald-500/20 hover:bg-emerald-500/5 transition has-[:checked]:border-emerald-500/50 has-[:checked]:bg-emerald-500/10">
                    <input type="radio" value="INCOME" {...register('type')} className="w-4 h-4" />
                    <div className="flex items-center gap-2">
                      <ArrowUpRight size={16} className="text-emerald-400" />
                      <span className="text-sm font-black text-premium-text">Pemasukan</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer soft-card rounded-2xl p-4 border border-rose-500/20 hover:bg-rose-500/5 transition has-[:checked]:border-rose-500/50 has-[:checked]:bg-rose-500/10">
                    <input type="radio" value="EXPENSE" {...register('type')} className="w-4 h-4" />
                    <div className="flex items-center gap-2">
                      <ArrowDownRight size={16} className="text-rose-400" />
                      <span className="text-sm font-black text-premium-text">Pengeluaran</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                  Warna (Opsional)
                </label>
                <select {...register('color')} className="input w-full">
                  <option value="emerald">Emerald</option>
                  <option value="blue">Blue</option>
                  <option value="violet">Violet</option>
                  <option value="rose">Rose</option>
                  <option value="orange">Orange</option>
                  <option value="cyan">Cyan</option>
                  <option value="green">Green</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/[.06] hover:bg-white/[.10] transition text-premium-text font-black text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 transition text-white font-black text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Menyimpan...' : 'Tambah Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
