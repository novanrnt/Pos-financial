# POS Finance - Next.js 14 + Prisma + Neon PostgreSQL

Aplikasi POS pribadi untuk dashboard keuangan, rekening/saldo, transaksi, stok mobil showroom, hutang piutang, investasi, tagihan rutin, laporan bulanan, dan monthly closing lock.

## 🎨 UI/UX Redesign v2.0 ✨

Aplikasi ini telah di-redesign dengan **premium dark mode** dan **mobile-first responsive design**. Semua fitur tetap sama, hanya tampilan yang lebih modern dan profesional.

### Apa yang Baru?
- ✨ Premium dark mode dengan glass morphism
- 📱 Mobile-first responsive design
- 🎨 Consistent design system (24 color tokens)
- 💎 Professional appearance
- 🚀 Better user experience
- ♿ WCAG AA accessibility compliant

### Dokumentasi Redesign
- 📖 [REDESIGN_SUMMARY.md](./REDESIGN_SUMMARY.md) - Detail lengkap redesign
- 🎨 [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) - Color & styling reference
- 🚀 [REDESIGN_QUICK_START.md](./REDESIGN_QUICK_START.md) - Quick start guide
- 📝 [CHANGELOG_REDESIGN.md](./CHANGELOG_REDESIGN.md) - Changelog lengkap
- ✅ [REDESIGN_CHECKLIST.md](./REDESIGN_CHECKLIST.md) - Completion checklist

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- Neon PostgreSQL
- Custom Credentials Auth memakai bcrypt + JWT cookie
- Recharts
- jsPDF
- Lucide React
- Framer Motion ready
- React Hook Form + Zod dependency ready

## ENV

Buat file ENV di Vercel:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require"
AUTH_SECRET="isi-random-secret-minimal-32-karakter"
NEXT_PUBLIC_APP_NAME="POS"
```

## Cara Deploy Paling Simple ke Vercel via GitHub

1. Extract ZIP project.
2. Pastikan root langsung berisi `package.json`.
3. Upload semua isi folder ke GitHub repository baru.
4. Buat database gratis di Neon.
5. Copy connection string Neon ke `DATABASE_URL`.
6. Import repo ke Vercel.
7. Isi Environment Variables:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_APP_NAME`
8. Deploy.

## Membuat Table Database

Setelah deploy pertama, jalankan Prisma db push. Cara paling mudah:

### Opsi A - Local sebentar

```bash
npm install
npx prisma db push
npm run dev
```

Lalu buka `/setup-admin` untuk buat admin pertama.

### Opsi B - Vercel Build Command otomatis push

Kalau ingin otomatis saat deploy awal, ubah Build Command di Vercel menjadi:

```bash
npx prisma db push && npm run build
```

Setelah berhasil deploy pertama, kembalikan ke default:

```bash
npm run build
```

Catatan: untuk production jangka panjang lebih aman pakai migrasi Prisma, tapi untuk deploy simple pribadi `db push` paling mudah.

## Login

Versi ini tidak memakai Supabase Auth. Login dibuat custom:

- Email/password
- Password di-hash bcrypt
- Session JWT httpOnly cookie
- Middleware route protection

Saat database kosong, halaman `/login` akan menampilkan link **Buat admin pertama** menuju `/setup-admin`.

## Fitur Sudah Ada

### Auth

- Login email/password
- Logout
- Middleware proteksi route
- Session panjang 60 hari
- Auto redirect login/dashboard

### Onboarding

- Setup wizard awal setelah login pertama
- Rekening dan saldo awal
- Hutang awal optional
- Piutang awal optional
- Mobil awal optional tanpa memotong saldo
- Investasi awal optional
- Flag `setupCompleted`

### Rekening

- Multi rekening
- Tipe cash, bank, e-wallet, lainnya
- Saldo realtime dari aksi transaksi
- Rekening utama
- Warna/icon field

### Kategori

Default income:
- Jual Mobil
- Profit Mobil
- Ngopseh
- Fee Makelar
- Komisi
- Titip Jual
- Gaji
- Bonus
- Investasi
- Freelance
- Lainnya

Default expense:
- Operasional
- Makan
- BBM
- Servis Mobil
- Pajak
- Cicilan
- Tagihan
- Belanja
- Marketing
- Transfer Keluarga
- Investasi
- Lainnya

### Transaksi

- Pemasukan
- Pengeluaran
- Transfer antar rekening
- Pilih rekening
- Pilih kategori
- Catatan transaksi
- Tanggal transaksi
- Delete transaksi dengan reverse saldo
- Audit log create/delete
- Monthly closing protection

### Mobil Showroom

- Tambah mobil lengkap
- Harga beli/modal
- Estimasi harga jual
- URL foto banyak via textarea
- Biaya mobil
- Saat tambah mobil baru bisa pilih rekening untuk potong saldo
- Tambah biaya mobil otomatis mengurangi rekening
- Jual mobil otomatis menambah rekening
- Profit/rugi dihitung dari harga jual - modal - biaya
- Status available/sold

### Hutang Piutang

- Tambah hutang
- Tambah piutang
- Pembayaran cicilan/pelunasan
- Bayar hutang mengurangi saldo
- Terima piutang menambah saldo
- Status active/paid

### Investasi

- Snapshot saldo bulanan
- Kategori Saham, Crypto, Reksa Dana, R&D / Eksperimen, Lainnya
- Update saldo bulan berjalan
- Masuk dashboard/net worth

### Tagihan Rutin

- Nama tagihan
- Nominal
- Due day bulanan
- Rekening pembayaran
- Bayar tagihan mengurangi saldo

### Monthly Closing

- Closing bulan
- Setelah closing, server action menolak transaksi baru/edit/hapus di bulan itu
- Daftar closing
- Export PDF laporan bulanan

## Catatan Penting

- Project ini tidak butuh Supabase.
- Tidak butuh Docker.
- Tidak butuh custom server.
- Cocok deploy di Vercel free plan.
- Database memakai Neon PostgreSQL gratis.
- Jangan commit `.env` asli ke GitHub.
