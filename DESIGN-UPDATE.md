# POS Design Update

Versi ini memakai arah visual seperti referensi FinancialProject:

- Dark premium fintech dashboard
- Rounded glass cards
- Accent violet, emerald, rose, sky
- Hero dashboard + health score
- Horizontal month period selector
- Stat cards compact
- Financial trend chart besar
- Donut spending/income breakdown
- Quick monitor untuk hutang/tagihan/piutang
- Log transaksi compact
- Sidebar desktop
- Bottom navigation + floating action button mobile
- Mobile-first responsive layout

Catatan deploy:
- Pakai Neon PostgreSQL + Prisma
- ENV: DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_APP_NAME
- Tidak pakai Supabase/RLS


## Dashboard Analytics Update
- Added Pertumbuhan Net Worth line chart.
- Added Cashflow Mingguan bar chart income vs expense.
- Added Insight Otomatis cards: growth net worth, weekly cashflow, hari boros, kategori terbesar.
- Charts are wrapped with horizontal scroll on mobile so browser HP stays responsive.
