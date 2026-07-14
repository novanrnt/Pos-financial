'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Key, Eye, EyeOff } from 'lucide-react';
import { processChat } from '@/lib/chat-actions';
import { rupiah } from '@/lib/utils';

export function ChatBot() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('pos_ai_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string; data?: any }[]>([
    { role: 'bot', text: 'Halo! Masukkan API Key sumopod dulu di atas, lalu ketik transaksi.\n\nContoh:\n• beli bubur 20rb BCA\n• gajian 5jt BCA 2890\n• isi bensin 50rb' },
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
      const typeLabel = res.type === 'INCOME' ? '💰 Pemasukan' : '💸 Pengeluaran';
      setMessages(prev => [...prev, {
        role: 'bot',
        text: `✅ Berhasil dicatat!\n\n${typeLabel}\nNominal: ${rupiah(res.amount)}\nRekening: ${res.account}\nKeterangan: ${res.description}`,
        data: res,
      }]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '65vh', maxHeight: 600,
      borderRadius: 16, overflow: 'hidden',
      background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)',
    }}>
      {/* API Key Input */}
      <div style={{
        padding: '10px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Key size={14} style={{ color: '#FF9F0A', flexShrink: 0 }} />
        <input
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          type={showKey ? 'text' : 'password'}
          placeholder="sk-... (API Key sumopod)"
          style={{
            flex: 1, padding: '6px 10px', borderRadius: 8, border: '0.5px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 12, outline: 'none',
          }}
        />
        <button onClick={() => setShowKey(!showKey)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
          {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button onClick={saveKey} style={{
          padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: '#FF9F0A', color: '#fff', fontSize: 11, fontWeight: 600,
        }}>Simpan</button>
      </div>

      {/* Messages */}
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
