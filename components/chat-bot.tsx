'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Key, Eye, EyeOff } from 'lucide-react';
import { processChat } from '@/lib/chat-actions';
import { rupiah } from '@/lib/utils';

export function ChatBot() {
  const [apiKey, setApiKey] = useState(() => '');
  const [showKey, setShowKey] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string; data?: any }[]>([
    { role: 'bot', text: 'Halo! Gw bisa bantu catat transaksi, adjust saldo, bayar hutang, dan lainnya.\n\nContoh:\n• beli bubur 20rb BCA\n• adjust saldo BCA 2890 jadi 50jt\n• bayar hutang mamah 500rb\n• tambah tagihan listrik 200rb' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const saveKey = () => {
    localStorage.setItem('pos_ai_key', apiKey);
    setMessages(prev => [...prev, { role: 'bot', text: '✅ API Key tersimpan! Sekarang coba chat.' }]);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    if (!apiKey) { setMessages(prev => [...prev, { role: 'bot', text: '❌ Isi API Key dulu di atas!' }]); return; }
    
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    const fd = new FormData();
    fd.append('text', userText);
    fd.append('apiKey', apiKey);
    const res = await processChat(fd);

    if (res.error) {
      setMessages(prev => [...prev, { role: 'bot', text: `❌ ${res.error}` }]);
    } else if (res.success) {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: res.msg || `✅ Berhasil!`,
        data: res,
      }]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '60vh', maxHeight: 500,
      borderRadius: 16, overflow: 'hidden',
      background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)',
    }}>
      <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '10px 14px', borderRadius: 16,
              fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap',
              background: m.role === 'user' ? 'rgba(191,90,242,0.2)' : 'rgba(255,255,255,0.06)',
              color: '#fff',
              border: m.role === 'user' ? '0.5px solid rgba(191,90,242,0.3)' : '0.5px solid rgba(255,255,255,0.08)',
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '10px 14px', borderRadius: 16, fontSize: 13,
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
              border: '0.5px solid rgba(255,255,255,0.08)',
            }}>
              Memproses...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ketik transaksi..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 12, border: '0.5px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 13, outline: 'none',
          }}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{
          width: 40, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: loading ? 'rgba(255,255,255,0.1)' : '#BF5AF2',
          color: '#fff', display: 'grid', placeItems: 'center', opacity: loading || !input.trim() ? 0.5 : 1,
        }}>
          <Send size={16} />
        </button>
      </div>

      {/* Example chips */}
      <div style={{ display: 'flex', gap: 6, padding: '0 12px 12px', flexWrap: 'wrap' }}>
        {['beli bubur 20rb BCA', 'isi bensin 50rb', 'gajian 5jt'].map(ex => (
          <button key={ex} onClick={() => setInput(ex)}
            style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 11, border: '0.5px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
            }}
          >{ex}</button>
        ))}
      </div>
    </div>
  );
}
