'use client';
import { useState } from 'react';
import { Card, PageTitle } from '@/components/ui';

export default function TelegramSettings() {
  const [botToken, setBotToken] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  const handleSetWebhook = async () => {
    if (!botToken || !webhookUrl || !secret) {
      setResult({ error: 'Semua field harus diisi' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: secret
        })
      });

      const data = await response.json();
      if (data.ok) {
        setResult({ success: true, message: '✅ Webhook berhasil di-set!' });
      } else {
        setResult({ error: `❌ Error: ${data.description}` });
      }
    } catch (err) {
      setResult({ error: `❌ Error: ${String(err)}` });
    } finally {
      setLoading(false);
    }
  };

  const handleGetWebhookInfo = async () => {
    if (!botToken) {
      setResult({ error: 'Bot token harus diisi' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
      const data = await response.json();
      
      if (data.ok) {
        const info = data.result;
        setResult({
          success: true,
          message: `
✅ Webhook Info:
URL: ${info.url || 'Belum di-set'}
Pending Updates: ${info.pending_update_count || 0}
Last Error: ${info.last_error_date ? new Date(info.last_error_date * 1000).toLocaleString() : 'Tidak ada'}
Last Error Message: ${info.last_error_message || 'Tidak ada'}
          `
        });
      } else {
        setResult({ error: `❌ Error: ${data.description}` });
      }
    } catch (err) {
      setResult({ error: `❌ Error: ${String(err)}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async () => {
    if (!botToken) {
      setResult({ error: 'Bot token harus diisi' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`);
      const data = await response.json();
      
      if (data.ok) {
        setResult({ success: true, message: '✅ Webhook berhasil dihapus' });
      } else {
        setResult({ error: `❌ Error: ${data.description}` });
      }
    } catch (err) {
      setResult({ error: `❌ Error: ${String(err)}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle title="Telegram Webhook" desc="Setup dan verify webhook untuk bot Telegram" />

      <Card>
        <h2 className="font-black mb-4">Set Webhook</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-black text-slate-400 mb-1">Bot Token</label>
            <input
              type="password"
              placeholder="123456789:ABCdefGHIjklmnoPQRstuvWXYZ"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 mb-1">Webhook URL</label>
            <input
              type="text"
              placeholder="https://your-domain.com/api/telegram"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 mb-1">Secret Token</label>
            <input
              type="password"
              placeholder="your_webhook_secret_here"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleSetWebhook}
              disabled={loading}
              className="btn btn-primary text-sm"
            >
              {loading ? 'Loading...' : 'Set Webhook'}
            </button>
            <button
              onClick={handleGetWebhookInfo}
              disabled={loading}
              className="btn btn-ghost text-sm"
            >
              {loading ? 'Loading...' : 'Get Info'}
            </button>
            <button
              onClick={handleDeleteWebhook}
              disabled={loading}
              className="btn btn-danger text-sm"
            >
              {loading ? 'Loading...' : 'Delete'}
            </button>
          </div>
        </div>
      </Card>

      {result && (
        <Card className={result.success ? 'border-emerald-400/30' : 'border-rose-400/30'}>
          <p className={result.success ? 'text-emerald-300' : 'text-rose-300'} style={{ whiteSpace: 'pre-wrap' }}>
            {result.message || result.error}
          </p>
        </Card>
      )}

      <Card>
        <h2 className="font-black mb-4">Format Pesan Telegram</h2>
        <div className="space-y-2 text-sm">
          <div className="bg-white/[.04] p-3 rounded-lg">
            <p className="text-emerald-300 font-mono">19 mei 2026 makan 20.000 blue</p>
            <p className="text-slate-400 text-xs mt-1">→ Pengeluaran 20.000 dari rekening blue</p>
          </div>
          <div className="bg-white/[.04] p-3 rounded-lg">
            <p className="text-emerald-300 font-mono">19 mei 2026 gaji 500.000 blue income</p>
            <p className="text-slate-400 text-xs mt-1">→ Pemasukan 500.000 ke rekening blue</p>
          </div>
          <div className="bg-white/[.04] p-3 rounded-lg">
            <p className="text-rose-300 font-mono">19 mei 2026 pinjam 100.000 blue hutang</p>
            <p className="text-slate-400 text-xs mt-1">→ Hutang 100.000 dari rekening blue</p>
          </div>
          <div className="bg-white/[.04] p-3 rounded-lg">
            <p className="text-emerald-300 font-mono">19 mei 2026 pinjamkan 50.000 blue piutang</p>
            <p className="text-slate-400 text-xs mt-1">→ Piutang 50.000 ke rekening blue</p>
          </div>
        </div>
      </Card>
    </>
  );
}
