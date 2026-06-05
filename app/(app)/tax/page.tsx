'use client';

import { useState, useEffect } from 'react';
import { TaxSettingsCard } from '@/components/tax-settings-card';
import { TaxSummaryCard } from '@/components/tax-summary-card';
import { TaxDetailsTable } from '@/components/tax-details-table';
import { formatRupiah } from '@/lib/tax-calculations';
import { AlertTriangle } from 'lucide-react';

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
    <div style={{ paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#FFFFFF', margin: 0 }}>Pajak / SPT Tahunan</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8, margin: '8px 0 0 0' }}>
          Estimasi pajak penghasilan tahunan berdasarkan transaksi Anda
        </p>
      </div>

      {/* Settings Card */}
      <TaxSettingsCard onSettingsChange={handleSettingsChange} />

      {/* Error Message */}
      {error && (
        <div style={{
          background: 'rgba(255,69,58,0.2)', border: '0.5px solid rgba(255,69,58,0.4)',
          borderRadius: 16, padding: 16, color: 'rgba(255,69,58,0.9)',
          fontSize: 14
        }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
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
            <div className="ios-card" style={{ padding: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF', margin: '0 0 16px 0' }}>
                {method === 'progressive'
                  ? 'Breakdown PPh Progresif per Lapisan'
                  : 'Perhitungan PPh Final UMKM'}
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                        {method === 'progressive' ? 'Lapisan' : 'Keterangan'}
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                        {method === 'progressive' ? 'Tarif' : 'Basis'}
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                        PPh
                      </th>
                    </tr>
                  </thead>
                  <tbody style={{ borderCollapse: 'collapse' }}>
                    {summary.taxBreakdown.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.7)' }}>
                          {item.layer}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: 'rgba(255,255,255,0.8)' }}>
                          {method === 'progressive'
                            ? `${item.rate.toFixed(1)}%`
                            : formatRupiah(item.basis || item.taxableAmount || 0)}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#FFFFFF' }}>
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
          <div style={{ display: 'flex', gap: 16 }}>
            <button
              onClick={handleCopySummary}
              className="active-scale"
              style={{
                flex: 1, padding: '14px 24px',
                background: '#0A84FF', border: 'none',
                borderRadius: 16, color: '#FFFFFF', fontSize: 14,
                fontWeight: 600, cursor: 'pointer'
              }}
            >
              Salin Ringkasan
            </button>
          </div>

          {/* Disclaimer */}
          <div style={{
            background: 'rgba(255,159,10,0.2)', border: '0.5px solid rgba(255,159,10,0.4)',
            borderRadius: 16, padding: 16, fontSize: 13, color: '#FF9F0A'
          }}>
            <p style={{ fontWeight: 700, marginBottom: 8, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              Disclaimer
            </p>
            <p style={{ margin: 0 }}>
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
