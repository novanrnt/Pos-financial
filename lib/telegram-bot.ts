import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/utils';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; first_name: string; username?: string };
    chat: { id: number };
    text: string;
    date: number;
  };
}

let lastUpdateId = 0;
const months: { [key: string]: number } = {
  januari: 0, jan: 0, februari: 1, feb: 1, maret: 2, mar: 2, april: 3, apr: 3,
  mei: 4, juni: 5, jun: 5, juli: 6, jul: 6, agustus: 7, agu: 7, september: 8,
  sep: 8, oktober: 9, okt: 9, november: 10, nov: 10, desember: 11, des: 11
};

async function parseTransaction(text: string, telegramId: number) {
  try {
    const user = await prisma.user.findFirst({
      where: { email: `telegram_${telegramId}@pos.local` },
      select: { id: true }
    });
    
    if (!user) return { error: 'User tidak ditemukan' };

    const regex = /^(\d{1,2})\s+(\w+)\s+(\d{4})\s+(.+?)\s+([\d.]+)\s+(\w+)(?:\s+(income|expense|hutang|piutang))?$/i;
    const match = text.trim().match(regex);

    if (!match) return { error: 'Format: 19 mei 2026 makan 20.000 blue' };

    const [, day, monthName, year, description, amountStr, accountName, typeStr] = match;
    const monthIndex = months[monthName.toLowerCase()];
    
    if (monthIndex === undefined) return { error: 'Bulan tidak valid' };

    const date = new Date(Number(year), monthIndex, Number(day));
    const amount = toNumber(amountStr);
    const type = typeStr?.toLowerCase() || 'expense';

    const account = await prisma.account.findFirst({
      where: { userId: user.id, name: { mode: 'insensitive', contains: accountName } },
      select: { id: true, name: true }
    });

    if (!account) return { error: `Rekening "${accountName}" tidak ditemukan` };

    if (!type.includes('hutang') && !type.includes('piutang')) {
      let category = await prisma.category.findFirst({
        where: { userId: user.id, name: { mode: 'insensitive', contains: description } },
        select: { id: true }
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            userId: user.id,
            name: description,
            type: type === 'income' ? 'INCOME' : 'EXPENSE',
            icon: 'Circle',
            color: 'emerald'
          },
          select: { id: true }
        });
      }

      await prisma.$transaction(async tx => {
        await tx.transaction.create({
          data: {
            userId: user.id,
            accountId: account.id,
            categoryId: category.id,
            type: type === 'income' ? 'INCOME' : 'EXPENSE',
            amount,
            date,
            description: `[TG] ${description}`,
            sourceType: 'telegram'
          }
        });

        await tx.account.update({
          where: { id: account.id },
          data: { balance: type === 'income' ? { increment: amount } : { decrement: amount } }
        });
      });

      return { success: true, message: `✅ ${type === 'income' ? 'Masuk' : 'Keluar'} ${amount} • ${account.name}` };
    } else {
      const debtType = type.includes('hutang') ? 'DEBT' : 'RECEIVABLE';
      
      await prisma.$transaction(async tx => {
        await tx.debt.create({
          data: {
            userId: user.id,
            accountId: account.id,
            type: debtType,
            name: `[TG] ${description}`,
            amount,
            remainingAmount: amount,
            dueDate: date
          }
        });

        await tx.account.update({
          where: { id: account.id },
          data: { balance: debtType === 'DEBT' ? { increment: amount } : { decrement: amount } }
        });
      });

      return { success: true, message: `✅ ${debtType === 'DEBT' ? 'Hutang' : 'Piutang'} ${amount} • ${account.name}` };
    }
  } catch (error) {
    console.error('Parse error:', error);
    return { error: 'Error processing transaction' };
  }
}

export async function processTelegramUpdates() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return { processed: 0 };

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offset: lastUpdateId + 1, timeout: 0, allowed_updates: ['message'] })
    });

    const data = await response.json();
    if (!data.ok || !data.result?.length) return { processed: 0 };

    let processed = 0;
    const updates = data.result as TelegramUpdate[];

    for (const update of updates) {
      if (!update.message?.text) continue;

      const { text, from, chat } = update.message;
      const result = await parseTransaction(text, from.id);
      const responseText = result.error || result.message || 'OK';

      // Send response without waiting
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chat.id, text: responseText })
      }).catch(err => console.error('Send error:', err));

      lastUpdateId = update.update_id;
      processed++;
    }

    return { processed };
  } catch (error) {
    console.error('Telegram error:', error);
    return { processed: 0 };
  }
}
