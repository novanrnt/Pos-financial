import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { completeSetup } from '@/lib/actions';
import { Card, PageTitle, SubmitButton, SectionHeader, Badge } from '@/components/ui';
import { CheckCircle2 } from 'lucide-react';

export default async function Setup(){
  const u=await requireUser();
  if(!u)redirect('/login');
  if(u.setupCompleted)redirect('/dashboard');

  return <>
    <PageTitle title="Setup Awal" desc="Isi data awal untuk memulai. Bagian selain rekening boleh dikosongkan."/>
    
    <form action={completeSetup} className="space-y-6 max-w-3xl">
      {/* Step 1: Account */}
      <Card variant="premium" className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <span className="text-sm font-black text-violet-300">1</span>
          </div>
          <div>
            <h2 className="text-lg font-black text-premium-text">Rekening & Saldo Awal</h2>
            <p className="text-xs text-premium-text-muted mt-1">Wajib diisi untuk memulai</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Nama Rekening</label>
            <input name="account" placeholder="Kas Utama" required className="w-full" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Tipe</label>
              <select name="accountType" className="w-full">
                <option value="BANK">Bank</option>
                <option value="CASH">Cash</option>
                <option value="EWALLET">E-Wallet</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Saldo Awal</label>
              <input name="balance" placeholder="0" type="number" required className="w-full" />
            </div>
          </div>
        </div>
      </Card>

      {/* Step 2-3: Debt & Receivable */}
      <Card variant="premium" className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <span className="text-sm font-black text-violet-300">2-3</span>
          </div>
          <div>
            <h2 className="text-lg font-black text-premium-text">Hutang & Piutang Awal</h2>
            <p className="text-xs text-premium-text-muted mt-1">Opsional - bisa dikosongkan</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Hutang */}
          <div className="p-4 rounded-2xl bg-premium-expense/10 border border-premium-expense/20">
            <p className="text-xs font-black text-premium-expense uppercase mb-4">💳 Hutang</p>
            <div className="grid grid-cols-2 gap-3">
              <input name="debtName" placeholder="Nama pemberi hutang" className="col-span-2" />
              <input name="debtAmount" placeholder="Nominal hutang" type="number" />
              <input name="debtDue" type="date" />
              <input name="debtNotes" placeholder="Catatan" className="col-span-2" />
            </div>
          </div>

          {/* Piutang */}
          <div className="p-4 rounded-2xl bg-premium-income/10 border border-premium-income/20">
            <p className="text-xs font-black text-premium-income uppercase mb-4">💰 Piutang</p>
            <div className="grid grid-cols-2 gap-3">
              <input name="recName" placeholder="Nama pihak piutang" className="col-span-2" />
              <input name="recAmount" placeholder="Nominal piutang" type="number" />
              <input name="recDue" type="date" />
              <input name="recNotes" placeholder="Catatan" className="col-span-2" />
            </div>
          </div>
        </div>
      </Card>

      {/* Step 4-6: Car & Investment */}
      <Card variant="premium" className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <span className="text-sm font-black text-violet-300">4-6</span>
          </div>
          <div>
            <h2 className="text-lg font-black text-premium-text">Mobil & Investasi Awal</h2>
            <p className="text-xs text-premium-text-muted mt-1">Opsional - bisa dikosongkan</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Mobil */}
          <div className="p-4 rounded-2xl bg-premium-card-soft border border-premium-border-soft">
            <p className="text-xs font-black text-premium-text-muted uppercase mb-4">🚗 Mobil Awal</p>
            <div className="grid grid-cols-2 gap-3">
              <input name="carName" placeholder="Nama mobil" className="col-span-2" />
              <input name="brand" placeholder="Merek" />
              <input name="model" placeholder="Tipe" />
              <input name="year" placeholder="Tahun" type="number" />
              <input name="purchasePrice" placeholder="Harga beli/modal" type="number" />
              <input name="estimatedSellPrice" placeholder="Estimasi jual" type="number" />
            </div>
            <p className="text-xs text-premium-text-muted mt-3">💡 Stok mobil awal tidak memotong saldo rekening.</p>
          </div>

          {/* Investasi */}
          <div className="p-4 rounded-2xl bg-premium-savings/10 border border-premium-savings/20">
            <p className="text-xs font-black text-premium-savings uppercase mb-4">📊 Investasi Awal</p>
            <div className="grid grid-cols-2 gap-3">
              <select name="invCat" className="col-span-2">
                <option value="">Skip investasi</option>
                <option value="Saham">Saham</option>
                <option value="Crypto">Crypto</option>
                <option value="Reksa Dana">Reksa Dana</option>
                <option value="Emas">Emas</option>
                <option value="Properti">Properti</option>
                <option value="R&D / Eksperimen">R&D / Eksperimen</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              <input name="invBalance" placeholder="Saldo investasi" type="number" />
              <input name="invNotes" placeholder="Catatan investasi" className="col-span-2" />
            </div>
          </div>
        </div>
      </Card>

      {/* Submit */}
      <div className="flex gap-3">
        <SubmitButton>Selesaikan Setup</SubmitButton>
      </div>

      <div className="p-4 rounded-2xl bg-premium-border-soft/20 border border-premium-border-soft">
        <p className="text-xs text-premium-text-muted">
          ✨ Setelah setup selesai, kamu bisa menambah data lebih lanjut di halaman masing-masing fitur.
        </p>
      </div>
    </form>
  </>
}
