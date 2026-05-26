'use client';
import { useState } from 'react';
import { Card, PageTitle } from '@/components/ui';

export default function TelegramSettings() {
  const [botToken, setBotToken] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'setup' | 'guide' | 'commands'>('setup');

  const handleSetWebhook = async () => {
    if (!botToken || !webhookUrl || !secret) {
      setResult({ error: '❌ Semua field harus diisi' });
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
        setResult({ success: true, message: '✅ Webhook berhasil di-set! Bot Anda sekarang siap menerima pesan.' });
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
      setResult({ error: '❌ Bot token harus diisi' });
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
          message: `✅ Webhook Info:\nURL: ${info.url || 'Belum di-set'}\nPending Updates: ${info.pending_update_count || 0}\nStatus: ${info.url ? 'Aktif' : 'Tidak aktif'}`
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
      setResult({ error: '❌ Bot token harus diisi' });
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
      <PageTitle 
        title="Integrasi Telegram" 
        desc="Setup bot Telegram untuk input pengeluaran, pemasukan, hutang, dan piutang" 
      />

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('setup')}
          className={`px-4 py-2 font-semibold text-sm transition-colors ${
            activeTab === 'setup'
              ? 'border-b-2 border-cyan-400 text-cyan-300'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          ⚙️ Setup Webhook
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-4 py-2 font-semibold text-sm transition-colors ${
            activeTab === 'guide'
              ? 'border-b-2 border-cyan-400 text-cyan-300'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          📖 Format Input
        </button>
        <button
          onClick={() => setActiveTab('commands')}
          className={`px-4 py-2 font-semibold text-sm transition-colors ${
            activeTab === 'commands'
              ? 'border-b-2 border-cyan-400 text-cyan-300'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          🤖 Perintah Bot
        </button>
      </div>

      {/* Setup Tab */}
      {activeTab === 'setup' && (
        <>
          <Card>
            <h2 className="font-black mb-4">Langkah 1: Buat Bot di BotFather</h2>
            <ol className="space-y-2 text-sm text-slate-300">
              <li>1. Buka Telegram dan cari <span className="font-mono bg-white/10 px-2 py-1 rounded">@BotFather</span></li>
              <li>2. Kirim perintah <span className="font-mono bg-white/10 px-2 py-1 rounded">/newbot</span></li>
              <li>3. Ikuti instruksi untuk membuat bot baru</li>
              <li>4. Copy bot token (contoh: <span className="font-mono bg-white/10 px-2 py-1 rounded text-xs">123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11</span>)</li>
            </ol>
          </Card>

          <Card>
            <h2 className="font-black mb-4">Langkah 2: Set Webhook</h2>
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
                <p className="text-xs text-slate-400 mt-1">Contoh: https://pos-finance.vercel.app/api/telegram</p>
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
                <p className="text-xs text-slate-400 mt-1">Gunakan string random yang kuat, misal: abc123xyz789</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleSetWebhook}
                  disabled={loading}
                  className="btn btn-primary text-sm"
                >
                  {loading ? '⏳ Loading...' : '✅ Set Webhook'}
                </button>
                <button
                  onClick={handleGetWebhookInfo}
                  disabled={loading}
                  className="btn btn-ghost text-sm"
                >
                  {loading ? '⏳ Loading...' : 'ℹ️ Get Info'}
                </button>
                <button
                  onClick={handleDeleteWebhook}
                  disabled={loading}
                  className="btn btn-danger text-sm"
                >
                  {loading ? '⏳ Loading...' : '❌ Delete'}
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

          <Card className="bg-blue-900/20 border-blue-400/30">
            <h3 className="font-black text-blue-300 mb-2">💡 Tips</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Pastikan Webhook URL menggunakan HTTPS (tidak HTTP)</li>
              <li>• Domain harus accessible dari internet</li>
              <li>• Secret token harus disimpan dengan aman</li>
              <li>• Setelah set webhook, coba kirim /start ke bot</li>
            </ul>
          </Card>
        </>
      )}

      {/* Guide Tab */}
      {activeTab === 'guide' && (
        <>
          <Card>
            <h2 className="font-black mb-4">Format Input Transaksi</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold mb-2">Pengeluaran (Expense) - Default</p>
                <div className="bg-white/[.04] p-3 rounded-lg">
                  <p className="text-emerald-300 font-mono">19 mei 2026 makan 20.000 blue</p>
                  <p className="text-slate-400 text-xs mt-1">→ Mencatat pengeluaran 20.000 dari rekening blue</p>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2">Pemasukan (Income)</p>
                <div className="bg-white/[.04] p-3 rounded-lg">
                  <p className="text-sky-300 font-mono">19 mei 2026 gaji 500.000 blue income</p>
                  <p className="text-slate-400 text-xs mt-1">→ Mencatat pemasukan 500.000 ke rekening blue</p>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2">Hutang (Debt) - Uang yang Anda Utang</p>
                <div className="bg-white/[.04] p-3 rounded-lg">
                  <p className="text-rose-300 font-mono">19 mei 2026 pinjam dari teman 100.000 blue hutang</p>
                  <p className="text-slate-400 text-xs mt-1">→ Mencatat hutang 100.000 dari rekening blue</p>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2">Piutang (Receivable) - Uang yang Orang Utang ke Anda</p>
                <div className="bg-white/[.04] p-3 rounded-lg">
                  <p className="text-amber-300 font-mono">19 mei 2026 pinjamkan ke teman 50.000 blue piutang</p>
                  <p className="text-slate-400 text-xs mt-1">→ Mencatat piutang 50.000 dari rekening blue</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-black mb-4">Breakdown Format</h2>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-slate-300 mb-1">Tanggal</p>
                  <p className="text-xs text-slate-400">1-31 (nomor hari)</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-300 mb-1">Bulan</p>
                  <p className="text-xs text-slate-400">januari/jan, februari/feb, dst</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-300 mb-1">Tahun</p>
                  <p className="text-xs text-slate-400">4 digit (2026, 2025, dst)</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-300 mb-1">Deskripsi</p>
                  <p className="text-xs text-slate-400">Nama transaksi (makan, bensin, gaji, dll)</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-300 mb-1">Nominal</p>
                  <p className="text-xs text-slate-400">Angka dengan/tanpa titik (20.000 atau 20000)</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-300 mb-1">Rekening</p>
                  <p className="text-xs text-slate-400">Nama akun di aplikasi (blue, cash, bca, dana, dll)</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-amber-900/20 border-amber-400/30">
            <h3 className="font-black text-amber-300 mb-2">⚠️ Contoh Kesalahan</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>❌ 19 Mei 2026 makan 20000 blue (spasi tidak konsisten)</li>
              <li>❌ 19/5/2026 makan 20.000 blue (format tanggal salah)</li>
              <li>❌ 19 mei 2026 makan 20,000.00 blue (format nominal aneh)</li>
              <li>✅ 19 mei 2026 makan 20.000 blue (format benar)</li>
            </ul>
          </Card>
        </>
      )}

      {/* Commands Tab */}
      {activeTab === 'commands' && (
        <>
          <Card>
            <h2 className="font-black mb-4">Perintah Bot Tersedia</h2>
            <div className="space-y-4">
              <div className="bg-white/[.04] p-4 rounded-lg">
                <p className="font-mono text-sky-300 font-semibold">/start</p>
                <p className="text-sm text-slate-300 mt-1">Memulai bot dan menampilkan pesan sambutan</p>
                <p className="text-xs text-slate-400 mt-2">Gunakan ini untuk setup awal atau testing bot</p>
              </div>

              <div className="bg-white/[.04] p-4 rounded-lg">
                <p className="font-mono text-sky-300 font-semibold">/help</p>
                <p className="text-sm text-slate-300 mt-1">Menampilkan bantuan lengkap dengan contoh format</p>
                <p className="text-xs text-slate-400 mt-2">Lihat ini jika lupa format atau ingin refresh memory</p>
              </div>

              <div className="bg-white/[.04] p-4 rounded-lg">
                <p className="font-mono text-sky-300 font-semibold">/accounts</p>
                <p className="text-sm text-slate-300 mt-1">Menampilkan daftar semua rekening dengan saldo</p>
                <p className="text-xs text-slate-400 mt-2">Gunakan ini untuk verifikasi nama rekening sebelum input</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-black mb-4">Shortcut Penggunaan</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-slate-300 mb-2">Nama Bulan Singkat</p>
                <code className="bg-white/10 p-2 rounded block text-xs">jan, feb, mar, apr, mei, jun, jul, agu, sep, okt, nov, des</code>
              </div>

              <div>
                <p className="font-semibold text-slate-300 mb-2">Format Nominal Fleksibel</p>
                <code className="bg-white/10 p-2 rounded block text-xs">20.000 = 20000 (kedua-duanya valid)</code>
              </div>

              <div>
                <p className="font-semibold text-slate-300 mb-2">Transaksi Masa Lalu</p>
                <code className="bg-white/10 p-2 rounded block text-xs">18 mei 2026 makan 30.000 cash (bisa cek transaksi kemarin)</code>
              </div>

              <div>
                <p className="font-semibold text-slate-300 mb-2">Nama Rekening Case-Insensitive</p>
                <code className="bg-white/10 p-2 rounded block text-xs">blue, BLUE, Blue, BlueMoney (semua akan cocok dengan "blue")</code>
              </div>
            </div>
          </Card>

          <Card className="bg-emerald-900/20 border-emerald-400/30">
            <h3 className="font-black text-emerald-300 mb-2">✨ Fitur Otomatis</h3>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>✅ Kategori baru dibuat otomatis jika belum ada</li>
              <li>✅ Saldo rekening diupdate otomatis sesuai transaksi</li>
              <li>✅ Semua transaksi muncul di dashboard aplikasi</li>
              <li>✅ Data real-time, tidak perlu refresh</li>
              <li>✅ Bisa diedit di aplikasi jika perlu koreksi</li>
            </ul>
          </Card>
        </>
      )}
    </>
  );
}
