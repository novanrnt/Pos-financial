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
    kurang_bayar: { label: 'Kurang Bayar', color: '#FF453A', bg: 'rgba(255,69,58,0.12)' },
    lebih_bayar: { label: 'Lebih Bayar', color: '#30D158', bg: 'rgba(48,209,88,0.12)' },
    nihil: { label: 'Nihil', color: '#0A84FF', bg: 'rgba(10,132,255,0.12)' },
  };
  const config = statusConfig[status];

  return (
    <div style={{
      background: config.bg,
      border: `0.5px solid ${config.color}25`,
      borderRadius: 24, padding: 24,
      WebkitBackdropFilter: 'blur(40px) saturate(200%)',
      backdropFilter: 'blur(40px) saturate(200%)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
    }}>
      <div className="flex items-center justify-between mb-6">
        <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: '-0.2px', margin: 0 }}>Estimasi PPh</h3>
        <span style={{
          padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          background: config.bg, color: config.color, border: `0.5px solid ${config.color}30`,
        }}>{config.label}</span>
      </div>

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 32, fontWeight: 700, color: config.color, letterSpacing: '-0.5px', margin: '0 0 4px 0' }}>
          {formatRupiah(Math.abs(pphDue))}
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          {status === 'kurang_bayar' && 'Jumlah yang harus dibayarkan'}
          {status === 'lebih_bayar' && 'Jumlah yang dapat diklaim kembali'}
          {status === 'nihil' && 'Tidak ada kewajiban pajak'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
        <div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '0 0 2px 0' }}>Tahun Pajak</p>
          <p style={{ fontSize: 17, fontWeight: 600, color: '#fff', margin: 0 }}>{year}</p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '0 0 2px 0' }}>Status PTKP</p>
          <p style={{ fontSize: 17, fontWeight: 600, color: '#fff', margin: 0 }}>{ptkpStatus}</p>
        </div>
      </div>
    </div>
  );
}
