import { redirect } from 'next/navigation';
import { PiggyBank, Plus, Target, TrendingUp, Wallet, CheckCircle2, Calendar } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { rupiah } from '@/lib/utils';
import { Card, Badge, SubmitButton } from '@/components/ui';
import { depositSavings, withdrawSavings, deleteSavingsGoal } from '@/lib/actions';
import { SavingsGoalModal } from '@/components/savings-goal-modal';

export default async function SavingsPage() {
  const u = await requireUser();
  if (!u) redirect('/login');

  const [goals, accounts] = await Promise.all([
    prisma.savingsGoal.findMany({
      where: { userId: u.id },
      include: { deposits: { orderBy: { date: 'desc' }, take: 5 } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.account.findMany({ where: { userId: u.id }, orderBy: { isPrimary: 'desc' } })
  ]);

  const totalSaved = goals.reduce((a, g) => a + Number(g.savedAmount), 0);
  const totalTarget = goals.reduce((a, g) => a + Number(g.targetAmount), 0);
  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);
  const now = new Date();

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="glass-premium rounded-3xl p-6 md:p-8 overflow-hidden relative">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <Badge variant="default" className="mb-3">Tabungan • POS Finance</Badge>
          <h1 className="text-2xl md:text-3xl font-black text-premium-text tracking-tight">Tabungan</h1>
          <p className="mt-2 text-sm text-premium-text-muted">Kelola target tabungan dan pantau progress kamu.</p>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <SavingsGoalModal />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="glass-premium rounded-2xl p-4 border border-violet-500/20">
          <p className="text-xs font-black text-premium-text-muted uppercase mb-2">Total Tabungan</p>
          <p className="text-base font-black text-violet-300">{rupiah(totalSaved)}</p>
        </div>
        <div className="glass-premium rounded-2xl p-4 border border-premium-border-soft">
          <p className="text-xs font-black text-premium-text-muted uppercase mb-2">Total Target</p>
          <p className="text-base font-black text-premium-text">{rupiah(totalTarget)}</p>
        </div>
        <div className="glass-premium rounded-2xl p-4 border border-premium-income/20">
          <p className="text-xs font-black text-premium-text-muted uppercase mb-2">Goal Aktif</p>
          <p className="text-base font-black text-premium-income">{activeGoals.length} goal</p>
        </div>
        <div className="glass-premium rounded-2xl p-4 border border-emerald-500/20">
          <p className="text-xs font-black text-premium-text-muted uppercase mb-2">Selesai</p>
          <p className="text-base font-black text-emerald-400">{completedGoals.length} goal</p>
        </div>
      </div>



      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-premium-text px-1">Goal Aktif</h2>
          {activeGoals.map(goal => {
            const percent = Math.min((Number(goal.savedAmount) / Number(goal.targetAmount)) * 100, 100);
            const remaining = Number(goal.targetAmount) - Number(goal.savedAmount);
            const isNearDeadline = goal.deadline && (goal.deadline.getTime() - now.getTime()) < 30 * 24 * 60 * 60 * 1000;
            return (
              <div key={goal.id} className="glass-premium rounded-3xl p-6 md:p-8">
                {/* Goal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/20">
                      <PiggyBank size={20} className="text-violet-300" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-premium-text">{goal.name}</h3>
                      {goal.deadline && (
                        <p className={`text-xs mt-0.5 flex items-center gap-1 ${isNearDeadline ? 'text-premium-expense' : 'text-premium-text-muted'}`}>
                          <Calendar size={11} />
                          {goal.deadline.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <form action={deleteSavingsGoal}>
                    <input type="hidden" name="id" value={goal.id} />
                    <button type="submit" className="text-xs text-premium-expense hover:text-premium-expense/80 transition">Hapus</button>
                  </form>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-black text-premium-text-muted uppercase">Progress</p>
                    <p className="text-xs font-black text-violet-300">{Math.round(percent)}%</p>
                  </div>
                  <div className="h-3 bg-white/[.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-black text-violet-300">{rupiah(Number(goal.savedAmount))}</p>
                    <p className="text-xs text-premium-text-muted">dari {rupiah(Number(goal.targetAmount))}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="soft-card rounded-xl p-3 border border-premium-border-soft">
                    <p className="text-xs text-premium-text-muted">Sisa Target</p>
                    <p className="text-sm font-black text-premium-expense mt-1">{rupiah(remaining)}</p>
                  </div>
                  <div className="soft-card rounded-xl p-3 border border-premium-border-soft">
                    <p className="text-xs text-premium-text-muted">Jumlah Setor</p>
                    <p className="text-sm font-black text-premium-text mt-1">{goal.deposits.length}x</p>
                  </div>
                </div>

                {/* Deposit Form */}
                <div className="border-t border-premium-border-soft pt-5">
                  <p className="text-xs font-black text-premium-text-muted uppercase mb-3">Setor Tabungan</p>
                  <form action={depositSavings} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="hidden" name="goalId" value={goal.id} />
                    <select name="accountId" required className="input">
                      <option value="">Pilih Rekening</option>
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({rupiah(Number(a.balance))})</option>
                      ))}
                    </select>
                    <input name="amount" type="number" required placeholder="Nominal setor" className="input" />
                    <input name="date" type="date" required defaultValue={now.toISOString().split('T')[0]} className="input" />
                    <div className="sm:col-span-3">
                      <SubmitButton>Setor Sekarang</SubmitButton>
                    </div>
                  </form>
                </div>

                {/* Withdraw Form */}
                {Number(goal.savedAmount) > 0 && (
                  <div className="border-t border-premium-border-soft pt-5 mt-4">
                    <p className="text-xs font-black text-premium-text-muted uppercase mb-3">Tarik Tabungan</p>
                    <form action={withdrawSavings} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="hidden" name="goalId" value={goal.id} />
                      <select name="accountId" required className="input">
                        <option value="">Pilih Rekening</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                      <input name="amount" type="number" required placeholder="Nominal tarik" className="input" />
                      <input name="date" type="date" required defaultValue={now.toISOString().split('T')[0]} className="input" />
                      <div className="sm:col-span-3">
                        <button type="submit" className="btn btn-ghost">Tarik Tabungan</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Recent Deposits */}
                {goal.deposits.length > 0 && (
                  <div className="border-t border-premium-border-soft pt-5 mt-4">
                    <p className="text-xs font-black text-premium-text-muted uppercase mb-3">Riwayat Setor</p>
                    <div className="space-y-2">
                      {goal.deposits.map(d => (
                        <div key={d.id} className="flex items-center justify-between py-2 border-b border-premium-border-soft last:border-0">
                          <p className="text-xs text-premium-text-muted">{d.date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p className="text-sm font-black text-violet-300">{rupiah(Number(d.amount))}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-premium-text px-1 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-400" /> Goal Selesai
          </h2>
          {completedGoals.map(goal => (
            <div key={goal.id} className="glass-premium rounded-3xl p-6 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-premium-text">{goal.name}</h3>
                    <p className="text-xs text-emerald-400 mt-0.5">Tercapai! {rupiah(Number(goal.savedAmount))}</p>
                  </div>
                </div>
                <form action={deleteSavingsGoal}>
                  <input type="hidden" name="id" value={goal.id} />
                  <button type="submit" className="text-xs text-premium-expense hover:text-premium-expense/80 transition">Hapus</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="glass-premium rounded-3xl p-12 text-center">
          <PiggyBank size={48} className="text-violet-300 opacity-30 mx-auto mb-4" />
          <h3 className="text-lg font-black text-premium-text">Belum ada goal tabungan</h3>
          <p className="text-sm text-premium-text-muted mt-2">Buat goal pertama kamu di atas!</p>
        </div>
      )}
    </div>
  );
}
