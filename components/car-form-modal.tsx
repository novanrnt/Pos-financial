'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Car } from 'lucide-react';
import { addCar } from '@/lib/actions';

type Account = { id: string; name: string };

export function CarFormModal({ accounts }: { accounts: Account[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Form state
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [transmission, setTransmission] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [estimatedSellPrice, setEstimatedSellPrice] = useState('');
  const [accountId, setAccountId] = useState('');
  const [dpAmount, setDpAmount] = useState('');
  const [notes, setNotes] = useState('');

  // Calculate sisa pelunasan
  const harga = Number(purchasePrice) || 0;
  const dp = Number(dpAmount) || 0;
  const sisaPelunasan = harga - dp;
  const isDP = dp > 0 && dp < harga;

  const reset = () => {
    setName(''); setBrand(''); setModel(''); setYear(''); setColor('');
    setTransmission(''); setLicensePlate(''); setPurchasePrice('');
    setEstimatedSellPrice(''); setAccountId(''); setDpAmount(''); setNotes('');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !purchasePrice || !accountId) return;
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('brand', brand);
      formData.append('model', model);
      formData.append('year', year);
      formData.append('color', color);
      formData.append('transmission', transmission);
      formData.append('licensePlate', licensePlate);
      formData.append('purchasePrice', purchasePrice);
      formData.append('estimatedSellPrice', estimatedSellPrice);
      formData.append('accountId', accountId);
      formData.append('myMoney', isDP ? dpAmount : purchasePrice);
      formData.append('notes', notes);
      
      // If DP, create debt for remaining amount
      if (isDP && sisaPelunasan > 0) {
        formData.append('debtName', `Sisa pelunasan ${name}`);
        formData.append('debtAmount', String(sisaPelunasan));
      }
      
      await addCar(formData);
      reset();
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding car:', error);
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

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Nama Mobil</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Honda CR-V 2.4 AT 2010" className="input w-full" required />
            </div>
            
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Spesifikasi</label>
              <div className="grid grid-cols-2 gap-2">
                <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Merek" className="input w-full text-sm" />
                <input value={model} onChange={e => setModel(e.target.value)} placeholder="Tipe" className="input w-full text-sm" />
                <input value={year} onChange={e => setYear(e.target.value)} placeholder="Tahun" type="number" className="input w-full text-sm" />
                <input value={color} onChange={e => setColor(e.target.value)} placeholder="Warna" className="input w-full text-sm" />
                <input value={transmission} onChange={e => setTransmission(e.target.value)} placeholder="Transmisi" className="input w-full text-sm" />
                <input value={licensePlate} onChange={e => setLicensePlate(e.target.value)} placeholder="Nopol" className="input w-full text-sm" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Harga Beli</label>
                <input value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="0" type="number" className="input w-full" required />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Est. Harga Jual</label>
                <input value={estimatedSellPrice} onChange={e => setEstimatedSellPrice(e.target.value)} placeholder="0" type="number" className="input w-full" />
              </div>
            </div>
            
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Rekening Pembayaran</label>
              <select value={accountId} onChange={e => setAccountId(e.target.value)} className="input w-full" required>
                <option value="">Pilih rekening</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            
            {/* DP Section */}
            <div style={{ padding: 14, borderRadius: 14, background: 'rgba(48,209,88,0.1)', border: '0.5px solid rgba(48,209,88,0.2)' }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#30D158', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6, margin: '0 0 6px 0' }}>DP / Uang Muka</p>
              <input 
                value={dpAmount} 
                onChange={e => setDpAmount(e.target.value)} 
                placeholder="Isi jika bayar DP dulu" 
                type="number" 
                className="input w-full text-sm" 
              />
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 6, margin: '6px 0 0 0' }}>
                Kosongkan jika bayar lunas
              </p>
            </div>

            {/* Sisa Pelunasan - Auto calculated */}
            {isDP && (
              <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255,159,10,0.1)', border: '0.5px solid rgba(255,159,10,0.2)' }}>
                <div className="flex justify-between items-center">
                  <p style={{ fontSize: 11, fontWeight: 500, color: '#FF9F0A', letterSpacing: '0.5px', textTransform: 'uppercase', margin: 0 }}>Sisa Pelunasan</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#FF9F0A', margin: 0 }}>
                    Rp {new Intl.NumberFormat('id-ID').format(sisaPelunasan)}
                  </p>
                </div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 6, margin: '6px 0 0 0' }}>
                  Akan tercatat sebagai hutang & bisa dibayar kapan saja
                </p>
              </div>
            )}

            {/* Summary */}
            {harga > 0 && (
              <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8, margin: '0 0 8px 0' }}>Ringkasan</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Harga Mobil</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Rp {new Intl.NumberFormat('id-ID').format(harga)}</span>
                  </div>
                  {isDP && (
                    <>
                      <div className="flex justify-between">
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>DP</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#30D158' }}>- Rp {new Intl.NumberFormat('id-ID').format(dp)}</span>
                      </div>
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }} />
                      <div className="flex justify-between">
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#FF9F0A' }}>Sisa Pelunasan</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#FF9F0A' }}>Rp {new Intl.NumberFormat('id-ID').format(sisaPelunasan)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Catatan (Opsional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan tambahan" className="input w-full" rows={3} />
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
