'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, Plus } from 'lucide-react';
import { Modal } from '@/components/modal';
import { addTransaction } from '@/lib/actions';
import { cn, todayInput } from '@/lib/utils';

const schema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  accountId: z.string().min(1, 'Pilih rekening'),
  transferToAccountId: z.string().optional(),
  categoryId: z.string().optional(),
  amount: z.coerce.number().positive('Nominal harus lebih dari 0'),
  date: z.string().min(1, 'Pilih tanggal'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Account = { id: string; name: string; balance: unknown };
type Category = { id: string; name: string; type: string };

export function TransactionFormButton({
  accounts,
  categories,
  label = 'Tambah Transaksi',
  variant = 'primary',
}: {
  accounts: Account[];
  categories: Category[];
  label?: string;
  variant?: 'primary' | 'fab';
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === 'fab' ? (
        <button
          onClick={() => setOpen(true)}
          className="md:hidden fixed z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/30 hover:scale-105 transition-transform duration-300 active:scale-95"
          style={{
            bottom: 'calc(1rem + var(--safe-area-inset-bottom) + 5rem)',
            right: '1rem',
          }}
        >
          <Plus size={24} />
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="btn btn-primary gap-2">
          <Plus size={16} /> {label}
        </button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Transaksi">
        <TransactionForm
          accounts={accounts}
          categories={categories}
          onSuccess={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}

function TransactionForm({
  accounts,
  categories,
  onSuccess,
}: {
  accounts: Account[];
  categories: Category[];
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EXPENSE', date: todayInput() },
  });

  const txType = watch('type');
  const filteredCats = categories.filter(c =>
    txType === 'INCOME' ? c.type === 'INCOME' : c.type === 'EXPENSE'
  );

  const onSubmit = (data: FormData) => {
    setServerError('');
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, String(v)); });
    startTransition(async () => {
      try {
        await addTransaction(fd);
        reset();
        onSuccess();
      } catch (e: unknown) {
        setServerError(e instanceof Error ? e.message : 'Terjadi kesalahan');
      }
    });
  };

  const typeOptions = [
    { value: 'INCOME', label: 'Pemasukan', icon: ArrowUpRight, color: 'text-premium-income border-premium-income/30 bg-premium-income/10' },
    { value: 'EXPENSE', label: 'Pengeluaran', icon: ArrowDownRight, color: 'text-premium-expense border-premium-expense/30 bg-premium-expense/10' },
    { value: 'TRANSFER', label: 'Transfer', icon: ArrowRightLeft, color: 'text-violet-300 border-violet-500/30 bg-violet-500/10' },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Type Selector */}
      <div>
        <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-3">Tipe Transaksi</label>
        <div className="grid grid-cols-3 gap-2">
          {typeOptions.map(opt => {
            const Icon = opt.icon;
            const isActive = txType === opt.value;
            return (
              <label key={opt.value} className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-2xl border cursor-pointer transition-all duration-200',
                isActive ? opt.color : 'border-premium-border-soft bg-white/[.03] text-premium-text-muted hover:bg-white/[.05]'
              )}>
                <input type="radio" value={opt.value} {...register('type')} className="sr-only" />
                <Icon size={18} />
                <span className="text-xs font-black">{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Account */}
      <div>
        <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">
          {txType === 'TRANSFER' ? 'Dari Rekening' : 'Rekening'}
        </label>
        <select {...register('accountId')} className={cn('input w-full', errors.accountId && 'border-premium-expense/50')}>
          <option value="">Pilih rekening</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        {errors.accountId && <p className="text-xs text-premium-expense mt-1">{errors.accountId.message}</p>}
      </div>

      {/* Transfer To */}
      <AnimatePresence>
        {txType === 'TRANSFER' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Ke Rekening</label>
            <select {...register('transferToAccountId')} className="input w-full">
              <option value="">Pilih tujuan</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category */}
      <AnimatePresence>
        {txType !== 'TRANSFER' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Kategori</label>
            <select {...register('categoryId')} className="input w-full">
              <option value="">Pilih kategori</option>
              {filteredCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Amount */}
      <div>
        <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Nominal</label>
        <input
          type="number"
          placeholder="0"
          {...register('amount')}
          className={cn('input w-full', errors.amount && 'border-premium-expense/50')}
        />
        {errors.amount && <p className="text-xs text-premium-expense mt-1">{errors.amount.message}</p>}
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Tanggal</label>
        <input type="date" {...register('date')} className="input w-full" />
        {errors.date && <p className="text-xs text-premium-expense mt-1">{errors.date.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-black text-premium-text-muted uppercase tracking-wide mb-2">Catatan (opsional)</label>
        <input type="text" placeholder="Keterangan transaksi..." {...register('description')} className="input w-full" />
      </div>

      {serverError && (
        <p className="text-xs text-premium-expense bg-premium-expense/10 border border-premium-expense/20 rounded-xl p-3">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={cn('btn btn-primary w-full', isPending && 'opacity-60 cursor-not-allowed')}
      >
        {isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
      </button>
    </form>
  );
}
