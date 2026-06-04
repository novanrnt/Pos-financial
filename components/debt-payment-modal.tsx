'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);
  const remaining = Number(debt.remainingAmount);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

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

  const modalContent = isOpen ? (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }} onClick={() => setIsOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          backdropFilter: 'blur(40px) saturate(200%)',
          border: '0.5px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          borderRadius: 24, padding: 20, width: '100%', maxWidth: 420,
          maxHeight: '90vh', overflowY: 'auto',
        }}>
          <div className="flex items-center justify-between mb-5">
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: '-0.2px', margin: 0 }}>{title}</h2>
            <button onClick={() => setIsOpen(false)} className="active-scale" style={{
              width: 32, height: 32, display: 'grid', placeItems: 'center',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
            }}><X size={18} /></button>
          </div>

          <div className={`mb-4 p-3 rounded-[14px] ${isDebt ? '' : ''}`} style={{
            background: isDebt ? 'rgba(255,69,58,0.12)' : 'rgba(48,209,88,0.12)',
            border: isDebt ? '0.5px solid rgba(255,69,58,0.25)' : '0.5px solid rgba(48,209,88,0.25)',
          }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{isDebt ? 'Hutang' : 'Piutang'}</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '2px 0 0 0' }}>{debt.name}</p>
            <p style={{ fontSize: 12, marginTop: 2, margin: '2px 0 0 0', color: isDebt ? '#FF453A' : '#30D158' }}>
              Sisa: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(remaining)}
            </p>
          </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
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
              {errors.amount && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.amount.message}</p>}
              {mode === 'cicil' && (
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Maksimal: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(remaining)}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Rekening</label>
              <select {...register('accountId')} className="input w-full">
                <option value="">Pilih Rekening</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              {errors.accountId && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.accountId.message}</p>}
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Tanggal</label>
              <input {...register('date')} type="date" className="input w-full" />
              {errors.date && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.date.message}</p>}
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Catatan (Opsional)</label>
              <textarea {...register('notes')} placeholder="Catatan tambahan..." className="input w-full" rows={2} />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setIsOpen(false)} className="active-scale" style={{
                flex: 1, padding: '12px 16px', borderRadius: 14,
                background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>Batal</button>
              <button type="submit" disabled={isLoading} className="active-scale" style={{
                flex: 1, padding: '12px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: isDebt ? '#FF453A' : '#30D158', color: isDebt ? '#fff' : '#000',
                fontSize: 13, fontWeight: 600, opacity: isLoading ? 0.5 : 1,
              }}>{isLoading ? 'Memproses...' : mode === 'lunasi' ? 'Lunasi' : 'Bayar'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  ) : null;

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
        className="active-scale"
        style={{
          width: 32, height: 32, display: 'grid', placeItems: 'center',
          borderRadius: 10, border: 'none', cursor: 'pointer',
          background: isDebt ? 'rgba(255,69,58,0.1)' : 'rgba(48,209,88,0.1)',
          color: isDebt ? '#FF453A' : '#30D158',
        }}
        title={title}
      >
        {trigger}
      </button>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
