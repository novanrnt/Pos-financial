import clsx from 'clsx';
export const cn = (...v: Array<string | false | null | undefined>) => clsx(v);
export const rupiah = (value: number | string | { toString(): string } | null | undefined) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
};
export const ym = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
export const toNumber = (v: unknown) => Number(String(v ?? '0').replace(/[^0-9.-]/g, '')) || 0;
export const todayInput = () => new Date().toISOString().slice(0,10);
