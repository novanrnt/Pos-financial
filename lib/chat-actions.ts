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
  const systemPrompt = `Kamu asisten pencatatan keuangan. Extract data transaksi dari teks user. Balas HANYA JSON, tanpa markdown, tanpa teks lain.

Format: {"type":"INCOME|EXPENSE","amount":number,"accountId":"id","categoryId":"id atau ''","description":"..."}

Akun: ${accountList}
Kategori: ${catList}

Contoh: "beli bubur 20rb BCA" → {"type":"EXPENSE","amount":20000,"accountId":"...","categoryId":"...","description":"Beli bubur"}`;

  try {
    // API key from hermes config (local server)
    const apiKey = 'sk-QBO1yDwev0sxa_IldV2_Tg';
    if (!apiKey) {
      return { error: 'API Key server tidak ditemukan.' };
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
        max_tokens: 500,
      }),
    });
    
    const data = await resp.json();
    
    if (!resp.ok) {
      return { error: `API error: ${resp.status} - ${JSON.stringify(data).slice(0, 100)}` };
    }
    
    const content = data.choices?.[0]?.message?.content || '';
    
    if (!content) {
      return { error: 'AI ga ngasih respons. Coba lagi.' };
    }
    
    // Parse JSON: strip markdown code blocks and find JSON object
    let jsonStr = content.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    // Find first { and last }
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    if (start === -1 || end === -1) {
      return { error: `AI ga ngasih format yang bener. Respons: ${content.slice(0, 100)}` };
    }
    jsonStr = jsonStr.slice(start, end + 1);
    
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return { error: `Gagal parse respons AI. Coba ketik ulang.` };
    }
    
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
    return { error: `Error: ${e?.message || e || 'Gagal proses'}` };
  }
}
