'use client';
import { useState } from 'react';
import { deleteCar } from '@/lib/actions';

type CarData = {
  id: string;
  name: string;
  accountId?: string;
  dpAmount?: number;
  debts?: { id: string; remainingAmount: number }[];
};

type Account = { id: string; name: string };

export function DeleteCarButton({ car, accounts }: { car: CarData; accounts: Account[] }) {
  const [showForm, setShowForm] = useState(false);
  const [returnAmount, setReturnAmount] = useState(String(car.dpAmount || 0));
  const [returnAccount, setReturnAccount] = useState(car.accountId || accounts[0]?.id || '');

  const hasDebts = car.debts && car.debts.length > 0;
  const totalDebt = car.debts?.reduce((a, d) => a + Number(d.remainingAmount), 0) || 0;

  if (!showForm) {
    return (
      <button
        className="btn btn-ghost btn-outline w-full text-rose-300"
        onClick={() => setShowForm(true)}
      >
        {car.dpAmount ? 'Batal & Kembalikan DP' : 'Hapus'}
      </button>
    );
  }

  return (
    <form action={deleteCar} onSubmit={(e) => {
      let msg = `Batal beli ${car.name}?\n\n`;
      const amt = Number(returnAmount);
      if (amt > 0) msg += `Rp ${new Intl.NumberFormat('id-ID').format(amt)} akan dikembalikan ke rekening terpilih.\n`;
      if (hasDebts) msg += `Hutang Rp ${new Intl.NumberFormat('id-ID').format(totalDebt)} akan dihapus.\n`;
      msg += `\nMobil akan dihapus dari daftar.`;
      if (!confirm(msg)) { e.preventDefault(); return; }
    }}>
      <input type="hidden" name="id" value={car.id} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
        <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: 0 }}>
          Kembalikan DP
        </p>
        
        <select 
          value={returnAccount}
          onChange={e => setReturnAccount(e.target.value)}
          name="accountId"
          style={{
            background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none'
          }}
        >
          <option value="">Pilih rekening</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        
        <input
          type="number"
          name="dpAmount"
          value={returnAmount}
          onChange={e => setReturnAmount(e.target.value)}
          placeholder="Nominal DP yang dikembalikan"
          style={{
            background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none'
          }}
        />
      </div>

      <button type="submit" className="btn btn-ghost btn-outline w-full text-rose-300">
        Konfirmasi Hapus
      </button>
      
      <button 
        type="button" 
        className="btn btn-ghost btn-outline w-full"
        onClick={() => setShowForm(false)}
        style={{ marginTop: 4, opacity: 0.6 }}
      >
        Batal
      </button>
    </form>
  );
}
