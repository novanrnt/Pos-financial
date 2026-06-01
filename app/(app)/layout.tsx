import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { Sidebar, BottomNav } from '@/components/nav';
import { BottomNavigation } from '@/components/bottom-navigation';
import { InstallPWAHint } from '@/components/install-pwa-hint';
export const dynamic='force-dynamic';
export default async function AppLayout({children}:{children:React.ReactNode}){
  const u=await requireUser();
  if(!u)redirect('/login');
  return <div className="app-shell min-h-[100dvh] bg-premium-bg text-premium-text">
    <Sidebar/>
    <main className="md:pl-[276px] pt-[env(safe-area-inset-top)] md:pt-0 pb-[calc(120px+env(safe-area-inset-bottom))] md:pb-8 overflow-y-auto">
      <div className="mx-auto w-full max-w-[480px] md:max-w-[1480px] p-4 md:p-6 xl:p-8">
        <InstallPWAHint />
        {children}
      </div>
    </main>
    <BottomNav/>
    <BottomNavigation/>
  </div>
}
