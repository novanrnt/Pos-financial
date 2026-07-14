import { requireUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ChatBot } from '@/components/chat-bot';

export default async function ChatPage() {
  const u = await requireUser();
  if (!u) redirect('/login');
  
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-[17px] font-semibold text-white" style={{ letterSpacing: -0.2 }}>AI Chat</h1>
        <p className="text-[13px] text-white/40 mt-1">Catat transaksi dengan ngobrol aja</p>
      </div>
      <ChatBot />
    </div>
  );
}
