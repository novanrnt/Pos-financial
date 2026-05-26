import { NextRequest, NextResponse } from 'next/server';
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

const months: { [key: string]: number } = {
  januari: 0, jan: 0,
  februari: 1, feb: 1,
  maret: 2, mar: 2,
  april: 3, apr: 3,
  mei: 4,
  juni: 5, jun: 5,
  juli: 6, jul: 6,
  agustus: 7, agu: 7,
  september: 8, sep: 8,
  oktober: 9, okt: 9,
  november: 10, nov: 10,
  desember: 11, des: 11
};

async function getUserByTelegramId(telegramId: number) {
  return prisma.user.findFirst({
    where: { email: `telegram_${telegramId}@pos.local` },
    select: { id: true, fullName: true }
  });
}

async function sendTelegramMessage(botToken: string, chatId: number, text: string, options?: any) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        ...options
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }
}

function getHelpMessage() {
  return `<b>📊 POS Keuangan Bot</b>\n\n` +
    `<b>Format Input Transaksi:</b>\n` +
    `<code>19 mei 2026 makan 20.000 blue</code>\n\n` +
    `<b>Jenis Transaksi:</b>\n` +
    `• <b>Pengeluaran</b> (default): <code>19 mei 2026 makan 20.000 blue</code>\n` +
    `• <b>Pemasukan</b>: <code>19 mei 2026 gaji 500.000 blue income</code>\n` +
    `• <b>Hutang</b>: <code>19 mei 2026 pinjam 100.000 blue hutang</code>\n` +
    `• <b>Piutang</b>: <code>19 mei 2026 pinjamkan 50.000 blue piutang</code>\n\n` +
    `<b>Contoh:</b>\n` +
    `📉 19 mei 2026 bensin 50.000 cash\n` +
    `📈 20 mei 2026 bonus 100.000 bca income\n` +
    `💳 21 mei 2026 utang teman 200.000 mandiri hutang\n\n` +
    `<b>Perintah Lain:</b>\n` +
    `/accounts - Lihat daftar akun Anda`;
}

async function handleStartCommand(botToken: string, chatId: number, telegramId: number, firstName: string) {
  const user = await getUserByTelegramId(telegramId);
  
  if (!user) {
    return sendTelegramMessage(botToken, chatId, 
      `Halo ${firstName}! 👋\n\nUntuk menggunakan bot ini, Anda perlu melakukan setup terlebih dahulu di aplikasi POS Keuangan.\n\n` +
      `Silakan buka aplikasi dan pergi ke Settings > Telegram untuk mengaktifkan integrasi.\n\n` +
      `Setelah itu, kirim /help untuk melihat bantuan.`
    );
  }

  const helpMessage = getHelpMessage();
  return sendTelegramMessage(botToken, chatId, 
    `Selamat datang kembali, <b>${user.fullName}</b>! 👋\n\n${helpMessage}`
  );
}

async function handleAccountsCommand(botToken: string, chatId: number, telegramId: number) {
  const user = await getUserByTelegramId(telegramId);
  
  if (!user) {
    return sendTelegramMessage(botToken, chatId, '❌ Silakan setup akun terlebih dahulu di aplikasi.');
  }

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    select: { name: true, balance: true, type: true },
    orderBy: { createdAt: 'asc' }
  });

  if (accounts.length === 0) {
    return sendTelegramMessage(botToken, chatId, '❌ Anda belum memiliki akun. Silakan buat akun terlebih dahulu.');
  }

  let message = '<b>💰 Daftar Akun Anda:</b>\n\n';
  accounts.forEach((acc, idx) => {
    const balance = typeof acc.balance === 'object' ? acc.balance.toString() : String(acc.balance);
    message += `${idx + 1}. <b>${acc.name}</b> (${acc.type})\n`;
    message += `   Saldo: Rp ${parseInt(balance).toLocaleString('id-ID')}\n\n`;
  });

  return sendTelegramMessage(botToken, chatId, message);
}

// Parse telegram message format: "19 mei 2026 makan 20.000 blue" or "19 mei 2026 gaji 500.000 blue income"
async function parseTransaction(text: string, telegramId: number) {
  const user = await getUserByTelegramId(telegramId);
  
  if (!user) {
    return { error: '❌ User tidak ditemukan. Silakan setup di aplikasi terlebih dahulu.' };
  }

  // Parse format: "tanggal bulan tahun deskripsi nominal rekening [type]"
  // Example: "19 mei 2026 makan 20.000 blue" or "19 mei 2026 gaji 500.000 blue income"
  const regex = /^(\d{1,2})\s+(\w+)\s+(\d{4})\s+(.+?)\s+([\d.]+)\s+(\w+)(?:\s+(income|expense|hutang|piutang))?$/i;
  const match = text.trim().match(regex);

  if (!match) {
    return { error: '❌ Format tidak valid.\n\nGunakan: <code>19 mei 2026 makan 20.000 blue</code>\n\nKetik /help untuk bantuan.' };
  }

  const [, day, monthName, year, description, amountStr, accountName, typeStr] = match;
  const monthIndex = months[monthName.toLowerCase()];
  
  if (monthIndex === undefined) {
    return { error: '❌ Bulan tidak valid' };
  }

  const date = new Date(Number(year), monthIndex, Number(day));
  const amount = toNumber(amountStr);
  const type = typeStr?.toLowerCase() || 'expense';

  // Find account by name (case-insensitive)
  const account = await prisma.account.findFirst({
    where: { userId: user.id, name: { mode: 'insensitive', contains: accountName } },
    select: { id: true, name: true }
  });

  if (!type.includes('hutang') && !type.includes('piutang')) {
    // Regular transaction
    if (!account) {
      return { error: `❌ Rekening "<b>${accountName}</b>" tidak ditemukan.\n\nKetik /accounts untuk melihat daftar akun.` };
    }

    // Find or create category
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

    const emoji = type === 'income' ? '📈' : '📉';
    return { 
      success: true, 
      message: `${emoji} <b>${type === 'income' ? 'Pemasukan' : 'Pengeluaran'} tercatat!</b>\n\n` +
               `Nominal: Rp ${amount.toLocaleString('id-ID')}\n` +
               `Kategori: ${description}\n` +
               `Rekening: <b>${account.name}</b>` 
    };
  } else {
    // Debt/Receivable
    if (!account) {
      return { error: `❌ Rekening "<b>${accountName}</b>" tidak ditemukan.\n\nKetik /accounts untuk melihat daftar akun.` };
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

    const emoji = debtType === 'DEBT' ? '💳' : '💰';
    const label = debtType === 'DEBT' ? 'Hutang' : 'Piutang';
    return { 
      success: true, 
      message: `${emoji} <b>${label} tercatat!</b>\n\n` +
               `Nominal: Rp ${amount.toLocaleString('id-ID')}\n` +
               `Deskripsi: ${description}\n` +
               `Rekening: <b>${account.name}</b>` 
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if configured
    const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (process.env.TELEGRAM_WEBHOOK_SECRET && secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body: TelegramUpdate = await request.json();
    
    if (!body.message?.text) {
      return new NextResponse(JSON.stringify({ ok: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { text, from, chat } = body.message;
    const telegramId = from.id;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return new NextResponse(JSON.stringify({ error: 'Bot token not configured' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse command
    const command = text.toLowerCase().split(/\s+/)[0];

    if (command === '/start') {
      await handleStartCommand(botToken, chat.id, telegramId, from.first_name);
    } else if (command === '/help') {
      const helpMessage = getHelpMessage();
      await sendTelegramMessage(botToken, chat.id, helpMessage);
    } else if (command === '/accounts') {
      await handleAccountsCommand(botToken, chat.id, telegramId);
    } else {
      // Parse transaction
      const result = await parseTransaction(text, telegramId);
      const responseText = result.error || result.message || '✅ Transaksi tercatat';
      await sendTelegramMessage(botToken, chat.id, responseText);
    }

    return new NextResponse(JSON.stringify({ ok: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return new NextResponse(JSON.stringify({ ok: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
