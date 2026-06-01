import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rupiah } from '@/lib/utils';

export async function GET(req: Request) {
  const u = await requireUser();
  if (!u) return new NextResponse('Unauthorized', { status: 401 });

  const month = new URL(req.url).searchParams.get('month') || '';
  if (!month) {
    return NextResponse.json({ error: 'Invalid month parameter' }, { status: 400 });
  }

  try {
    const c = await prisma.monthlyClosing.findUnique({
      where: { userId_month: { userId: u.id, month } },
    });

    if (!c) return new NextResponse('Not found', { status: 404 });

    const s = (c.summaryJson ?? {}) as any;
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

    const closedAt = c.closedAt as Date;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Laporan Bulanan POS Finance', 14, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode: ${month}`, 14, y);
    y += 5;
    doc.text(
      `Dikunci: ${closedAt.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`,
      14,
      y
    );
    y += 12;

    addSection('CASHFLOW');
    addRow('Total Pemasukan', rupiah(Number(s.income ?? 0)));
    addRow('Total Pengeluaran', rupiah(Number(s.expense ?? 0)));
    addRow('Net Profit', rupiah(Number(s.profit ?? 0)));
    if (s.totalTransactions !== undefined && s.totalTransactions !== null) {
      addRow('Jumlah Transaksi', `${Number(s.totalTransactions)} transaksi`);
    }

    if (Array.isArray(s.incomeByCategory) && s.incomeByCategory.length > 0) {
      addSection('PEMASUKAN PER KATEGORI');
      s.incomeByCategory.forEach((it: any) => addRow(it.name, rupiah(Number(it.total ?? 0))));
    }

    if (Array.isArray(s.expenseByCategory) && s.expenseByCategory.length > 0) {
      addSection('PENGELUARAN PER KATEGORI');
      s.expenseByCategory.forEach((it: any) => addRow(it.name, rupiah(Number(it.total ?? 0))));
    }

    if (Array.isArray(s.accounts) && s.accounts.length > 0) {
      addSection('SALDO REKENING');
      s.accounts.forEach((a: any) => {
        addRow(`${a.name} (${a.type || '-'})`, rupiah(Number(a.balance ?? 0)));
      });
      addRow('TOTAL SALDO', rupiah(Number(s.totalCash ?? 0)));
    }

    if (Array.isArray(s.cars) && s.cars.length > 0) {
      addSection('ASET MOBIL (TOTAL MODAL)');
      s.cars.forEach((car: any) => {
        addRow(car.name, rupiah(Number(car.totalModal ?? 0)));
        doc.setFontSize(8);
        doc.text(
          `  Harga Beli: ${rupiah(Number(car.purchasePrice ?? 0))} | Biaya: ${rupiah(Number(car.totalCosts ?? 0))}`,
          22,
          y
        );
        y += 6;
        doc.setFontSize(10);
      });
      addRow('TOTAL MODAL MOBIL', rupiah(Number(s.totalCarModal ?? 0)));
    }

    if (Array.isArray(s.debts) && s.debts.length > 0) {
      addSection('HUTANG AKTIF');
      s.debts.forEach((d: any) => {
        addRow(d.name + (d.dueDate ? ` (jatuh tempo: ${d.dueDate})` : ''), rupiah(Number(d.remaining ?? 0)));
      });
      addRow('TOTAL HUTANG', rupiah(Number(s.totalDebt ?? 0)));
    }

    if (Array.isArray(s.receivables) && s.receivables.length > 0) {
      addSection('PIUTANG AKTIF');
      s.receivables.forEach((d: any) => {
        addRow(d.name + (d.dueDate ? ` (jatuh tempo: ${d.dueDate})` : ''), rupiah(Number(d.remaining ?? 0)));
      });
      addRow('TOTAL PIUTANG', rupiah(Number(s.totalReceivable ?? 0)));
    }

    if (Array.isArray(s.investments) && s.investments.length > 0) {
      addSection('INVESTASI');
      s.investments.forEach((inv: any) => {
        addRow(inv.category + (inv.notes ? ` - ${inv.notes}` : ''), rupiah(Number(inv.balance ?? 0)));
      });
      addRow('TOTAL INVESTASI', rupiah(Number(s.totalInvestment ?? 0)));
    }

    if (Array.isArray(s.savings) && s.savings.length > 0) {
      addSection('TABUNGAN');
      s.savings.forEach((g: any) => {
        const status = g.isCompleted ? ' [TERCAPAI]' : '';
        addRow(`${g.name}${status}`, `${rupiah(Number(g.savedAmount ?? 0))} / ${rupiah(Number(g.targetAmount ?? 0))}`);
      });
      addRow('TOTAL TABUNGAN', rupiah(Number(s.totalSavings ?? 0)));
    }

    if (s.netWorth !== undefined) {
      addSection('NET WORTH');
      addRow('Net Worth Snapshot', rupiah(Number(s.netWorth ?? 0)));
    }

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
        'Content-Disposition': `attachment; filename="laporan-bulanan-${month}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate PDF';
    console.error('Monthly export error:', message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
