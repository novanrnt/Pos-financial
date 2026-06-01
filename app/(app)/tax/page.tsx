'use client';

import { useState, useEffect } from 'react';
import { TaxSettingsCard } from '@/components/tax-settings-card';
import { TaxSummaryCard } from '@/components/tax-summary-card';
import { TaxDetailsTable } from '@/components/tax-details-table';
import { formatRupiah } from '@/lib/tax-calculations';

interface TaxSummary {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  ptkp: number;
  pkp: number;
  pphDue: number;
  taxPaid: number;
  difference: number;
  status: 'kurang_bayar' | 'lebih_bayar' | 'nihil';
  incomeByCategory: Record<string, { count: number; total: number }>;
  expenseByCategory: Record<string, { count: number; total: number }>;
  taxBreakdown: any[];
  method: 'progressive' | 'umkm_final';
}

export default function TaxPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [ptkpStatus, setPtkpStatus] = useState('TK/0');
  const [method, setMethod] = useState('progressive');
  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    loadSavedSettings();
  }, []);

  // Fetch summary when year, ptkpStatus, or method changes (and settings are loaded)
  useEffect(() => {
    if (year && settingsLoaded) {
      fetchSummary();
    }
  }, [year, ptkpStatus, method, settingsLoaded]);

  const loadSavedSettings = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const response = await fetch(`/api/tax/settings?year=${currentYear}`);
      
      if (response.ok) {
        const settings = await response.json();
        if (settings && settings.ptkpStatus && settings.calculationMethod) {
          setPtkpStatus(settings.ptkpStatus);
          setMethod(settings.calculationMethod);
        }
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setSettingsLoaded(true);
    }
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        year: String(year),
        ptkpStatus,
        method,
      });
      const response = await fetch(`/api/tax/summary?${params.toString()}`);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Failed to fetch tax summary (${response.status})`);
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error fetching summary';
      setError(errorMsg);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (settings: any) => {
    setPtkpStatus(settings.ptkpStatus);
    setMethod(settings.calculationMethod);
  };

  const handleCopySummary = async () => {
    if (!summary) return;

    const text = `
Ringkasan Pajak SPT Tahunan ${year}
=====================================
Status PTKP: ${ptkpStatus}
Metode: ${method === 'progressive' ? 'Laba Bersih/Progresif' : 'UMKM Final 0,5%'}

Total Pemasukan: ${formatRupiah(summary.totalIncome)}
Total Pengeluaran: ${formatRupiah(summary.totalExpense)}
Penghasilan Neto: ${formatRupiah(summary.netIncome)}
PTKP: ${formatRupiah(summary.ptkp)}
PKP: ${formatRupiah(summary.pkp)}
PPh Terutang: ${formatRupiah(summary.pphDue)}
Pajak Sudah Dibayar: ${formatRupiah(summary.taxPaid)}
Kurang/Lebih Bayar: ${formatRupiah(summary.difference)}
Status: ${summary.status === 'kurang_bayar' ? 'Kurang Bayar' : summary.status === 'lebih_bayar' ? 'Lebih Bayar' : 'Nihil'}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      alert('Ringkasan berhasil disalin ke clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Pajak / SPT Tahunan</h1>
        <p className="text-white/60 mt-2">
          Estimasi pajak penghasilan tahunan berdasarkan transaksi Anda
        </p>
      </div>

      {/* Settings Card */}
      <TaxSettingsCard onSettingsChange={handleSettingsChange} />

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-white/60">
          Memuat data pajak...
        </div>
      )}

      {/* Summary */}
      {summary && !loading && (
        <>
          {/* Hero Summary Card */}
          <TaxSummaryCard
            pphDue={summary.pphDue}
            status={summary.status}
            year={year}
            ptkpStatus={ptkpStatus}
          />

          {/* Calculation Summary */}
          <TaxDetailsTable
            title="Ringkasan Perhitungan"
            rows={[
              { label: 'Total Pemasukan', value: summary.totalIncome },
              { label: 'Total Pengeluaran', value: summary.totalExpense },
              { label: 'Penghasilan Neto', value: summary.netIncome },
              { label: 'PTKP', value: summary.ptkp },
              { label: 'PKP', value: summary.pkp },
              { label: 'PPh Terutang', value: summary.pphDue, highlight: true },
              { label: 'Pajak Sudah Dibayar', value: summary.taxPaid },
              {
                label: 'Kurang/Lebih Bayar',
                value: summary.difference,
                highlight: true,
              },
            ]}
          />

          {/* Income by Category */}
          {Object.keys(summary.incomeByCategory).length > 0 && (
            <TaxDetailsTable
              title="Detail Pemasukan per Kategori"
              rows={Object.entries(summary.incomeByCategory).map(
                ([category, data]) => ({
                  label: `${category} (${data.count}x)`,
                  value: data.total,
                })
              )}
            />
          )}

          {/* Expense by Category */}
          {Object.keys(summary.expenseByCategory).length > 0 && (
            <TaxDetailsTable
              title="Detail Pengeluaran per Kategori"
              rows={Object.entries(summary.expenseByCategory).map(
                ([category, data]) => ({
                  label: `${category} (${data.count}x)`,
                  value: data.total,
                })
              )}
            />
          )}

          {/* Tax Breakdown */}
          {summary.taxBreakdown.length > 0 && (
            <div className="soft-card rounded-2xl p-4 border border-premium-border-soft space-y-4">
              <h3 className="text-lg font-black text-white">
                {method === 'progressive'
                  ? 'Breakdown PPh Progresif per Lapisan'
                  : 'Perhitungan PPh Final UMKM'}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-3 px-4 text-left text-white/80 font-semibold">
                        {method === 'progressive' ? 'Lapisan' : 'Keterangan'}
                      </th>
                      <th className="py-3 px-4 text-right text-white/80 font-semibold">
                        {method === 'progressive' ? 'Tarif' : 'Basis'}
                      </th>
                      <th className="py-3 px-4 text-right text-white/80 font-semibold">
                        PPh
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {summary.taxBreakdown.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-white/80">
                          {item.layer}
                        </td>
                        <td className="py-3 px-4 text-right text-white/90">
                          {method === 'progressive'
                            ? `${(item.rate * 100).toFixed(1)}%`
                            : formatRupiah(item.basis || item.taxableAmount || 0)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-white">
                          {formatRupiah(item.tax)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleCopySummary}
              className="flex-1 btn btn-primary rounded-lg"
            >
              Salin Ringkasan
            </button>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 text-sm text-amber-200">
            <p className="font-semibold mb-2">⚠️ Disclaimer</p>
            <p>
              Fitur ini hanya untuk estimasi. Untuk perhitungan pajak yang akurat,
              konsultasikan dengan konsultan pajak profesional. Hasil perhitungan
              mungkin berbeda dengan SPT resmi karena berbagai faktor yang tidak
              tercakup dalam sistem ini.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
