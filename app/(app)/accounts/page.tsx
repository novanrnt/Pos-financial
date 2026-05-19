import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { addAccount, deleteAccount } from '@/lib/actions';
import { Card, Empty, PageTitle, SubmitButton } from '@/components/ui';
import { rupiah } from '@/lib/utils';

export default async function Accounts() {
  const u = await requireUser();
  const rows = await prisma.account.findMany({ where: { userId: u!.id }, orderBy: { createdAt: 'desc' } });

  return (
    <>
      <PageTitle title="Rekening" desc="Multi rekening, saldo realtime, dan rekening utama." />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.length ? rows.map(a => (
            <Card key={a.id}>
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-slate-400">{a.type}</p>
                  <h3 className="text-lg md:text-xl font-black">{a.name}</h3>
                </div>
                {a.isPrimary && <span className="text-xs text-emerald-300">Utama</span>}
              </div>
              <div className="mt-4 md:mt-6 text-xl md:text-2xl font-black">{rupiah(a.balance)}</div>
              <form action={deleteAccount} className="mt-4">
                <input type="hidden" name="id" value={a.id} />
                <button className="text-xs text-rose-300">Hapus</button>
              </form>
            </Card>
          )) : <Empty />}
        </div>
        <Card>
          <h2 className="font-black mb-4">Tambah Rekening</h2>
          <form action={addAccount} className="space-y-3">
            <input name="name" placeholder="Nama rekening" required />
            <select name="type">
              <option value="BANK">Bank</option>
              <option value="CASH">Cash</option>
              <option value="EWALLET">E-Wallet</option>
              <option value="OTHER">Lainnya</option>
            </select>
            <input name="initialBalance" placeholder="Saldo awal" required />
            <input name="icon" placeholder="Icon Lucide: Wallet" />
            <input name="color" placeholder="emerald / blue" />
            <label className="flex items-center gap-2">
              <input className="w-auto" type="checkbox" name="isPrimary" /> Rekening utama
            </label>
            <SubmitButton />
          </form>
        </Card>
      </div>
    </>
  );
}
