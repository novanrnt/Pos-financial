'use client';
import { deleteBill } from '@/lib/actions';
import { Trash2 } from 'lucide-react';

export function DeleteBillButton({ billId, name }: { billId: string; name: string }) {
  return (
    <form action={deleteBill}>
      <input type="hidden" name="id" value={billId} />
      <button
        type="submit"
        className="shrink-0 w-9 h-9 rounded-full grid place-items-center text-white/25 hover:text-rose-400 transition-colors active-scale"
        onClick={(e) => { if (!confirm(`Hapus tagihan "${name}"? Riwayat pembayaran yang sudah ada tetap tersimpan di transaksi.`)) e.preventDefault(); }}
        aria-label={`Hapus tagihan ${name}`}
      >
        <Trash2 size={16} />
      </button>
    </form>
  );
}
