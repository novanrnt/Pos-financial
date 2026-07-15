'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Wallet, Bot, Plus } from 'lucide-react';
import { addTransaction } from '@/lib/actions';

const tabs = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'State', href: '/reports', icon: BarChart3 },
  { label: 'Wallet', href: '/accounts', icon: Wallet },
  { label: 'Chatbot', href: '/chat', icon: Bot },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const [showAdd, setShowAdd] = useState(false);

  if (showAdd) {
    return <AddTransactionModal onClose={() => setShowAdd(false)} />;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-[calc(8px+env(safe-area-inset-bottom))] pt-2"
      style={{ pointerEvents: 'none' }}>
      <div className="flex items-center justify-around px-2 pt-1 pb-1 rounded-[28px]"
        style={{
          pointerEvents: 'auto',
          width: 'calc(100% - 48px)',
          maxWidth: 380,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(50px) saturate(200%)',
          WebkitBackdropFilter: 'blur(50px) saturate(200%)',
          border: '0.5px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
        {/* Left 2 tabs */}
        {tabs.slice(0, 2).map(tab => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link key={tab.href} href={tab.href}
              className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-[16px] transition-all active-scale"
              style={{ minWidth: 48, background: active ? 'rgba(48,209,88,0.15)' : 'transparent' }}>
              <Icon size={22} style={{ color: active ? '#30D158' : 'rgba(255,255,255,0.4)' }} />
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.3px', color: active ? '#30D158' : 'rgba(255,255,255,0.3)' }}>
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* Center FAB */}
        <button onClick={() => setShowAdd(true)}
          className="active-scale"
          style={{
            width: 54, height: 54, borderRadius: 27,
            background: '#30D158', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: -24,
            boxShadow: '0 4px 16px rgba(48,209,88,0.4)',
          }}>
          <Plus size={26} style={{ color: '#FFFFFF' }} />
        </button>

        {/* Right 2 tabs */}
        {tabs.slice(2, 4).map(tab => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link key={tab.href} href={tab.href}
              className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-[16px] transition-all active-scale"
              style={{ minWidth: 48, background: active ? 'rgba(48,209,88,0.15)' : 'transparent' }}>
              <Icon size={22} style={{ color: active ? '#30D158' : 'rgba(255,255,255,0.4)' }} />
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.3px', color: active ? '#30D158' : 'rgba(255,255,255,0.3)' }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function AddTransactionModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target as HTMLFormElement);
    await addTransaction(fd);
    window.location.reload();
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end',
      justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: 16, paddingBottom: 120,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 400, borderRadius: 20, overflow: 'hidden',
        background: '#1C1C1E', color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 0' }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>Transaksi Baru</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 18 }}>✕</button>
        </div>
        <form onSubmit={submit} style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['EXPENSE', 'INCOME'].map(t => (
              <button key={t} type="button" onClick={() => setType(t as any)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: type === t ? (t === 'EXPENSE' ? '#FF453A' : '#30D158') : 'rgba(255,255,255,0.08)',
                  color: type === t ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600,
                }}>
                {t === 'EXPENSE' ? '✕ Pengeluaran' : '✓ Pemasukan'}
              </button>
            ))}
          </div>
          <input type="hidden" name="type" value={type} />
          <input name="amount" type="number" required placeholder="Nominal"
            style={{ padding: 12, borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 15, outline: 'none' }} />
          <input name="description" placeholder="Keterangan"
            style={{ padding: 12, borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 15, outline: 'none' }} />
          <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]}
            style={{ padding: 12, borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 15, outline: 'none' }} />
          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: 14, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: loading ? '#555' : '#30D158', color: '#fff', fontSize: 15, fontWeight: 600,
            }}>
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>
    </div>
  );
}
