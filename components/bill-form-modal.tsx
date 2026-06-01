'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import { addBill } from '@/lib/actions';

const billSchema = z.object({
  name: z.string().min(1, 'Nama tagihan wajib diisi'),
  amount: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  dueDay: z.coerce.number().min(1).max(31, 'Tanggal harus 1-31'),
  accountId: z.string().min(1, 'Pilih rekening'),
});

type BillFormData = z.infer<typeof billSchema>;

type Account = { id: string; name: string };

export function BillFormModal({ accounts }: { accounts: Account[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
  });

  const onSubmit = async (data: BillFormData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('amount', String(data.amount));
      formData.append('dueDay', String(data.dueDay));
      formData.append('accountId', data.accountId);
      
      await addBill(formData);
      reset();
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding bill:', error);
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
                <Plus size={18} className="text-orange-400" /> Tambah Tagihan
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
                  Nama Tagihan
                </label>
                <input
                  {...register('name')}
                  placeholder="Listrik PLN, Internet, dll..."
                  className="input w-full"
                />
                {errors.name && (
                  <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                    Jumlah
                  </label>
                  <input
                    {...register('amount')}
                    placeholder="0"
                    type="number"
                    className="input w-full"
                  />
                  {errors.amount && (
                    <p className="text-xs text-rose-400 mt-1">{errors.amount.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                    Tgl Jatuh Tempo
                  </label>
                  <input
                    {...register('dueDay')}
                    placeholder="1-31"
                    type="number"
                    min="1"
                    max="31"
                    className="input w-full"
                  />
                  {errors.dueDay && (
                    <p className="text-xs text-rose-400 mt-1">{errors.dueDay.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                  Rekening Pembayaran
                </label>
                <select {...register('accountId')} className="input w-full">
                  <option value="">Pilih Rekening</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                {errors.accountId && (
                  <p className="text-xs text-rose-400 mt-1">{errors.accountId.message}</p>
                )}
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
                  className="flex-1 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 transition text-white font-black text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Menyimpan...' : 'Tambah Tagihan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
