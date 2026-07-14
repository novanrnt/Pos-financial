'use server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { addTransaction } from '@/lib/actions';

/**
 * Parses Indonesian natural language to create transactions
 */
function parseTransaction(text: string, accounts: any[], categories: any[]) {
  const lower = text.toLowerCase().trim();
  let type = 'EXPENSE';
  const incomeWords = ['gajian', 'gaji', 'bonus', 'profit', 'rejeki', 'pemasukan', 'dibayar', 'terima', 'komisi', 'fee'];
  const expenseWords = ['beli', 'makan', 'minum', 'bayar', 'bensin', 'pulsa', 'jajan', 'roko', 'rokok', 'isi', 'top up', 'topup'];
  
  for (const w of incomeWords) { if (lower.includes(w)) { type = 'INCOME'; break; } }
  for (const w of expenseWords) { if (lower.includes(w)) { type = 'EXPENSE'; break; } }
  if (lower.includes('transfer') || lower.includes('kirim')) type = 'TRANSFER';
  
  const amountRegex = /(\d+[\d.]*)\s*(rb|k|jt|juta|ribu|puluh|ratus)?/i;
  const amountMatch = text.match(amountRegex);
  let amount = 0;
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/\./g, ''));
    const unit = (amountMatch[2] || '').toLowerCase();
    if (unit === 'rb' || unit === 'k' || unit === 'ribu') amount *= 1000;
    else if (unit === 'jt' || unit === 'juta') amount *= 1000000;
    else if (unit === 'puluh') amount *= 10;
    else if (unit === 'ratus') amount *= 100;
  }
  
  let accountId = accounts[0]?.id || '';
  let accountName = accounts[0]?.name || '';
  const accountText = text.replace(amountMatch?.[0] || '', '').toLowerCase();
  
  for (const acc of accounts) {
    const an = acc.name.toLowerCase();
    if (accountText.includes('bca') && an.includes('bca')) {
      if (!accountText.includes('blue') && !accountText.includes('saqu') && an.includes('2890')) { 
        accountId = acc.id; accountName = acc.name; break; 
      }
      if (accountText.includes('blue') && an.includes('blue')) { accountId = acc.id; accountName = acc.name; break; }
      if (accountText.includes('saqu') && an.includes('saqu')) { accountId = acc.id; accountName = acc.name; break; }
      if (!an.includes('2890') && !an.includes('blue') && !an.includes('saqu')) { accountId = acc.id; accountName = acc.name; break; }
    }
    if (accountText.includes(an.replace(/[^a-z0-9]/g, '')) && an.length > 3) {
      accountId = acc.id; accountName = acc.name;
    }
  }
  
  let categoryId = '';
  for (const cat of categories) {
    const cn = cat.name.toLowerCase();
    if (type === 'INCOME' && cat.type === 'INCOME') {
      if (lower.includes('gaji') && cn.includes('gaji')) { categoryId = cat.id; }
      if (lower.includes('bonus') && cn.includes('bonus')) { categoryId = cat.id; }
    }
    if (type === 'EXPENSE' && cat.type === 'EXPENSE') {
      if ((lower.includes('makan') || lower.includes('bubur')) && cn.includes('makanan')) { categoryId = cat.id; }
      if (lower.includes('roko') && cn.includes('roko')) { categoryId = cat.id; }
      if ((lower.includes('bensin') || lower.includes('bbm')) && cn.includes('bbm')) { categoryId = cat.id; }
      if (lower.includes('belanja') && cn.includes('belanja')) { categoryId = cat.id; }
    }
  }
  
  let description = text;
  if (accountName) description = description.replace(new RegExp(accountName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
  if (amountMatch) description = description.replace(amountMatch[0], '');
  description = description.replace(/\s+/g, ' ').trim();
  if (!description) description = type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran';
  
  return { type, amount, accountId, accountName, categoryId, description };
}

export async function processChat(fd: FormData) {
  const user = await requireUser();
  if (!user) return { error: 'Not logged in' };
  
  const text = String(fd.get('text') || '');
  if (!text) return { error: 'Ketik sesuatu' };
  
  const [accounts, categories] = await Promise.all([
    prisma.account.findMany({ where: { userId: user.id } }),
    prisma.category.findMany({ where: { userId: user.id, isActive: true } }),
  ]);
  
  const parsed = parseTransaction(text, accounts, categories);
  
  if (!parsed.amount || parsed.amount <= 0) {
    return { error: 'Gak nemu nominalnya. Contoh: beli bubur 20rb BCA' };
  }
  
  if (parsed.type === 'TRANSFER') {
    return { error: 'Transfer belum didukung via chat.' };
  }
  
  try {
    const fd2 = new FormData();
    fd2.append('type', parsed.type);
    fd2.append('amount', String(parsed.amount));
    fd2.append('accountId', parsed.accountId);
    fd2.append('categoryId', parsed.categoryId || '');
    fd2.append('date', new Date().toISOString().split('T')[0]);
    fd2.append('description', parsed.description);
    await addTransaction(fd2);
    
    return {
      success: true,
      type: parsed.type,
      amount: parsed.amount,
      account: parsed.accountName,
      description: parsed.description,
    };
  } catch (e: any) {
    return { error: e.message || 'Gagal simpan transaksi' };
  }
}
