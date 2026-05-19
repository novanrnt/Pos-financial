import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { Sidebar, BottomNav } from '@/components/nav';
export const dynamic='force-dynamic';
export default async function AppLayout({children}:{children:React.ReactNode}){
  const u=await requireUser();
  if(!u)redirect('/login');
  return <div className="min-h-screen"><Sidebar/><main className="md:pl-[276px] pt-16 md:pt-0"><div className="mx-auto max-w-[1480px] p-3 md:p-6 xl:p-8 pb-8">{children}</div></main><BottomNav/></div>
}
