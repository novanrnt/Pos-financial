'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import { addInvestment } from '@/lib/actions';
import { ym } from '@/lib/utils';

const investmentSchema = z.object({
  category: z.string().min(1, 'Pilih kategori'),
  month: z.string().min(1, 'Pilih bulan'),
  balance: z.coerce.number().positive('Saldo harus lebih dari 0'),
  notes: z.string().optional(),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

export function InvestmentFormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: { month: ym() },
  });

  const onSubmit = async (data: InvestmentFormData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('category', data.category);
      formData.append('month', data.month);
      formData.append('balance', String(data.balance));
      if (data.notes) formData.append('notes', data.notes);
      await addInvestment(formData);
      reset({ month: ym() }); setIsOpen(false);
    } catch (error) {
      console.error('Error adding investment:', error);
    } finally { setIsLoading(false); }
  };

  const modal = isOpen ? (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }} onClick={() => setIsOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div style={{
          background: 'rgba(255,255,255,0.08)', WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          backdropFilter: 'blur(40px) saturate(200%)',
          border: '0.5px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          borderRadius: 24, padding: 20, width: '100%', maxWidth: 420,
        }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2" style={{ fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: '-0.2px', margin: 0 }}>
              <Plus size={18} style={{ color: '#BF5AF2' }} /> Update Snapshot
            </h2>
            <button onClick={() => setIsOpen(false)} className="active-scale" style={{
              width: 32, height: 32, borderRadius: 10, display: 'grid', placeItems: 'center',
              border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
            }}><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Kategori</label>
              <select {...register('category')} className="input w-full">
                <option value="">Pilih Kategori</option>
                <option value="Saham">Saham</option>
                <option value="Crypto">Crypto</option>
                <option value="Reksa Dana">Reksa Dana</option>
                <option value="Emas">Emas</option>
                <option value="Properti">Properti</option>
                <option value="R&D / Eksperimen">R&D / Eksperimen</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              {errors.category && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.category.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Bulan</label>
                <input {...register('month')} type="month" className="input w-full" />
                {errors.month && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.month.message}</p>}
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Saldo</label>
                <input {...register('balance')} placeholder="0" type="number" className="input w-full" />
                {errors.balance && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.balance.message}</p>}
              </div>
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
                flex: 1, padding: '12px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: '#BF5AF2', color: '#fff', fontSize: 13, fontWeight: 600, opacity: isLoading ? 0.5 : 1,
              }}>{isLoading ? 'Menyimpan...' : 'Simpan Snapshot'}</button>
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
