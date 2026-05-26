import { requireUser } from '@/lib/auth';
import { Card, PageTitle } from '@/components/ui';
import { prisma } from '@/lib/prisma';

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
    <PageTitle title="Setting" desc="Akun dan info aplikasi."/>
    
    <Card>
      <h2 className="font-black mb-3">Akun</h2>
      <p>Email: <b>{u?.email}</b></p>
      <p className="text-slate-400 mt-2">Untuk tambah user lain, jalankan seed/manual Prisma nanti. Versi ini fokus POS pribadi.</p>
    </Card>

    <Card>
      <h2 className="font-black mb-3">Link Telegram Bot</h2>
      <p className="text-sm text-slate-300 mb-3">Link akun Telegram kamu untuk input transaksi langsung dari bot.</p>
      
      {u?.telegramId ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg mb-3">
          <p className="text-sm text-emerald-300">✅ Telegram ID: <b>{u.telegramId}</b></p>
          <p className="text-xs text-slate-400 mt-2">Bot sudah terhubung dengan akun kamu.</p>
        </div>
      ) : (
        <form action={linkTelegram} className="space-y-3">
          <div className="bg-slate-500/10 border border-slate-500/30 p-3 rounded-lg mb-3">
            <p className="text-sm text-slate-300 mb-2">Belum terhubung dengan Telegram</p>
            <p className="text-xs text-slate-400">1. Kirim pesan ke bot: <b>/start</b></p>
            <p className="text-xs text-slate-400">2. Bot akan memberikan Telegram ID kamu</p>
            <p className="text-xs text-slate-400">3. Copy ID dan paste di bawah</p>
          </div>
          
          <input 
            type="text" 
            name="telegramId" 
            placeholder="Masukkan Telegram ID (contoh: 123456789)"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            required
          />
          
          <button 
            type="submit"
            className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Link Telegram
          </button>
        </form>
      )}
    </Card>

    <Card>
      <h2 className="font-black mb-3">Format Input Transaksi</h2>
      <p className="text-sm text-slate-300 mb-3">Kirim pesan ke bot dengan format:</p>
      <div className="bg-white/[.04] p-3 rounded-lg mb-3 text-xs font-mono space-y-1">
        <p>📝 Pengeluaran: <span className="text-emerald-300">19 mei 2026 makan 20.000 blue</span></p>
        <p>💰 Pemasukan: <span className="text-emerald-300">19 mei 2026 gaji 500.000 blue income</span></p>
        <p>💳 Hutang: <span className="text-rose-300">19 mei 2026 pinjam 100.000 blue hutang</span></p>
        <p>📊 Piutang: <span className="text-emerald-300">19 mei 2026 pinjamkan 50.000 blue piutang</span></p>
      </div>
      <p className="text-xs text-slate-400">
        Format: <b>tanggal bulan tahun deskripsi nominal rekening [type]</b>
      </p>
    </Card>

    <Card>
      <h2 className="font-black mb-3">Perintah Bot</h2>
      <div className="space-y-2 text-xs">
        <p><b>/start</b> - Mulai dan dapatkan Telegram ID</p>
        <p><b>/help</b> - Lihat bantuan format transaksi</p>
        <p><b>/accounts</b> - Lihat daftar rekening kamu</p>
      </div>
    </Card>
  </>
}
