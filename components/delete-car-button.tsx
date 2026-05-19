'use client';
import { deleteCar } from '@/lib/actions';

export function DeleteCarButton({ carId }: { carId: string }) {
  return (
    <form action={deleteCar}>
      <input type="hidden" name="id" value={carId} />
      <button
        className="btn btn-ghost btn-outline w-full text-rose-300"
        onClick={(e) => {
          if (!confirm('Hapus mobil ini?')) e.preventDefault();
        }}
      >
        Hapus
      </button>
    </form>
  );
}
