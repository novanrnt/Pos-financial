'use client';

import { useState } from 'react';

type DayData = { name: string; income: number; expense: number; net: number };
type MonthData = { name: string; income: number; expense: number; savings: number };

export function TrendChart({
  dailyData,
  monthlyData,
  weeklyExpense,
  prevWeeklyExpense,
  changePct,
}: {
  dailyData: DayData[];
  monthlyData: MonthData[];
  weeklyExpense: number;
  prevWeeklyExpense: number;
  changePct: number;
}) {
  const [tab, setTab] = useState<'Harian' | 'Mingguan' | 'Bulanan'>('Mingguan');

  const monthlyExpenses = monthlyData.map(m => m.expense);
  const monthlyLabels = monthlyData.map(m => m.name);
  const monthlyMax = Math.max(...monthlyExpenses, 1);
  const weeklyMax = Math.max(...dailyData.map(d => d.expense), 1);
  const dailyMax = Math.max(...dailyData.map(d => Math.max(d.income, d.expense)), 1);

  const currentData = tab === 'Harian' ? dailyData
    : tab === 'Mingguan' ? dailyData
    : monthlyData;

  const maxVal = tab === 'Harian' ? dailyMax : tab === 'Mingguan' ? weeklyMax : monthlyMax;

  return (
    <div className="ios-card p-4">
      {/* Segmented Control */}
      <div className="flex mb-4 rounded-[10px] p-[2px] w-fit" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {(['Harian', 'Mingguan', 'Bulanan'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="text-[12px] font-medium px-4 py-1.5 rounded-[8px] border-none cursor-pointer transition-all active-scale"
            style={{
              background: tab === t ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: tab === t ? '#fff' : 'rgba(255,255,255,0.4)',
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="flex items-end gap-[5px]" style={{ height: 130 }}>
        {tab === 'Bulanan' ? (
          monthlyData.map((m, i) => {
            const h = Math.max(4, (m.expense / maxVal) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-[2px]">
                <div className="w-full rounded-t-[3px] transition-all" style={{
                  height: `${h}%`, minHeight: 3,
                  background: 'rgba(255,69,58,0.6)',
                }} />
                <span className="text-[8px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{m.name}</span>
              </div>
            );
          })
        ) : (
          dailyData.map((d, i) => {
            const expH = Math.max(4, (d.expense / maxVal) * 100);
            const incH = Math.max(4, (d.income / maxVal) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                <div className="w-full rounded-t-[3px]" style={{
                  height: `${incH}%`, minHeight: 3,
                  background: 'rgba(48,209,88,0.3)',
                }} />
                <div className="w-full flex justify-center">
                  <div className="w-full rounded-t-[3px]" style={{
                    height: `${expH}%`, minHeight: 3,
                    background: 'rgba(255,69,58,0.6)',
                  }} />
                </div>
                <span className="text-[8px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{d.name}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Legend & Comparison */}
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-[6px] h-[6px] rounded-full" style={{ background: 'rgba(48,209,88,0.3)' }} />
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Pemasukan</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-[6px] h-[6px] rounded-full" style={{ background: '#FF453A' }} />
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Pengeluaran</span>
          </div>
        </div>
        <span className="text-[12px] font-medium"
          style={{ color: changePct > 0 ? '#FF453A' : '#30D158' }}>
          {changePct > 0 ? '▲' : '▼'} {Math.abs(changePct).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
