'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, CreditCard, FileText, Home, Layers, LogOut, PiggyBank, Receipt, Repeat, Settings, WalletCards, Plus, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const items = [
  ['Dashboard','/dashboard',Home],
  ['Rekening','/accounts',WalletCards],
  ['Transaksi','/transactions',Repeat],
  ['Mobil','/cars',Car],
  ['Hutang','/debts',CreditCard],
  ['Investasi','/investments',PiggyBank],
  ['Tagihan','/bills',Receipt],
  ['Kategori','/categories',Layers],
  ['Laporan','/reports',FileText],
  ['Setting','/settings',Settings]
] as const;

export function Sidebar(){
  const p=usePathname();
  return <aside className="hide-mobile fixed inset-y-0 left-0 z-30 w-[276px] border-r border-white/10 bg-[#080811] p-4">
    <div className="mb-6 rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-violet-500/20 via-white/[.04] to-emerald-400/10 p-4 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-500/20 text-violet-200 font-black">P</div>
        <div>
          <div className="text-2xl font-black tracking-[-.05em]">POS</div>
          <div className="text-[11px] text-slate-400">Showroom Finance OS</div>
        </div>
      </div>
    </div>
    <nav className="space-y-1.5">
      {items.map(([n,h,I])=>
        <Link key={h} href={h} className={cn('group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-slate-400 hover:bg-white/[.06] hover:text-white transition',p.startsWith(h)&&'bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/15')}>
          <I size={18} className={cn('text-slate-500 group-hover:text-violet-200',p.startsWith(h)&&'text-violet-200')}/>
          {n}
        </Link>
      )}
    </nav>
    <form action="/api/logout" method="post" className="absolute bottom-4 left-4 right-4">
      <button className="btn btn-ghost w-full"><LogOut size={18}/> Logout</button>
    </form>
  </aside>
}

export function BottomNav(){
  const p=usePathname();
  const [open,setOpen]=useState(false);
  
  return <>
    <Link href="/transactions" className="md:hidden fixed bottom-6 right-4 z-40 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 text-white shadow-2xl shadow-violet-500/25 hover:scale-110 transition">
      <Plus size={24}/>
    </Link>
    
    <div className="md:hidden fixed top-3 left-3 z-40">
      <button onClick={()=>setOpen(!open)} className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0b0b15] border border-white/10 text-violet-200 hover:bg-white/[.06] transition">
        <Menu size={22}/>
      </button>
    </div>
    
    {open&&<div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={()=>setOpen(false)}></div>}
    
    {open&&<div className="md:hidden fixed inset-y-0 left-0 z-50 w-[280px] rounded-r-[1.5rem] border-r border-white/10 bg-[#080811] p-4 shadow-2xl overflow-y-auto animate-in slide-in-from-left">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xl font-black tracking-[-.05em]">Menu</div>
          <div className="text-[11px] text-slate-400">Navigasi</div>
        </div>
        <button onClick={()=>setOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-white/[.06] transition">
          <X size={20}/>
        </button>
      </div>
      <nav className="space-y-1.5">
        {items.map(([n,h,I])=>
          <Link key={h} href={h} onClick={()=>setOpen(false)} className={cn('group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-slate-400 hover:bg-white/[.06] hover:text-white transition',p.startsWith(h)&&'bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/15')}>
            <I size={18} className={cn('text-slate-500 group-hover:text-violet-200',p.startsWith(h)&&'text-violet-200')}/>
            {n}
          </Link>
        )}
      </nav>
      <form action="/api/logout" method="post" className="mt-6 pt-6 border-t border-white/10">
        <button className="btn btn-ghost w-full"><LogOut size={18}/> Logout</button>
      </form>
    </div>}
  </>
}
