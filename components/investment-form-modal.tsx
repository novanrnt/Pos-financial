'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import { addInvestment } from '@/lib/actions';
import { ym } from '@/lib/utils';

const investmentSchema = z.object({
  category: z.string().min(1, 'Pilih kategori'),
  month: z.string().min(1, 'Pilih bulan'),
  balance: z.coerce.number().positive('Saldo harus lebih dari 0'),
  notes: z.string().optional(),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

export function InvestmentFormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: { month: ym() },
  });

  const onSubmit = async (data: InvestmentFormData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('category', data.category);
      formData.append('month', data.month);
      formData.append('balance', String(data.balance));
      if (data.notes) formData.append('notes', data.notes);
      
      await addInvestment(formData);
      reset({ month: ym() });
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding investment:', error);
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
                <Plus size={18} className="text-cyan-400" /> Update Snapshot
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
                  Kategori
                </label>
                <select {...register('category')} className="input w-full">
                  <option value="">Pilih Kategori</option>
                  <option value="Saham">Saham</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Reksa Dana">Reksa Dana</option>
                  <option value="Emas">Emas</option>
                  <option value="Properti">Properti</option>
                  <option value="R&D / Eksperimen">R&D / Eksperimen</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
                {errors.category && (
                  <p className="text-xs text-rose-400 mt-1">{errors.category.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                    Bulan
                  </label>
                  <input
                    {...register('month')}
                    type="month"
                    className="input w-full"
                  />
                  {errors.month && (
                    <p className="text-xs text-rose-400 mt-1">{errors.month.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                    Saldo
                  </label>
                  <input
                    {...register('balance')}
                    placeholder="0"
                    type="number"
                    className="input w-full"
                  />
                  {errors.balance && (
                    <p className="text-xs text-rose-400 mt-1">{errors.balance.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  {...register('notes')}
                  placeholder="Catatan tambahan..."
                  className="input w-full"
                  rows={3}
                />
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
                  className="flex-1 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 transition text-white font-black text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan Snapshot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
