'use client';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        {/* Logo SVG - PF with gold accent */}
        <svg
          viewBox="0 0 100 100"
          className="w-8 h-8 md:w-10 md:h-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background circle */}
          <circle cx="50" cy="50" r="48" fill="#13171f" stroke="#ffffff" strokeWidth="1" opacity="0.2" />
          
          {/* Gold accent arc */}
          <path
            d="M 50 8 A 42 42 0 0 1 85 50"
            stroke="#d4af37"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* P letter */}
          <text
            x="35"
            y="62"
            fontSize="48"
            fontWeight="900"
            fill="#f1f3f7"
            fontFamily="Arial, sans-serif"
            letterSpacing="-2"
          >
            P
          </text>
          
          {/* 1 in gold */}
          <text
            x="50"
            y="62"
            fontSize="40"
            fontWeight="900"
            fill="#d4af37"
            fontFamily="Arial, sans-serif"
          >
            1
          </text>
          
          {/* S letter */}
          <text
            x="65"
            y="62"
            fontSize="48"
            fontWeight="900"
            fill="#f1f3f7"
            fontFamily="Arial, sans-serif"
            letterSpacing="-2"
          >
            S
          </text>
        </svg>
      </div>
      
      {/* Text */}
      <div className="hidden sm:flex flex-col">
        <span className="text-sm md:text-base font-black text-premium-text leading-tight">POS Finance</span>
        <span className="text-xs text-premium-text-muted font-semibold">Personal • Business</span>
      </div>
    </div>
  );
}
