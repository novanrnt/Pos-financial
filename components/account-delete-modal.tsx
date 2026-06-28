'use client';
import { useState, useEffect, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, X } from 'lucide-react';
import { deleteAccount, mergeAccount } from '@/lib/actions';
import { rupiah } from '@/lib/utils';

export function AccountDeleteModal({ account, otherAccounts }: { account: { id: string; name: string; balance: number }; otherAccounts: { id: string; name: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const fd = new FormData(e.currentTarget);
      if (otherAccounts.length > 0) await mergeAccount(fd);
      else await deleteAccount(fd);
      setIsOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus rekening');
    } finally {
      setIsLoading(false);
    }
  };

  const modal = isOpen ? (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }} onClick={() => setIsOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div style={{ background: 'rgba(255,255,255,0.15)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', backdropFilter: 'blur(40px) saturate(200%)', border: '0.5px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)', borderRadius: 24, padding: 20, width: '100%', maxWidth: 420 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2" style={{ fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: '-0.2px', margin: 0 }}>
              <Trash2 size={18} style={{ color: '#FF453A' }} /> Hapus Rekening
            </h2>
            <button onClick={() => setIsOpen(false)} className="active-scale" style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}><X size={18} /></button>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Hapus <b style={{ color: '#fff' }}>{account.name}</b> (saldo {rupiah(account.balance)}).</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <input type="hidden" name="id" value={account.id} />
            {otherAccounts.length > 0 ? (
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Pindahkan saldo & transaksi ke</label>
                <select name="targetAccountId" className="input w-full" defaultValue={otherAccounts[0]?.id}>
                  {otherAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>Semua transaksi, tagihan, hutang, cicilan, biaya mobil, & saldo dipindah ke rekening tujuan lalu rekening ini dihapus.</p>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Ini satu-satunya rekening. Hapus langsung hanya berhasil jika rekening kosong (tanpa transaksi/tagihan).</p>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setIsOpen(false)} className="active-scale" style={{ flex: 1, padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Batal</button>
              <button type="submit" disabled={isLoading} className="active-scale" style={{ flex: 1, padding: '12px 16px', borderRadius: 14, border: 'none', cursor: 'pointer', background: '#FF453A', color: '#fff', fontSize: 13, fontWeight: 600, opacity: isLoading ? 0.5 : 1 }}>{isLoading ? 'Memproses...' : otherAccounts.length > 0 ? 'Gabungkan & Hapus' : 'Hapus Rekening'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="shrink-0 grid h-8 w-8 place-items-center rounded-xl active-scale text-white/40 hover:text-[#FF453A] transition-colors" style={{ background: 'rgba(255,255,255,0.06)' }} aria-label="Hapus rekening">
        <Trash2 size={14} />
      </button>
      {mounted && createPortal(modal, document.body)}
    </>
  );
}
