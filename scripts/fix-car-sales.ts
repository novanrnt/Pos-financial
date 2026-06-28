import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';

function loadEnv(p = '.env') {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]]) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}
loadEnv();

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');
const fixOrphans = process.argv.includes('--fix-orphans');

const ymLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const rupiah = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

async function main() {
  const [closings, annuals] = await Promise.all([
    prisma.monthlyClosing.findMany({ select: { userId: true, month: true } }),
    prisma.annualClosing.findMany({ select: { userId: true, year: true } }),
  ]);
  const closedMonth = new Set(closings.map(c => `${c.userId}|${c.month}`));
  const closedYear = new Set(annuals.map(a => `${a.userId}|${a.year}`));

  const cars = await prisma.car.findMany({
    where: { status: 'SOLD' },
    include: { costs: true, debts: true },
    orderBy: { soldAt: 'asc' },
  });

  const userIds = [...new Set(cars.map(c => c.userId))];
  const catMap: Record<string, string> = {};
  for (const uid of userIds) {
    const cat = await prisma.category.findFirst({ where: { userId: uid, name: 'Jual Mobil', type: 'INCOME' } });
    if (cat) catMap[uid] = cat.id;
    else if (apply) catMap[uid] = (await prisma.category.create({ data: { userId: uid, name: 'Jual Mobil', type: 'INCOME', icon: 'TrendingUp', color: 'emerald' } })).id;
    else catMap[uid] = '(akan dibuat saat --apply)';
  }

  const report: string[] = [];
  let fixedCount = 0, skipClosed = 0, skipAlreadyNew = 0, skipNoSale = 0;

  for (const car of cars) {
    const costIds = car.costs.map(k => k.id);
    const debtIds = car.debts.map(d => d.id);
    const relTx = await prisma.transaction.findMany({
      where: { userId: car.userId, sourceType: { in: ['car_purchase', 'car_cost', 'debt_payment', 'car_sale'] }, sourceId: { in: [car.id, ...costIds, ...debtIds] } },
    });
    const saleTx = relTx.find(t => t.sourceType === 'car_sale' && t.sourceId === car.id);
    if (!saleTx) { skipNoSale++; report.push(`- [SKIP] ${car.name}: tidak ada tx 'car_sale' (mungkin dijual manual/lewat cara lain)`); continue; }

    const isOldSale = saleTx.sourceType === 'car_sale' && !saleTx.categoryId;
    if (!isOldSale) { skipAlreadyNew++; report.push(`- [SKIP] ${car.name}: sudah model baru (tx jual ada kategori / car_sale_loss)`); continue; }

    const closedHit = relTx.find(t => closedMonth.has(`${car.userId}|${ymLocal(t.date)}`) || closedYear.has(`${car.userId}|${t.date.getFullYear()}`));
    if (closedHit) {
      skipClosed++;
      report.push(`- [SKIP] ${car.name}: ada tx di bulan/tahun closing (${ymLocal(closedHit.date)}). Dibiarkan model lama (sudah benar, snapshot beku).`);
      continue;
    }

    const modal = Number(car.purchasePrice) + car.costs.reduce((a, k) => a + Number(k.amount), 0);
    const sellPrice = Number(car.sellPrice ?? saleTx.amount);
    const selisih = sellPrice - modal;
    const toDelete = relTx.filter(t => t !== saleTx).map(t => t.id);

    if (toDelete.length === 0 && !fixOrphans) {
      skipOrphan++;
      report.push(`- [SKIP] ${car.name}: tx jual model lama tapi 0 tx beli/biaya ditemukan. Modal ${rupiah(modal)} mungkin dicatat manual di kategori lain -> fix bisa dobek. Cek Transactions (ada expense ~${rupiah(modal)} pas beli?). Kalau modal memang TIDAK pernah dicatat keluar, ulangi pakai --fix-orphans.`);
      continue;
    }

    let action: string;
    if (selisih > 0) action = `INCOME ${rupiah(selisih)} (kategori Jual Mobil)`;
    else if (selisih < 0) action = `EXPENSE ${rupiah(Math.abs(selisih))} (rugi)`;
    else action = `tx jual dihapus (selisih 0)`;

    report.push(`- [${apply ? 'FIX' : 'AKAN FIX'}] ${car.name}: jual ${rupiah(sellPrice)} - modal ${rupiah(modal)} = ${rupiah(selisih)} -> ${action}; hapus ${toDelete.length} tx lama (beli/biaya/pelunasan)`);

    if (apply) {
      await prisma.$transaction(async tx => {
        if (toDelete.length) await tx.transaction.deleteMany({ where: { id: { in: toDelete } } });
        if (selisih > 0) {
          await tx.transaction.update({ where: { id: saleTx.id }, data: { amount: selisih, categoryId: catMap[car.userId], description: `Profit jual mobil ${car.name} (jual ${sellPrice} - modal ${modal}) [migrated]` } });
        } else if (selisih < 0) {
          await tx.transaction.update({ where: { id: saleTx.id }, data: { type: 'EXPENSE', amount: Math.abs(selisih), categoryId: null, sourceType: 'car_sale_loss', description: `Rugi jual mobil ${car.name} (jual ${sellPrice} - modal ${modal}) [migrated]` } });
        } else {
          await tx.transaction.delete({ where: { id: saleTx.id } });
        }
      });
      fixedCount++;
    }
  }

  console.log('=========================================');
  console.log('  Fix Data Jual Mobil (model lama -> baru)');
  console.log('=========================================');
  console.log(`Mode        : ${apply ? 'APPLY (eksekusi)' : 'DRY-RUN  (tambah --apply untuk eksekusi)'}`);
  console.log(`Mobil terjual: ${cars.length}`);
  console.log(`Fix         : ${fixedCount}${apply ? '' : ' (direncanakan)'}`);
  console.log(`Skip closing: ${skipClosed}`);
  console.log(`Skip sudah baru: ${skipAlreadyNew}`);
  console.log(`Skip tanpa tx jual: ${skipNoSale}`);
  console.log('-----------------------------------------');
  console.log(report.length ? report.join('\n') : '(tidak ada mobil yang perlu diperbaiki)');
  console.log('-----------------------------------------');
  if (!apply) console.log('\nJalankan: npx tsx scripts/fix-car-sales.ts --apply');
}

main().finally(() => prisma.$disconnect());
