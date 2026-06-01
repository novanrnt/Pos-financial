'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { addDebt } from '@/lib/actions';

const debtSchema = z.object({
  type: z.enum(['DEBT', 'RECEIVABLE']),
  name: z.string().min(1, 'Nama pihak wajib diisi'),
  amount: z.coerce.number().positive('Nominal harus lebih dari 0'),
  dueDate: z.string().optional(),
  accountId: z.string().optional(),
  notes: z.string().optional(),
});

type DebtFormData = z.infer<typeof debtSchema>;

type Account = { id: string; name: string };

export function DebtFormModal({ accounts }: { accounts: Account[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    defaultValues: { type: 'DEBT' },
  });

  const onSubmit = async (data: DebtFormData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('type', data.type);
      formData.append('name', data.name);
      formData.append('amount', String(data.amount));
      if (data.dueDate) formData.append('dueDate', data.dueDate);
      if (data.accountId) formData.append('accountId', data.accountId);
      if (data.notes) formData.append('notes', data.notes);
      
      await addDebt(formData);
      reset();
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding debt:', error);
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
                <Plus size={18} className="text-violet-400" /> Tambah Hutang/Piutang
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[.10] transition text-premium-text-muted shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-3">
                  Tipe
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 cursor-pointer soft-card rounded-2xl p-4 border border-rose-500/20 hover:bg-rose-500/5 transition has-[:checked]:border-rose-500/50 has-[:checked]:bg-rose-500/10">
                    <input type="radio" value="DEBT" {...register('type')} className="w-4 h-4" />
                    <div className="flex items-center gap-2">
                      <ArrowDownRight size={16} className="text-rose-400" />
                      <span className="text-sm font-black text-premium-text">Hutang</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer soft-card rounded-2xl p-4 border border-emerald-500/20 hover:bg-emerald-500/5 transition has-[:checked]:border-emerald-500/50 has-[:checked]:bg-emerald-500/10">
                    <input type="radio" value="RECEIVABLE" {...register('type')} className="w-4 h-4" />
                    <div className="flex items-center gap-2">
                      <ArrowUpRight size={16} className="text-emerald-400" />
                      <span className="text-sm font-black text-premium-text">Piutang</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                  Nama Pihak
                </label>
                <input
                  {...register('name')}
                  placeholder="Nama orang/institusi"
                  className="input w-full"
                />
                {errors.name && (
                  <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                    Nominal
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
                    Jatuh Tempo
                  </label>
                  <input
                    {...register('dueDate')}
                    type="date"
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                  Rekening Terkait
                </label>
                <select {...register('accountId')} className="input w-full">
                  <option value="">Pilih Rekening (Opsional)</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
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
                  className="flex-1 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 transition text-white font-black text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Menyimpan...' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
