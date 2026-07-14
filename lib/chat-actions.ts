'use server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { addTransaction } from '@/lib/actions';

export async function processChat(fd: FormData) {
  const user = await requireUser();
  if (!user) return { error: 'Not logged in' };
  
  const text = String(fd.get('text') || '');
  if (!text) return { error: 'Ketik sesuatu' };
  
  // Get accounts & categories for AI context
  const [accounts, categories] = await Promise.all([
    prisma.account.findMany({ where: { userId: user.id } }),
    prisma.category.findMany({ where: { userId: user.id, isActive: true } }),
  ]);
  
  const accountList = accounts.map(a => `${a.name} (${a.id})`).join(', ');
  const catList = categories.map(c => `${c.name} (${c.type})`).join(', ');
  
  // Call AI via sumopod
  const systemPrompt = `Kamu adalah asisten pencatatan keuangan. Kamu menerima teks dari user dalam bahasa Indonesia, lalu meng-extract data transaksi.

Format output HARUS persis JSON ini, NO MARKDOWN, NO CODEBLOCK:
{"type":"INCOME|EXPENSE","amount":number,"accountId":"id rekening","categoryId":"id kategori atau ''","description":"deskripsi singkat"}

Aturan:
- type: INCOME untuk pemasukan (gaji, bonus, komisi, profit, dll), EXPENSE untuk pengeluaran (beli, bayar, makan, dll)
- amount: sudah dalam angka penuh (20rb → 20000, 5jt → 5000000)
- accountId: pilih dari daftar rekening yang tersedia
- categoryId: pilih dari daftar kategori yang tersedia, atau '' jika tidak ada yang cocok
- description: deskripsi singkat transaksi

Rekening tersedia: ${accountList}
Kategori tersedia: ${catList}

Contoh:
User: "beli bubur 20rb BCA"
Output: {"type":"EXPENSE","amount":20000,"accountId":"...","categoryId":"...","description":"Beli bubur"}

User: "gajian 5jt"
Output: {"type":"INCOME","amount":5000000,"accountId":"...","categoryId":"...","description":"Gajian"}`;

  try {
    // API key from client (sent from chat input)
    const apiKey = String(fd.get('apiKey') || '');
    if (!apiKey) {
      return { error: 'API Key belum diisi. Masukkan API Key di kolom atas chat.' };
    }
    
    const resp = await fetch('https://ai.sumopod.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: 200,
      }),
    });
    
    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response (strip code blocks if any)
    let jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    
    if (!parsed.amount || parsed.amount <= 0) {
      return { error: 'AI gak bisa baca nominalnya. Coba tulis ulang.' };
    }
    
    // Create transaction
    const fd2 = new FormData();
    fd2.append('type', parsed.type);
    fd2.append('amount', String(parsed.amount));
    fd2.append('accountId', String(parsed.accountId));
    fd2.append('categoryId', String(parsed.categoryId || ''));
    fd2.append('date', new Date().toISOString().split('T')[0]);
    fd2.append('description', String(parsed.description || text));
    await addTransaction(fd2);
    
    // Get account name for display
    const acc = accounts.find(a => a.id === parsed.accountId);
    
    return {
      success: true,
      type: parsed.type,
      amount: parsed.amount,
      account: acc?.name || '',
      description: parsed.description || text,
    };
  } catch (e: any) {
    return { error: e.message || 'Gagal proses AI' };
  }
}
