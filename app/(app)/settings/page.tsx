import { requireUser } from '@/lib/auth';
import { Card, PageTitle, SectionHeader, Badge } from '@/components/ui';
import { prisma } from '@/lib/prisma';
import { Mail, MessageCircle, CheckCircle, AlertCircle, Code } from 'lucide-react';

async function linkTelegram(formData: FormData) {
  'use server';
  const user = await requireUser();
  if (!user) return;
  
  const telegramId = formData.get('telegramId') as string;
  if (!telegramId) return;
  
  await prisma.user.update({
    where: { id: user.id },
    data: { telegramId }
  });
}

export default async function Settings(){
  const u=await requireUser();
  
  return <>
    <PageTitle title="Pengaturan" desc="Akun, integrasi, dan informasi aplikasi."/>
    
    <div className="space-y-6 max-w-2xl">
      {/* Account Section */}
      <Card variant="premium" className="p-6">
        <SectionHeader title="Akun Saya" />
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-premium-card-soft border border-premium-border-soft">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Mail size={20} className="text-violet-300" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-premium-text-muted uppercase">Email</p>
              <p className="text-sm font-black text-premium-text mt-1">{u?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-premium-card-soft border border-premium-border-soft">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-premium-text-muted/10 flex items-center justify-center">
              <Code size={20} className="text-premium-text-muted" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-premium-text-muted uppercase">User ID</p>
              <p className="text-xs font-mono text-premium-text-secondary mt-1 truncate">{u?.id}</p>
            </div>
          </div>

          <p className="text-xs text-premium-text-muted mt-4">
            💡 Untuk tambah user lain, jalankan seed/manual Prisma. Versi ini fokus POS pribadi.
          </p>
        </div>
      </Card>

      {/* Telegram Integration */}
      <Card variant="premium" className="p-6">
        <SectionHeader title="Integrasi Telegram Bot" />
        <p className="text-sm text-premium-text-muted mt-2">Link akun Telegram kamu untuk input transaksi langsung dari bot.</p>
        
        <div className="mt-6">
          {u?.telegramId ? (
            <div className="bg-premium-income/10 border border-premium-income/20 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-premium-income flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-black text-premium-income">Telegram Terhubung</p>
                  <p className="text-xs text-premium-text-muted mt-1">Telegram ID: <b className="text-premium-text">{u.telegramId}</b></p>
                  <p className="text-xs text-premium-text-muted mt-2">Bot sudah siap menerima transaksi dari Telegram kamu.</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-premium-orange/10 border border-premium-orange/20 rounded-2xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-premium-orange flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-premium-orange">Belum Terhubung</p>
                    <p className="text-xs text-premium-text-muted mt-2">Ikuti langkah berikut untuk menghubungkan Telegram:</p>
                    <ol className="text-xs text-premium-text-muted mt-3 space-y-1 ml-4 list-decimal">
                      <li>Buka Telegram dan cari bot POS Finance</li>
                      <li>Kirim pesan <code className="bg-premium-card-dark px-2 py-1 rounded text-premium-text">/start</code></li>
                      <li>Bot akan memberikan Telegram ID kamu</li>
                      <li>Copy ID dan paste di form di bawah</li>
                    </ol>
                  </div>
                </div>
              </div>

              <form action={linkTelegram} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Telegram ID</label>
                  <input 
                    type="text" 
                    name="telegramId" 
                    placeholder="Contoh: 123456789"
                    required
                    className="w-full"
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-sm font-black transition-colors"
                >
                  Link Telegram
                </button>
              </form>
            </>
          )}
        </div>
      </Card>

      {/* Format Guide */}
      <Card variant="premium" className="p-6">
        <SectionHeader title="Format Input Transaksi" />
        <p className="text-sm text-premium-text-muted mt-2">Kirim pesan ke bot dengan format berikut:</p>
        
        <div className="mt-6 space-y-3">
          <div className="bg-premium-card-soft rounded-2xl p-4 border border-premium-border-soft">
            <p className="text-xs font-black text-premium-text-muted uppercase mb-2">📝 Pengeluaran</p>
            <code className="text-xs font-mono text-premium-text">19 mei 2026 makan 20.000 blue</code>
          </div>

          <div className="bg-premium-card-soft rounded-2xl p-4 border border-premium-border-soft">
            <p className="text-xs font-black text-premium-text-muted uppercase mb-2">💰 Pemasukan</p>
            <code className="text-xs font-mono text-premium-text">19 mei 2026 gaji 500.000 blue income</code>
          </div>

          <div className="bg-premium-card-soft rounded-2xl p-4 border border-premium-border-soft">
            <p className="text-xs font-black text-premium-text-muted uppercase mb-2">💳 Hutang</p>
            <code className="text-xs font-mono text-premium-text">19 mei 2026 pinjam 100.000 blue hutang</code>
          </div>

          <div className="bg-premium-card-soft rounded-2xl p-4 border border-premium-border-soft">
            <p className="text-xs font-black text-premium-text-muted uppercase mb-2">📊 Piutang</p>
            <code className="text-xs font-mono text-premium-text">19 mei 2026 pinjamkan 50.000 blue piutang</code>
          </div>
        </div>

        <div className="mt-6 p-4 bg-premium-border-soft/20 rounded-2xl border border-premium-border-soft">
          <p className="text-xs font-black text-premium-text-muted uppercase mb-2">Format Umum</p>
          <p className="text-xs text-premium-text-muted font-mono">
            tanggal bulan tahun deskripsi nominal rekening [type]
          </p>
        </div>
      </Card>

      {/* Bot Commands */}
      <Card variant="premium" className="p-6">
        <SectionHeader title="Perintah Bot" />
        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-premium-card-soft border border-premium-border-soft">
            <MessageCircle size={18} className="text-violet-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-black text-premium-text"><code>/start</code></p>
              <p className="text-xs text-premium-text-muted mt-1">Mulai bot dan dapatkan Telegram ID kamu</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-premium-card-soft border border-premium-border-soft">
            <MessageCircle size={18} className="text-violet-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-black text-premium-text"><code>/help</code></p>
              <p className="text-xs text-premium-text-muted mt-1">Lihat bantuan format input transaksi</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-premium-card-soft border border-premium-border-soft">
            <MessageCircle size={18} className="text-violet-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-black text-premium-text"><code>/accounts</code></p>
              <p className="text-xs text-premium-text-muted mt-1">Lihat daftar rekening kamu</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </>
}
