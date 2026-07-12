'use client';
import { useState } from 'react';
import { deleteCar } from '@/lib/actions';

type CarData = { id: string; name: string; debts?: { id: string; remainingAmount: number }[] };

export function DeleteCarButton({ car }: { car: CarData }) {
  const [loading, setLoading] = useState(false);
  const totalDebt = car.debts?.filter(d => d.remainingAmount > 0).reduce((a, d) => a + Number(d.remainingAmount), 0) || 0;

  return (
    <form action={deleteCar} onSubmit={async (e) => {
      let msg = `Batal beli ${car.name}?\n\nSemua uang yang sudah dibayarkan akan dikembalikan ke rekening.\n`;
      if (totalDebt > 0) msg += `Hutang sisa Rp ${new Intl.NumberFormat('id-ID').format(totalDebt)} akan dihapus.\n`;
      msg += `\nMobil akan dihapus dari daftar.`;
      if (!confirm(msg)) { e.preventDefault(); return; }
      setLoading(true);
      // Form submits via server action - loading removes on re-render
      setTimeout(() => setLoading(false), 5000);
    }}>
      <input type="hidden" name="id" value={car.id} />
      <button 
        type="submit" 
        disabled={loading}
        className="btn btn-ghost btn-outline w-full text-rose-300"
        style={{ opacity: loading ? 0.5 : 1 }}
      >
        {loading ? 'Memproses...' : 'Hapus & Kembalikan Saldo'}
      </button>
    </form>
  );
}
