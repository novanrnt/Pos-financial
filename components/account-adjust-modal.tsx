'use client';
import { useState, useEffect, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Scale, X } from 'lucide-react';
import { adjustAccount } from '@/lib/actions';
import { rupiah, todayInput } from '@/lib/utils';

export function AccountAdjustModal({ account }: { account: { id: string; name: string; balance: number } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await adjustAccount(new FormData(e.currentTarget));
      setIsOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menyesuaikan saldo');
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
              <Scale size={18} style={{ color: '#FF9F0A' }} /> Sesuaikan Saldo
            </h2>
            <button onClick={() => setIsOpen(false)} className="active-scale" style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}><X size={18} /></button>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>{account.name} • Saldo saat ini {rupiah(account.balance)}</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <input type="hidden" name="id" value={account.id} />
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Saldo Baru</label>
              <input name="balance" type="number" defaultValue={account.balance} className="input w-full" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Tanggal</label>
              <input name="date" type="date" defaultValue={todayInput()} className="input w-full" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Catatan (opsional)</label>
              <input name="note" placeholder="Mis. koreksi sesuai rekening koran" className="input w-full" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setIsOpen(false)} className="active-scale" style={{ flex: 1, padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Batal</button>
              <button type="submit" disabled={isLoading} className="active-scale" style={{ flex: 1, padding: '12px 16px', borderRadius: 14, border: 'none', cursor: 'pointer', background: '#FF9F0A', color: '#fff', fontSize: 13, fontWeight: 600, opacity: isLoading ? 0.5 : 1 }}>{isLoading ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="shrink-0 grid h-8 w-8 place-items-center rounded-xl active-scale text-white/40 hover:text-[#FF9F0A] transition-colors" style={{ background: 'rgba(255,255,255,0.06)' }} aria-label="Sesuaikan saldo">
        <Scale size={14} />
      </button>
      {mounted && createPortal(modal, document.body)}
    </>
  );
}
