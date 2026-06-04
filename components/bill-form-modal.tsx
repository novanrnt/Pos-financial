'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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

  const modal = isOpen ? (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }} onClick={() => setIsOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div style={{
          background: 'rgba(255,255,255,0.15)', WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          backdropFilter: 'blur(40px) saturate(200%)',
          border: '0.5px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          borderRadius: 24, padding: 20, width: '100%', maxWidth: 420,
        }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2" style={{ fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: '-0.2px', margin: 0 }}>
              <Plus size={18} style={{ color: '#FF9F0A' }} /> Tambah Tagihan
            </h2>
            <button onClick={() => setIsOpen(false)} className="active-scale" style={{
              width: 32, height: 32, display: 'grid', placeItems: 'center',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
            }}><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Nama Tagihan</label>
              <input {...register('name')} placeholder="Listrik PLN, Internet, dll..." className="input w-full" />
              {errors.name && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Jumlah</label>
                <input {...register('amount')} placeholder="0" type="number" className="input w-full" />
                {errors.amount && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.amount.message}</p>}
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Tgl Jatuh Tempo</label>
                <input {...register('dueDay')} placeholder="1-31" type="number" min="1" max="31" className="input w-full" />
                {errors.dueDay && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.dueDay.message}</p>}
              </div>
            </div>
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
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <button onClick={() => { reset(); setIsOpen(true); }} className="active-scale" style={{
        width: 40, height: 40, display: 'grid', placeItems: 'center',
        borderRadius: 12, border: 'none', cursor: 'pointer',
        background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
      }}><Plus size={20} /></button>
      {mounted && createPortal(modal, document.body)}
    </>
  );
}
