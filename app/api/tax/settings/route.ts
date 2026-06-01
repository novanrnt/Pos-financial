import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { saveTaxSettings, getTaxSettings } from '@/lib/tax-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');

    if (!year || isNaN(Number(year))) {
      return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 });
    }

    const taxYear = Number(year);

    // Get tax settings
    const settings = await getTaxSettings(user.id, taxYear);

    // Return null if no settings found (client will use defaults)
    return NextResponse.json(settings || {}, { status: 200 });
  } catch (error) {
    console.error('Error fetching tax settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taxYear, ptkpStatus, calculationMethod, manualTaxPaid, notes } = body;

    // Validation
    if (!taxYear || typeof taxYear !== 'number') {
      return NextResponse.json({ error: 'Invalid tax year' }, { status: 400 });
    }

    if (!ptkpStatus || !['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3'].includes(ptkpStatus)) {
      return NextResponse.json({ error: 'Invalid PTKP status' }, { status: 400 });
    }

    if (!calculationMethod || !['progressive', 'umkm_final'].includes(calculationMethod)) {
      return NextResponse.json({ error: 'Invalid calculation method' }, { status: 400 });
    }

    if (typeof manualTaxPaid !== 'number' || manualTaxPaid < 0) {
      return NextResponse.json({ error: 'Invalid tax paid amount' }, { status: 400 });
    }

    // Save settings
    const settings = await saveTaxSettings(
      user.id,
      taxYear,
      ptkpStatus,
      calculationMethod,
      manualTaxPaid,
      notes
    );

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Error saving tax settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
