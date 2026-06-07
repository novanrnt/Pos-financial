'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Receipt, CalendarClock } from 'lucide-react';
import { Modal } from '@/components/modal';
import { addBill } from '@/lib/actions';

const billSchema = z.object({
  billType: z.enum(['MONTHLY', 'INSTALLMENT']),
  name: z.string().min(1, 'Nama tagihan wajib diisi'),
  amount: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  dueDay: z.coerce.number().min(1).max(31, 'Tanggal harus 1-31'),
  accountId: z.string().min(1, 'Pilih rekening'),
  totalAmount: z.coerce.number().optional(),
  totalMonths: z.coerce.number().optional(),
  startDate: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => {
  if (data.billType === 'INSTALLMENT') {
    return data.totalAmount && data.totalAmount > 0 && data.totalMonths && data.totalMonths > 0 && data.startDate;
  }
  return true;
}, { message: 'Lengkapi data cicilan', path: ['totalAmount'] });

type BillFormData = z.infer<typeof billSchema>;
type Account = { id: string; name: string };

export function BillFormModal({ accounts }: { accounts: Account[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [billType, setBillType] = useState<'MONTHLY' | 'INSTALLMENT'>('MONTHLY');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: { billType: 'MONTHLY', dueDay: 1 },
  });

  const watchedType = watch('billType');
  useEffect(() => { setBillType(watchedType); }, [watchedType]);

  const onSubmit = async (data: BillFormData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('billType', data.billType);
      formData.append('name', data.name);
      formData.append('amount', String(data.amount));
      formData.append('dueDay', String(data.dueDay));
      formData.append('accountId', data.accountId);
      if (data.notes) formData.append('notes', data.notes);
      if (data.billType === 'INSTALLMENT') {
        formData.append('totalAmount', String(data.totalAmount));
        formData.append('totalMonths', String(data.totalMonths));
        formData.append('startDate', data.startDate!);
      }
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
      <button onClick={() => { reset(); setIsOpen(true); }} className="active-scale" style={{
        width: 40, height: 40, display: 'grid', placeItems: 'center',
        borderRadius: 12, border: 'none', cursor: 'pointer',
        background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
      }}><Plus size={20} /></button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Tambah Tagihan">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 10 }}>
              Tipe Tagihan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 cursor-pointer p-3 active-scale" style={{
                borderRadius: 12, border: billType === 'MONTHLY' ? '0.5px solid rgba(255,159,10,0.5)' : '0.5px solid rgba(255,255,255,0.08)',
                background: billType === 'MONTHLY' ? 'rgba(255,159,10,0.1)' : 'rgba(255,255,255,0.04)',
              }}>
                <input type="radio" value="MONTHLY" {...register('billType')} style={{ accentColor: '#FF9F0A' }} />
                <Receipt size={14} style={{ color: '#FF9F0A', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>Bulanan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 active-scale" style={{
                borderRadius: 12, border: billType === 'INSTALLMENT' ? '0.5px solid rgba(10,132,255,0.5)' : '0.5px solid rgba(255,255,255,0.08)',
                background: billType === 'INSTALLMENT' ? 'rgba(10,132,255,0.1)' : 'rgba(255,255,255,0.04)',
              }}>
                <input type="radio" value="INSTALLMENT" {...register('billType')} style={{ accentColor: '#0A84FF' }} />
                <CalendarClock size={14} style={{ color: '#0A84FF', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>Cicilan</span>
              </label>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Nama Tagihan</label>
            <input {...register('name')} placeholder={billType === 'MONTHLY' ? 'Listrik PLN, Internet, dll...' : 'Cicilan Motor, KPR, dll...'} className="input w-full" />
            {errors.name && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                {billType === 'INSTALLMENT' ? 'Per Bulan' : 'Jumlah'}
              </label>
              <input {...register('amount')} placeholder="0" type="number" className="input w-full" />
              {errors.amount && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.amount.message}</p>}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Tgl Jatuh Tempo</label>
              <input {...register('dueDay')} placeholder="1-31" type="number" min="1" max="31" className="input w-full" />
              {errors.dueDay && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.dueDay.message}</p>}
            </div>
          </div>

          {billType === 'INSTALLMENT' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Total Pinjaman</label>
                  <input {...register('totalAmount')} placeholder="0" type="number" className="input w-full" />
                  {errors.totalAmount && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.totalAmount.message}</p>}
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Lama (Bulan)</label>
                  <input {...register('totalMonths')} placeholder="24" type="number" min="1" className="input w-full" />
                  {errors.totalMonths && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.totalMonths.message}</p>}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Mulai Cicilan</label>
                <input {...register('startDate')} type="date" className="input w-full" />
                {errors.startDate && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.startDate.message}</p>}
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Rekening Pembayaran</label>
            <select {...register('accountId')} className="input w-full">
              <option value="">Pilih Rekening</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {errors.accountId && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.accountId.message}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsOpen(false)} className="active-scale" style={{
              flex: 1, padding: '12px 16px', borderRadius: 14,
              background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>Batal</button>
            <button type="submit" disabled={isLoading} className="active-scale" style={{
              flex: 1, padding: '12px 16px', borderRadius: 14,
              border: 'none', cursor: 'pointer',
              background: '#FF9F0A', color: '#fff', fontSize: 13, fontWeight: 600,
              opacity: isLoading ? 0.5 : 1,
            }}>{isLoading ? 'Menyimpan...' : 'Tambah Tagihan'}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
