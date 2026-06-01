'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import { addSavingsGoal } from '@/lib/actions';

const savingsSchema = z.object({
  name: z.string().min(1, 'Nama goal wajib diisi'),
  targetAmount: z.coerce.number().positive('Target harus lebih dari 0'),
  deadline: z.string().optional(),
  notes: z.string().optional(),
});

type SavingsFormData = z.infer<typeof savingsSchema>;

export function SavingsGoalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SavingsFormData>({
    resolver: zodResolver(savingsSchema),
  });

  const onSubmit = async (data: SavingsFormData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('targetAmount', String(data.targetAmount));
      if (data.deadline) formData.append('deadline', data.deadline);
      if (data.notes) formData.append('notes', data.notes);
      
      await addSavingsGoal(formData);
      reset();
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding savings goal:', error);
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
                <Plus size={18} className="text-violet-300" /> Buat Goal Tabungan
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
                  Nama Goal
                </label>
                <input
                  {...register('name')}
                  placeholder="Contoh: DP Rumah, Liburan Bali..."
                  className="input w-full"
                />
                {errors.name && (
                  <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                  Target Nominal
                </label>
                <input
                  {...register('targetAmount')}
                  placeholder="0"
                  type="number"
                  className="input w-full"
                />
                {errors.targetAmount && (
                  <p className="text-xs text-rose-400 mt-1">{errors.targetAmount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                  Deadline (Opsional)
                </label>
                <input
                  {...register('deadline')}
                  type="date"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                  Catatan (Opsional)
                </label>
                <input
                  {...register('notes')}
                  placeholder="Catatan..."
                  className="input w-full"
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
                  className="flex-1 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 transition text-white font-black text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Menyimpan...' : 'Buat Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
