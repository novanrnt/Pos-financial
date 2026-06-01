import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { calculateTaxSummary, getTaxSettings } from '@/lib/tax-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const ptkpStatus = searchParams.get('ptkpStatus');
    const method = searchParams.get('method');

    if (!year || isNaN(Number(year))) {
      return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 });
    }

    const taxYear = Number(year);

    // Get tax settings from database if not provided in query
    let finalPtkpStatus = ptkpStatus;
    let finalMethod = method;
    let manualTaxPaid = 0;

    const settings = await getTaxSettings(user.id, taxYear);
    if (settings) {
      finalPtkpStatus = finalPtkpStatus || settings.ptkpStatus;
      finalMethod = finalMethod || settings.calculationMethod;
      manualTaxPaid = Number(settings.manualTaxPaid);
    }

    // Use defaults if still not set
    finalPtkpStatus = finalPtkpStatus || 'TK/0';
    finalMethod = finalMethod || 'progressive';

    // Calculate summary
    const summary = await calculateTaxSummary(
      user.id,
      taxYear,
      finalPtkpStatus,
      finalMethod as 'progressive' | 'umkm_final',
      manualTaxPaid
    );

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error('Error fetching tax summary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
