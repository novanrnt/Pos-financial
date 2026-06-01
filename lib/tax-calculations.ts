// PTKP values mapping
export const PTKP_VALUES: Record<string, number> = {
  'TK/0': 54_000_000,
  'TK/1': 58_500_000,
  'TK/2': 63_000_000,
  'TK/3': 67_500_000,
  'K/0': 58_500_000,
  'K/1': 63_000_000,
  'K/2': 67_500_000,
  'K/3': 72_000_000,
};

// Progressive tax brackets
export const TAX_BRACKETS = [
  { min: 0, max: 60_000_000, rate: 0.05 },
  { min: 60_000_000, max: 250_000_000, rate: 0.15 },
  { min: 250_000_000, max: 500_000_000, rate: 0.25 },
  { min: 500_000_000, max: 5_000_000_000, rate: 0.30 },
  { min: 5_000_000_000, max: Infinity, rate: 0.35 },
];

export interface TaxBreakdownItem {
  layer: string;
  rate: number;
  taxableAmount: number;
  tax: number;
}

export interface ProgressiveTaxResult {
  totalTax: number;
  breakdown: TaxBreakdownItem[];
}

export interface UMKMTaxResult {
  totalTax: number;
  basis: number;
}

export type TaxStatus = 'kurang_bayar' | 'lebih_bayar' | 'nihil';

/**
 * Calculate PTKP value based on status
 */
export function calculatePTKP(ptkpStatus: string): number {
  return PTKP_VALUES[ptkpStatus] || 0;
}

/**
 * Calculate net income
 */
export function calculateNetIncome(
  totalIncome: number,
  totalExpense: number
): number {
  return Math.max(0, totalIncome - totalExpense);
}

/**
 * Calculate PKP (Penghasilan Kena Pajak)
 */
export function calculatePKP(netIncome: number, ptkp: number): number {
  return Math.max(0, netIncome - ptkp);
}

/**
 * Calculate progressive tax for given PKP
 */
export function calculateProgressiveTax(pkp: number): ProgressiveTaxResult {
  const breakdown: TaxBreakdownItem[] = [];
  let totalTax = 0;
  let remainingPKP = pkp;

  for (const bracket of TAX_BRACKETS) {
    if (remainingPKP <= 0) {
      breakdown.push({
        layer: `${bracket.min.toLocaleString('id-ID')} - ${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString('id-ID')}`,
        rate: bracket.rate * 100,
        taxableAmount: 0,
        tax: 0,
      });
      continue;
    }

    const bracketSize = bracket.max === Infinity ? remainingPKP : bracket.max - bracket.min;
    const taxableInBracket = Math.min(remainingPKP, bracketSize);
    const taxInBracket = taxableInBracket * bracket.rate;

    breakdown.push({
      layer: `${bracket.min.toLocaleString('id-ID')} - ${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString('id-ID')}`,
      rate: bracket.rate * 100,
      taxableAmount: taxableInBracket,
      tax: taxInBracket,
    });

    totalTax += taxInBracket;
    remainingPKP -= taxableInBracket;
  }

  return { totalTax, breakdown };
}

/**
 * Calculate UMKM final tax (0.5%)
 */
export function calculateUMKMFinalTax(bruto: number): UMKMTaxResult {
  const totalTax = bruto * 0.005;
  return { totalTax, basis: bruto };
}

/**
 * Calculate tax status
 */
export function calculateTaxStatus(taxDue: number, taxPaid: number): TaxStatus {
  const difference = taxDue - taxPaid;
  if (difference > 0) return 'kurang_bayar';
  if (difference < 0) return 'lebih_bayar';
  return 'nihil';
}

/**
 * Calculate difference between tax due and tax paid
 */
export function calculateTaxDifference(taxDue: number, taxPaid: number): number {
  return taxDue - taxPaid;
}

/**
 * Format currency to Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
