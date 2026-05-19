import { cn, rupiah } from '@/lib/utils';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('glass rounded-[1.6rem] p-4 md:p-6', className)}>{children}</div>;
}

export function PageTitle({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return <div className="mb-5 md:mb-7 flex items-start justify-between gap-4"><div><h1 className="text-2xl md:text-3xl font-black tracking-[-.04em]">{title}</h1>{desc && <p className="text-sm text-slate-400 mt-1">{desc}</p>}</div>{action}</div>;
}

export function SubmitButton({ children='Simpan' }: { children?: React.ReactNode }) { return <button className="btn btn-primary w-full md:w-auto" type="submit">{children}</button>; }
export function Empty({ text='Belum ada data' }: { text?: string }) { return <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-slate-400">{text}</div>; }

export function StatCard({ label, value, hint, tone='neutral' }: { label: string; value: number; hint?: string; tone?: 'green'|'red'|'blue'|'purple'|'neutral' }) {
  const tones = {green:'text-emerald-300 bg-emerald-400/10',red:'text-rose-300 bg-rose-400/10',blue:'text-sky-300 bg-sky-400/10',purple:'text-violet-300 bg-violet-400/10',neutral:'text-slate-100 bg-white/5'} as const;
  return <div className="soft-card rounded-[1.35rem] p-3 md:p-4 min-h-[100px] md:min-h-[110px] flex flex-col justify-between"><div><p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-wide">{label}</p><h3 className={cn('mt-2 md:mt-3 text-base md:text-xl font-black tracking-[-.04em] line-clamp-2', tones[tone].split(' ')[0])}>{rupiah(value)}</h3></div>{hint && <p className="mt-1 text-[10px] md:text-[11px] text-slate-500">{hint}</p>}</div>;
}

export function SectionHeader({ title, desc, right }: { title: string; desc?: string; right?: React.ReactNode }) {
  return <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-base md:text-lg font-black tracking-[-.03em]">{title}</h2>{desc && <p className="text-xs text-slate-500 mt-1">{desc}</p>}</div>{right}</div>;
}
