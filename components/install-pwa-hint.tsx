'use client';

import { useEffect, useState } from 'react';

function isIPhoneSafari() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
  return isIOS && isSafari;
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
}

export function InstallPWAHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa_hint_dismissed') === '1';
    if (!dismissed && isIPhoneSafari() && !isStandalone()) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="md:hidden mb-3 rounded-2xl border border-white/12 bg-[#111a2a]/90 p-3 text-xs text-[#c7d4ed]">
      <p className="font-black text-[#eaf2ff] mb-1">Install iPhone App</p>
      <p>Buka seperti aplikasi iPhone: tap Share lalu Add to Home Screen.</p>
      <button
        className="mt-2 text-[11px] font-black text-cyan-300 active:scale-95 transition"
        onClick={() => {
          localStorage.setItem('pwa_hint_dismissed', '1');
          setShow(false);
        }}
      >
        Tutup
      </button>
    </div>
  );
}
