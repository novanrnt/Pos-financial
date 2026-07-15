'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Wallet, Bot } from 'lucide-react';

const tabs = [
  { label: 'Beranda', href: '/dashboard', icon: Home },
  { label: 'Stats', href: '/reports', icon: BarChart3 },
  { label: 'Kantong', href: '/accounts', icon: Wallet },
  { label: 'Chat', href: '/chat', icon: Bot },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-[calc(8px+env(safe-area-inset-bottom))] pt-2"
      style={{ pointerEvents: 'none' }}>
      <div className="flex items-center justify-around px-2 py-1.5 rounded-[28px]"
          style={{
            pointerEvents: 'auto',
            width: 'calc(100% - 48px)',
            maxWidth: 380,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(50px) saturate(200%)',
            WebkitBackdropFilter: 'blur(50px) saturate(200%)',
            border: '0.5px solid rgba(0,0,0,0.08)',
            boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
          }}>
          {tabs.map(tab => {
            const active = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link key={tab.href} href={tab.href}
                className="flex flex-col items-center gap-0.5 py-2 px-4 rounded-[16px] transition-all active-scale"
                style={{ minWidth: 52, background: active ? 'rgba(255,159,10,0.12)' : 'transparent' }}>
                <Icon size={22} style={{ color: active ? '#FF9F0A' : 'rgba(0,0,0,0.4)' }} />
                <span style={{
                  fontSize: 9, fontWeight: 600, letterSpacing: '0.3px',
                  color: active ? '#FF9F0A' : 'rgba(0,0,0,0.3)',
                }}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
  );
}
