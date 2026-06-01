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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-premium-border-soft bg-premium-nav/95 backdrop-blur-xl" style={{ paddingBottom: 'var(--safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-20 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300',
                isActive
                  ? 'bg-premium-nav-active text-violet-300 shadow-lg shadow-violet-500/20'
                  : 'text-premium-text-muted hover:text-premium-text'
              )}
            >
              <Icon size={24} />
              <span className="text-[10px] font-black mt-1 uppercase tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
