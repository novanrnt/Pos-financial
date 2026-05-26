import { requireUser } from '@/lib/auth';
import { Card, PageTitle } from '@/components/ui';

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
      <h2 className="font-black mb-3">Telegram Bot Integration (Polling Mode)</h2>
      <p className="text-sm text-slate-300 mb-3">Input transaksi langsung dari Telegram dengan format:</p>
      <div className="bg-white/[.04] p-3 rounded-lg mb-3 text-xs font-mono space-y-1">
        <p>📝 Pengeluaran: <span className="text-emerald-300">19 mei 2026 makan 20.000 blue</span></p>
        <p>💰 Pemasukan: <span className="text-emerald-300">19 mei 2026 gaji 500.000 blue income</span></p>
        <p>💳 Hutang: <span className="text-rose-300">19 mei 2026 pinjam 100.000 blue hutang</span></p>
        <p>📊 Piutang: <span className="text-emerald-300">19 mei 2026 pinjamkan 50.000 blue piutang</span></p>
      </div>
      <p className="text-xs text-slate-400">
        Format: <b>tanggal bulan tahun deskripsi nominal rekening [type]</b>
      </p>
      <p className="text-xs text-slate-400 mt-2">
        Type: income, expense (default), hutang, piutang
      </p>
      <p className="text-xs text-slate-400 mt-2">
        Rekening: nama rekening (blue, cash, etc)
      </p>
    </Card>

    <Card>
      <h2 className="font-black mb-3">Setup Step by Step</h2>
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-black text-emerald-300">1. Create Bot di Telegram</p>
          <p className="text-slate-400 text-xs mt-1">• Chat @BotFather</p>
          <p className="text-slate-400 text-xs">• Send /newbot</p>
          <p className="text-slate-400 text-xs">• Follow instructions, copy bot token</p>
        </div>
        <div>
          <p className="font-black text-emerald-300">2. Update .env</p>
          <p className="text-slate-400 text-xs mt-1">TELEGRAM_BOT_TOKEN=your_token_here</p>
        </div>
        <div>
          <p className="font-black text-emerald-300">3. Deploy aplikasi</p>
          <p className="text-slate-400 text-xs mt-1">Push ke Vercel atau hosting kamu</p>
        </div>
        <div>
          <p className="font-black text-emerald-300">4. Test Bot</p>
          <p className="text-slate-400 text-xs mt-1">• Find bot di Telegram (search by name)</p>
          <p className="text-slate-400 text-xs">• Send: 19 mei 2026 makan 20.000 blue</p>
          <p className="text-slate-400 text-xs">• Bot akan reply dengan konfirmasi</p>
        </div>
        <div>
          <p className="font-black text-emerald-300">5. Auto Polling (Optional)</p>
          <p className="text-slate-400 text-xs mt-1">• Setup cron job ke: https://your-domain.com/api/telegram-poll</p>
          <p className="text-slate-400 text-xs">• Atau polling otomatis setiap 30 detik</p>
        </div>
      </div>
    </Card>
  </>
}
