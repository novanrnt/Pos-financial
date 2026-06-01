'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Wallet, Briefcase, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Stats', href: '/reports', icon: BarChart3 },
  { name: 'Wallet', href: '/accounts', icon: Wallet },
  { name: 'Business', href: '/cars', icon: Briefcase },
  { name: 'Profile', href: '/settings', icon: User }
] as const;

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="bottom-nav md:hidden fixed z-40 h-[72px] rounded-full border border-white/10 bg-[#11151C]/90 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      style={{
        width: 'calc(100% - 48px)',
        maxWidth: '380px',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 'calc(16px + env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 active:scale-95',
                isActive
                  ? 'bg-gradient-to-br from-[#1a2438] to-[#101a2b] text-[#eaf2ff] shadow-lg shadow-cyan-500/20 ring-1 ring-white/10'
                  : 'text-[#90a1bf] hover:text-[#eaf2ff]'
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-black mt-1 uppercase tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
