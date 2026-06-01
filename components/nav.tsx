'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, CreditCard, FileText, Home, Layers, LogOut, PiggyBank, Receipt, Repeat, Settings, WalletCards, Plus, Menu, X, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Logo } from './logo';

const items = [
  ['Dashboard','/dashboard',Home],
  ['Rekening','/accounts',WalletCards],
  ['Transaksi','/transactions',Repeat],
  ['Tabungan','/savings',PiggyBank],
  ['Mobil','/cars',Car],
  ['Hutang','/debts',CreditCard],
  ['Investasi','/investments',PiggyBank],
  ['Tagihan','/bills',Receipt],
  ['Kategori','/categories',Layers],
  ['Laporan Bulanan','/reports',FileText],
  ['Laporan Tahunan','/reports/annual',FileText],

  ['Pajak','/tax',DollarSign],
  ['Setting','/settings',Settings]
] as const;

export function Sidebar(){
  const p=usePathname();
  return (
    <aside className="hide-mobile fixed inset-y-0 left-0 z-30 w-[276px] border-r border-premium-border-soft bg-premium-bg-dark p-4">
      {/* Logo Card */}
      <div className="mb-6 rounded-2xl border border-premium-border-medium bg-gradient-to-br from-violet-500/20 via-white/[.04] to-emerald-400/10 p-4 shadow-lg">
        <Logo className="w-full" />
      </div>

      {/* Navigation */}
      <nav className="space-y-1.5">
        {items.map(([n,h,I])=>
          <Link 
            key={h} 
            href={h} 
            className={cn(
              'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black transition-all duration-300',
              p.startsWith(h)
                ? 'bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/30 shadow-lg shadow-violet-500/10'
                : 'text-premium-text-muted hover:bg-white/[.06] hover:text-premium-text'
            )}
          >
            <I size={18} className={cn(
              'transition-colors',
              p.startsWith(h) ? 'text-violet-300' : 'text-premium-text-muted group-hover:text-violet-300'
            )}/>
            {n}
          </Link>
        )}
      </nav>

      {/* Logout Button */}
      <form action="/api/logout" method="post" className="absolute bottom-4 left-4 right-4">
        <button className="btn btn-ghost w-full">
          <LogOut size={18}/> Logout
        </button>
      </form>
    </aside>
  );
}

export function BottomNav(){
  const p=usePathname();
  const [open,setOpen]=useState(false);
  
  return <>
    {/* Mobile Menu Button */}
    <div className="md:hidden fixed top-4 left-4 z-40">
      <button 
        onClick={()=>setOpen(!open)} 
        className="grid h-12 w-12 place-items-center rounded-xl bg-premium-card border border-premium-border-soft text-violet-200 hover:bg-premium-card-soft transition-all duration-300"
      >
        <Menu size={22}/>
      </button>
    </div>
    
    {/* Mobile Menu Overlay */}
    {open&&<div 
      className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
      onClick={()=>setOpen(false)}
    />}
    
    {/* Mobile Menu Drawer */}
    {open&&<div className="md:hidden fixed inset-y-0 left-0 z-50 w-[280px] rounded-r-2xl border-r border-premium-border-soft bg-premium-bg-dark p-4 shadow-premium overflow-y-auto animate-in slide-in-from-left">
      <div className="flex items-center justify-between mb-6">
        <Logo className="flex-1" />
        <button 
          onClick={()=>setOpen(false)} 
          className="grid h-10 w-10 place-items-center rounded-lg hover:bg-white/[.06] transition shrink-0"
        >
          <X size={20}/>
        </button>
      </div>

      {/* Menu Items */}
      <nav className="space-y-1.5">
        {items.map(([n,h,I])=>
          <Link 
            key={h} 
            href={h} 
            onClick={()=>setOpen(false)} 
            className={cn(
              'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black transition-all duration-300',
              p.startsWith(h)
                ? 'bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/30'
                : 'text-premium-text-muted hover:bg-white/[.06] hover:text-premium-text'
            )}
          >
            <I size={18} className={cn(
              'transition-colors',
              p.startsWith(h) ? 'text-violet-300' : 'text-premium-text-muted group-hover:text-violet-300'
            )}/>
            {n}
          </Link>
        )}
      </nav>

      {/* Logout Button */}
      <form action="/api/logout" method="post" className="mt-6 pt-6 border-t border-premium-border-soft">
        <button className="btn btn-ghost w-full">
          <LogOut size={18}/> Logout
        </button>
      </form>
    </div>}
  </>
}
