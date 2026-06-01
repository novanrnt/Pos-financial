export default function AppLoading() {
  return (
    <div className="min-h-[100dvh] bg-[#090C12] text-[#F1F3F7] grid place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-emerald-400/30 border border-white/15 shadow-[0_0_30px_rgba(47,215,255,.2)]" />
        <p className="text-sm font-black tracking-wide">POS Finance</p>
        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-300/70" />
        </div>
      </div>
    </div>
  );
}
