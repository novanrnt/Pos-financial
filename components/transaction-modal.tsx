'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { addTransaction } from '@/lib/actions';

export function TransactionModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await addTransaction(fd);
    setLoading(false);
    window.location.reload();
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 420, borderRadius: 20, overflow: 'hidden',
        background: '#1C1C1E', color: '#fff', marginBottom: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <span style={{ fontSize: 17, fontWeight: 600 }}>Transaksi Baru</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '8px 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setType('EXPENSE')}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: type === 'EXPENSE' ? '#FF453A' : 'rgba(255,255,255,0.08)',
                color: '#fff', fontSize: 13, fontWeight: 600, opacity: type === 'EXPENSE' ? 1 : 0.5,
              }}>
              ✕ Pengeluaran
            </button>
            <button type="button" onClick={() => setType('INCOME')}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: type === 'INCOME' ? '#30D158' : 'rgba(255,255,255,0.08)',
                color: '#fff', fontSize: 13, fontWeight: 600, opacity: type === 'INCOME' ? 1 : 0.5,
              }}>
              ✓ Pemasukan
            </button>
          </div>

          <input type="hidden" name="type" value={type} />
          <input name="amount" type="number" required placeholder="Nominal"
            style={{ padding: '12px', borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 15, outline: 'none' }} />
          <input name="description" placeholder="Keterangan"
            style={{ padding: '12px', borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 15, outline: 'none' }} />
          <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]}
            style={{ padding: '12px', borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 15, outline: 'none' }} />

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: loading ? '#555' : '#FF9F0A', color: '#fff', fontSize: 15, fontWeight: 600,
              opacity: loading ? 0.5 : 1,
            }}>
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>
    </div>
  );
}
