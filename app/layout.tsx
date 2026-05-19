import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'POS', description: 'POS pribadi keuangan dan showroom mobil' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="id"><body>{children}</body></html>; }
