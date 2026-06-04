import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { Sidebar, BottomNav } from '@/components/nav';
import { BottomNavigation } from '@/components/bottom-navigation';
import { InstallPWAHint } from '@/components/install-pwa-hint';

export const dynamic='force-dynamic';

export default async function AppLayout({children}:{children:React.ReactNode}){
  const u=await requireUser();
  if(!u)redirect('/login');
  return (
    <div className="app-shell min-h-[100dvh]" style={{ background: '#000', color: '#fff' }}>
      <Sidebar/>
      <BottomNav/>
      <main className="md:pl-[260px] pt-[calc(52px+env(safe-area-inset-top))] md:pt-[env(safe-area-inset-top)] pb-[calc(80px+env(safe-area-inset-bottom))] md:pb-6 overflow-y-auto">
        <div className="mx-auto w-full max-w-[480px] md:max-w-[1400px] p-4 md:p-6 xl:p-8">
          <InstallPWAHint />
          {children}
        </div>
      </main>
      <BottomNavigation/>
    </div>
  );
}
