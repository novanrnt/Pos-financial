import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { rupiah, ym } from '@/lib/utils';
import {
  Bell, ShoppingCart, Receipt, ArrowUpRight, ArrowDownRight,
  ChevronRight, Clock, MoreHorizontal, TrendingUp,
  Wallet, Car, PiggyBank, Plus,
  Utensils, Fuel, Wrench, Dumbbell, DollarSign, ShoppingBagIcon, Home as HomeIcon,
  Smartphone, Gamepad2, BookOpen, Heart, Plane, Gift, Music, Coffee
} from 'lucide-react';

import { TransactionFormButton } from '@/components/transaction-form';

const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const monthLong = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

const categoryIcons: Record<string, React.ReactNode> = {
  'Makan': <Utensils size={16} />, 'BBM': <Fuel size={16} />, 'Servis': <Wrench size={16} />,
  'Olahraga': <Dumbbell size={16} />, 'Investasi': <TrendingUp size={16} />, 'Gaji': <DollarSign size={16} />,
  'Belanja': <ShoppingBagIcon size={16} />, 'Rumah': <HomeIcon size={16} />, 'Gadget': <Smartphone size={16} />,
  'Gaming': <Gamepad2 size={16} />, 'Buku': <BookOpen size={16} />, 'Kesehatan': <Heart size={16} />,
  'Liburan': <Plane size={16} />, 'Hadiah': <Gift size={16} />, 'Musik': <Music size={16} />, 'Kopi': <Coffee size={16} />,
};

function getCatIcon(cat: string): React.ReactNode {
  return categoryIcons[cat] || <ShoppingCart size={16} />;
}

// ───── CSS donut: returns conic-gradient string ─────
function donutGradient(items: { value: number; color: string }[], total: number): string {
  if (total === 0) return 'conic-gradient(#222 0deg, #222 360deg)';
  let current = 0;
  const parts = items.filter(i => i.value > 0).map(i => {
    const pct = (i.value / total) * 360;
    const start = current;
    current += pct;
    return `${i.color} ${start}deg ${current}deg`;
  });
  if (parts.length === 0) return 'conic-gradient(#222 0deg, #222 360deg)';
  return `conic-gradient(${parts.join(', ')})`;
}

const donutColors = ['#FF453A','#FF9F0A','#0A84FF','#BF5AF2','#30D158','#64D2FF','#FFD60A','#FF375F'];
function getColor(idx: number) { return donutColors[idx % donutColors.length]; }

// ───── Mini trend chart (CSS bars) ─────
async function MiniBarChart({ data, height = 40 }: { data: { value: number; label: string; isToday?: boolean }[]; height?: number }) {
  const max = Math.max(...data.map(d => Math.abs(d.value)), 1);
  return <div className="flex items-end gap-[3px]" style={{ height }}>
    {data.map((d,i) => {
      const pct = Math.max(3, (Math.abs(d.value) / max) * 100);
      const isNeg = d.value < 0;
      return <div key={i} className="flex-1 flex flex-col items-center gap-1">
        <div className="w-full rounded-t-[3px] transition-all" style={{
          height: `${pct}%`,
          background: isNeg ? 'rgba(255,69,58,0.6)' : 'rgba(48,209,88,0.5)',
          minHeight: 3,
        }} />
        <span className="text-[7px] font-medium" style={{ color: d.isToday ? '#fff' : 'rgba(255,255,255,0.3)' }}>{d.label}</span>
      </div>;
    })}
  </div>;
}

// ───── Donut chart component ─────
function DonutChart({ data, total, size = 120 }: { data: { name: string; value: number }[]; total: number; size?: number }) {
  const items = data.slice().sort((a,b) => b.value - a.value).map((d,i) => ({ ...d, color: getColor(i) }));
  const grad = donutGradient(items, total);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <div className="w-full h-full rounded-full" style={{ background: grad }} />
        <div className="absolute inset-[8px] rounded-full bg-black" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-semibold opacity-50">0%</span>
        </div>
      </div>
      <div className="w-full space-y-[5px]">
        {items.slice(0, 5).map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: item.color }} />
              <span className="text-[12px] flex-1 truncate" style={{ color: 'rgba(255,255,255,0.65)' }}>{item.name}</span>
              <span className="text-[12px] font-semibold">{Math.round(pct)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───── Bar data for trend (weekly) ─────
type DayData = { name: string; income: number; expense: number; net: number };

// ───── Server Component ─────
export default async function Dashboard() {
  const u = await requireUser();
  if (!u) redirect('/login');
  if (!u.setupCompleted) redirect('/setup');
  const uid = u.id;
  const now = new Date();
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const compareStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const month = ym(now);
  const startYear = new Date(now.getFullYear(), 0, 1);
  const endYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

  const [accounts, cars, debts, invest, allYear, bills, savingsGoals, recentTx, categories, compareTx] = await Promise.all([
    prisma.account.findMany({ where: { userId: uid }, orderBy: { isPrimary: 'desc' } }),
    prisma.car.findMany({ where: { userId: uid, status: 'AVAILABLE' }, include: { costs: true }, orderBy: { createdAt: 'desc' } }),
    prisma.debt.findMany({ where: { userId: uid, status: 'ACTIVE' }, orderBy: { dueDate: 'asc' }, take: 6 }),
    prisma.investmentSnapshot.findMany({ where: { userId: uid, month } }),
    prisma.transaction.findMany({ where: { userId: uid, date: { gte: startYear, lte: endYear } }, include: { category: true }, orderBy: { date: 'asc' } }),
    prisma.recurringBill.findMany({ where: { userId: uid, status: 'UNPAID' }, include: { account: true }, orderBy: { dueDay: 'asc' }, take: 5 }),
    prisma.savingsGoal.findMany({ where: { userId: uid } }),
    prisma.transaction.findMany({ where: { userId: uid }, include: { category: true, account: true, transferToAccount: true }, orderBy: { date: 'desc' }, take: 8 }),
    prisma.category.findMany({ where: { userId: uid, isActive: true }, orderBy: { name: 'asc' } }),
    prisma.transaction.findMany({ where: { userId: uid, date: { gte: compareStart, lte: now } } }),
  ]);

  const cash = accounts.reduce((a, x) => a + Number(x.balance), 0);
  const carAsset = cars.reduce((a, c) => a + Number(c.purchasePrice) + c.costs.reduce((s, k) => s + Number(k.amount), 0), 0);
  const debt = debts.filter(d => d.type === 'DEBT').reduce((a, d) => a + Number(d.remainingAmount), 0);
  const rec = debts.filter(d => d.type === 'RECEIVABLE').reduce((a, d) => a + Number(d.remainingAmount), 0);
  const inv = invest.reduce((a, i) => a + Number(i.balance), 0);
  const invExcludeRnd = invest.filter(i => i.category !== 'R&D / Eksperimen').reduce((a, i) => a + Number(i.balance), 0);
  const savings_total = savingsGoals.reduce((a, g) => a + Number(g.savedAmount), 0);
  const totalAssets = cash + carAsset + invExcludeRnd + savings_total;
  const monthTx = allYear.filter(t => ym(t.date) === month);
  const income = monthTx.filter(t => t.type === 'INCOME').reduce((a, t) => a + Number(t.amount), 0);
  const expense = monthTx.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + Number(t.amount), 0);
  const savings = income - expense;
  const netWorth = cash + carAsset + inv + rec + savings_total - debt;

  const chartData = months.map((m, i) => {
    const list = allYear.filter(t => t.date.getMonth() === i);
    const inc = list.filter(t => t.type === 'INCOME').reduce((a, t) => a + Number(t.amount), 0);
    const exp = list.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + Number(t.amount), 0);
    return { name: m, income: inc, expense: exp, savings: inc - exp };
  });

  const netWorthGrowthData = months.slice(0, now.getMonth() + 1).map((m, i) => {
    const futureTx = allYear.filter(t => t.date.getMonth() > i);
    const futureNet = futureTx.reduce((a, t) => a + (t.type === 'INCOME' ? -Number(t.amount) : t.type === 'EXPENSE' ? Number(t.amount) : 0), 0);
    const monthInvest = invest.reduce((a, x) => a + Number(x.balance), 0);
    const estimatedNetWorth = Math.max(0, netWorth + futureNet);
    return { name: m, netWorth: estimatedNetWorth, cash: Math.max(0, cash + futureNet), assets: carAsset + monthInvest + rec };
  });

  // Weekly data
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() + 1); weekStart.setHours(0, 0, 0, 0);
  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const weeklyCashflowData: DayData[] = dayNames.map((name, idx) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + idx);
    const list = allYear.filter(t => t.date.getFullYear() === d.getFullYear() && t.date.getMonth() === d.getMonth() && t.date.getDate() === d.getDate());
    const inc = list.filter(t => t.type === 'INCOME').reduce((a, t) => a + Number(t.amount), 0);
    const exp = list.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + Number(t.amount), 0);
    return { name, income: inc, expense: exp, net: inc - exp };
  });
  const weeklyIncome = weeklyCashflowData.reduce((a, d) => a + d.income, 0);
  const weeklyExpense = weeklyCashflowData.reduce((a, d) => a + d.expense, 0);
  const weeklyNet = weeklyIncome - weeklyExpense;

  // Compare
  const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
  const startLast7 = new Date(startOfToday); startLast7.setDate(startLast7.getDate() - 6);
  const startPrev7 = new Date(startLast7); startPrev7.setDate(startPrev7.getDate() - 7);
  const endPrev7 = new Date(startLast7); endPrev7.setMilliseconds(-1);
  const last7Expense = compareTx.filter(t => t.type === 'EXPENSE' && t.date >= startLast7 && t.date <= now).reduce((a, t) => a + Number(t.amount), 0);
  const prev7Expense = compareTx.filter(t => t.type === 'EXPENSE' && t.date >= startPrev7 && t.date <= endPrev7).reduce((a, t) => a + Number(t.amount), 0);
  const dayOfMonth = now.getDate();
  const monthStartNow = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStartLast = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1);
  const lastMonthComparableEnd = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), dayOfMonth, 23, 59, 59, 999);
  const monthNowExpense = compareTx.filter(t => t.type === 'EXPENSE' && t.date >= monthStartNow && t.date <= now).reduce((a, t) => a + Number(t.amount), 0);
  const monthLastExpense = compareTx.filter(t => t.type === 'EXPENSE' && t.date >= monthStartLast && t.date <= lastMonthComparableEnd).reduce((a, t) => a + Number(t.amount), 0);
  const pct = (current: number, previous: number) => previous > 0 ? ((current - previous) / previous) * 100 : (current > 0 ? 100 : 0);
  const last7Pct = pct(last7Expense, prev7Expense);
  const monthPct = pct(monthNowExpense, monthLastExpense);

  const todayDate = now.getDate();
  const dueSoonBills = bills.filter(b => { const delta = b.dueDay - todayDate; return delta >= 0 && delta <= 3; });
  const criticalAccounts = accounts.filter(a => Number(a.balance) <= 0);
  const cashCritical = cash < Math.max(1, expense * 0.2);

  // Category pie
  const expensePie = Object.values(monthTx.filter(t => t.type === 'EXPENSE' && t.category).reduce((m: Record<string, { name: string; value: number }>, t) => { const n = t.category!.name; m[n] = { name: n, value: (m[n]?.value || 0) + Number(t.amount) }; return m; }, {}));
  const incomePie = Object.values(monthTx.filter(t => t.type === 'INCOME' && t.category).reduce((m: Record<string, { name: string; value: number }>, t) => { const n = t.category!.name; m[n] = { name: n, value: (m[n]?.value || 0) + Number(t.amount) }; return m; }, {}));

  // Today's transactions
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const todayTx = allYear.filter(t => t.date >= today && t.date < tomorrow);
  const todayIncome = todayTx.filter(t => t.type === 'INCOME').reduce((a, t) => a + Number(t.amount), 0);
  const todayExpense = todayTx.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + Number(t.amount), 0);

  // Daily history
  const dailyMap = monthTx.reduce((acc: Record<string, { income: number; expense: number; date: Date }>, tx) => {
    const dateKey = tx.date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long' });
    if (!acc[dateKey]) acc[dateKey] = { income: 0, expense: 0, date: tx.date };
    if (tx.type === 'INCOME') acc[dateKey].income += Number(tx.amount);
    else acc[dateKey].expense += Number(tx.amount);
    return acc;
  }, {});
  const dailyHistory = Object.entries(dailyMap).sort((a, b) => b[1].date.getTime() - a[1].date.getTime());

  // Mini bar data for HARIAN
  const miniBarData = weeklyCashflowData.map(d => ({ value: d.net, label: d.name, isToday: d.name === dayNames[now.getDay() === 0 ? 6 : now.getDay() - 1] }));

  // Total bill amount
  const totalBillsAmount = bills.reduce((a, b) => a + Number(b.amount), 0);
  const totalBillThisMonth = bills.length;

  // Trend bar chart data (weekly)
  const trendBarMax = Math.max(...weeklyCashflowData.map(d => Math.max(d.income, d.expense)), 1);

  return (
    <div className="pb-4 space-y-[18px]">
      {/* ========== 1. HEADER ========== */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-[40px] h-[40px] rounded-full ios-glass-strong flex items-center justify-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #BF5AF2, #0A84FF)' }}>
            <span className="text-[16px] font-bold text-white">{u.fullName ? u.fullName[0].toUpperCase() : 'O'}</span>
          </div>
          <div>
            <div className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Total Saldo
            </div>
          </div>
        </div>
        <div className="relative">
          <Bell size={22} style={{ color: 'rgba(255,255,255,0.5)' }} />
          {dueSoonBills.length > 0 && (
            <div className="absolute -top-[2px] -right-[2px] w-[10px] h-[10px] rounded-full" style={{ background: '#FF453A' }} />
          )}
        </div>
      </div>

      {/* Balance Amount */}
      <div className="px-1">
        <h1 style={{
          fontSize: 40, fontWeight: 700, letterSpacing: '-1.2px',
          lineHeight: 1.1, margin: 0
        }}>
          {rupiah(netWorth)}
        </h1>
      </div>

      {/* ========== 2. TAGIHAN REMINDER ========== */}
      {dueSoonBills.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2.5 px-1">
            <Bell size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
            <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Tagihan</span>
            <div className="text-[11px] font-semibold px-[6px] py-[1px] rounded-full" style={{ background: 'rgba(255,69,58,0.2)', color: '#FF453A' }}>
              {dueSoonBills.length} tagihan
            </div>
          </div>
          {dueSoonBills.slice(0, 2).map(b => {
            const daysLeft = b.dueDay - todayDate;
            return (
              <div key={b.id} className="ios-card overflow-hidden animate-ios-pulse mb-2.5" style={{
                background: 'linear-gradient(135deg, rgba(255,159,10,0.15), rgba(255,69,58,0.12))',
              }}>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(255,69,58,0.2)' }}>
                        <Receipt size={18} style={{ color: '#FF453A' }} />
                      </div>
                      <div>
                        <div className="text-[15px] font-semibold">{b.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock size={11} style={{ color: 'rgba(255,255,255,0.4)' }} />
                          <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            {daysLeft === 0 ? 'Hari ini' : `${daysLeft} hari lagi`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ color: '#FF453A' }}>
                      <div className="text-[16px] font-semibold text-right">{rupiah(Number(b.amount))}</div>
                      <div className="text-[11px] text-right" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Jatuh tempo {b.dueDay} {monthLong[now.getMonth()]}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Link href="/bills" className="flex-1 h-[40px] rounded-[12px] flex items-center justify-center text-[13px] font-semibold active-scale"
                      style={{ background: '#FF453A', color: 'white' }}>
                      Bayar Sekarang
                    </Link>
                    <button className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center active-scale"
                      style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <MoreHorizontal size={18} style={{ color: 'rgba(255,255,255,0.5)' }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="ios-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Total tagihan bulan ini</div>
              <div className="text-[15px] font-semibold" style={{ color: '#FF453A' }}>{rupiah(totalBillsAmount)}</div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 3. QUICK STATS ========== */}
      <div className="grid grid-cols-2 gap-[10px]">
        <div className="ios-card p-4 animate-ios-slide-up ios-stagger-1">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowUpRight size={14} style={{ color: '#30D158' }} />
            <span className="text-[11px] font-medium uppercase" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>Pemasukan</span>
          </div>
          <div className="text-[22px] font-semibold" style={{ color: '#30D158', letterSpacing: '-0.5px' }}>{rupiah(income)}</div>
          <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{monthTx.filter(t => t.type === 'INCOME').length} transaksi</div>
        </div>
        <div className="ios-card p-4 animate-ios-slide-up ios-stagger-2">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowDownRight size={14} style={{ color: '#FF453A' }} />
            <span className="text-[11px] font-medium uppercase" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>Pengeluaran</span>
          </div>
          <div className="text-[22px] font-semibold" style={{ color: '#FF453A', letterSpacing: '-0.5px' }}>{rupiah(expense)}</div>
          <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{monthTx.filter(t => t.type === 'EXPENSE').length} transaksi</div>
        </div>
      </div>

      {/* ========== 4. HUTANG & PIUTANG ========== */}
      <div className="grid grid-cols-2 gap-[10px]">
        <div className="ios-card p-4 animate-ios-slide-up ios-stagger-3" style={{
          background: 'linear-gradient(135deg, rgba(255,69,58,0.12), rgba(255,69,58,0.04))'
        }}>
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowDownRight size={12} style={{ color: '#FF453A' }} />
            <span className="text-[11px] font-medium uppercase" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>Hutang</span>
          </div>
          <div className="text-[20px] font-semibold" style={{ color: '#FF453A', letterSpacing: '-0.5px' }}>{rupiah(debt)}</div>
          <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {criticalAccounts.length} akun kritis
          </div>
        </div>
        <div className="ios-card p-4 animate-ios-slide-up ios-stagger-4" style={{
          background: 'linear-gradient(135deg, rgba(48,209,88,0.12), rgba(48,209,88,0.04))'
        }}>
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowUpRight size={12} style={{ color: '#30D158' }} />
            <span className="text-[11px] font-medium uppercase" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>Piutang</span>
          </div>
          <div className="text-[20px] font-semibold" style={{ color: '#30D158', letterSpacing: '-0.5px' }}>{rupiah(rec)}</div>
          <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {debts.filter(d => d.type === 'RECEIVABLE').length} items
          </div>
        </div>
      </div>

      {/* Net progress bar */}
      {(debt > 0 || rec > 0) && (
        <div className="px-1 animate-ios-fade-in">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Net Position</span>
            <span className="text-[11px] font-semibold" style={{ color: rec > debt ? '#30D158' : '#FF453A' }}>
              {rupiah(Math.abs(rec - debt))} {rec > debt ? 'surplus' : 'defisit'}
            </span>
          </div>
          <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all" style={{
              width: `${Math.min((Math.max(debt, rec) > 0 ? Math.min(rec, debt) / Math.max(debt, rec) : 0) * 100, 100)}%`,
              background: 'linear-gradient(90deg, #FF453A, #FF9F0A, #30D158)'
            }} />
          </div>
        </div>
      )}

      {/* ========== 5. DEBTS LIST ========== */}
      {debts.length > 0 && (
        <div className="space-y-[6px] animate-ios-slide-up ios-stagger-5">
          {debts.slice(0, 4).map(d => {
            const isDebt = d.type === 'DEBT';
            const isOverdue = d.dueDate && d.dueDate < new Date();
            return (
              <Link key={d.id} href="/debts" className="ios-card p-3.5 flex items-center gap-3 active-scale" style={{ display: 'flex' }}>
                <div className="w-[32px] h-[32px] rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ background: isDebt ? 'rgba(255,69,58,0.15)' : 'rgba(48,209,88,0.15)' }}>
                  {isDebt ? <ArrowDownRight size={14} style={{ color: '#FF453A' }} /> : <ArrowUpRight size={14} style={{ color: '#30D158' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium truncate">{d.name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[11px]" style={{ color: isDebt ? 'rgba(255,69,58,0.6)' : 'rgba(48,209,88,0.6)' }}>
                      {isDebt ? 'Hutang' : 'Piutang'}
                    </span>
                    {isOverdue && (
                      <div className="text-[10px] px-[4px] py-[1px] rounded-full" style={{ background: 'rgba(255,69,58,0.2)', color: '#FF453A' }}>
                        Lewat
                      </div>
                    )}
                    {d.dueDate && (
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        • {d.dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-[14px] font-semibold shrink-0" style={{ color: isDebt ? '#FF453A' : '#30D158' }}>
                  {rupiah(Number(d.remainingAmount))}
                </div>
              </Link>
            );
          })}
          <Link href="/debts" className="flex items-center justify-center py-2.5 text-[13px] font-medium active-scale"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            Lihat Semua <ChevronRight size={14} className="ml-0.5" />
          </Link>
        </div>
      )}

      {/* ========== 6. HARIAN ========== */}
      <div className="animate-ios-slide-up ios-stagger-6">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-semibold" style={{ letterSpacing: '-0.2px' }}>Harian</span>
            <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
          <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {todayTx.length} transaksi
          </span>
        </div>
        <div className="ios-card p-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center shrink-0"
                style={{ background: 'rgba(48,209,88,0.15)' }}>
                <ArrowUpRight size={13} style={{ color: '#30D158' }} />
              </div>
              <div>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Pemasukan</span>
                <div className="text-[14px] font-semibold" style={{ color: '#30D158' }}>{rupiah(todayIncome)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,69,58,0.15)' }}>
                <ArrowDownRight size={13} style={{ color: '#FF453A' }} />
              </div>
              <div>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Pengeluaran</span>
                <div className="text-[14px] font-semibold" style={{ color: '#FF453A' }}>-{rupiah(todayExpense)}</div>
              </div>
            </div>
          </div>
          <div className="h-[1px] my-2.5" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <MiniBarChart data={miniBarData} height={36} />
        </div>
      </div>

      {/* ========== 7. TREND PENGELUARAN ========== */}
      <div className="animate-ios-slide-up ios-stagger-7">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-[17px] font-semibold" style={{ letterSpacing: '-0.2px' }}>Trend Pengeluaran</span>
          <div className="flex rounded-[10px] p-[2px]" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="text-[12px] font-medium px-3 py-1.5 rounded-[8px]" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>Minggu</div>
            <div className="text-[12px] font-medium px-3 py-1.5 rounded-[8px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Bulan</div>
          </div>
        </div>
        <div className="ios-card p-4">
          <div className="flex items-end gap-[5px]" style={{ height: 130 }}>
            {weeklyCashflowData.map((d, i) => {
              const expPct = Math.max(4, (d.expense / trendBarMax) * 100);
              const incPct = Math.max(4, (d.income / trendBarMax) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                  <div className="w-[6px] rounded-t-[3px]" style={{ height: `${incPct}%`, background: 'rgba(48,209,88,0.3)', minHeight: 3 }} />
                  <div className="w-full flex justify-center">
                    <div className="w-[6px] rounded-t-[3px]" style={{ height: `${expPct}%`, background: 'rgba(255,69,58,0.6)', minHeight: 3 }} />
                  </div>
                  <span className="text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{d.name}</span>
                </div>
              );
            })}
          </div>
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
            <span className={`text-[12px] font-medium ${last7Pct > 0 ? '' : ''}`}
              style={{ color: last7Pct > 0 ? '#FF453A' : '#30D158' }}>
              {last7Pct > 0 ? '▲' : '▼'} {Math.abs(last7Pct).toFixed(0)}% vs Minggu Lalu
            </span>
          </div>
        </div>
      </div>

      {/* ========== 8. PENGELUARAN PER KATEGORI ========== */}
      <div className="animate-ios-slide-up ios-stagger-8">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-[17px] font-semibold" style={{ letterSpacing: '-0.2px' }}>Pengeluaran per Kategori</span>
        </div>
        <div className="ios-card p-4">
          {expensePie.length > 0 ? (
            <div className="grid grid-cols-[1fr,1fr] gap-4 items-start">
              <DonutChart data={expensePie} total={expense} size={100} />
              <div className="space-y-2.5">
                {expensePie.slice().sort((a, b) => b.value - a.value).slice(0, 5).map((cat, i) => {
                  const p = expense > 0 ? (cat.value / expense) * 100 : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[12px] truncate" style={{ color: 'rgba(255,255,255,0.65)' }}>{cat.name}</span>
                        <span className="text-[11px] font-medium">{rupiah(cat.value)}</span>
                      </div>
                      <div className="h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(p, 100)}%`, background: getColor(i) }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-[80px] h-[80px] rounded-full mx-auto" style={{ background: '#222' }} />
              <div className="text-[13px] mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Belum ada pengeluaran bulan ini</div>
            </div>
          )}
        </div>
      </div>

      {/* ========== 9. PEMASUKAN PER KATEGORI ========== */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-[17px] font-semibold" style={{ letterSpacing: '-0.2px' }}>Pemasukan per Kategori</span>
        </div>
        <div className="ios-card p-4">
          {incomePie.length > 0 ? (
            <div className="grid grid-cols-[1fr,1fr] gap-4 items-start">
              <DonutChart data={incomePie} total={income} size={100} />
              <div className="space-y-2.5">
                {incomePie.slice().sort((a, b) => b.value - a.value).slice(0, 5).map((cat, i) => {
                  const p = income > 0 ? (cat.value / income) * 100 : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[12px] truncate" style={{ color: 'rgba(255,255,255,0.65)' }}>{cat.name}</span>
                        <span className="text-[11px] font-medium">{rupiah(cat.value)}</span>
                      </div>
                      <div className="h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(p, 100)}%`, background: getColor(i) }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-[80px] h-[80px] rounded-full mx-auto" style={{ background: '#222' }} />
              <div className="text-[13px] mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Belum ada pemasukan bulan ini</div>
              <Link href="/transactions" className="inline-flex items-center gap-1 mt-3 px-4 py-2.5 rounded-[12px] text-[13px] font-semibold active-scale"
                style={{ background: '#30D158', color: '#000' }}>
                <Plus size={14} /> Tambah Pemasukan
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ========== 10. TREND BULANAN (chart) ========== */}
      <div className="animate-ios-fade-in">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-[17px] font-semibold" style={{ letterSpacing: '-0.2px' }}>Trend Bulanan</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-[2px] h-[2px] rounded-full" style={{ background: '#30D158' }} />
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Income</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-[6px] h-[6px] rounded-full" style={{ background: 'rgba(255,69,58,0.6)' }} />
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Expense</span>
            </div>
          </div>
        </div>
        <div className="ios-card p-4">
          <div className="flex items-end gap-[5px]" style={{ height: 100 }}>
            {chartData.slice(0, now.getMonth() + 1).map((d, i) => {
              const maxV = Math.max(...chartData.map(c => Math.max(c.income, c.expense)), 1);
              const incH = Math.max(4, (d.income / maxV) * 100);
              const expH = Math.max(4, (d.expense / maxV) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-[2px] justify-end">
                  <div className="w-[5px] rounded-t-[2px]" style={{ height: `${incH}%`, background: 'rgba(48,209,88,0.3)', minHeight: 3 }} />
                  <div className="w-[5px] rounded-t-[2px]" style={{ height: `${expH}%`, background: 'rgba(255,69,58,0.5)', minHeight: 3 }} />
                  <span className="text-[8px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{d.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========== 11. TRANSAKSI TERAKHIR ========== */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-[17px] font-semibold" style={{ letterSpacing: '-0.2px' }}>Transaksi Terakhir</span>
          <Link href="/transactions" className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Lihat Semua
          </Link>
        </div>
        <div className="space-y-[6px]">
          {recentTx.slice(0, 5).map(t => {
            const isExpense = t.type === 'EXPENSE';
            const isIncome = t.type === 'INCOME';
            const catName = t.category?.name || '';
            const timeStr = t.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const cIdx = catName.length % donutColors.length;
            const iconBg = isExpense ? donutColors[cIdx] : '#30D158';
            return (
              <div key={t.id} className="ios-card p-3.5 flex items-center gap-3 active-scale">
                <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ background: `${iconBg}20` }}>
                  {getCatIcon(catName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium truncate">{t.description || catName || t.type}</span>
                    <span className="text-[11px] shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>{timeStr}</span>
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {t.account.name}
                    {catName && <span> • {catName}</span>}
                  </div>
                </div>
                <div className="text-[14px] font-semibold shrink-0" style={{ color: isExpense ? '#FF453A' : '#30D158' }}>
                  {isExpense ? '−' : '+'}{rupiah(Number(t.amount))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========== 12. TOTAL ASET ========== */}
      <div className="ios-card p-4 animate-ios-fade-in">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[15px] font-semibold">Total Aset</span>
          <span className="text-[20px] font-semibold" style={{ color: '#30D158', letterSpacing: '-0.5px' }}>{rupiah(totalAssets)}</span>
        </div>
        <div className="space-y-2.5">
          {[
            { label: 'Saldo Rekening', value: cash, icon: <Wallet size={14} />, color: '#0A84FF' },
            { label: 'Aset Mobil', value: carAsset, icon: <Car size={14} />, color: '#FF9F0A' },
            { label: 'Investasi', value: invExcludeRnd, icon: <TrendingUp size={14} />, color: '#BF5AF2' },
            { label: 'Tabungan', value: savings_total, icon: <PiggyBank size={14} />, color: '#30D158' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-[24px] h-[24px] rounded-[6px] flex items-center justify-center" style={{ background: `${item.color}15` }}>
                  <span style={{ color: item.color }}>{item.icon}</span>
                </div>
                <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{item.label}</span>
              </div>
              <span className="text-[14px] font-medium">{rupiah(item.value)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold">Net Worth</span>
            <span className="text-[17px] font-semibold" style={{ color: '#30D158' }}>{rupiah(netWorth)}</span>
          </div>
        </div>
      </div>

      {/* ========== FAB ========== */}
      <TransactionFormButton accounts={accounts} categories={categories} variant="fab" />
    </div>
  );
}
