'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { addCategory } from '@/lib/actions';

const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().default('emerald'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export function CategoryFormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { type: 'INCOME', color: 'emerald' },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('type', data.type);
      formData.append('color', data.color);
      await addCategory(formData);
      reset(); setIsOpen(false);
    } catch (error) {
      console.error('Error adding category:', error);
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
              <Plus size={18} style={{ color: '#BF5AF2' }} /> Tambah Kategori
            </h2>
            <button onClick={() => setIsOpen(false)} className="active-scale" style={{
              width: 32, height: 32, borderRadius: 10, display: 'grid', placeItems: 'center',
              border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
            }}><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Nama Kategori</label>
              <input {...register('name')} placeholder="Gaji, Makanan, Transport, dll..." className="input w-full" />
              {errors.name && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.name.message}</p>}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Tipe Kategori</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-3 cursor-pointer p-4 active-scale" style={{
                  borderRadius: 14, border: '0.5px solid rgba(48,209,88,0.3)', background: 'rgba(255,255,255,0.04)',
                }}>
                  <input type="radio" value="INCOME" {...register('type')} style={{ accentColor: '#30D158' }} />
                  <div className="flex items-center gap-2">
                    <ArrowUpRight size={16} style={{ color: '#30D158' }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Pemasukan</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-4 active-scale" style={{
                  borderRadius: 14, border: '0.5px solid rgba(255,69,58,0.3)', background: 'rgba(255,255,255,0.04)',
                }}>
                  <input type="radio" value="EXPENSE" {...register('type')} style={{ accentColor: '#FF453A' }} />
                  <div className="flex items-center gap-2">
                    <ArrowDownRight size={16} style={{ color: '#FF453A' }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Pengeluaran</span>
                  </div>
                </label>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Warna (Opsional)</label>
              <select {...register('color')} className="input w-full">
                <option value="emerald">Emerald</option>
                <option value="blue">Blue</option>
                <option value="violet">Violet</option>
                <option value="rose">Rose</option>
                <option value="orange">Orange</option>
                <option value="cyan">Cyan</option>
                <option value="green">Green</option>
              </select>
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
              }}>{isLoading ? 'Menyimpan...' : 'Tambah Kategori'}</button>
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
