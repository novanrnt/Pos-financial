import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowDownRight, ArrowUpRight, Car, CreditCard, Plus, Receipt, WalletCards, TrendingUp, Activity, CalendarDays } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { rupiah, ym } from '@/lib/utils';
import { Card, SectionHeader, StatCard } from '@/components/ui';
import { CashflowChart, CategoryPie, NetWorthGrowthChart, WeeklyCashflowChart } from '@/components/charts';

const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const monthLong = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

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

  return <div className="space-y-4 md:space-y-5">
    <Card className="overflow-hidden relative">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="badge text-violet-200">Financial Project • POS</p>
          <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-[-.06em]">Halo, {u.fullName || 'Owner'}.</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">Track smarter, invest wiser, dan pantau semua cashflow showroom dari satu dashboard mobile responsive.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative grid h-24 w-24 place-items-center rounded-full border border-white/10 bg-white/[.04]">
            <div className="absolute inset-2 rounded-full border-4 border-violet-500/35 border-t-emerald-400" />
            <div className="text-center"><div className="text-2xl font-black text-rose-300">{healthScore}</div><div className="text-[10px] text-slate-500">Health Score</div></div>
          </div>
          <div className="text-right"><div className="text-xs text-slate-500">Net Worth</div><div className="text-lg md:text-2xl font-black text-violet-200">{rupiah(netWorth)}</div></div>
        </div>
      </div>
    </Card>

    <Card className="p-3 md:p-4">
      <div className="mb-3 flex items-center justify-between px-1"><p className="text-xs font-black text-slate-400 uppercase tracking-wide">Period</p><p className="text-xs font-black text-violet-300">{monthLong[now.getMonth()]} {now.getFullYear()}</p></div>
      <div className="hide-scroll flex gap-2 overflow-x-auto pb-1">{monthLong.map((m,i)=><div key={m} className={`shrink-0 rounded-2xl px-4 py-3 text-xs font-black ${i===now.getMonth()?'bg-violet-500 text-white shadow-lg shadow-violet-500/20':'bg-white/[.035] text-slate-500'}`}>{m}</div>)}</div>
    </Card>

    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mobile-card-grid">
      <StatCard label="Income" value={income} hint={`${monthTx.filter(t=>t.type==='INCOME').length} transaksi`} tone="green" />
      <StatCard label="Expense" value={expense} hint={`${monthTx.filter(t=>t.type==='EXPENSE').length} transaksi`} tone="red" />
      <StatCard label="Net Savings" value={savings} hint={savings>=0?'Cashflow positif':'Cashflow negatif'} tone={savings>=0?'purple':'red'} />
      <StatCard label="Investasi" value={inv} hint="Saldo bulan ini" tone="blue" />
    </div>

    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mobile-card-grid">
      <MiniMetric icon={<WalletCards size={18}/>} label="Saldo Rekening" value={cash} />
      <MiniMetric icon={<Car size={18}/>} label="Aset Mobil" value={carAsset} />
      <MiniMetric icon={<CreditCard size={18}/>} label="Hutang" value={debt} danger />
      <MiniMetric icon={<ArrowDownRight size={18}/>} label="Piutang" value={rec} />
    </div>

    <Card className="bg-gradient-to-br from-emerald-500/10 via-white/[.04] to-emerald-400/5 border-emerald-400/20">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Saldo Rekening</p>
          <h3 className="mt-2 text-lg md:text-2xl font-black text-emerald-300">{rupiah(cash)}</h3>
        </div>
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Aset Mobil</p>
          <h3 className="mt-2 text-lg md:text-2xl font-black text-emerald-300">{rupiah(carAsset)}</h3>
        </div>
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Investasi (ex R&D)</p>
          <h3 className="mt-2 text-lg md:text-2xl font-black text-emerald-300">{rupiah(invExcludeRnd)}</h3>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-emerald-400/20">
        <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Total Aset</p>
        <h2 className="mt-2 text-2xl md:text-4xl font-black text-emerald-200">{rupiah(totalAssets)}</h2>
      </div>
    </Card>

    <Card>
      <SectionHeader title="Financial Trend" desc="Income vs expense vs savings tahun berjalan" right={<Link href="/reports" className="btn btn-ghost text-xs">Laporan</Link>} />
      <div className="overflow-x-auto hide-scroll"><CashflowChart data={chartData}/></div>
    </Card>

    <Card>
      <SectionHeader title="Pertumbuhan Net Worth" desc="Estimasi perkembangan kekayaan bersih tahun berjalan" right={<span className={`badge text-xs ${netWorthGrowthPct>=0?'text-emerald-300':'text-rose-300'}`}>{netWorthGrowthPct>=0?'+':''}{netWorthGrowthPct.toFixed(1)}%</span>} />
      <div className="overflow-x-auto hide-scroll"><NetWorthGrowthChart data={netWorthGrowthData}/></div>
    </Card>

    <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
      <Card>
        <SectionHeader title="Cashflow Mingguan" desc="Pemasukan vs pengeluaran per hari minggu ini" right={<span className={`badge text-xs ${weeklyNet>=0?'text-emerald-300':'text-rose-300'}`}>{weeklyNet>=0?'+':''}{rupiah(weeklyNet)}</span>} />
        <div className="overflow-x-auto hide-scroll"><WeeklyCashflowChart data={weeklyCashflowData}/></div>
      </Card>
      <Card>
        <SectionHeader title="Insight Otomatis" desc="Ringkasan performa keuangan cepat" />
        <div className="grid gap-3">
          <InsightBox icon={<TrendingUp size={18}/>} label="Growth Net Worth" value={`${netWorthGrowthPct>=0?'+':''}${netWorthGrowthPct.toFixed(1)}%`} hint="dibanding bulan sebelumnya" tone={netWorthGrowthPct>=0?'green':'red'} />
          <InsightBox icon={<Activity size={18}/>} label="Cashflow Minggu Ini" value={rupiah(weeklyNet)} hint={`${weeklyCashflowData.filter(d=>d.income||d.expense).length} hari ada transaksi`} tone={weeklyNet>=0?'green':'red'} />
          <InsightBox icon={<CalendarDays size={18}/>} label="Hari Boros" value={topExpenseDay?.name || '-'} hint={topExpenseDay?.expense?rupiah(topExpenseDay.expense):'belum ada expense'} tone="purple" />
          <InsightBox icon={<CreditCard size={18}/>} label="Kategori Terbesar" value={topExpenseCategory?.name || '-'} hint={topExpenseCategory?.value?rupiah(topExpenseCategory.value):'belum ada data'} tone="blue" />
        </div>
      </Card>
    </div>

    <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
      <Card>
        <SectionHeader title="Spending Breakdown" desc="Distribusi pengeluaran bulan ini" />
        <CategoryPie data={expensePie}/>
      </Card>
      <Card>
        <SectionHeader title="Quick Monitor" desc="Hutang, tagihan, dan piutang terdekat" right={<Link href="/transactions" className="btn btn-primary text-xs"><Plus size={15}/> Add</Link>} />
        <div className="space-y-3">
          {debts.length===0&&bills.length===0 ? <p className="rounded-2xl bg-white/[.04] p-4 text-sm text-slate-500">Belum ada reminder aktif.</p> : null}
          {debts.map(d=><div key={d.id} className="rounded-2xl bg-white/[.04] p-4"><div className="flex items-start justify-between gap-3"><div><span className="badge text-[10px]">{d.type==='DEBT'?'Hutang':'Piutang'}</span><h3 className="mt-2 font-black">{d.name}</h3><p className="text-xs text-slate-500">Sisa: {rupiah(d.remainingAmount)}</p></div><div className={d.type==='DEBT'?'text-rose-300':'text-emerald-300'}>{d.type==='DEBT'?<ArrowUpRight/>:<ArrowDownRight/>}</div></div></div>)}
          {bills.map(b=><div key={b.id} className="rounded-2xl bg-white/[.04] p-4"><div className="flex items-start justify-between gap-3"><div><span className="badge text-[10px]">Tagihan</span><h3 className="mt-2 font-black">{b.name}</h3><p className="text-xs text-slate-500">Due day {b.dueDay} • {b.account.name}</p></div><div className="text-amber-300"><Receipt/></div></div></div>)}
        </div>
      </Card>
    </div>

    <div className="grid gap-4 lg:grid-cols-[.85fr_1.15fr]">
      <Card>
        <SectionHeader title="Income Breakdown" desc="Distribusi pemasukan bulan ini" />
        <CategoryPie data={incomePie}/>
      </Card>
      <Card>
        <SectionHeader title="Log Transaksi" desc="Aktivitas terbaru akun dan showroom" right={<Link href="/transactions" className="btn btn-primary text-xs">+ Add Log</Link>} />
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          <TinyBox label="Pemasukan" value={income} green />
          <TinyBox label="Pengeluaran" value={expense} red />
          <TinyBox label="Net Cashflow" value={savings} purple />
          <div className="rounded-2xl bg-white/[.04] p-3"><p className="text-[10px] text-slate-500 font-black uppercase">Aktivitas</p><h4 className="mt-2 font-black">{tx.length}</h4></div>
        </div>
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 hide-scroll">{tx.map(t=><div key={t.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/[.04] p-3"><div className="min-w-0"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${t.type==='EXPENSE'?'bg-rose-400':t.type==='INCOME'?'bg-emerald-400':'bg-violet-400'}`}/><div className="font-black truncate">{t.description||t.type}</div></div><div className="mt-1 text-[11px] text-slate-500 truncate">{t.account.name} • {t.category?.name||'Transfer'} • {t.date.toLocaleDateString('id-ID')}</div></div><div className={`shrink-0 text-sm font-black ${t.type==='EXPENSE'?'text-rose-300':'text-emerald-300'}`}>{t.type==='EXPENSE'?'- ':'+ '}{rupiah(t.amount)}</div></div>)}</div>
      </Card>
    </div>
  </div>
}

function MiniMetric({icon,label,value,danger=false}:{icon:React.ReactNode;label:string;value:number;danger?:boolean}){return <div className="soft-card rounded-[1.25rem] p-4 flex items-center gap-3"><div className={`grid h-10 w-10 place-items-center rounded-2xl ${danger?'bg-rose-400/10 text-rose-300':'bg-violet-400/10 text-violet-200'}`}>{icon}</div><div className="min-w-0"><p className="text-[11px] text-slate-500 font-black uppercase truncate">{label}</p><h3 className={`mt-1 text-sm md:text-base font-black truncate ${danger?'text-rose-300':'text-slate-100'}`}>{rupiah(value)}</h3></div></div>}
function InsightBox({icon,label,value,hint,tone}:{icon:React.ReactNode;label:string;value:string;hint:string;tone:'green'|'red'|'purple'|'blue'}){const toneClass=tone==='green'?'bg-emerald-400/10 text-emerald-300':tone==='red'?'bg-rose-400/10 text-rose-300':tone==='blue'?'bg-sky-400/10 text-sky-300':'bg-violet-400/10 text-violet-300';return <div className="rounded-[1.25rem] border border-white/10 bg-white/[.035] p-4"><div className="flex items-start gap-3"><div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${toneClass}`}>{icon}</div><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</p><h4 className="mt-1 truncate text-base font-black text-white">{value}</h4><p className="mt-1 truncate text-xs text-slate-500">{hint}</p></div></div></div>}
function TinyBox({label,value,green,red,purple}:{label:string;value:number;green?:boolean;red?:boolean;purple?:boolean}){return <div className={`rounded-2xl p-3 ${green?'bg-emerald-400/10':red?'bg-rose-400/10':purple?'bg-violet-400/10':'bg-white/[.04]'}`}><p className="text-[10px] text-slate-500 font-black uppercase">{label}</p><h4 className={`mt-2 text-sm font-black ${green?'text-emerald-300':red?'text-rose-300':purple?'text-violet-300':'text-white'}`}>{rupiah(value)}</h4></div>}
