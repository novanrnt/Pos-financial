'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PTKP_OPTIONS = [
  { value: 'TK/0', label: 'TK/0 (Rp 54 Juta)' },
  { value: 'TK/1', label: 'TK/1 (Rp 58,5 Juta)' },
  { value: 'TK/2', label: 'TK/2 (Rp 63 Juta)' },
  { value: 'TK/3', label: 'TK/3 (Rp 67,5 Juta)' },
  { value: 'K/0', label: 'K/0 (Rp 58,5 Juta)' },
  { value: 'K/1', label: 'K/1 (Rp 63 Juta)' },
  { value: 'K/2', label: 'K/2 (Rp 67,5 Juta)' },
  { value: 'K/3', label: 'K/3 (Rp 72 Juta)' },
];

interface TaxSettingsCardProps {
  onSettingsChange?: (settings: any) => void;
}

export function TaxSettingsCard({ onSettingsChange }: TaxSettingsCardProps) {
  const router = useRouter();
  const [year, setYear] = useState(new Date().getFullYear());
  const [ptkpStatus, setPtkpStatus] = useState('TK/0');
  const [method, setMethod] = useState('progressive');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load saved settings on mount and when year changes
  useEffect(() => {
    loadSettings();
  }, [year]);

  // Debounced save on changes (ptkpStatus and method only)
  useEffect(() => {
    // Clear previous timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout to save after 500ms of no changes
    const timeout = setTimeout(() => {
      saveSettings();
    }, 500);

    setSaveTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [ptkpStatus, method]);

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/tax/settings?year=${year}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setPtkpStatus(data.ptkpStatus || 'TK/0');
          setMethod(data.calculationMethod || 'progressive');
        }
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const saveSettings = async () => {
    try {
      setError('');

      const response = await fetch('/api/tax/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxYear: year,
          ptkpStatus,
          calculationMethod: method,
          manualTaxPaid: 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const data = await response.json();
      onSettingsChange?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving settings');
    }
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.15)',
      WebkitBackdropFilter: 'blur(40px) saturate(200%)',
      backdropFilter: 'blur(40px) saturate(200%)',
      border: '0.5px solid rgba(255,255,255,0.1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
      borderRadius: 24, padding: 24,
    }}>
      <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 20, letterSpacing: '-0.2px' }}>Pengaturan Pajak</h3>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Year Selection */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Tahun Pajak
        </label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
          min={1900}
          max={new Date().getFullYear() + 1}
        />
      </div>

      {/* PTKP Status */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Status PTKP
        </label>
        <select
          value={ptkpStatus}
          onChange={(e) => setPtkpStatus(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/40"
        >
          {PTKP_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Calculation Method */}
      <div>
        <label className="block text-sm font-semibold text-white mb-3">
          Metode Perhitungan
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="method"
              value="progressive"
              checked={method === 'progressive'}
              onChange={(e) => setMethod(e.target.value)}
              className="w-4 h-4"
            />
            <span className="text-sm text-white">Laba Bersih/Progresif</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="method"
              value="umkm_final"
              checked={method === 'umkm_final'}
              onChange={(e) => setMethod(e.target.value)}
              className="w-4 h-4"
            />
            <span className="text-sm text-white">UMKM Final 0,5%</span>
          </label>
        </div>
      </div>

      {saveTimeout && (
        <div className="text-sm text-white/60">Menyimpan pengaturan...</div>
      )}
    </div>
  );
}
