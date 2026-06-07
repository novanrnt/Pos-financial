import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { InstallPWAHint } from '@/components/install-pwa-hint';
import { BottomNavigation } from '@/components/bottom-navigation';

export const dynamic='force-dynamic';

export default async function AppLayout({children}:{children:React.ReactNode}){
  const u=await requireUser();
  if(!u)redirect('/login');
  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100dvh' }}>
      <main className="overflow-y-auto" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'calc(90px + env(safe-area-inset-bottom, 0px))' }}>
        <div className="mx-auto w-full max-w-[480px] md:max-w-[600px] px-4 pt-4 pb-6 md:px-5 md:pt-5">
          <InstallPWAHint />
          {children}
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
