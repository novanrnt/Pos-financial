import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { InstallPWAHint } from '@/components/install-pwa-hint';

export const dynamic='force-dynamic';

export default async function AppLayout({children}:{children:React.ReactNode}){
  const u=await requireUser();
  if(!u)redirect('/login');
  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100dvh' }}>
      <main className="overflow-y-auto">
        <div className="mx-auto w-full max-w-[480px] md:max-w-[600px] p-4 md:p-5">
          <InstallPWAHint />
          {children}
        </div>
      </main>
    </div>
  );
}
