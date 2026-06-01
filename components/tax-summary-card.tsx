'use client';

import { formatRupiah } from '@/lib/tax-calculations';

interface TaxSummaryCardProps {
  pphDue: number;
  status: 'kurang_bayar' | 'lebih_bayar' | 'nihil';
  year: number;
  ptkpStatus: string;
}

export function TaxSummaryCard({
  pphDue,
  status,
  year,
  ptkpStatus,
}: TaxSummaryCardProps) {
  const statusConfig = {
    kurang_bayar: {
      label: 'Kurang Bayar',
      color: 'from-red-500/20 to-red-600/20',
      textColor: 'text-red-300',
      badgeColor: 'bg-red-500/30 text-red-200',
    },
    lebih_bayar: {
      label: 'Lebih Bayar',
      color: 'from-green-500/20 to-green-600/20',
      textColor: 'text-green-300',
      badgeColor: 'bg-green-500/30 text-green-200',
    },
    nihil: {
      label: 'Nihil',
      color: 'from-blue-500/20 to-blue-600/20',
      textColor: 'text-blue-300',
      badgeColor: 'bg-blue-500/30 text-blue-200',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`glass-premium rounded-3xl p-8 border border-white/10 bg-gradient-to-br ${config.color}`}
    >
      <div className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white">Estimasi PPh</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.badgeColor}`}>
            {config.label}
          </span>
        </div>

        {/* PPh Amount */}
        <div className="space-y-1">
          <p className={`text-4xl font-black ${config.textColor}`}>
            {formatRupiah(Math.abs(pphDue))}
          </p>
          <p className="text-sm text-white/60">
            {status === 'kurang_bayar' && 'Jumlah yang harus dibayarkan'}
            {status === 'lebih_bayar' && 'Jumlah yang dapat diklaim kembali'}
            {status === 'nihil' && 'Tidak ada kewajiban pajak'}
          </p>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-xs text-white/60 mb-1">Tahun Pajak</p>
            <p className="text-lg font-semibold text-white">{year}</p>
          </div>
          <div>
            <p className="text-xs text-white/60 mb-1">Status PTKP</p>
            <p className="text-lg font-semibold text-white">{ptkpStatus}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
