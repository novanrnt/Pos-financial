'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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

  const modal = isOpen ? (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }} onClick={() => setIsOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          backdropFilter: 'blur(40px) saturate(200%)',
          border: '0.5px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          borderRadius: 24, padding: 20, width: '100%', maxWidth: 420,
          maxHeight: '90vh', overflowY: 'auto',
        }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2" style={{ fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: '-0.2px', margin: 0 }}>
              <Plus size={18} style={{ color: '#BF5AF2' }} /> Tambah Hutang/Piutang
            </h2>
            <button onClick={() => setIsOpen(false)} className="active-scale" style={{
              width: 32, height: 32, display: 'grid', placeItems: 'center',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
            }}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 10 }}>
                Tipe
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-3 cursor-pointer p-4 active-scale" style={{
                  borderRadius: 14, border: '0.5px solid rgba(255,69,58,0.3)',
                  background: 'rgba(255,255,255,0.04)',
                }}>
                  <input type="radio" value="DEBT" {...register('type')} style={{ accentColor: '#FF453A' }} />
                  <div className="flex items-center gap-2">
                    <ArrowDownRight size={16} style={{ color: '#FF453A' }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Hutang</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-4 active-scale" style={{
                  borderRadius: 14, border: '0.5px solid rgba(48,209,88,0.3)',
                  background: 'rgba(255,255,255,0.04)',
                }}>
                  <input type="radio" value="RECEIVABLE" {...register('type')} style={{ accentColor: '#30D158' }} />
                  <div className="flex items-center gap-2">
                    <ArrowUpRight size={16} style={{ color: '#30D158' }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Piutang</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Nama Pihak</label>
              <input {...register('name')} placeholder="Nama orang/institusi" className="input w-full" />
              {errors.name && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Nominal</label>
                <input {...register('amount')} placeholder="0" type="number" className="input w-full" />
                {errors.amount && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.amount.message}</p>}
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Jatuh Tempo</label>
                <input {...register('dueDate')} type="date" className="input w-full" />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Rekening Terkait</label>
              <select {...register('accountId')} className="input w-full">
                <option value="">Pilih Rekening (Opsional)</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Catatan (Opsional)</label>
              <textarea {...register('notes')} placeholder="Catatan tambahan..." className="input w-full" rows={3} />
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
                background: '#BF5AF2', color: '#fff', fontSize: 13, fontWeight: 600,
                opacity: isLoading ? 0.5 : 1,
              }}>{isLoading ? 'Menyimpan...' : 'Tambah'}</button>
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
      }}>
        <Plus size={20} />
      </button>
      {mounted && createPortal(modal, document.body)}
    </>
  );
}
