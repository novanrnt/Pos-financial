import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { Sidebar, BottomNav } from '@/components/nav';
import { BottomNavigation } from '@/components/bottom-navigation';
export const dynamic='force-dynamic';
export default async function AppLayout({children}:{children:React.ReactNode}){
  const u=await requireUser();
  if(!u)redirect('/login');
  return <div className="min-h-screen bg-premium-bg">
    <Sidebar/>
    <main className="md:pl-[276px] pt-16 md:pt-0 pb-24 md:pb-8">
      <div className="mx-auto max-w-[1480px] p-4 md:p-6 xl:p-8">
        {children}
      </div>
    </main>
    <BottomNav/>
    <BottomNavigation/>
  </div>
}
