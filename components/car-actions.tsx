'use client';
import { useState } from 'react';
import { payDebt, sellCar } from '@/lib/actions';
import { rupiah } from '@/lib/utils';

type Account = { id: string; name: string };
type Debt = { id: string; remainingAmount: number };

export function PayDebtForm({ debt, accounts }: { debt: Debt; accounts: Account[] }) {
  const [loading, setLoading] = useState(false);

  return (
    <form action={payDebt} onSubmit={() => setLoading(true)} style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      paddingTop: 12, borderTop: '0.5px solid rgba(255,255,255,0.08)'
    }}>
      <input type="hidden" name="debtId" value={debt.id} />
      <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: 0 }}>
        Bayar DP / Pelunasan
      </p>
      <p style={{ fontSize: 12, color: '#FF9F0A', margin: 0 }}>
        Sisa: <strong>{rupiah(debt.remainingAmount)}</strong>
      </p>
      <select name="accountId" style={{
        background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
      }}>
        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <input name="amount" placeholder="Nominal bayar" type="number" style={{
        background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
      }} required />
      <input name="date" type="date" defaultValue={new Date().toISOString().slice(0,10)} style={{
        background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
      }} />
      <input name="notes" placeholder="Catatan (DP 1, DP 2, dll)" style={{
        background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
      }} />
      <button type="submit" disabled={loading} className="active-scale" style={{
        width: '100%', padding: '10px 16px',
        background: 'rgba(255,159,10,0.2)', border: '0.5px solid rgba(255,159,10,0.3)',
        borderRadius: 14, color: loading ? '#888' : '#FF9F0A', fontSize: 13,
        fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.5 : 1
      }}>
        {loading ? 'Memproses...' : `Bayar Rp ${new Intl.NumberFormat('id-ID').format(debt.remainingAmount)}`}
      </button>
    </form>
  );
}

export function SellCarForm({ carId, accounts }: { carId: string; accounts: Account[] }) {
  const [loading, setLoading] = useState(false);

  return (
    <form action={sellCar} onSubmit={() => setLoading(true)} style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      paddingTop: 12, borderTop: '0.5px solid rgba(255,255,255,0.08)'
    }}>
      <input type="hidden" name="carId" value={carId} />
      <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: 0 }}>Jual Mobil</p>
      <select name="accountId" style={{
        background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
      }}>
        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <input name="sellPrice" placeholder="Harga jual aktual" type="number" style={{
        background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
      }} />
      <input name="date" type="date" defaultValue={new Date().toISOString().slice(0,10)} style={{
        background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '10px 12px', color: '#FFFFFF', fontSize: 13, outline: 'none'
      }} />
      <button type="submit" disabled={loading} className="active-scale" style={{
        width: '100%', padding: '10px 16px',
        background: loading ? '#555' : '#0A84FF', border: 'none',
        borderRadius: 14, color: '#FFFFFF', fontSize: 13,
        fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.5 : 1
      }}>
        {loading ? 'Menjual...' : 'Jual Mobil'}
      </button>
    </form>
  );
}
