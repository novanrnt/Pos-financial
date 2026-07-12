'use client';
import { deleteCar } from '@/lib/actions';

type CarData = { id: string; name: string; debts?: { id: string; remainingAmount: number }[] };

export function DeleteCarButton({ car }: { car: CarData }) {
  const totalDebt = car.debts?.filter(d => d.remainingAmount > 0).reduce((a, d) => a + Number(d.remainingAmount), 0) || 0;

  return (
    <form action={deleteCar} onSubmit={(e) => {
      let msg = `Batal beli ${car.name}?\n\nSemua uang yang sudah dibayarkan akan dikembalikan ke rekening asal.\n`;
      if (totalDebt > 0) msg += `Hutang sisa Rp ${new Intl.NumberFormat('id-ID').format(totalDebt)} akan dihapus.\n`;
      msg += `\nMobil akan dihapus dari daftar.`;
      if (!confirm(msg)) { e.preventDefault(); }
    }}>
      <input type="hidden" name="id" value={car.id} />
      <button className="btn btn-ghost btn-outline w-full text-rose-300">
        Hapus & Kembalikan Saldo
      </button>
    </form>
  );
}
