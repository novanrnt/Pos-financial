'use client';
import { deleteCar } from '@/lib/actions';

type CarData = {
  id: string;
  name: string;
  accountId?: string;
  dpAmount?: number;
  debts?: { id: string; remainingAmount: number }[];
};

export function DeleteCarButton({ car }: { car: CarData }) {
  const hasDebts = car.debts && car.debts.length > 0;
  const hasDP = car.dpAmount && car.dpAmount > 0;
  const totalDebt = car.debts?.reduce((a, d) => a + Number(d.remainingAmount), 0) || 0;

  return (
    <form action={deleteCar}>
      <input type="hidden" name="id" value={car.id} />
      {car.accountId && <input type="hidden" name="accountId" value={car.accountId} />}
      {hasDP && <input type="hidden" name="dpAmount" value={car.dpAmount} />}
      
      <button
        className="btn btn-ghost btn-outline w-full text-rose-300"
        onClick={(e) => {
          let msg = `Batal beli ${car.name}?\n\n`;
          if (hasDP) msg += `DP Rp ${new Intl.NumberFormat('id-ID').format(car.dpAmount!)} akan dikembalikan ke rekening.\n`;
          if (hasDebts) msg += `Hutang Rp ${new Intl.NumberFormat('id-ID').format(totalDebt)} akan dihapus.\n`;
          msg += `\nMobil akan dihapus dari daftar.`;
          if (!confirm(msg)) e.preventDefault();
        }}
      >
        {hasDP ? 'Batal & Kembalikan DP' : 'Hapus'}
      </button>
    </form>
  );
}
