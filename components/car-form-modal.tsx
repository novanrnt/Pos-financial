'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import { addCar } from '@/lib/actions';

const carSchema = z.object({
  name: z.string().min(1, 'Nama mobil wajib diisi'),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().optional(),
  color: z.string().optional(),
  transmission: z.string().optional(),
  licensePlate: z.string().optional(),
  purchasePrice: z.coerce.number().positive('Harga beli harus lebih dari 0'),
  estimatedSellPrice: z.coerce.number().optional(),
  accountId: z.string().min(1, 'Pilih rekening'),
  myMoney: z.coerce.number().optional(),
  debtName: z.string().optional(),
  debtAmount: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type CarFormData = z.infer<typeof carSchema>;

type Account = { id: string; name: string };

export function CarFormModal({ accounts }: { accounts: Account[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
  });

  const onSubmit = async (data: CarFormData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== null) {
          formData.append(k, String(v));
        }
      });
      
      await addCar(formData);
      reset();
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding car:', error);
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
          <div className="glass-premium rounded-3xl p-4 sm:p-6 w-full max-w-md border border-premium-border-soft my-4 max-h-[90vh]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-premium-text flex items-center gap-2">
                <Plus size={18} className="text-blue-400" /> Tambah Mobil
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[.10] transition text-premium-text-muted shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nama Mobil */}
              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                  Nama Mobil
                </label>
                <input
                  {...register('name')}
                  placeholder="Honda CR-V 2.4 AT 2010"
                  className="input w-full"
                />
                {errors.name && (
                  <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Spesifikasi */}
              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                  Spesifikasi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    {...register('brand')}
                    placeholder="Merek"
                    className="input w-full text-sm"
                  />
                  <input
                    {...register('model')}
                    placeholder="Tipe"
                    className="input w-full text-sm"
                  />
                  <input
                    {...register('year')}
                    placeholder="Tahun"
                    type="number"
                    className="input w-full text-sm"
                  />
                  <input
                    {...register('color')}
                    placeholder="Warna"
                    className="input w-full text-sm"
                  />
                  <input
                    {...register('transmission')}
                    placeholder="Transmisi"
                    className="input w-full text-sm"
                  />
                  <input
                    {...register('licensePlate')}
                    placeholder="Nopol"
                    className="input w-full text-sm"
                  />
                </div>
              </div>

              {/* Harga */}
              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                  Harga Beli
                </label>
                <input
                  {...register('purchasePrice')}
                  placeholder="0"
                  type="number"
                  className="input w-full"
                />
                {errors.purchasePrice && (
                  <p className="text-xs text-rose-400 mt-1">{errors.purchasePrice.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                  Est. Harga Jual
                </label>
                <input
                  {...register('estimatedSellPrice')}
                  placeholder="0"
                  type="number"
                  className="input w-full"
                />
              </div>

              {/* Rekening */}
              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                  Rekening Pembayaran
                </label>
                <select {...register('accountId')} className="input w-full">
                  <option value="">Pilih rekening</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                {errors.accountId && (
                  <p className="text-xs text-rose-400 mt-1">{errors.accountId.message}</p>
                )}
              </div>

              {/* Modal Saya */}
              <div className="bg-premium-income/10 border border-premium-income/20 rounded-2xl p-4">
                <p className="text-xs font-black text-premium-income uppercase mb-2">💰 Modal Saya</p>
                <input
                  {...register('myMoney')}
                  placeholder="Uang saya untuk beli mobil"
                  type="number"
                  className="input w-full text-sm"
                />
                <p className="text-[10px] text-premium-text-muted mt-2">Nominal ini akan dipotong dari rekening</p>
              </div>

              {/* Pinjaman */}
              <div className="bg-premium-expense/10 border border-premium-expense/20 rounded-2xl p-4">
                <p className="text-xs font-black text-premium-expense uppercase mb-2">🏦 Pinjaman (Opsional)</p>
                <input
                  {...register('debtName')}
                  placeholder="Nama pemberi pinjaman"
                  className="input w-full text-sm"
                />
                <input
                  {...register('debtAmount')}
                  placeholder="Nominal pinjaman"
                  type="number"
                  className="input w-full text-sm mt-2"
                />
                <p className="text-[10px] text-premium-text-muted mt-2">Total modal = Uang saya + Pinjaman</p>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  {...register('notes')}
                  placeholder="Catatan tambahan"
                  className="input w-full"
                  rows={3}
                />
              </div>

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
                  className="flex-1 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 transition text-white font-black text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Menyimpan...' : 'Tambah Mobil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
