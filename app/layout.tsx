import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'POS Finance - RNT',
  description: 'Catat, atur, pantau, dan kendalikan keuangan Anda',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RNT Finance',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0e0f0c',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="POS Finance" />
        <meta name="theme-color" content="#090C12" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="POS Finance" />
        <meta name="msapplication-TileColor" content="#090C12" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('submit', function(e) {
              const f = e.target;
              setTimeout(() => {
                const btns = f.querySelectorAll('button[type="submit"]');
                btns.forEach(b => { b.disabled = true; b.textContent = 'Memproses...'; b.style.opacity = '0.5'; });
              }, 10);
            });
            document.addEventListener('click', function(e) {
              const btn = e.target.closest('button[type="submit"]');
              if (btn && !btn.disabled && btn.closest('form')) {
                setTimeout(() => {
                  btn.disabled = true;
                  btn.textContent = 'Memproses...';
                  btn.style.opacity = '0.5';
                }, 10);
              }
            });
          `
        }} />
        {children}
      </body>
    </html>
  );
}
