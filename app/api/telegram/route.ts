import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toNumber, ym } from '@/lib/utils';

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

// Parse telegram message format: "19 mei 2026 makan 20.000 blue" or "19 mei 2026 gaji 500.000 blue income"
async function parseTransaction(text: string, telegramId: number) {
  const user = await prisma.user.findFirst({
    where: { email: `telegram_${telegramId}@pos.local` }
  });
  
  if (!user) {
    return { error: 'User tidak ditemukan. Silakan setup akun terlebih dahulu.' };
  }

  // Parse format: "tanggal bulan tahun deskripsi nominal rekening [type]"
  // Example: "19 mei 2026 makan 20.000 blue" or "19 mei 2026 gaji 500.000 blue income"
  const regex = /^(\d{1,2})\s+(\w+)\s+(\d{4})\s+(.+?)\s+([\d.]+)\s+(\w+)(?:\s+(income|expense|hutang|piutang))?$/i;
  const match = text.trim().match(regex);

  if (!match) {
    return { error: 'Format tidak valid. Gunakan: "19 mei 2026 makan 20.000 blue" atau "19 mei 2026 gaji 500.000 blue income"' };
  }

  const [, day, monthName, year, description, amountStr, accountName, typeStr] = match;
  const months: { [key: string]: number } = {
    januari: 0, jan: 0, 'januari': 0,
    februari: 1, feb: 1, 'februari': 1,
    maret: 2, mar: 2, 'maret': 2,
    april: 3, apr: 3, 'april': 3,
    mei: 4, 'mei': 4,
    juni: 5, jun: 5, 'juni': 5,
    juli: 6, jul: 6, 'juli': 6,
    agustus: 7, agu: 7, 'agustus': 7,
    september: 8, sep: 8, 'september': 8,
    oktober: 9, okt: 9, 'oktober': 9,
    november: 10, nov: 10, 'november': 10,
    desember: 11, des: 11, 'desember': 11
  };

  const monthIndex = months[monthName.toLowerCase()];
  if (monthIndex === undefined) {
    return { error: 'Bulan tidak valid' };
  }

  const date = new Date(Number(year), monthIndex, Number(day));
  const amount = toNumber(amountStr);
  const type = typeStr?.toLowerCase() || 'expense';

  // Find account by name (case-insensitive)
  const account = await prisma.account.findFirst({
    where: { userId: user.id, name: { mode: 'insensitive', contains: accountName } }
  });

  if (!type.includes('hutang') && !type.includes('piutang')) {
    // Regular transaction
    if (!account) {
      return { error: `Rekening "${accountName}" tidak ditemukan` };
    }

    // Find or create category
    let category = await prisma.category.findFirst({
      where: { userId: user.id, name: { mode: 'insensitive', contains: description } }
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          userId: user.id,
          name: description,
          type: type === 'income' ? 'INCOME' : 'EXPENSE',
          icon: 'Circle',
          color: 'emerald'
        }
      });
    }

    // Create transaction
    await prisma.$transaction(async tx => {
      await tx.transaction.create({
        data: {
          userId: user.id,
          accountId: account.id,
          categoryId: category.id,
          type: type === 'income' ? 'INCOME' : 'EXPENSE',
          amount,
          date,
          description: `[Telegram] ${description}`,
          sourceType: 'telegram'
        }
      });

      if (type === 'income') {
        await tx.account.update({
          where: { id: account.id },
          data: { balance: { increment: amount } }
        });
      } else {
        await tx.account.update({
          where: { id: account.id },
          data: { balance: { decrement: amount } }
        });
      }
    });

    return { success: true, message: `✅ ${type === 'income' ? 'Pemasukan' : 'Pengeluaran'} ${amount} dari ${account.name} tercatat` };
  } else {
    // Debt/Receivable
    if (!account) {
      return { error: `Rekening "${accountName}" tidak ditemukan` };
    }

    const debtType = type.includes('hutang') ? 'DEBT' : 'RECEIVABLE';
    
    await prisma.$transaction(async tx => {
      await tx.debt.create({
        data: {
          userId: user.id,
          accountId: account.id,
          type: debtType,
          name: `[Telegram] ${description}`,
          amount,
          remainingAmount: amount,
          dueDate: date
        }
      });

      if (debtType === 'DEBT') {
        await tx.account.update({
          where: { id: account.id },
          data: { balance: { increment: amount } }
        });
      } else {
        await tx.account.update({
          where: { id: account.id },
          data: { balance: { decrement: amount } }
        });
      }
    });

    return { success: true, message: `✅ ${debtType === 'DEBT' ? 'Hutang' : 'Piutang'} ${amount} dari ${account.name} tercatat` };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TelegramUpdate = await request.json();
    
    if (!body.message?.text) {
      return NextResponse.json({ ok: true });
    }

    const { text, from, chat } = body.message;
    const telegramId = from.id;

    // Parse and process transaction
    const result = await parseTransaction(text, telegramId);

    // Send response back to Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      const responseText = result.error || result.message || 'Transaksi tercatat';
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chat.id,
          text: responseText,
          parse_mode: 'HTML'
        })
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
