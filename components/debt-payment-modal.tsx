'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Wallet, Banknote, CreditCard } from 'lucide-react';
import { payDebt } from '@/lib/actions';

const paymentSchema = z.object({
  amount: z.coerce.number().positive('Nominal harus lebih dari 0'),
  accountId: z.string().min(1, 'Pilih rekening'),
  date: z.string().min(1, 'Pilih tanggal'),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

type Account = { id: string; name: string; type: string };

type DebtPaymentModalProps = {
  debt: {
    id: string;
    name: string;
    type: string;
    remainingAmount: { toString(): string } | number;
    amount: { toString(): string } | number;
    accountId: string | null;
  };
  accounts: Account[];
  mode: 'lunasi' | 'cicil';
  trigger: React.ReactNode;
};

export function DebtPaymentModal({ debt, accounts, mode, trigger }: DebtPaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const remaining = Number(debt.remainingAmount);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: mode === 'lunasi' ? remaining : undefined,
      accountId: debt.accountId || '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    if (data.amount > remaining) return;
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('debtId', debt.id);
      formData.append('amount', String(data.amount));
      formData.append('accountId', data.accountId);
      formData.append('date', data.date);
      if (data.notes) formData.append('notes', data.notes);

      await payDebt(formData);
      reset();
      setIsOpen(false);
    } catch (error) {
      console.error('Error paying debt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isDebt = debt.type === 'DEBT';
  const title = mode === 'lunasi'
    ? (isDebt ? 'Lunasi Hutang' : 'Terima Pelunasan Piutang')
    : (isDebt ? 'Cicil Hutang' : 'Terima Cicilan Piutang');

  return (
    <>
      <button
        type="button"
        onClick={() => {
          reset({
            amount: mode === 'lunasi' ? remaining : undefined,
            accountId: debt.accountId || '',
            date: new Date().toISOString().split('T')[0],
            notes: '',
          });
          setIsOpen(true);
        }}
        className="shrink-0 grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[.10] transition text-premium-text-muted"
        title={title}
      >
        {trigger}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-premium rounded-3xl p-4 sm:p-6 w-full max-w-md border border-premium-border-soft my-4 max-h-[90vh]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-premium-text">{title}</h2>
              <button onClick={() => setIsOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[.10] transition text-premium-text-muted shrink-0">
                <X size={18} />
              </button>
            </div>

            <div className={`mb-4 p-3 rounded-xl border ${isDebt ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
              <p className="text-xs text-premium-text-muted">{isDebt ? 'Hutang' : 'Piutang'}</p>
              <p className="text-sm font-black text-premium-text">{debt.name}</p>
              <p className={`text-xs mt-0.5 ${isDebt ? 'text-rose-400' : 'text-emerald-400'}`}>
                Sisa: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(remaining)}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">
                  {mode === 'lunasi' ? 'Nominal Pelunasan' : 'Nominal Cicilan'}
                </label>
                <input
                  {...register('amount')}
                  type="number"
                  placeholder="0"
                  className="input w-full"
                  readOnly={mode === 'lunasi'}
                  max={remaining}
                />
                {errors.amount && <p className="text-xs text-rose-400 mt-1">{errors.amount.message}</p>}
                {mode === 'cicil' && (
                  <p className="text-xs text-premium-text-muted mt-1">Maksimal: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(remaining)}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">Rekening</label>
                <select {...register('accountId')} className="input w-full">
                  <option value="">Pilih Rekening</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} {a.type === 'CASH' ? '💵' : a.type === 'BANK' ? '🏦' : a.type === 'EWALLET' ? '📱' : ''}
                    </option>
                  ))}
                </select>
                {errors.accountId && <p className="text-xs text-rose-400 mt-1">{errors.accountId.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">Tanggal</label>
                <input {...register('date')} type="date" className="input w-full" />
                {errors.date && <p className="text-xs text-rose-400 mt-1">{errors.date.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-black text-premium-text-muted uppercase mb-2">Catatan (Opsional)</label>
                <textarea {...register('notes')} placeholder="Catatan tambahan..." className="input w-full" rows={2} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-4 py-2 rounded-xl bg-white/[.06] hover:bg-white/[.10] transition text-premium-text font-black text-sm">Batal</button>
                <button type="submit" disabled={isLoading} className={`flex-1 px-4 py-2 rounded-xl transition text-white font-black text-sm disabled:opacity-50 ${isDebt ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                  {isLoading ? 'Memproses...' : mode === 'lunasi' ? 'Lunasi' : 'Bayar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
