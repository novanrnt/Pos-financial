'use server';

import { prisma } from './prisma';
import type { TaxBreakdownItem } from './tax-calculations';
import {
  calculatePTKP,
  calculateNetIncome,
  calculatePKP,
  calculateProgressiveTax,
  calculateUMKMFinalTax,
  calculateTaxStatus,
  calculateTaxDifference,
} from './tax-calculations';

export interface TaxSummary {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  ptkp: number;
  pkp: number;
  pphDue: number;
  taxPaid: number;
  difference: number;
  status: 'kurang_bayar' | 'lebih_bayar' | 'nihil';
  incomeByCategory: Record<string, { count: number; total: number }>;
  expenseByCategory: Record<string, { count: number; total: number }>;
  taxBreakdown: TaxBreakdownItem[];
  method: 'progressive' | 'umkm_final';
}

/**
 * Get all transactions for a specific year
 */
export async function getTaxYearTransactions(userId: string, year: number) {
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  return await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    include: {
      category: true,
    },
  });
}

/**
 * Get income grouped by category
 */
export async function getIncomeByCategory(userId: string, year: number) {
  const transactions = await getTaxYearTransactions(userId, year);
  const incomeTransactions = transactions.filter((t) => t.type === 'INCOME');

  const grouped: Record<string, { count: number; total: number }> = {};

  for (const tx of incomeTransactions) {
    const categoryName = tx.category?.name || 'Uncategorized';
    if (!grouped[categoryName]) {
      grouped[categoryName] = { count: 0, total: 0 };
    }
    grouped[categoryName].count += 1;
    grouped[categoryName].total += Number(tx.amount);
  }

  return grouped;
}

/**
 * Get expense grouped by category
 */
export async function getExpenseByCategory(userId: string, year: number) {
  const transactions = await getTaxYearTransactions(userId, year);
  const expenseTransactions = transactions.filter((t) => t.type === 'EXPENSE');

  const grouped: Record<string, { count: number; total: number }> = {};

  for (const tx of expenseTransactions) {
    const categoryName = tx.category?.name || 'Uncategorized';
    if (!grouped[categoryName]) {
      grouped[categoryName] = { count: 0, total: 0 };
    }
    grouped[categoryName].count += 1;
    grouped[categoryName].total += Number(tx.amount);
  }

  return grouped;
}

/**
 * Get account balances
 */
export async function getAccountBalances(userId: string) {
  const accounts = await prisma.account.findMany({
    where: { userId },
  });

  const balances: Record<string, number> = {};
  for (const account of accounts) {
    balances[account.id] = Number(account.balance);
  }

  return balances;
}

/**
 * Get assets summary (cars, investments)
 */
export async function getAssetsSummary(userId: string, year: number) {
  const cars = await prisma.car.findMany({
    where: { userId },
  });

  const investments = await prisma.investmentSnapshot.findMany({
    where: {
      userId,
      month: {
        startsWith: String(year),
      },
    },
  });

  const carsData = cars.map((car) => ({
    id: car.id,
    name: car.name,
    estimatedValue: Number(car.estimatedSellPrice || 0),
  }));

  const investmentsData = investments.map((inv) => ({
    category: inv.category,
    balance: Number(inv.balance),
  }));

  return { cars: carsData, investments: investmentsData };
}

/**
 * Get debt and receivable summary
 */
export async function getDebtReceivableSummary(userId: string) {
  const debts = await prisma.debt.findMany({
    where: {
      userId,
      status: 'ACTIVE',
    },
  });

  const debtsList = debts
    .filter((d) => d.type === 'DEBT')
    .map((d) => ({
      name: d.name,
      remainingAmount: Number(d.remainingAmount),
    }));

  const receivablesList = debts
    .filter((d) => d.type === 'RECEIVABLE')
    .map((d) => ({
      name: d.name,
      amount: Number(d.remainingAmount),
    }));

  return { debts: debtsList, receivables: receivablesList };
}

/**
 * Calculate complete tax summary
 */
export async function calculateTaxSummary(
  userId: string,
  year: number,
  ptkpStatus: string,
  method: 'progressive' | 'umkm_final',
  taxPaid: number
): Promise<TaxSummary> {
  // Get transactions
  const transactions = await getTaxYearTransactions(userId, year);

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Get grouped data
  const incomeByCategory = await getIncomeByCategory(userId, year);
  const expenseByCategory = await getExpenseByCategory(userId, year);

  // Calculate tax
  const ptkp = calculatePTKP(ptkpStatus);
  const netIncome = calculateNetIncome(totalIncome, totalExpense);
  const pkp = calculatePKP(netIncome, ptkp);

  let pphDue = 0;
  let taxBreakdown: TaxBreakdownItem[] = [];

  if (method === 'progressive') {
    const result = calculateProgressiveTax(pkp);
    pphDue = result.totalTax;
    taxBreakdown = result.breakdown;
  } else {
    const result = calculateUMKMFinalTax(totalIncome);
    pphDue = result.totalTax;
    taxBreakdown = [
      {
        layer: 'UMKM Final 0.5%',
        rate: 0.5,
        taxableAmount: result.basis,
        tax: result.totalTax,
      },
    ];
  }

  const difference = calculateTaxDifference(pphDue, taxPaid);
  const status = calculateTaxStatus(pphDue, taxPaid);

  return {
    totalIncome,
    totalExpense,
    netIncome,
    ptkp,
    pkp,
    pphDue,
    taxPaid,
    difference,
    status,
    incomeByCategory,
    expenseByCategory,
    taxBreakdown,
    method,
  };
}

/**
 * Save tax settings
 */
export async function saveTaxSettings(
  userId: string,
  taxYear: number,
  ptkpStatus: string,
  calculationMethod: string,
  manualTaxPaid: number,
  notes?: string
) {
  return await prisma.taxSettings.upsert({
    where: {
      userId_taxYear: {
        userId,
        taxYear,
      },
    },
    update: {
      ptkpStatus,
      calculationMethod,
      manualTaxPaid,
      notes,
      updatedAt: new Date(),
    },
    create: {
      userId,
      taxYear,
      ptkpStatus,
      calculationMethod,
      manualTaxPaid,
      notes,
    },
  });
}

/**
 * Get tax settings
 */
export async function getTaxSettings(userId: string, taxYear: number) {
  return await prisma.taxSettings.findUnique({
    where: {
      userId_taxYear: {
        userId,
        taxYear,
      },
    },
  });
}
