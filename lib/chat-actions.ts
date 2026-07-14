'use server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { addTransaction, adjustAccount } from '@/lib/actions';
import { revalidatePath } from 'next/cache';

function cleanJson(content: string) {
  let s = content.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1) return '';
  return s.slice(start, end + 1);
}

export async function processChat(fd: FormData) {
  const user = await requireUser();
  if (!user) return { error: 'Not logged in' };

  const text = String(fd.get('text') || '');
  if (!text) return { error: 'Ketik sesuatu' };

  const [accounts, categories, debts] = await Promise.all([
    prisma.account.findMany({ where: { userId: user.id } }),
    prisma.category.findMany({ where: { userId: user.id, isActive: true } }),
    prisma.debt.findMany({ where: { userId: user.id }, take: 20 }),
  ]);

  const sys = `Kamu asisten keuangan. Balas HANYA JSON valid, tanpa teks lain.

AKUN: ${accounts.map(a => `${a.name} (${a.id}, saldo ${Number(a.balance)})`).join('; ')}
KATEGORI: ${categories.map(c => c.name).join(', ')}
HUTANG AKTIF: ${debts.filter(d => d.status === 'ACTIVE').map(d => `${d.name} sisa ${Number(d.remainingAmount)}`).join('; ')}

FORMAT RESPON (pilih salah satu):

1. TRANSAKSI biasa: {"action":"transaction","type":"INCOME|EXPENSE","amount":number,"accountId":"id rekening","categoryName":"nama kategori","description":"..."}

2. ADJUST/SESUAIKAN saldo: {"action":"adjust","accountId":"id rekening","newBalance":number}

3. TAGIHAN (bulanan): {"action":"bill","name":"nama","amount":number,"dueDay":1-31,"accountId":"id rekening"}

4. BAYAR HUTANG: {"action":"pay_debt","debtName":"nama hutang","amount":number,"accountId":"id rekening"}

5. HUTANG BARU: {"action":"new_debt","name":"nama","amount":number,"type":"DEBT|RECEIVABLE","accountId":"id rekening"}

CONTOH:
User: "beli bubur 20rb BCA"
Respon: {"action":"transaction","type":"EXPENSE","amount":20000,"accountId":"...","categoryName":"Makanan & Minuman","description":"Beli bubur"}

User: "sesuaikan saldo BCA 2890 jadi 50jt"
Respon: {"action":"adjust","accountId":"...","newBalance":50000000}

User: "bayar hutang mamah 500rb"
Respon: {"action":"pay_debt","debtName":"Mamah","amount":500000,"accountId":"..."}

User: "tambah tagihan listrik 200rb tgl 5"
Respon: {"action":"bill","name":"Listrik","amount":200000,"dueDay":5,"accountId":"..."}

User: "terima piutang dari dr julian 300rb"
Respon: {"action":"pay_debt","debtName":"Dr julian","amount":300000,"accountId":"..."}

User: "hutang baru ke budi 2jt"
Respon: {"action":"new_debt","name":"Budi","amount":2000000,"type":"DEBT","accountId":"..."}

User: "piutang baru dari agus 1,5jt"
Respon: {"action":"new_debt","name":"Agus","amount":1500000,"type":"RECEIVABLE","accountId":"..."}

CATATAN PENTING:
- DEBT = hutang (lu punya hutang ke orang lain): bayar hutang = saldo rekening BERKURANG
- RECEIVABLE = piutang (orang lain punya hutang ke lu): terima piutang = saldo rekening BERTAMBAH
- Kalau user bilang "bayar piutang" atau "terima piutang" -> itu RECEIVABLE, pake pay_debt`;

  try {
    const apiKey = process.env.SUMOPOD_API_KEY || 'sk-QBO1yDwev0sxa_IldV2_Tg';
    const resp = await fetch('https://ai.sumopod.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'system', content: sys }, { role: 'user', content: text }],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    const data = await resp.json();
    if (!resp.ok) return { error: `API error ${resp.status}` };

    const content = data.choices?.[0]?.message?.content || '';
    if (!content) return { error: 'AI ga ngasih respons. Coba lagi.' };

    const jsonStr = cleanJson(content);
    if (!jsonStr) return { error: `AI ga ngasih format JSON yang bener.` };

    let parsed;
    try { parsed = JSON.parse(jsonStr); } catch { return { error: 'Gagal parse respons AI.' }; }

    const action = parsed.action || 'transaction';

    // === TRANSACTION ===
    if (action === 'transaction') {
      const acc = accounts.find(a => a.id === parsed.accountId);
      if (!acc) return { error: 'Rekening gak ditemukan.' };
      let catId = '';
      if (parsed.categoryName) {
        const cat = categories.find(c => c.name.toLowerCase() === parsed.categoryName.toLowerCase());
        if (cat) catId = cat.id;
        if (!catId) {
          const fallback = categories.find(c => c.name.toLowerCase() === 'lainnya' && c.type === parsed.type);
          if (fallback) catId = fallback.id;
        }
      }
      const fd2 = new FormData();
      fd2.append('type', parsed.type);
      fd2.append('amount', String(parsed.amount));
      fd2.append('accountId', parsed.accountId);
      fd2.append('categoryId', catId);
      fd2.append('date', new Date().toISOString().split('T')[0]);
      fd2.append('description', parsed.description || text);
      await addTransaction(fd2);

      return {
        success: true,
        msg: `✅ ${parsed.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'} Rp ${Number(parsed.amount).toLocaleString('id-ID')} di ${acc.name} tercatat!`,
      };
    }

    // === ADJUST ACCOUNT ===
    if (action === 'adjust') {
      const acc = accounts.find(a => a.id === parsed.accountId);
      if (!acc) return { error: 'Rekening gak ditemukan.' };
      const fd2 = new FormData();
      fd2.append('id', parsed.accountId);
      fd2.append('balance', String(parsed.newBalance));
      fd2.append('note', `Sesuaian saldo via chat: ${parsed.newBalance}`);
      await adjustAccount(fd2);
      return {
        success: true,
        msg: `✅ Saldo ${acc.name} disesuaikan jadi Rp ${Number(parsed.newBalance).toLocaleString('id-ID')}`,
      };
    }

    // === PAY DEBT ===
    if (action === 'pay_debt') {
      const debt = debts.find(d => d.name.toLowerCase().includes((parsed.debtName || '').toLowerCase()) && d.status === 'ACTIVE');
      if (!debt) return { error: `Hutang "${parsed.debtName}" gak ditemukan.` };
      const { payDebt } = await import('@/lib/actions');
      const fd2 = new FormData();
      fd2.append('debtId', debt.id);
      fd2.append('amount', String(parsed.amount));
      fd2.append('accountId', parsed.accountId || debt.accountId || '');
      fd2.append('date', new Date().toISOString().split('T')[0]);
      fd2.append('notes', 'Bayar via chat');
      await payDebt(fd2);
      return {
        success: true,
        msg: `✅ Bayar hutang ${debt.name} Rp ${Number(parsed.amount).toLocaleString('id-ID')}`,
      };
    }

    // === NEW DEBT ===
    if (action === 'new_debt') {
      const { addDebt } = await import('@/lib/actions');
      const fd2 = new FormData();
      fd2.append('name', parsed.name);
      fd2.append('amount', String(parsed.amount));
      fd2.append('type', parsed.type || 'DEBT');
      fd2.append('accountId', parsed.accountId || '');
      await addDebt(fd2);
      return {
        success: true,
        msg: `✅ ${parsed.type === 'RECEIVABLE' ? 'Piutang' : 'Hutang'} ${parsed.name} Rp ${Number(parsed.amount).toLocaleString('id-ID')} tercatat!`,
      };
    }

    // === BILL ===
    if (action === 'bill') {
      const { addBill } = await import('@/lib/actions');
      const fd2 = new FormData();
      fd2.append('name', parsed.name);
      fd2.append('amount', String(parsed.amount));
      fd2.append('dueDay', String(parsed.dueDay || 1));
      fd2.append('accountId', parsed.accountId || accounts[0]?.id || '');
      fd2.append('billType', 'MONTHLY');
      await addBill(fd2);
      return {
        success: true,
        msg: `✅ Tagihan ${parsed.name} Rp ${Number(parsed.amount).toLocaleString('id-ID')} tgl ${parsed.dueDay} tercatat!`,
      };
    }

    return { error: 'Aksi gak dikenal.' };

  } catch (e: any) {
    return { error: `Error: ${e?.message || e || 'Gagal proses'}` };
  }
}
