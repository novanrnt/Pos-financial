import { NextRequest, NextResponse } from 'next/server';
import { processTelegramUpdates } from '@/lib/telegram-bot';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  processTelegramUpdates().catch(err => console.error('Poll error:', err));
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(request: NextRequest) {
  processTelegramUpdates().catch(err => console.error('Poll error:', err));
  return NextResponse.json({ ok: true }, { status: 200 });
}
