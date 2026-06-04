'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import { addSavingsGoal } from '@/lib/actions';

const savingsSchema = z.object({
  name: z.string().min(1, 'Nama goal wajib diisi'),
  targetAmount: z.coerce.number().positive('Target harus lebih dari 0'),
  deadline: z.string().optional(),
  notes: z.string().optional(),
});

type SavingsFormData = z.infer<typeof savingsSchema>;

export function SavingsGoalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SavingsFormData>({
    resolver: zodResolver(savingsSchema),
  });

  const onSubmit = async (data: SavingsFormData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('targetAmount', String(data.targetAmount));
      if (data.deadline) formData.append('deadline', data.deadline);
      if (data.notes) formData.append('notes', data.notes);
      await addSavingsGoal(formData);
      reset(); setIsOpen(false);
    } catch (error) {
      console.error('Error adding savings goal:', error);
    } finally { setIsLoading(false); }
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
              <Plus size={18} style={{ color: '#30D158' }} /> Buat Goal Tabungan
            </h2>
            <button onClick={() => setIsOpen(false)} className="active-scale" style={{
              width: 32, height: 32, borderRadius: 10, display: 'grid', placeItems: 'center',
              border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
            }}><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Nama Goal</label>
              <input {...register('name')} placeholder="Contoh: DP Rumah, Liburan Bali..." className="input w-full" />
              {errors.name && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.name.message}</p>}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Target Nominal</label>
              <input {...register('targetAmount')} placeholder="0" type="number" className="input w-full" />
              {errors.targetAmount && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.targetAmount.message}</p>}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Deadline (Opsional)</label>
              <input {...register('deadline')} type="date" className="input w-full" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Catatan (Opsional)</label>
              <input {...register('notes')} placeholder="Catatan..." className="input w-full" />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setIsOpen(false)} className="active-scale" style={{
                flex: 1, padding: '12px 16px', borderRadius: 14,
                background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>Batal</button>
              <button type="submit" disabled={isLoading} className="active-scale" style={{
                flex: 1, padding: '12px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: '#30D158', color: '#000', fontSize: 13, fontWeight: 600, opacity: isLoading ? 0.5 : 1,
              }}>{isLoading ? 'Menyimpan...' : 'Buat Goal'}</button>
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
