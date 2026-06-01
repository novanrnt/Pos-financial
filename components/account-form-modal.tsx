'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import { addAccount } from '@/lib/actions';

const accountSchema = z.object({
  name: z.string().min(1, 'Nama rekening wajib diisi'),
  type: z.enum(['BANK', 'EWALLET', 'CASH', 'OTHER']),
  initialBalance: z.coerce.number().min(0, 'Saldo awal tidak boleh negatif'),
  isPrimary: z.boolean().default(false),
});

type AccountFormData = z.infer<typeof accountSchema>;

export function AccountFormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: { type: 'BANK', initialBalance: 0, isPrimary: false },
  });

  const onSubmit = async (data: AccountFormData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('type', data.type);
      formData.append('initialBalance', String(data.initialBalance));
      formData.append('isPrimary', String(data.isPrimary));
      
      await addAccount(formData);
      reset();
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-xl bg-white/[.06] hover:bg-white/[.10] transition text-premium-text"
      >
        <Plus size={20} />
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-premium rounded-3xl p-4 sm:p-6 w-full max-w-md border border-premium-border-soft my-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-premium-text flex items-center gap-2">
                <Plus size={18} className="text-violet-300" /> Tambah Rekening
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[.10] transition text-premium-text-muted"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nama Rekening */}
              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                  Nama Rekening
                </label>
                <input
                  {...register('name')}
                  placeholder="BCA Utama, GoPay, dll..."
                  className="input w-full"
                />
                {errors.name && (
                  <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Tipe & Saldo Awal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                    Tipe
                  </label>
                  <select {...register('type')} className="input w-full">
                    <option value="BANK">Bank</option>
                    <option value="EWALLET">E-Wallet</option>
                    <option value="CASH">Cash</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                    Saldo Awal
                  </label>
                  <input
                    {...register('initialBalance')}
                    placeholder="0"
                    type="number"
                    className="input w-full"
                  />
                  {errors.initialBalance && (
                    <p className="text-xs text-rose-400 mt-1">{errors.initialBalance.message}</p>
                  )}
                </div>
              </div>

              {/* Jadikan Utama */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  {...register('isPrimary')}
                  type="checkbox"
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-black text-premium-text-muted">
                  Jadikan rekening utama
                </span>
              </label>

              {/* Buttons */}
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
                  {isLoading ? 'Menyimpan...' : 'Tambah Rekening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
