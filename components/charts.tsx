'use client';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { rupiah } from '@/lib/utils';

const money = (v: number) => rupiah(v).replace('Rp','Rp ');

export function CashflowChart({data}:{data:{name:string;income:number;expense:number;savings?:number}[]}){
  return <div className="h-[290px] md:h-[360px] min-w-[640px] md:min-w-0">
    <ResponsiveContainer>
      <AreaChart data={data} margin={{top:12,right:18,left:0,bottom:0}}>
        <defs>
          <linearGradient id="income" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={.35}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
          <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={.35}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
          <linearGradient id="savings" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={.35}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" vertical={false}/>
        <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} tick={{fontSize:11}}/>
        <YAxis stroke="#64748b" tickLine={false} axisLine={false} tick={{fontSize:11}} tickFormatter={(v)=>`${Number(v)/1000000}jt`}/>
        <Tooltip contentStyle={{background:'#11111f',border:'1px solid rgba(255,255,255,.1)',borderRadius:16,color:'#fff'}} formatter={(v:any)=>money(Number(v))}/>
        <Legend wrapperStyle={{fontSize:12}}/>
        <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2.5} fill="url(#income)" dot={{r:3}}/>
        <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2.5} fill="url(#expense)" dot={{r:3}}/>
        <Area type="monotone" dataKey="savings" name="Savings" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#savings)" dot={{r:3}}/>
      </AreaChart>
    </ResponsiveContainer>
  </div>
}

export function NetWorthGrowthChart({data}:{data:{name:string;netWorth:number;cash:number;assets:number}[]}){
  return <div className="h-[300px] md:h-[380px] min-w-[640px] md:min-w-0">
    <ResponsiveContainer>
      <LineChart data={data} margin={{top:16,right:20,left:0,bottom:0}}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" vertical={false}/>
        <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} tick={{fontSize:11}}/>
        <YAxis stroke="#64748b" tickLine={false} axisLine={false} tick={{fontSize:11}} tickFormatter={(v)=>`${Number(v)/1000000}jt`}/>
        <Tooltip contentStyle={{background:'#11111f',border:'1px solid rgba(255,255,255,.1)',borderRadius:16,color:'#fff'}} formatter={(v:any)=>money(Number(v))}/>
        <Legend wrapperStyle={{fontSize:12}}/>
        <Line type="monotone" dataKey="netWorth" name="Net Worth" stroke="#a78bfa" strokeWidth={3} dot={{r:3}} activeDot={{r:6}}/>
        <Line type="monotone" dataKey="cash" name="Cash" stroke="#10b981" strokeWidth={2} dot={false}/>
        <Line type="monotone" dataKey="assets" name="Aset + Investasi" stroke="#38bdf8" strokeWidth={2} dot={false}/>
      </LineChart>
    </ResponsiveContainer>
  </div>
}

export function WeeklyCashflowChart({data}:{data:{name:string;income:number;expense:number;net:number}[]}){
  return <div className="h-[280px] md:h-[330px] min-w-[560px] md:min-w-0">
    <ResponsiveContainer>
      <BarChart data={data} margin={{top:16,right:18,left:0,bottom:0}} barGap={6}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" vertical={false}/>
        <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} tick={{fontSize:11}}/>
        <YAxis stroke="#64748b" tickLine={false} axisLine={false} tick={{fontSize:11}} tickFormatter={(v)=>`${Number(v)/1000000}jt`}/>
        <Tooltip contentStyle={{background:'#11111f',border:'1px solid rgba(255,255,255,.1)',borderRadius:16,color:'#fff'}} formatter={(v:any)=>money(Number(v))}/>
        <Legend wrapperStyle={{fontSize:12}}/>
        <Bar dataKey="income" name="Income" radius={[12,12,0,0]} fill="#10b981" />
        <Bar dataKey="expense" name="Expense" radius={[12,12,0,0]} fill="#f43f5e" />
      </BarChart>
    </ResponsiveContainer>
  </div>
}

export function CategoryPie({data}:{data:{name:string;value:number}[]}){
  const colors=['#8b5cf6','#10b981','#f43f5e','#f59e0b','#38bdf8','#ec4899','#22c55e','#a78bfa'];
  const total=data.reduce((a,d)=>a+d.value,0)||1;
  return <div className="grid gap-4 md:grid-cols-[230px_1fr] items-center">
    <div className="h-[220px]"><ResponsiveContainer><PieChart><Pie data={data.length?data:[{name:'Belum ada',value:1}]} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={data.length?1:0}>{(data.length?data:[{name:'Belum ada',value:1}]).map((_,i)=><Cell key={i} fill={data.length?colors[i%colors.length]:'#1e293b'}/>)}</Pie><Tooltip contentStyle={{background:'#11111f',border:'1px solid rgba(255,255,255,.1)',borderRadius:16,color:'#fff'}} formatter={(v:any)=>money(Number(v))}/></PieChart></ResponsiveContainer></div>
    <div className="space-y-2">{data.length?data.slice(0,7).map((d,i)=><div key={d.name} className="flex items-center justify-between gap-3 rounded-2xl bg-white/[.04] px-3 py-2"><div className="flex items-center gap-2 min-w-0"><span className="h-2.5 w-2.5 rounded-full shrink-0" style={{background:colors[i%colors.length]}}/><span className="text-xs font-bold truncate">{d.name}</span></div><div className="text-right"><div className="text-xs font-black">{money(d.value)}</div><div className="text-[10px] text-slate-500">{Math.round((d.value/total)*100)}%</div></div></div>):<p className="text-sm text-slate-500">Belum ada data kategori.</p>}</div>
  </div>
}
