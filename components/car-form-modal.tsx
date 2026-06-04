'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Car } from 'lucide-react';
import { addCar } from '@/lib/actions';

const carSchema = z.object({
  name: z.string().min(1, 'Nama mobil wajib diisi'),
  brand: z.string().optional(), model: z.string().optional(),
  year: z.coerce.number().optional(), color: z.string().optional(),
  transmission: z.string().optional(), licensePlate: z.string().optional(),
  purchasePrice: z.coerce.number().positive('Harga beli harus lebih dari 0'),
  estimatedSellPrice: z.coerce.number().optional(),
  accountId: z.string().min(1, 'Pilih rekening'),
  myMoney: z.coerce.number().optional(),
  debtName: z.string().optional(), debtAmount: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type CarFormData = z.infer<typeof carSchema>;
type Account = { id: string; name: string };

export function CarFormModal({ accounts }: { accounts: Account[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
  });

  const onSubmit = async (data: CarFormData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) formData.append(k, String(v)); });
      await addCar(formData);
      reset(); setIsOpen(false);
    } catch (error) {
      console.error('Error adding car:', error);
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
          borderRadius: 24, padding: 20, width: '100%', maxWidth: 420, maxHeight: '90vh', overflowY: 'auto',
        }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2" style={{ fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: '-0.2px', margin: 0 }}>
              <Plus size={18} style={{ color: '#0A84FF' }} /> Tambah Mobil
            </h2>
            <button onClick={() => setIsOpen(false)} className="active-scale" style={{
              width: 32, height: 32, borderRadius: 10, display: 'grid', placeItems: 'center',
              border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
            }}><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Nama Mobil</label>
              <input {...register('name')} placeholder="Honda CR-V 2.4 AT 2010" className="input w-full" />
              {errors.name && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.name.message}</p>}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Spesifikasi</label>
              <div className="grid grid-cols-2 gap-2">
                <input {...register('brand')} placeholder="Merek" className="input w-full text-sm" />
                <input {...register('model')} placeholder="Tipe" className="input w-full text-sm" />
                <input {...register('year')} placeholder="Tahun" type="number" className="input w-full text-sm" />
                <input {...register('color')} placeholder="Warna" className="input w-full text-sm" />
                <input {...register('transmission')} placeholder="Transmisi" className="input w-full text-sm" />
                <input {...register('licensePlate')} placeholder="Nopol" className="input w-full text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Harga Beli</label>
                <input {...register('purchasePrice')} placeholder="0" type="number" className="input w-full" />
                {errors.purchasePrice && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.purchasePrice.message}</p>}
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Est. Harga Jual</label>
                <input {...register('estimatedSellPrice')} placeholder="0" type="number" className="input w-full" />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Rekening Pembayaran</label>
              <select {...register('accountId')} className="input w-full">
                <option value="">Pilih rekening</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              {errors.accountId && <p style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>{errors.accountId.message}</p>}
            </div>
            <div style={{ padding: 14, borderRadius: 14, background: 'rgba(48,209,88,0.1)', border: '0.5px solid rgba(48,209,88,0.2)' }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#30D158', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6, margin: '0 0 6px 0' }}>Modal Saya</p>
              <input {...register('myMoney')} placeholder="Uang saya untuk beli mobil" type="number" className="input w-full text-sm" />
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 6, margin: '6px 0 0 0' }}>Nominal ini akan dipotong dari rekening</p>
            </div>
            <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255,69,58,0.1)', border: '0.5px solid rgba(255,69,58,0.2)' }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#FF453A', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6, margin: '0 0 6px 0' }}>Pinjaman (Opsional)</p>
              <input {...register('debtName')} placeholder="Nama pemberi pinjaman" className="input w-full text-sm" />
              <input {...register('debtAmount')} placeholder="Nominal pinjaman" type="number" className="input w-full text-sm mt-2" />
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 6, margin: '6px 0 0 0' }}>Total modal = Uang saya + Pinjaman</p>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Catatan (Opsional)</label>
              <textarea {...register('notes')} placeholder="Catatan tambahan" className="input w-full" rows={3} />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setIsOpen(false)} className="active-scale" style={{
                flex: 1, padding: '12px 16px', borderRadius: 14,
                background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>Batal</button>
              <button type="submit" disabled={isLoading} className="active-scale" style={{
                flex: 1, padding: '12px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: '#0A84FF', color: '#fff', fontSize: 13, fontWeight: 600, opacity: isLoading ? 0.5 : 1,
              }}>{isLoading ? 'Menyimpan...' : 'Tambah Mobil'}</button>
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
