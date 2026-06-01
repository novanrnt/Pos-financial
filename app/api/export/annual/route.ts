import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rupiah } from '@/lib/utils';

export async function GET(req: Request) {
  const u = await requireUser();
  if (!u) return new NextResponse('Unauthorized', { status: 401 });

  const yearParam = new URL(req.url).searchParams.get('year');
  const year = yearParam ? Number(yearParam) : NaN;

  if (!yearParam || Number.isNaN(year)) {
    return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 });
  }

  const prismaAny = prisma as any;
  const c = await prismaAny.annualClosing?.findUnique?.({
    where: { userId_year: { userId: u.id, year } },
  });

  if (!c) return new NextResponse('Not found', { status: 404 });

  const s = (c.summaryJson ?? {}) as any;

  try {
    const mod = await import('jspdf');
    const jsPDF = mod.default as any;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    function checkPage() {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    }

    function addSection(title: string) {
      checkPage();
      y += 4;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 14, y);
      y += 2;
      doc.setDrawColor(100, 100, 100);
      doc.line(14, y, pageWidth - 14, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
    }

    function addRow(label: string, value: string) {
      checkPage();
      doc.text(label, 18, y);
      doc.text(value, pageWidth - 18, y, { align: 'right' });
      y += 7;
    }

    const updatedAt = (c.updatedAt ?? c.createdAt) as Date;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Laporan Tahunan POS Finance', 14, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode: ${year}`, 14, y);
    y += 5;
    doc.text(
      `Dikunci: ${updatedAt.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`,
      14,
      y
    );
    y += 12;

    // Cashflow
    addSection('CASHFLOW');
    addRow('Total Pemasukan', rupiah(s.income || 0));
    addRow('Total Pengeluaran', rupiah(s.expense || 0));
    addRow('Net Profit', rupiah(s.profit || 0));
    if (s.totalTransactions) {
      addRow('Jumlah Transaksi', `${s.totalTransactions} transaksi`);
    }

    // Pemasukan per Kategori
    if (Array.isArray(s.incomeByCategory) && s.incomeByCategory.length > 0) {
      addSection('PEMASUKAN PER KATEGORI');
      s.incomeByCategory.forEach((c: any) => {
        addRow(c.name, rupiah(c.total));
      });
    }

    // Pengeluaran per Kategori
    if (Array.isArray(s.expenseByCategory) && s.expenseByCategory.length > 0) {
      addSection('PENGELUARAN PER KATEGORI');
      s.expenseByCategory.forEach((c: any) => {
        addRow(c.name, rupiah(c.total));
      });
    }

    // Saldo Rekening
    if (Array.isArray(s.accounts) && s.accounts.length > 0) {
      addSection('SALDO REKENING');
      s.accounts.forEach((a: any) => {
        addRow(`${a.name} (${a.type || '-'})`, rupiah(Number(a.balance)));
      });
      addRow('TOTAL SALDO', rupiah(s.totalCash || 0));
    }

    // Aset Mobil
    if (Array.isArray(s.cars) && s.cars.length > 0) {
      addSection('ASET MOBIL (TOTAL MODAL)');
      s.cars.forEach((car: any) => {
        addRow(car.name, rupiah(car.totalModal));
        doc.setFontSize(8);
        doc.text(
          `  Harga Beli: ${rupiah(car.purchasePrice)} | Biaya: ${rupiah(car.totalCosts)}`,
          22,
          y
        );
        y += 6;
        doc.setFontSize(10);
      });
      addRow('TOTAL MODAL MOBIL', rupiah(s.totalCarModal || 0));
    }

    // Hutang
    if (Array.isArray(s.debts) && s.debts.length > 0) {
      addSection('HUTANG AKTIF');
      s.debts.forEach((d: any) => {
        addRow(d.name + (d.dueDate ? ` (jatuh tempo: ${d.dueDate})` : ''), rupiah(d.remaining));
      });
      addRow('TOTAL HUTANG', rupiah(s.totalDebt || 0));
    }

    // Piutang
    if (Array.isArray(s.receivables) && s.receivables.length > 0) {
      addSection('PIUTANG AKTIF');
      s.receivables.forEach((d: any) => {
        addRow(d.name + (d.dueDate ? ` (jatuh tempo: ${d.dueDate})` : ''), rupiah(d.remaining));
      });
      addRow('TOTAL PIUTANG', rupiah(s.totalReceivable || 0));
    }

    // Investasi
    if (Array.isArray(s.investments) && s.investments.length > 0) {
      addSection('INVESTASI');
      s.investments.forEach((inv: any) => {
        addRow(inv.category + (inv.notes ? ` - ${inv.notes}` : ''), rupiah(inv.balance));
      });
      addRow('TOTAL INVESTASI', rupiah(s.totalInvestment || 0));
    }

    // Tabungan
    if (Array.isArray(s.savings) && s.savings.length > 0) {
      addSection('TABUNGAN');
      s.savings.forEach((g: any) => {
        const status = g.isCompleted ? ' [TERCAPAI]' : '';
        addRow(`${g.name}${status}`, `${rupiah(g.savedAmount)} / ${rupiah(g.targetAmount)}`);
      });
      addRow('TOTAL TABUNGAN', rupiah(s.totalSavings || 0));
    }

    // Net Worth
    if (s.netWorth !== undefined) {
      addSection('NET WORTH');
      addRow('Net Worth Snapshot', rupiah(s.netWorth));
    }

    // Footer
    checkPage();
    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Generated by POS Finance', 14, y);
    doc.text(new Date().toLocaleString('id-ID'), pageWidth - 14, y, { align: 'right' });

    const buffer = Buffer.from(doc.output('arraybuffer'));
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="laporan-tahunan-${year}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate PDF';
    console.error('Annual export error:', message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
