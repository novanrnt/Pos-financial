import { NextRequest, NextResponse } from 'next/server';
import { processTelegramUpdates } from '@/lib/telegram-bot';

export async function GET(request: NextRequest) {
  try {
    await processTelegramUpdates();
    return NextResponse.json({ ok: true, message: 'Polling completed' });
  } catch (error) {
    console.error('Telegram poll error:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await processTelegramUpdates();
    return NextResponse.json({ ok: true, message: 'Polling completed' });
  } catch (error) {
    console.error('Telegram poll error:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
