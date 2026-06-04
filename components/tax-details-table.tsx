'use client';

import { formatRupiah } from '@/lib/tax-calculations';

interface TableRow {
  label: string;
  value: number;
  highlight?: boolean;
}

interface TaxDetailsTableProps {
  title: string;
  rows: TableRow[];
  type?: 'summary' | 'income' | 'expense' | 'breakdown';
}

export function TaxDetailsTable({
  title,
  rows,
  type = 'summary',
}: TaxDetailsTableProps) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)', borderRadius: 16,
      border: '0.5px solid rgba(255,255,255,0.08)', padding: 16,
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16, letterSpacing: '-0.2px' }}>{title}</h3>
      <div className="overflow-x-auto">
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} style={{
                background: row.highlight ? 'rgba(255,255,255,0.04)' : 'transparent',
                borderTop: '0.5px solid rgba(255,255,255,0.05)',
              }}>
                <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                  {row.label}
                </td>
                <td style={{
                  padding: '10px 12px', textAlign: 'right', fontWeight: 600,
                  color: row.highlight ? '#fff' : 'rgba(255,255,255,0.8)'
                }}>
                  {type === 'breakdown' && typeof row.value === 'number'
                    ? `${(row.value * 100).toFixed(1)}%`
                    : formatRupiah(row.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
