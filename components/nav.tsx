'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Wallet, Repeat, PiggyBank, Car, CreditCard,
  TrendingUp, Receipt, Tags, BarChart3, Settings, X, Menu, LogOut
} from 'lucide-react';

const items = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Rekening', href: '/accounts', icon: Wallet },
  { label: 'Transaksi', href: '/transactions', icon: Repeat },
  { label: 'Tabungan', href: '/savings', icon: PiggyBank },
  { label: 'Mobil', href: '/cars', icon: Car },
  { label: 'Hutang', href: '/debts', icon: CreditCard },
  { label: 'Investasi', href: '/investments', icon: TrendingUp },
  { label: 'Tagihan', href: '/bills', icon: Receipt },
  { label: 'Kategori', href: '/categories', icon: Tags },
  { label: 'Laporan', href: '/reports', icon: BarChart3 },
  { label: 'Setting', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[260px] flex-col z-30 ios-glass-strong"
      style={{ borderRight: '0.5px solid rgba(255,255,255,0.08)' }}>
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #30D158, #0A84FF)' }}>
            <span className="text-white text-[13px] font-bold">P</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">POS Finance</span>
        </div>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto hide-scroll">
        <div className="space-y-[2px]">
          {items.map(item => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[13px] font-medium transition-all active-scale"
                style={{
                  color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                  background: active ? 'rgba(48,209,88,0.15)' : 'transparent',
                }}>
                <Icon size={17} style={{ color: active ? '#30D158' : 'rgba(255,255,255,0.4)' }} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-3 pb-6">
        <form action="/api/logout" method="POST">
          <button type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[12px] text-[13px] font-medium transition-all active-scale"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            <LogOut size={17} style={{ color: 'rgba(255,255,255,0.4)' }} />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile hamburger */}
      <div className="md:hidden fixed top-0 left-0 z-40 px-4 pt-[calc(12px+env(safe-area-inset-top))]">
        <button onClick={() => setOpen(true)}
          className="w-10 h-10 rounded-[12px] flex items-center justify-center active-scale ios-card">
          <Menu size={20} style={{ color: 'rgba(255,255,255,0.7)' }} />
        </button>
      </div>

      {/* Drawer overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)' }} />
          <div className="absolute left-0 top-0 h-full w-[260px] ios-glass-strong flex flex-col"
            style={{ borderRight: '0.5px solid rgba(255,255,255,0.08)' }}>
            <div className="p-5 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #30D158, #0A84FF)' }}>
                  <span className="text-white text-[13px] font-bold">P</span>
                </div>
                <span className="text-[15px] font-semibold tracking-tight">POS Finance</span>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-[10px] flex items-center justify-center active-scale"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <X size={18} style={{ color: 'rgba(255,255,255,0.5)' }} />
              </button>
            </div>

            <nav className="flex-1 px-3 overflow-y-auto hide-scroll">
              <div className="space-y-[2px]">
                {items.map(item => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[13px] font-medium transition-all active-scale"
                      style={{
                        color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                        background: active ? 'rgba(48,209,88,0.15)' : 'transparent',
                      }}>
                      <Icon size={17} style={{ color: active ? '#30D158' : 'rgba(255,255,255,0.4)' }} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="p-3 pb-8">
              <form action="/api/logout" method="POST">
                <button type="submit"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[12px] text-[13px] font-medium transition-all active-scale"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <LogOut size={17} style={{ color: 'rgba(255,255,255,0.4)' }} />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
