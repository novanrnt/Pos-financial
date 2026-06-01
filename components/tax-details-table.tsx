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
    <div className="soft-card rounded-2xl p-4 border border-premium-border-soft space-y-4">
      <h3 className="text-lg font-black text-white">{title}</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-white/10">
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={`${
                  row.highlight ? 'bg-white/5' : ''
                } hover:bg-white/5 transition-colors`}
              >
                <td className="py-3 px-4 text-white/80 font-medium">
                  {row.label}
                </td>
                <td className={`py-3 px-4 text-right font-semibold ${
                  row.highlight ? 'text-white' : 'text-white/90'
                }`}>
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
