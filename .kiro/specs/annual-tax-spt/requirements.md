# Requirements Document: Annual Tax SPT Calculator

## Introduction

Fitur "Pajak / SPT Tahunan" adalah halaman dashboard yang memungkinkan pengguna untuk menghitung estimasi pajak SPT Tahunan Orang Pribadi secara otomatis berdasarkan data transaksi yang sudah tercatat di POS Finance. Fitur ini dirancang untuk membantu pengguna dalam merekap dan mempersiapkan dokumen SPT, bukan untuk submit langsung ke DJP/Coretax.

## Glossary

- **SPT**: Surat Pemberitahuan Tahunan (laporan pajak tahunan)
- **PPh**: Pajak Penghasilan
- **PTKP**: Penghasilan Tidak Kena Pajak
- **PKP**: Penghasilan Kena Pajak
- **Penghasilan Neto**: Total pemasukan kena pajak setelah dikurangi pengeluaran
- **Tarif Progresif**: Sistem pajak berjenjang berdasarkan besarnya PKP
- **Pajak Sudah Dibayar/Dipotong**: Pajak yang telah dibayarkan atau dipotong selama tahun pajak (PPh 21, PPh 23, dll)
- **Kurang Bayar**: Selisih positif antara PPh Terutang dan Pajak Sudah Dibayar
- **Lebih Bayar**: Selisih positif antara Pajak Sudah Dibayar dan PPh Terutang
- **Nihil**: Kondisi ketika PPh Terutang sama dengan Pajak Sudah Dibayar
- **Profit Mobil**: Keuntungan bersih dari penjualan mobil (dianggap sebagai penghasilan)
- **Fee Makelar**: Komisi dari aktivitas makelar
- **Ngopseh**: Penghasilan dari aktivitas ngopseh/rental
- **UMKM Final**: Metode perhitungan pajak final untuk UMKM dengan tarif 0,5%
- **Bruto Usaha**: Total penghasilan kotor dari usaha sebelum dikurangi biaya
- **Dasar Kena PPh Final**: Penghasilan yang menjadi dasar perhitungan PPh Final (setelah dikurangi Rp 500 juta)
- **Aset**: Semua harta yang dimiliki (kas, investasi, mobil, dll)
- **Kewajiban**: Semua hutang yang harus dibayar
- **Net Worth**: Total aset dikurangi total kewajiban

## Requirements

### Requirement 1: Akses Halaman Pajak SPT Tahunan

**User Story:** Sebagai pengguna POS Finance, saya ingin mengakses halaman pajak SPT tahunan, sehingga saya dapat menghitung estimasi pajak tahunan saya.

#### Acceptance Criteria

1. THE System SHALL menyediakan route `/dashboard/pajak` atau `/dashboard/tax` yang dapat diakses oleh pengguna yang sudah login
2. WHEN pengguna mengakses halaman pajak, THE System SHALL menampilkan halaman dengan struktur: header, pengaturan pajak, ringkasan hero, dan detail perhitungan
3. WHEN pengguna belum login, THE System SHALL redirect ke halaman login
4. THE System SHALL menampilkan menu "Pajak" atau "SPT Tahunan" di sidebar atau bottom navigation tanpa merusak menu yang sudah ada

### Requirement 2: Pengaturan Tahun Pajak dan Status PTKP

**User Story:** Sebagai pengguna, saya ingin memilih tahun pajak dan status PTKP, sehingga perhitungan pajak sesuai dengan kondisi saya.

#### Acceptance Criteria

1. WHEN pengguna membuka halaman pajak, THE System SHALL menampilkan card "Pengaturan Pajak" dengan field: tahun pajak (dropdown), status PTKP (dropdown), metode hitung (radio button), pajak sudah dibayar (input number), dan catatan (textarea)
2. THE System SHALL menyediakan pilihan tahun pajak dari tahun sebelumnya hingga tahun saat ini
3. THE System SHALL menyediakan pilihan status PTKP: TK/0, TK/1, TK/2, TK/3, K/0, K/1, K/2, K/3
4. THE System SHALL menyediakan pilihan metode hitung: "Laba Bersih / Progresif OP" (default) dan "UMKM Final 0,5%"
5. WHEN pengguna mengubah tahun pajak, THE System SHALL otomatis memperbarui semua perhitungan berdasarkan transaksi tahun tersebut
6. WHEN pengguna mengubah status PTKP, THE System SHALL otomatis memperbarui nilai PTKP dan perhitungan PKP serta PPh
7. WHEN pengguna mengubah metode hitung, THE System SHALL otomatis menampilkan perhitungan dengan metode yang dipilih
8. THE System SHALL menyimpan pengaturan pajak ke database table `tax_settings` dengan field: user_id, tax_year, ptkp_status, calculation_method, manual_pph21_withheld, manual_commission_tax_withheld, manual_tax_paid, notes, created_at, updated_at
9. WHEN pengguna membuka halaman pajak kembali, THE System SHALL menampilkan pengaturan yang terakhir disimpan

### Requirement 3: Perhitungan Total Pemasukan Otomatis

**User Story:** Sebagai pengguna, saya ingin total pemasukan dihitung otomatis dari kategori pemasukan, sehingga saya tidak perlu menghitung manual.

#### Acceptance Criteria

1. WHEN pengguna memilih tahun pajak, THE System SHALL mengambil semua transaksi dengan type INCOME dari database untuk tahun tersebut
2. THE System SHALL mengelompokkan transaksi pemasukan berdasarkan kategori: Profit Mobil, Fee Makelar, Ngopseh, Bonus, Freelance, Lainnya, dan kategori income lain yang ada di database
3. THE System SHALL menampilkan detail pemasukan per kategori dengan format: nama kategori, jumlah transaksi, total amount, persentase dari total pemasukan
4. THE System SHALL menampilkan total pemasukan keseluruhan di ringkasan perhitungan
5. IF tidak ada transaksi pemasukan pada tahun tersebut, THEN THE System SHALL menampilkan nilai Rp0 dan empty state untuk detail pemasukan

### Requirement 4: Perhitungan Total Pengeluaran Otomatis

**User Story:** Sebagai pengguna, saya ingin total pengeluaran dihitung otomatis dari kategori pengeluaran, sehingga saya dapat melihat breakdown pengeluaran.

#### Acceptance Criteria

1. WHEN pengguna memilih tahun pajak, THE System SHALL mengambil semua transaksi dengan type EXPENSE dari database untuk tahun tersebut
2. THE System SHALL mengelompokkan transaksi pengeluaran berdasarkan kategori: Makan, Belanja, Transfer Keluarga, Harian Roko, Bensin, Lainnya, dan kategori expense lain yang ada di database
3. THE System SHALL menampilkan detail pengeluaran per kategori dengan format: nama kategori, jumlah transaksi, total amount, persentase dari total pengeluaran
4. THE System SHALL menampilkan total pengeluaran keseluruhan di ringkasan perhitungan
5. IF tidak ada transaksi pengeluaran pada tahun tersebut, THEN THE System SHALL menampilkan nilai Rp0 dan empty state untuk detail pengeluaran

### Requirement 5: Perhitungan Penghasilan Neto Estimasi

**User Story:** Sebagai pengguna, saya ingin penghasilan neto dihitung otomatis, sehingga saya tahu berapa penghasilan bersih saya.

#### Acceptance Criteria

1. THE System SHALL menghitung Penghasilan Neto Estimasi = Total Pemasukan Kena Pajak
2. THE System SHALL menampilkan nilai Penghasilan Neto Estimasi di ringkasan perhitungan dengan format Rupiah
3. THE System SHALL menampilkan formula perhitungan di bawah nilai untuk transparansi

### Requirement 6: Perhitungan PTKP Berdasarkan Status

**User Story:** Sebagai pengguna, saya ingin nilai PTKP dihitung otomatis berdasarkan status saya, sehingga perhitungan PKP akurat.

#### Acceptance Criteria

1. WHEN pengguna memilih status PTKP, THE System SHALL menampilkan nilai PTKP sesuai dengan tabel: TK/0=54.000.000, TK/1=58.500.000, TK/2=63.000.000, TK/3=67.500.000, K/0=58.500.000, K/1=63.000.000, K/2=67.500.000, K/3=72.000.000
2. THE System SHALL menampilkan nilai PTKP di ringkasan perhitungan dengan format Rupiah
3. THE System SHALL menampilkan status PTKP yang dipilih di sebelah nilai PTKP

### Requirement 7: Perhitungan PKP (Penghasilan Kena Pajak)

**User Story:** Sebagai pengguna, saya ingin PKP dihitung otomatis, sehingga saya tahu berapa penghasilan yang kena pajak.

#### Acceptance Criteria

1. THE System SHALL menghitung PKP = max(0, Penghasilan Neto Estimasi - PTKP)
2. THE System SHALL menampilkan nilai PKP di ringkasan perhitungan dengan format Rupiah
3. IF PKP = 0, THEN THE System SHALL menampilkan status "Nihil" dan PPh Terutang = 0
4. THE System SHALL menampilkan formula perhitungan di bawah nilai untuk transparansi

### Requirement 8: Perhitungan PPh Progresif Otomatis dengan Detail Per Lapisan

**User Story:** Sebagai pengguna, saya ingin PPh dihitung otomatis dengan tarif progresif dan menampilkan detail per lapisan, sehingga saya memahami bagaimana pajak dihitung.

#### Acceptance Criteria

1. WHEN PKP > 0, THE System SHALL menghitung PPh Terutang menggunakan tarif progresif: 5% untuk PKP sampai 60 juta, 15% untuk PKP 60-250 juta, 25% untuk PKP 250-500 juta, 30% untuk PKP 500 juta-5 miliar, 35% untuk PKP di atas 5 miliar
2. THE System SHALL menampilkan breakdown PPh per lapisan dengan format: lapisan (range PKP), tarif, dasar kena pajak, PPh per lapisan, total PPh
3. THE System SHALL menampilkan contoh perhitungan untuk setiap lapisan (misal: "Lapisan 1: PKP Rp60.000.000 x 5% = Rp3.000.000")
4. THE System SHALL menampilkan total PPh Terutang di ringkasan perhitungan dengan format Rupiah
5. IF PKP = 0, THEN THE System SHALL menampilkan PPh Terutang = 0 dan status "Nihil"

### Requirement 9: Input Manual Pajak Sudah Dibayar/Dipotong

**User Story:** Sebagai pengguna, saya ingin menginput pajak yang sudah dibayar atau dipotong, sehingga saya dapat menghitung kurang/lebih bayar.

#### Acceptance Criteria

1. WHEN pengguna membuka halaman pajak, THE System SHALL menampilkan section "Pajak Sudah Dibayar/Dipotong" dengan field input untuk: PPh 21 (dipotong), PPh 23 (dipotong), Pajak Lainnya (input manual)
2. THE System SHALL menyimpan nilai pajak yang sudah dibayar/dipotong ke database table `tax_settings` dengan field: manual_pph21_withheld, manual_commission_tax_withheld, manual_tax_paid
3. WHEN pengguna mengubah nilai pajak yang sudah dibayar, THE System SHALL otomatis memperbarui perhitungan kurang/lebih bayar
4. THE System SHALL menampilkan total pajak sudah dibayar/dipotong di ringkasan perhitungan
5. IF pengguna tidak menginput nilai pajak, THEN THE System SHALL menganggap nilai = 0

### Requirement 10: Perhitungan Kurang/Lebih Bayar dan Status Nihil

**User Story:** Sebagai pengguna, saya ingin mengetahui apakah saya kurang bayar, lebih bayar, atau nihil, sehingga saya tahu berapa yang harus dibayar atau diklaim kembali.

#### Acceptance Criteria

1. THE System SHALL menghitung: Kurang Bayar = max(0, PPh Terutang - Pajak Sudah Dibayar/Dipotong)
2. THE System SHALL menghitung: Lebih Bayar = max(0, Pajak Sudah Dibayar/Dipotong - PPh Terutang)
3. THE System SHALL menghitung: Status = "Kurang Bayar" jika Kurang Bayar > 0, "Lebih Bayar" jika Lebih Bayar > 0, "Nihil" jika keduanya = 0
4. THE System SHALL menampilkan hasil perhitungan di ringkasan dengan warna: merah untuk Kurang Bayar, hijau untuk Lebih Bayar, abu-abu untuk Nihil
5. THE System SHALL menampilkan nilai Kurang/Lebih Bayar dengan format Rupiah dan status dengan jelas

### Requirement 11: Perhitungan Mode UMKM Final 0,5%

**User Story:** Sebagai pengguna UMKM, saya ingin menghitung pajak dengan metode UMKM Final 0,5%, sehingga saya dapat membandingkan dengan metode progresif.

#### Acceptance Criteria

1. WHEN pengguna memilih metode "UMKM Final 0,5%", THE System SHALL menampilkan perhitungan dengan metode ini
2. THE System SHALL menghitung Bruto Usaha = Profit Mobil + Fee Makelar + Ngopseh + Freelance + kategori usaha lain (kategori yang dianggap usaha)
3. THE System SHALL menghitung Dasar Kena PPh Final = max(0, Bruto Usaha - 500.000.000)
4. THE System SHALL menghitung PPh Final = Dasar Kena PPh Final x 0,5%
5. THE System SHALL menampilkan breakdown perhitungan UMKM Final dengan format: Bruto Usaha, Pengurangan (500 juta), Dasar Kena PPh Final, Tarif (0,5%), PPh Final
6. THE System SHALL menampilkan perbandingan antara PPh Progresif dan PPh Final untuk membantu pengguna memilih metode yang lebih menguntungkan

### Requirement 12: Detail Profit Mobil Khusus

**User Story:** Sebagai pengguna yang menjual mobil, saya ingin melihat detail profit mobil secara terpisah, sehingga saya dapat memverifikasi perhitungan.

#### Acceptance Criteria

1. WHEN ada transaksi kategori "Profit Mobil" pada tahun pajak, THE System SHALL menampilkan section "Detail Profit Mobil" dengan tabel: nama mobil, tanggal penjualan, harga beli, harga jual, profit, kategori
2. THE System SHALL mengambil data dari table `Car` dan `Transaction` untuk menampilkan detail profit mobil
3. THE System SHALL menampilkan total profit mobil di section ini
4. IF tidak ada transaksi profit mobil, THEN THE System SHALL menampilkan empty state "Tidak ada penjualan mobil pada tahun ini"

### Requirement 13: Tampilkan Aset, Hutang, Piutang, dan Net Worth Akhir Tahun

**User Story:** Sebagai pengguna, saya ingin melihat aset, hutang, piutang, dan net worth akhir tahun, sehingga saya dapat melaporkan ke SPT dengan akurat.

#### Acceptance Criteria

1. WHEN pengguna membuka halaman pajak, THE System SHALL menampilkan section "Aset & Kewajiban Akhir Tahun" dengan breakdown: saldo rekening, aset mobil, investasi, tabungan, total aset, total hutang, total piutang, net worth
2. THE System SHALL mengambil data dari table `Account`, `Car`, `InvestmentSnapshot`, `SavingsGoal`, `Debt` untuk tanggal akhir tahun (31 Desember)
3. THE System SHALL menampilkan nilai dengan format Rupiah dan persentase dari total aset
4. THE System SHALL menampilkan formula: Net Worth = Total Aset - Total Hutang + Total Piutang

### Requirement 14: Export PDF Laporan Pajak

**User Story:** Sebagai pengguna, saya ingin export laporan pajak ke PDF, sehingga saya dapat menyimpan dan membawa ke konsultan pajak.

#### Acceptance Criteria

1. WHEN pengguna mengklik tombol "Export PDF", THE System SHALL generate file PDF dengan format A4 portrait, background putih, text hitam
2. THE System SHALL menampilkan struktur PDF: header (judul, tahun, PTKP), ringkasan (PPh, status, metode), cashflow, pemasukan per kategori, profit mobil, pengeluaran per kategori, PTKP & PKP, breakdown PPh, pajak dibayar, aset, hutang, net worth, catatan, footer (generated by POS Finance, tanggal, nomor halaman)
3. THE System SHALL menggunakan library yang sesuai (misal: jsPDF, html2pdf, atau react-pdf) untuk generate PDF
4. THE System SHALL menampilkan nama file PDF: "SPT_Tahunan_{tahun}_{nama_user}.pdf"
5. THE System SHALL menampilkan tombol "Export PDF" di halaman pajak dengan icon download

### Requirement 15: Copy Summary ke Clipboard

**User Story:** Sebagai pengguna, saya ingin copy ringkasan pajak ke clipboard, sehingga saya dapat paste ke aplikasi lain.

#### Acceptance Criteria

1. WHEN pengguna mengklik tombol "Copy Summary", THE System SHALL copy ringkasan perhitungan ke clipboard dalam format text yang rapi
2. THE System SHALL menampilkan notifikasi "Ringkasan berhasil dicopy" setelah copy berhasil
3. THE System SHALL menampilkan tombol "Copy Summary" di halaman pajak dengan icon copy

### Requirement 16: Validasi Input dan Error Handling

**User Story:** Sebagai pengguna, saya ingin sistem memvalidasi input saya, sehingga saya tidak membuat kesalahan dalam perhitungan.

#### Acceptance Criteria

1. WHEN pengguna tidak memilih tahun pajak, THE System SHALL menampilkan error message "Tahun pajak wajib dipilih"
2. WHEN pengguna tidak memilih status PTKP, THE System SHALL menampilkan error message "Status PTKP wajib dipilih"
3. WHEN pengguna tidak memilih metode hitung, THE System SHALL menampilkan error message "Metode hitung wajib dipilih"
4. WHEN pengguna menginput nilai pajak dibayar dengan nilai negatif, THE System SHALL menampilkan error message "Pajak dibayar tidak boleh minus"
5. WHEN pengguna menginput nilai pajak dibayar dengan nilai lebih besar dari PPh Terutang, THE System SHALL menampilkan warning "Pajak dibayar lebih besar dari PPh Terutang (Lebih Bayar)"
6. IF tidak ada transaksi pada tahun tersebut, THEN THE System SHALL menampilkan empty state "Belum ada data pajak untuk tahun ini. Tambahkan transaksi pemasukan dan pengeluaran terlebih dahulu agar estimasi SPT bisa dihitung."

### Requirement 17: Disclaimer dan Informasi Penting

**User Story:** Sebagai pengguna, saya ingin melihat disclaimer yang jelas, sehingga saya tahu bahwa ini hanya estimasi dan bukan laporan resmi.

#### Acceptance Criteria

1. WHEN pengguna membuka halaman pajak, THE System SHALL menampilkan disclaimer di bagian bawah halaman: "Perhitungan ini adalah estimasi berdasarkan data POS Finance dan bukan bukti pelaporan pajak resmi. Verifikasi kembali sebelum mengisi SPT Tahunan di DJP/Coretax."
2. THE System SHALL menampilkan disclaimer dengan background warna kuning/orange dan text hitam untuk menarik perhatian
3. THE System SHALL menampilkan disclaimer di setiap halaman yang menampilkan perhitungan pajak

### Requirement 18: Penyimpanan Data Pajak ke Database

**User Story:** Sebagai pengguna, saya ingin pengaturan pajak saya disimpan, sehingga saya tidak perlu mengatur ulang setiap kali membuka halaman.

#### Acceptance Criteria

1. THE System SHALL membuat table `tax_settings` dengan field: id (primary key), user_id (foreign key), tax_year (integer), ptkp_status (string), calculation_method (string), manual_pph21_withheld (decimal), manual_commission_tax_withheld (decimal), manual_tax_paid (decimal), notes (text), created_at (timestamp), updated_at (timestamp)
2. THE System SHALL membuat table `tax_report_snapshots` dengan field: id (primary key), user_id (foreign key), tax_year (integer), report_json (json), created_at (timestamp), updated_at (timestamp)
3. WHEN pengguna mengubah pengaturan pajak, THE System SHALL menyimpan ke table `tax_settings` dengan operasi upsert (update jika sudah ada, insert jika belum)
4. WHEN pengguna mengklik tombol "Simpan Snapshot", THE System SHALL menyimpan snapshot laporan ke table `tax_report_snapshots` dalam format JSON

### Requirement 19: Responsif dan Mobile-Friendly

**User Story:** Sebagai pengguna mobile, saya ingin halaman pajak responsif dan mudah digunakan di smartphone, sehingga saya dapat mengakses dari mana saja.

#### Acceptance Criteria

1. THE System SHALL menampilkan halaman pajak dengan layout responsif untuk desktop, tablet, dan mobile
2. THE System SHALL menggunakan Tailwind CSS dengan breakpoint: sm (640px), md (768px), lg (1024px), xl (1280px)
3. THE System SHALL menampilkan card dan section dengan ukuran yang sesuai untuk setiap ukuran layar
4. THE System SHALL menampilkan tombol dan input dengan ukuran yang mudah diklik di mobile (minimal 44x44px)
5. THE System SHALL menampilkan tabel dengan scroll horizontal di mobile jika diperlukan

### Requirement 20: Integrasi dengan Menu Navigasi Existing

**User Story:** Sebagai pengguna, saya ingin menu pajak terintegrasi dengan menu navigasi yang sudah ada, sehingga saya dapat mengakses dengan mudah.

#### Acceptance Criteria

1. THE System SHALL menambahkan menu "Pajak" atau "SPT Tahunan" di sidebar atau bottom navigation
2. THE System SHALL menggunakan icon yang sesuai (misal: FileText, Calculator, atau Receipt)
3. THE System SHALL tidak merusak menu yang sudah ada (Transaksi, Tabungan, Tagihan, Hutang, Mobil, Investasi, Laporan)
4. THE System SHALL menampilkan menu dengan warna dan styling yang konsisten dengan menu lain
5. WHEN pengguna mengklik menu "Pajak", THE System SHALL navigate ke halaman `/dashboard/pajak` atau `/dashboard/tax`

