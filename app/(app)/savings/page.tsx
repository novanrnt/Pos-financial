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
      <div className="ios-card p-6 md:p-8 overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-[11px] font-medium text-white/50 uppercase tracking-wide mb-2">Tabungan • POS Finance</p>
          <h1 className="text-[28px] md:text-[34px] font-semibold text-white tracking-tight">Tabungan</h1>
          <p className="mt-2 text-[13px] text-white/50">Kelola target tabungan dan pantau progress kamu.</p>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <SavingsGoalModal />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="ios-card p-4" style={{ border: '0.5px solid rgba(191,90,242,0.15)' }}>
          <p className="text-[11px] font-medium text-white/50 uppercase mb-2">Total Tabungan</p>
          <p className="text-[13px] font-semibold" style={{ color: '#BF5AF2' }}>{rupiah(totalSaved)}</p>
        </div>
        <div className="ios-card p-4">
          <p className="text-[11px] font-medium text-white/50 uppercase mb-2">Total Target</p>
          <p className="text-[13px] font-semibold text-white">{rupiah(totalTarget)}</p>
        </div>
        <div className="ios-card p-4" style={{ border: '0.5px solid rgba(48,209,88,0.15)' }}>
          <p className="text-[11px] font-medium text-white/50 uppercase mb-2">Goal Aktif</p>
          <p className="text-[13px] font-semibold" style={{ color: '#30D158' }}>{activeGoals.length} goal</p>
        </div>
        <div className="ios-card p-4" style={{ border: '0.5px solid rgba(48,209,88,0.15)' }}>
          <p className="text-[11px] font-medium text-white/50 uppercase mb-2">Selesai</p>
          <p className="text-[13px] font-semibold" style={{ color: '#30D158' }}>{completedGoals.length} goal</p>
        </div>
      </div>



      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-[13px] font-medium text-white px-1">Goal Aktif</h2>
          {activeGoals.map(goal => {
            const percent = Math.min((Number(goal.savedAmount) / Number(goal.targetAmount)) * 100, 100);
            const remaining = Number(goal.targetAmount) - Number(goal.savedAmount);
            const isNearDeadline = goal.deadline && (goal.deadline.getTime() - now.getTime()) < 30 * 24 * 60 * 60 * 1000;
            return (
              <div key={goal.id} className="ios-card p-6 md:p-8">
                {/* Goal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl" style={{ background: 'rgba(191,90,242,0.12)' }}>
                      <PiggyBank size={20} style={{ color: '#BF5AF2' }} />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-medium text-white">{goal.name}</h3>
                      {goal.deadline && (
                        <p className={`text-[11px] mt-0.5 flex items-center gap-1 ${isNearDeadline ? 'text-[#FF453A]' : 'text-white/50'}`}>
                          <Calendar size={11} />
                          {goal.deadline.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <form action={deleteSavingsGoal}>
                    <input type="hidden" name="id" value={goal.id} />
                    <button type="submit" className="text-[11px] active-scale transition" style={{ color: '#FF453A' }}>Hapus</button>
                  </form>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-medium text-white/50 uppercase">Progress</p>
                    <p className="text-[11px] font-medium" style={{ color: '#BF5AF2' }}>{Math.round(percent)}%</p>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, background: '#BF5AF2' }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[13px] font-semibold" style={{ color: '#BF5AF2' }}>{rupiah(Number(goal.savedAmount))}</p>
                    <p className="text-[11px] text-white/50">dari {rupiah(Number(goal.targetAmount))}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[11px] text-white/50">Sisa Target</p>
                    <p className="text-[13px] font-semibold mt-1" style={{ color: '#FF453A' }}>{rupiah(remaining)}</p>
                  </div>
                  <div className="p-3" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[11px] text-white/50">Jumlah Setor</p>
                    <p className="text-[13px] font-semibold text-white mt-1">{goal.deposits.length}x</p>
                  </div>
                </div>

                {/* Deposit Form */}
                <div className="border-t border-white/[0.07] pt-5">
                  <p className="text-[11px] font-medium text-white/50 uppercase mb-3">Setor Tabungan</p>
                  <form action={depositSavings} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="hidden" name="goalId" value={goal.id} />
                    <select name="accountId" required className="input active-scale">
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
                  <div className="border-t border-white/[0.07] pt-5 mt-4">
                    <p className="text-[11px] font-medium text-white/50 uppercase mb-3">Tarik Tabungan</p>
                    <form action={withdrawSavings} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="hidden" name="goalId" value={goal.id} />
                      <select name="accountId" required className="input active-scale">
                        <option value="">Pilih Rekening</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                      <input name="amount" type="number" required placeholder="Nominal tarik" className="input" />
                      <input name="date" type="date" required defaultValue={now.toISOString().split('T')[0]} className="input" />
                      <div className="sm:col-span-3">
                        <button type="submit" className="btn btn-ghost active-scale">Tarik Tabungan</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Recent Deposits */}
                {goal.deposits.length > 0 && (
                  <div className="border-t border-white/[0.07] pt-5 mt-4">
                    <p className="text-[11px] font-medium text-white/50 uppercase mb-3">Riwayat Setor</p>
                    <div className="space-y-2">
                      {goal.deposits.map(d => (
                        <div key={d.id} className="flex items-center justify-between py-2 border-b border-white/[0.07] last:border-0">
                          <p className="text-[11px] text-white/50">{d.date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p className="text-[13px] font-semibold" style={{ color: '#BF5AF2' }}>{rupiah(Number(d.amount))}</p>
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
          <h2 className="text-[13px] font-medium text-white px-1 flex items-center gap-2">
            <CheckCircle2 size={16} style={{ color: '#30D158' }} /> Goal Selesai
          </h2>
          {completedGoals.map(goal => (
            <div key={goal.id} className="ios-card p-6" style={{ border: '0.5px solid rgba(48,209,88,0.15)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl" style={{ background: 'rgba(48,209,88,0.12)' }}>
                    <CheckCircle2 size={20} style={{ color: '#30D158' }} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-medium text-white">{goal.name}</h3>
                    <p className="text-[11px] mt-0.5" style={{ color: '#30D158' }}>Tercapai! {rupiah(Number(goal.savedAmount))}</p>
                  </div>
                </div>
                <form action={deleteSavingsGoal}>
                  <input type="hidden" name="id" value={goal.id} />
                  <button type="submit" className="text-[11px] active-scale transition" style={{ color: '#FF453A' }}>Hapus</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="ios-card p-12 text-center">
          <PiggyBank size={48} className="opacity-30 mx-auto mb-4" style={{ color: '#BF5AF2' }} />
          <h3 className="text-[13px] font-medium text-white">Belum ada goal tabungan</h3>
          <p className="text-[13px] text-white/50 mt-2">Buat goal pertama kamu di atas!</p>
        </div>
      )}
    </div>
  );
}
