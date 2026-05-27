import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowDownRight, ArrowUpRight, Car, CreditCard, Plus, Receipt, WalletCards, TrendingUp, Activity, CalendarDays, Zap, Utensils, Fuel, Wrench, Dumbbell, DollarSign, ShoppingCart, Home, Smartphone, Gamepad2, BookOpen, Heart, Plane, Gift, Music, Coffee } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { rupiah, ym } from '@/lib/utils';
import { Card, SectionHeader, StatCard, PageTitle, Badge } from '@/components/ui';
import { BalanceCard, PeriodTabs, StatRow, EmptyState, ChartCard, ProgressBar } from '@/components/premium';
import { CashflowChart, CategoryPie, NetWorthGrowthChart, WeeklyCashflowChart } from '@/components/charts';

const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const monthLong = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

// Category icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
  'Makan': <Utensils size={18} />,
  'BBM': <Fuel size={18} />,
  'Servis': <Wrench size={18} />,
  'Olahraga': <Dumbbell size={18} />,
  'Investasi': <TrendingUp size={18} />,
  'Gaji': <DollarSign size={18} />,
  'Belanja': <ShoppingCart size={18} />,
  'Rumah': <Home size={18} />,
  'Gadget': <Smartphone size={18} />,
  'Gaming': <Gamepad2 size={18} />,
  'Buku': <BookOpen size={18} />,
  'Kesehatan': <Heart size={18} />,
  'Liburan': <Plane size={18} />,
  'Hadiah': <Gift size={18} />,
  'Musik': <Music size={18} />,
  'Kopi': <Coffee size={18} />,
};

function getCategoryIcon(categoryName: string): React.ReactNode {
  return categoryIcons[categoryName] || <ShoppingCart size={18} />;
}

export default async function Dashboard(){
  const u=await requireUser();
  if(!u)redirect('/login');
  if(!u.setupCompleted)redirect('/setup');
  const uid=u.id;
  const now=new Date();
  const month=ym(now);
  const startYear=new Date(now.getFullYear(),0,1);
  const endYear=new Date(now.getFullYear(),11,31,23,59,59);
  const [accounts,cars,debts,invest,tx,allYear,bills]=await Promise.all([
    prisma.account.findMany({where:{userId:uid},orderBy:{isPrimary:'desc'}}),
    prisma.car.findMany({where:{userId:uid,status:'AVAILABLE'},include:{costs:true},orderBy:{createdAt:'desc'}}),
    prisma.debt.findMany({where:{userId:uid,status:'ACTIVE'},orderBy:{dueDate:'asc'},take:6}),
    prisma.investmentSnapshot.findMany({where:{userId:uid,month}}),
    prisma.transaction.findMany({where:{userId:uid},include:{category:true,account:true},orderBy:{date:'desc'},take:16}),
    prisma.transaction.findMany({where:{userId:uid,date:{gte:startYear,lte:endYear}},include:{category:true},orderBy:{date:'asc'}}),
    prisma.recurringBill.findMany({where:{userId:uid,status:'UNPAID'},include:{account:true},orderBy:{dueDay:'asc'},take:5})
  ]);

  const cash=accounts.reduce((a,x)=>a+Number(x.balance),0);
  const carAsset=cars.reduce((a,c)=>a+Number(c.purchasePrice)+c.costs.reduce((s,k)=>s+Number(k.amount),0),0);
  const debt=debts.filter(d=>d.type==='DEBT').reduce((a,d)=>a+Number(d.remainingAmount),0);
  const rec=debts.filter(d=>d.type==='RECEIVABLE').reduce((a,d)=>a+Number(d.remainingAmount),0);
  const inv=invest.reduce((a,i)=>a+Number(i.balance),0);
  const invExcludeRnd=invest.filter(i=>i.category!=='R&D / Eksperimen').reduce((a,i)=>a+Number(i.balance),0);
  const totalAssets=cash+carAsset+invExcludeRnd;
  const monthTx=allYear.filter(t=>ym(t.date)===month);
  const income=monthTx.filter(t=>t.type==='INCOME').reduce((a,t)=>a+Number(t.amount),0);
  const expense=monthTx.filter(t=>t.type==='EXPENSE').reduce((a,t)=>a+Number(t.amount),0);
  const savings=income-expense;
  const netWorth=cash+carAsset+inv+rec-debt;
  const healthScore=Math.max(0,Math.min(100,Math.round((cash+inv+rec)/(Math.max(1,debt+expense))*25)));
  const chartData=months.map((m,i)=>{const list=allYear.filter(t=>t.date.getMonth()===i);const inc=list.filter(t=>t.type==='INCOME').reduce((a,t)=>a+Number(t.amount),0);const exp=list.filter(t=>t.type==='EXPENSE').reduce((a,t)=>a+Number(t.amount),0);return {name:m,income:inc,expense:exp,savings:inc-exp};});
  const netWorthGrowthData=months.slice(0,now.getMonth()+1).map((m,i)=>{
    const futureTx=allYear.filter(t=>t.date.getMonth()>i);
    const futureNet=futureTx.reduce((a,t)=>a+(t.type==='INCOME'?-Number(t.amount):t.type==='EXPENSE'?Number(t.amount):0),0);
    const monthInvest=invest.reduce((a,x)=>a+Number(x.balance),0);
    const estimatedNetWorth=Math.max(0,netWorth+futureNet);
    return {name:m,netWorth:estimatedNetWorth,cash:Math.max(0,cash+futureNet),assets:carAsset+monthInvest+rec};
  });
  const weekStart=new Date(now); weekStart.setDate(now.getDate()-now.getDay()+1); weekStart.setHours(0,0,0,0);
  const dayNames=['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  const weeklyCashflowData=dayNames.map((name,idx)=>{
    const d=new Date(weekStart); d.setDate(weekStart.getDate()+idx);
    const list=allYear.filter(t=>t.date.getFullYear()===d.getFullYear()&&t.date.getMonth()===d.getMonth()&&t.date.getDate()===d.getDate());
    const inc=list.filter(t=>t.type==='INCOME').reduce((a,t)=>a+Number(t.amount),0);
    const exp=list.filter(t=>t.type==='EXPENSE').reduce((a,t)=>a+Number(t.amount),0);
    return {name,income:inc,expense:exp,net:inc-exp};
  });
  const weeklyIncome=weeklyCashflowData.reduce((a,d)=>a+d.income,0);
  const weeklyExpense=weeklyCashflowData.reduce((a,d)=>a+d.expense,0);
  const weeklyNet=weeklyIncome-weeklyExpense;
  const topExpenseDay=weeklyCashflowData.slice().sort((a,b)=>b.expense-a.expense)[0];
  const lastNetWorthPoint=netWorthGrowthData.length > 1 ? netWorthGrowthData[netWorthGrowthData.length - 2].netWorth : netWorth;
  const netWorthGrowthPct=lastNetWorthPoint?((netWorth-lastNetWorthPoint)/lastNetWorthPoint)*100:0;
  const expensePie=Object.values(monthTx.filter(t=>t.type==='EXPENSE'&&t.category).reduce((m:any,t)=>{const n=t.category!.name;m[n]={name:n,value:(m[n]?.value||0)+Number(t.amount)};return m},{})) as {name:string;value:number}[];
  const incomePie=Object.values(monthTx.filter(t=>t.type==='INCOME'&&t.category).reduce((m:any,t)=>{const n=t.category!.name;m[n]={name:n,value:(m[n]?.value||0)+Number(t.amount)};return m},{})) as {name:string;value:number}[];
  const topExpenseCategory=expensePie.slice().sort((a,b)=>b.value-a.value)[0];
  const topIncomeCategory=incomePie.slice().sort((a,b)=>b.value-a.value)[0];
  
  // Today's transactions
  const today=new Date();
  today.setHours(0,0,0,0);
  const tomorrow=new Date(today);
  tomorrow.setDate(tomorrow.getDate()+1);
  const todayTx=allYear.filter(t=>t.date>=today&&t.date<tomorrow);
  const todayIncome=todayTx.filter(t=>t.type==='INCOME').reduce((a,t)=>a+Number(t.amount),0);
  const todayExpense=todayTx.filter(t=>t.type==='EXPENSE').reduce((a,t)=>a+Number(t.amount),0);

  return <div className="space-y-5 md:space-y-6">
    {/* Header */}
    <div className="glass-premium rounded-3xl p-6 md:p-8 overflow-hidden relative">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <Badge variant="default" className="mb-3">Financial • POS Finance</Badge>
            <h1 className="text-3xl md:text-4xl font-black text-premium-text tracking-tight">~ Hai, {u.fullName || 'Owner'}.</h1>
            <p className="mt-2 text-sm text-premium-text-muted max-w-2xl">Track smarter, invest wiser, dan pantau semua cashflow dari satu dashboard premium.</p>
          </div>
        </div>
      </div>
    </div>

    {/* Balance Card */}
    <BalanceCard 
      total={netWorth} 
      income={income} 
      expense={expense} 
      profit={savings}
      hidden={false}
    />

    {/* Today's Summary */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <div className="glass-premium rounded-2xl p-4 md:p-5 border border-premium-income/20">
        <div className="flex items-center gap-2 mb-2">
          <ArrowUpRight size={16} className="text-premium-income" />
          <p className="text-xs font-black text-premium-text-muted uppercase">Hari Ini</p>
        </div>
        <p className="text-lg md:text-xl font-black text-premium-income">{rupiah(todayIncome)}</p>
        <p className="text-xs text-premium-text-muted mt-1">{todayTx.filter(t=>t.type==='INCOME').length} transaksi</p>
      </div>
      
      <div className="glass-premium rounded-2xl p-4 md:p-5 border border-premium-expense/20">
        <div className="flex items-center gap-2 mb-2">
          <ArrowDownRight size={16} className="text-premium-expense" />
          <p className="text-xs font-black text-premium-text-muted uppercase">Hari Ini</p>
        </div>
        <p className="text-lg md:text-xl font-black text-premium-expense">{rupiah(todayExpense)}</p>
        <p className="text-xs text-premium-text-muted mt-1">{todayTx.filter(t=>t.type==='EXPENSE').length} transaksi</p>
      </div>

      <div className="glass-premium rounded-2xl p-4 md:p-5 border border-violet-500/20">
        <p className="text-xs font-black text-premium-text-muted uppercase mb-2">Bulan Ini</p>
        <p className="text-lg md:text-xl font-black text-violet-300">{rupiah(income)}</p>
        <p className="text-xs text-premium-text-muted mt-1">{monthTx.filter(t=>t.type==='INCOME').length} transaksi</p>
      </div>

      <div className="glass-premium rounded-2xl p-4 md:p-5 border border-rose-500/20">
        <p className="text-xs font-black text-premium-text-muted uppercase mb-2">Bulan Ini</p>
        <p className="text-lg md:text-xl font-black text-rose-300">{rupiah(expense)}</p>
        <p className="text-xs text-premium-text-muted mt-1">{monthTx.filter(t=>t.type==='EXPENSE').length} transaksi</p>
      </div>
    </div>

    {/* Period Selector */}
    <div className="glass-premium rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide">Periode</p>
        <p className="text-xs font-black text-violet-300">{monthLong[now.getMonth()]} {now.getFullYear()}</p>
      </div>
      <PeriodTabs 
        periods={monthLong} 
        active={monthLong[now.getMonth()]}
      />
    </div>

    {/* Main Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <StatCard label="Pemasukan" value={income} hint={`${monthTx.filter(t=>t.type==='INCOME').length} transaksi`} tone="green" trend="up" />
      <StatCard label="Pengeluaran" value={expense} hint={`${monthTx.filter(t=>t.type==='EXPENSE').length} transaksi`} tone="red" trend="down" />
      <StatCard label="Net Savings" value={savings} hint={savings>=0?'Positif':'Negatif'} tone={savings>=0?'purple':'red'} />
      <StatCard label="Investasi" value={inv} hint="Saldo bulan ini" tone="blue" />
    </div>

    {/* Assets Summary */}
    <Card variant="accent" className="p-6 md:p-8">
      <SectionHeader title="Total Aset" desc="Ringkasan semua aset kamu" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-6">
        <StatRow label="Saldo Rekening" value={cash} color="income" />
        <StatRow label="Aset Mobil" value={carAsset} color="neutral" />
        <StatRow label="Investasi (ex R&D)" value={invExcludeRnd} color="savings" />
      </div>
      <div className="mt-6 pt-6 border-t border-premium-border-soft">
        <p className="text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Total</p>
        <p className="text-3xl md:text-4xl font-black text-premium-income">{rupiah(totalAssets)}</p>
      </div>
    </Card>

    {/* Charts Grid */}
    <div className="grid lg:grid-cols-2 gap-5 md:gap-6">
      {/* Cashflow Chart */}
      <ChartCard title="Financial Trend" footer={<Link href="/reports" className="text-xs font-black text-violet-300 hover:text-violet-200">Lihat Laporan →</Link>}>
        <CashflowChart data={chartData}/>
      </ChartCard>

      {/* Net Worth Growth */}
      <ChartCard title="Pertumbuhan Net Worth" footer={<Badge variant={netWorthGrowthPct>=0?'success':'danger'} className="text-xs">{netWorthGrowthPct>=0?'+':''}{netWorthGrowthPct.toFixed(1)}%</Badge>}>
        <NetWorthGrowthChart data={netWorthGrowthData}/>
      </ChartCard>
    </div>

    {/* Weekly & Insights */}
    <div className="grid lg:grid-cols-2 gap-5 md:gap-6">
      {/* Weekly Cashflow */}
      <ChartCard title="Cashflow Mingguan" footer={<Badge variant={weeklyNet>=0?'success':'danger'} className="text-xs">{weeklyNet>=0?'+':''}{rupiah(weeklyNet)}</Badge>}>
        <WeeklyCashflowChart data={weeklyCashflowData}/>
      </ChartCard>

      {/* Quick Insights */}
      <div className="glass-premium rounded-3xl p-6 md:p-8">
        <h3 className="text-lg md:text-xl font-black text-premium-text mb-6">Insight Cepat</h3>
        <div className="space-y-4">
          <div className="soft-card rounded-2xl p-4 border border-premium-border-soft">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black text-premium-text-muted uppercase">Health Score</p>
                <p className="text-2xl font-black text-violet-300 mt-2">{healthScore}/100</p>
              </div>
              <Zap size={20} className="text-violet-300 opacity-50" />
            </div>
          </div>
          
          <div className="soft-card rounded-2xl p-4 border border-premium-border-soft">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black text-premium-text-muted uppercase">Hutang Aktif</p>
                <p className={`text-2xl font-black mt-2 ${debt > 0 ? 'text-premium-expense' : 'text-premium-income'}`}>{rupiah(debt)}</p>
              </div>
              <CreditCard size={20} className={debt > 0 ? 'text-premium-expense opacity-50' : 'text-premium-income opacity-50'} />
            </div>
          </div>

          <div className="soft-card rounded-2xl p-4 border border-premium-border-soft">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black text-premium-text-muted uppercase">Piutang Aktif</p>
                <p className="text-2xl font-black text-premium-income mt-2">{rupiah(rec)}</p>
              </div>
              <ArrowUpRight size={20} className="text-premium-income opacity-50" />
            </div>
          </div>

          {topExpenseCategory && (
            <div className="soft-card rounded-2xl p-4 border border-premium-border-soft">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-black text-premium-text-muted uppercase">Top Pengeluaran</p>
                  <p className="text-lg font-black text-premium-expense mt-2">{topExpenseCategory.name}</p>
                </div>
                <div className="text-premium-expense opacity-50">{getCategoryIcon(topExpenseCategory.name)}</div>
              </div>
              <p className="text-sm font-black text-premium-text">{rupiah(topExpenseCategory.value)}</p>
            </div>
          )}

          {topIncomeCategory && (
            <div className="soft-card rounded-2xl p-4 border border-premium-border-soft">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-black text-premium-text-muted uppercase">Top Pemasukan</p>
                  <p className="text-lg font-black text-premium-income mt-2">{topIncomeCategory.name}</p>
                </div>
                <div className="text-premium-income opacity-50">{getCategoryIcon(topIncomeCategory.name)}</div>
              </div>
              <p className="text-sm font-black text-premium-text">{rupiah(topIncomeCategory.value)}</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Category Breakdown */}
    <div className="grid lg:grid-cols-2 gap-5 md:gap-6">
      {/* Income by Category */}
      {incomePie.length > 0 && (
        <ChartCard title="Pemasukan per Kategori">
          <CategoryPie data={incomePie}/>
        </ChartCard>
      )}

      {/* Expense by Category - Table Format */}
      {expensePie.length > 0 && (
        <div className="glass-premium rounded-3xl p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-black text-premium-text mb-6">Pengeluaran per Kategori</h3>
          <div className="space-y-3">
            {expensePie.slice().sort((a,b)=>b.value-a.value).map((cat, idx) => {
              const percent = (cat.value / expense) * 100;
              return (
                <div key={idx} className="soft-card rounded-2xl p-4 border border-premium-border-soft">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-premium-expense opacity-70">{getCategoryIcon(cat.name)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-premium-text truncate">{cat.name}</p>
                      <p className="text-xs text-premium-text-muted">{rupiah(cat.value)}</p>
                    </div>
                    <p className="text-xs font-black text-premium-text-muted shrink-0">{Math.round(percent)}%</p>
                  </div>
                  <div className="h-2 bg-white/[.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-premium-expense rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  </div>;
}
