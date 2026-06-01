import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'POS Finance',
  description: 'Dashboard keuangan pribadi dan tracking bisnis mobil dengan fitur lengkap',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'POS Finance',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  themeColor: '#090C12',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
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
      <body>{children}</body>
    </html>
  );
}
