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
      <h2 className="font-black mb-3">Telegram Bot Integration</h2>
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
      <p className="text-xs text-slate-500 mt-3">
        ⚠️ Setup: Hubungi bot Telegram dengan ID: <b>telegram_{u?.id}@pos.local</b>
      </p>
    </Card>
  </>
}
