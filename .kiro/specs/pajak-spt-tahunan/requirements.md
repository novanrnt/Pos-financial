# Requirements Document: Pajak / SPT Tahunan

## Introduction

Fitur "Pajak / SPT Tahunan" adalah halaman baru di aplikasi POS Finance yang memungkinkan pengguna untuk menghitung estimasi pajak SPT Tahunan Orang Pribadi secara otomatis berdasarkan data pemasukan dan pengeluaran yang telah dicatat sepanjang tahun. Fitur ini mendukung dua metode perhitungan: Mode Laba Bersih/Progresif dan Mode UMKM Final 0,5%, dengan kemampuan untuk mengekspor laporan dalam format PDF.

## Glossary

- **SPT Tahunan**: Surat Pemberitahuan Pajak Tahunan untuk Orang Pribadi
- **PTKP**: Penghasilan Tidak Kena Pajak (nilai pengurangan dari penghasilan bruto)
- **PKP**: Penghasilan Kena Pajak (penghasilan neto setelah dikurangi PTKP)
- **PPh Terutang**: Pajak Penghasilan yang harus dibayarkan berdasarkan perhitungan
- **Penghasilan Neto**: Total pemasukan kena pajak setelah dikurangi pengeluaran
- **Tarif Progresif**: Sistem pajak berjenjang dengan persentase yang meningkat sesuai lapisan PKP
- **Pajak Sudah Dibayar**: Pajak yang telah dipotong/dibayarkan selama tahun berjalan
- **Kurang Bayar**: Selisih positif antara PPh Terutang dan Pajak Sudah Dibayar
- **Lebih Bayar**: Selisih negatif antara PPh Terutang dan Pajak Sudah Dibayar
- **Profit Mobil**: Keuntungan bersih dari penjualan mobil atau komisi dari mobil titipan
- **Bruto Usaha**: Total penghasilan kotor sebelum pengurangan
- **Mode Laba Bersih/Progresif**: Metode perhitungan pajak dengan tarif progresif berjenjang
- **Mode UMKM Final 0,5%**: Metode perhitungan pajak final untuk UMKM dengan tarif 0,5%
- **Status PTKP**: Kategori status perkawinan dan tanggungan untuk menentukan nilai PTKP
- **Kategori Pemasukan**: Jenis-jenis sumber penghasilan (Gaji, Profit Mobil, Investasi, dll)
- **Kategori Pengeluaran**: Jenis-jenis biaya operasional (BBM, Servis, Makan, dll)
- **Aset**: Harta yang dimiliki pada akhir tahun
- **Hutang**: Kewajiban finansial pada akhir tahun
- **Piutang**: Hak untuk menerima pembayaran dari pihak lain

## Requirements

### Requirement 1: Pengaturan Pajak Dasar

**User Story:** Sebagai pengguna, saya ingin mengatur tahun pajak dan status PTKP, sehingga sistem dapat menghitung pajak dengan parameter yang sesuai dengan kondisi saya.

#### Acceptance Criteria

1. WHEN pengguna membuka halaman Pajak / SPT Tahunan, THE System SHALL menampilkan card "Pengaturan Pajak" dengan field untuk memilih tahun pajak
2. WHEN pengguna membuka halaman Pajak / SPT Tahunan, THE System SHALL menampilkan dropdown untuk memilih status PTKP dengan opsi: TK/0, TK/1, TK/2, TK/3, K/0, K/1, K/2, K/3
3. WHEN pengguna memilih status PTKP, THE System SHALL menampilkan nilai PTKP yang sesuai: TK/0=54M, TK/1=58.5M, TK/2=63M, TK/3=67.5M, K/0=58.5M, K/1=63M, K/2=67.5M, K/3=72M
4. WHEN pengguna mengubah tahun pajak atau status PTKP, THE System SHALL secara otomatis memperbarui semua perhitungan pajak
5. WHEN pengguna membuka halaman untuk pertama kali, THE System SHALL menggunakan tahun saat ini sebagai default tahun pajak

### Requirement 2: Pemilihan Metode Perhitungan Pajak

**User Story:** Sebagai pengguna, saya ingin memilih metode perhitungan pajak (Laba Bersih/Progresif atau UMKM Final 0,5%), sehingga saya dapat menghitung pajak sesuai dengan jenis usaha saya.

#### Acceptance Criteria

1. WHEN pengguna membuka card "Pengaturan Pajak", THE System SHALL menampilkan radio button atau toggle untuk memilih metode perhitungan: "Laba Bersih/Progresif" atau "UMKM Final 0,5%"
2. WHEN pengguna memilih metode perhitungan, THE System SHALL secara otomatis beralih tampilan dan rumus perhitungan sesuai metode yang dipilih
3. WHEN metode "Laba Bersih/Progresif" dipilih, THE System SHALL menampilkan breakdown PPh per lapisan tarif progresif
4. WHEN metode "UMKM Final 0,5%" dipilih, THE System SHALL menampilkan perhitungan berdasarkan Bruto Usaha dikurangi 500M dengan tarif 0,5%
5. THE System SHALL menyimpan pilihan metode perhitungan sehingga tetap terpilih saat pengguna kembali ke halaman

### Requirement 3: Agregasi Penghasilan dari Kategori Pemasukan

**User Story:** Sebagai pengguna, saya ingin sistem secara otomatis mengagregasi penghasilan dari semua kategori pemasukan yang telah saya catat, sehingga saya tidak perlu menghitung manual.

#### Acceptance Criteria

1. WHEN pengguna membuka halaman Pajak / SPT Tahunan, THE System SHALL mengambil semua transaksi income dari database untuk tahun pajak yang dipilih
2. WHEN sistem mengagregasi penghasilan, THE System SHALL mengelompokkan berdasarkan kategori pemasukan (Gaji, Profit Mobil, Investasi, dll)
3. WHEN sistem mengagregasi penghasilan, THE System SHALL menampilkan total per kategori dalam section "Detail Pemasukan per Kategori"
4. WHEN pengguna mengubah tahun pajak, THE System SHALL secara otomatis memperbarui agregasi penghasilan untuk tahun yang dipilih
5. WHEN tidak ada transaksi income untuk kategori tertentu, THE System SHALL menampilkan nilai 0 untuk kategori tersebut

### Requirement 4: Perlakuan Khusus Kategori Profit Mobil

**User Story:** Sebagai pengguna yang menjual mobil atau menerima komisi dari mobil titipan, saya ingin kategori "Profit Mobil" langsung dianggap sebagai penghasilan bersih tanpa perlu input harga jual mobil, sehingga proses input lebih sederhana.

#### Acceptance Criteria

1. WHEN pengguna membuka section "Detail Profit Mobil Khusus", THE System SHALL menampilkan daftar semua transaksi dengan kategori "Profit Mobil" untuk tahun pajak yang dipilih
2. WHEN sistem menampilkan Profit Mobil, THE System SHALL menampilkan informasi: tanggal, deskripsi, dan jumlah cuan yang diterima
3. WHEN sistem menghitung penghasilan neto, THE System SHALL langsung menggunakan jumlah Profit Mobil tanpa meminta input harga jual mobil
4. WHEN pengguna menambah transaksi Profit Mobil baru, THE System SHALL secara otomatis memperbarui total Profit Mobil dalam perhitungan
5. WHEN pengguna menghapus transaksi Profit Mobil, THE System SHALL secara otomatis memperbarui total Profit Mobil dalam perhitungan

### Requirement 5: Perhitungan Penghasilan Neto

**User Story:** Sebagai pengguna, saya ingin sistem menghitung penghasilan neto secara otomatis dari total pemasukan dikurangi pengeluaran, sehingga saya memiliki dasar yang akurat untuk perhitungan pajak.

#### Acceptance Criteria

1. WHEN sistem menghitung penghasilan neto, THE System SHALL menggunakan rumus: Penghasilan Neto = Total Pemasukan Kena Pajak - Total Pengeluaran
2. WHEN sistem menghitung penghasilan neto, THE System SHALL mengambil semua transaksi income untuk tahun pajak yang dipilih
3. WHEN sistem menghitung penghasilan neto, THE System SHALL mengambil semua transaksi expense untuk tahun pajak yang dipilih
4. WHEN penghasilan neto bernilai negatif, THE System SHALL menampilkan nilai 0 untuk penghasilan neto
5. WHEN pengguna mengubah tahun pajak, THE System SHALL secara otomatis memperbarui perhitungan penghasilan neto

### Requirement 6: Perhitungan PKP (Penghasilan Kena Pajak)

**User Story:** Sebagai pengguna, saya ingin sistem menghitung PKP secara otomatis dengan mengurangi penghasilan neto dengan PTKP, sehingga saya mengetahui dasar pengenaan pajak yang sebenarnya.

#### Acceptance Criteria

1. WHEN sistem menghitung PKP, THE System SHALL menggunakan rumus: PKP = max(0, Penghasilan Neto - PTKP)
2. WHEN penghasilan neto lebih kecil dari PTKP, THE System SHALL menampilkan PKP = 0
3. WHEN pengguna mengubah status PTKP, THE System SHALL secara otomatis memperbarui perhitungan PKP
4. WHEN pengguna mengubah penghasilan neto, THE System SHALL secara otomatis memperbarui perhitungan PKP
5. WHEN sistem menampilkan PKP, THE System SHALL menampilkan dalam format rupiah dengan pemisah ribuan

### Requirement 7: Perhitungan PPh Terutang dengan Tarif Progresif

**User Story:** Sebagai pengguna, saya ingin sistem menghitung PPh Terutang menggunakan tarif progresif berjenjang, sehingga perhitungan pajak saya sesuai dengan peraturan perpajakan Indonesia.

#### Acceptance Criteria

1. WHEN metode "Laba Bersih/Progresif" dipilih, THE System SHALL menghitung PPh Terutang menggunakan tarif progresif dengan lapisan: 0-60M (5%), 60M-250M (15%), 250M-500M (25%), 500M-5M (30%), >5M (35%)
2. WHEN sistem menghitung PPh Terutang, THE System SHALL menampilkan breakdown detail per lapisan tarif dengan kolom: Lapisan, Dasar Kena Pajak, Tarif, PPh per Lapisan
3. WHEN PKP berada dalam satu lapisan, THE System SHALL menghitung PPh hanya untuk lapisan tersebut
4. WHEN PKP melampaui beberapa lapisan, THE System SHALL menghitung PPh untuk setiap lapisan secara akumulatif
5. WHEN sistem menampilkan PPh Terutang, THE System SHALL menampilkan total PPh dalam format rupiah dengan pemisah ribuan

### Requirement 8: Perhitungan PPh Final UMKM 0,5%

**User Story:** Sebagai pengguna UMKM, saya ingin sistem dapat menghitung PPh Final dengan tarif 0,5% berdasarkan Bruto Usaha, sehingga saya memiliki opsi perhitungan pajak yang sesuai dengan status UMKM saya.

#### Acceptance Criteria

1. WHEN metode "UMKM Final 0,5%" dipilih, THE System SHALL menampilkan section khusus untuk perhitungan PPh Final
2. WHEN sistem menghitung PPh Final, THE System SHALL menggunakan rumus: Dasar Kena PPh Final = max(0, Bruto Usaha - 500M), PPh Final = Dasar Kena PPh Final × 0,5%
3. WHEN sistem menghitung Bruto Usaha, THE System SHALL menggunakan total pemasukan tanpa pengurangan pengeluaran
4. WHEN Bruto Usaha lebih kecil atau sama dengan 500M, THE System SHALL menampilkan PPh Final = 0
5. WHEN pengguna mengubah tahun pajak atau total pemasukan, THE System SHALL secara otomatis memperbarui perhitungan PPh Final

### Requirement 9: Input Pajak Sudah Dibayar/Dipotong

**User Story:** Sebagai pengguna, saya ingin dapat menginput jumlah pajak yang telah dibayarkan atau dipotong selama tahun berjalan, sehingga saya dapat menghitung kurang bayar atau lebih bayar dengan akurat.

#### Acceptance Criteria

1. WHEN pengguna membuka section "Pajak Sudah Dibayar/Dipotong", THE System SHALL menampilkan input field untuk memasukkan jumlah pajak yang telah dibayarkan
2. WHEN pengguna memasukkan nilai pajak sudah dibayar, THE System SHALL menyimpan nilai tersebut
3. WHEN pengguna mengubah nilai pajak sudah dibayar, THE System SHALL secara otomatis memperbarui perhitungan kurang/lebih bayar
4. WHEN pengguna membuka halaman untuk pertama kali, THE System SHALL menampilkan nilai default 0 untuk pajak sudah dibayar
5. WHEN pengguna memasukkan nilai negatif, THE System SHALL menampilkan pesan error dan tidak menerima input

### Requirement 10: Perhitungan Kurang Bayar / Lebih Bayar / Nihil

**User Story:** Sebagai pengguna, saya ingin sistem menghitung status pajak saya (kurang bayar, lebih bayar, atau nihil), sehingga saya mengetahui kewajiban pajak saya dengan jelas.

#### Acceptance Criteria

1. WHEN sistem menghitung status pajak, THE System SHALL menggunakan rumus: Kurang/Lebih Bayar = PPh Terutang - Pajak Sudah Dibayar
2. WHEN hasil perhitungan positif, THE System SHALL menampilkan status "Kurang Bayar" dengan jumlah yang harus dibayarkan
3. WHEN hasil perhitungan negatif, THE System SHALL menampilkan status "Lebih Bayar" dengan jumlah yang dapat diklaim kembali
4. WHEN hasil perhitungan sama dengan 0, THE System SHALL menampilkan status "Nihil"
5. WHEN pengguna mengubah PPh Terutang atau Pajak Sudah Dibayar, THE System SHALL secara otomatis memperbarui status pajak

### Requirement 11: Hero Summary Card

**User Story:** Sebagai pengguna, saya ingin melihat ringkasan estimasi pajak dalam satu kartu yang menonjol, sehingga saya dapat dengan cepat mengetahui status pajak saya.

#### Acceptance Criteria

1. WHEN pengguna membuka halaman Pajak / SPT Tahunan, THE System SHALL menampilkan Hero Summary Card di bagian atas halaman
2. WHEN Hero Summary Card ditampilkan, THE System SHALL menampilkan informasi: Estimasi PPh, Status Pajak (Kurang Bayar/Lebih Bayar/Nihil), Tahun Pajak, Status PTKP
3. WHEN status pajak adalah "Kurang Bayar", THE System SHALL menampilkan warna merah atau warning
4. WHEN status pajak adalah "Lebih Bayar", THE System SHALL menampilkan warna hijau atau success
5. WHEN status pajak adalah "Nihil", THE System SHALL menampilkan warna netral atau info

### Requirement 12: Ringkasan Perhitungan

**User Story:** Sebagai pengguna, saya ingin melihat ringkasan lengkap dari semua perhitungan pajak dalam satu tempat, sehingga saya dapat memverifikasi akurasi perhitungan.

#### Acceptance Criteria

1. WHEN pengguna membuka section "Ringkasan Perhitungan", THE System SHALL menampilkan tabel dengan baris-baris: Total Pemasukan, Total Pengeluaran, Penghasilan Neto, PTKP, PKP, PPh Terutang, Pajak Sudah Dibayar, Kurang/Lebih Bayar
2. WHEN sistem menampilkan ringkasan perhitungan, THE System SHALL menampilkan nilai dalam format rupiah dengan pemisah ribuan
3. WHEN pengguna mengubah data pemasukan atau pengeluaran, THE System SHALL secara otomatis memperbarui ringkasan perhitungan
4. WHEN pengguna mengubah status PTKP atau metode perhitungan, THE System SHALL secara otomatis memperbarui ringkasan perhitungan
5. WHEN pengguna membuka halaman, THE System SHALL menampilkan ringkasan perhitungan dalam keadaan terhitung

### Requirement 13: Detail Pemasukan per Kategori

**User Story:** Sebagai pengguna, saya ingin melihat detail pemasukan yang dikelompokkan per kategori, sehingga saya dapat memverifikasi sumber penghasilan saya.

#### Acceptance Criteria

1. WHEN pengguna membuka section "Detail Pemasukan per Kategori", THE System SHALL menampilkan tabel dengan kolom: Kategori, Jumlah Transaksi, Total Pemasukan
2. WHEN sistem menampilkan detail pemasukan, THE System SHALL mengelompokkan berdasarkan kategori pemasukan yang ada di database
3. WHEN pengguna mengubah tahun pajak, THE System SHALL secara otomatis memperbarui detail pemasukan untuk tahun yang dipilih
4. WHEN tidak ada transaksi untuk kategori tertentu, THE System SHALL tidak menampilkan kategori tersebut atau menampilkan dengan nilai 0
5. WHEN pengguna mengklik kategori, THE System SHALL menampilkan daftar transaksi detail untuk kategori tersebut (opsional)

### Requirement 14: Detail Pengeluaran per Kategori

**User Story:** Sebagai pengguna, saya ingin melihat detail pengeluaran yang dikelompokkan per kategori, sehingga saya dapat memverifikasi biaya operasional saya.

#### Acceptance Criteria

1. WHEN pengguna membuka section "Detail Pengeluaran per Kategori", THE System SHALL menampilkan tabel dengan kolom: Kategori, Jumlah Transaksi, Total Pengeluaran
2. WHEN sistem menampilkan detail pengeluaran, THE System SHALL mengelompokkan berdasarkan kategori pengeluaran yang ada di database
3. WHEN pengguna mengubah tahun pajak, THE System SHALL secara otomatis memperbarui detail pengeluaran untuk tahun yang dipilih
4. WHEN tidak ada transaksi untuk kategori tertentu, THE System SHALL tidak menampilkan kategori tersebut atau menampilkan dengan nilai 0
5. WHEN pengguna mengklik kategori, THE System SHALL menampilkan daftar transaksi detail untuk kategori tersebut (opsional)

### Requirement 15: Breakdown PPh Progresif per Lapisan

**User Story:** Sebagai pengguna, saya ingin melihat breakdown detail PPh progresif per lapisan tarif, sehingga saya memahami bagaimana pajak saya dihitung.

#### Acceptance Criteria

1. WHEN metode "Laba Bersih/Progresif" dipilih, THE System SHALL menampilkan section "Breakdown PPh Progresif per Lapisan"
2. WHEN sistem menampilkan breakdown, THE System SHALL menampilkan tabel dengan kolom: Lapisan PKP, Dasar Kena Pajak, Tarif, PPh per Lapisan
3. WHEN sistem menampilkan breakdown, THE System SHALL menampilkan semua lapisan tarif: 0-60M (5%), 60M-250M (15%), 250M-500M (25%), 500M-5M (30%), >5M (35%)
4. WHEN PKP tidak mencapai lapisan tertentu, THE System SHALL menampilkan nilai 0 untuk lapisan tersebut
5. WHEN pengguna mengubah PKP, THE System SHALL secara otomatis memperbarui breakdown PPh per lapisan

### Requirement 16: Aset & Kewajiban Akhir Tahun

**User Story:** Sebagai pengguna, saya ingin dapat menginput dan melihat detail aset, hutang, dan piutang pada akhir tahun, sehingga saya memiliki gambaran lengkap tentang posisi keuangan saya.

#### Acceptance Criteria

1. WHEN pengguna membuka section "Aset & Kewajiban Akhir Tahun", THE System SHALL menampilkan subsection untuk Aset, Hutang, dan Piutang
2. WHEN pengguna membuka subsection Aset, THE System SHALL menampilkan daftar aset dari database (mobil, investasi, dll) dengan nilai estimasi
3. WHEN pengguna membuka subsection Hutang, THE System SHALL menampilkan daftar hutang aktif dari database dengan sisa jumlah
4. WHEN pengguna membuka subsection Piutang, THE System SHALL menampilkan daftar piutang dari database dengan jumlah
5. WHEN pengguna mengubah tahun pajak, THE System SHALL menampilkan aset, hutang, dan piutang yang relevan untuk tahun tersebut

### Requirement 17: Export PDF

**User Story:** Sebagai pengguna, saya ingin dapat mengekspor laporan pajak dalam format PDF yang rapi dan profesional, sehingga saya dapat menyimpan atau membagikan laporan tersebut.

#### Acceptance Criteria

1. WHEN pengguna mengklik tombol "Export PDF", THE System SHALL menghasilkan file PDF dengan nama format: "SPT_Tahunan_[Tahun]_[Nama_Pengguna].pdf"
2. WHEN sistem menghasilkan PDF, THE System SHALL menyertakan semua informasi: Header, Pengaturan Pajak, Hero Summary, Ringkasan Perhitungan, Detail Pemasukan, Detail Pengeluaran, Breakdown PPh, Aset & Kewajiban
3. WHEN sistem menghasilkan PDF, THE System SHALL menggunakan tema dark premium (#090C12) dengan glassmorphism style
4. WHEN sistem menghasilkan PDF, THE System SHALL menampilkan disclaimer di bagian bawah
5. WHEN pengguna mengklik tombol "Export PDF", THE System SHALL secara otomatis mengunduh file PDF ke perangkat pengguna

### Requirement 18: Copy Summary

**User Story:** Sebagai pengguna, saya ingin dapat menyalin ringkasan perhitungan pajak ke clipboard, sehingga saya dapat dengan mudah membagikan informasi tersebut.

#### Acceptance Criteria

1. WHEN pengguna mengklik tombol "Copy Summary", THE System SHALL menyalin ringkasan perhitungan ke clipboard
2. WHEN sistem menyalin ringkasan, THE System SHALL menyertakan: Tahun Pajak, Status PTKP, Total Pemasukan, Total Pengeluaran, Penghasilan Neto, PKP, PPh Terutang, Pajak Sudah Dibayar, Status Pajak
3. WHEN pengguna mengklik tombol "Copy Summary", THE System SHALL menampilkan notifikasi "Ringkasan berhasil disalin"
4. WHEN pengguna mengklik tombol "Copy Summary", THE System SHALL menyimpan ringkasan dalam format teks yang mudah dibaca
5. WHEN pengguna mengklik tombol "Copy Summary", THE System SHALL menyalin ringkasan dalam bahasa Indonesia

### Requirement 19: Disclaimer

**User Story:** Sebagai pengguna, saya ingin melihat disclaimer yang jelas tentang keterbatasan fitur pajak, sehingga saya memahami bahwa fitur ini hanya untuk estimasi dan bukan pengganti konsultasi profesional.

#### Acceptance Criteria

1. WHEN pengguna membuka halaman Pajak / SPT Tahunan, THE System SHALL menampilkan disclaimer di bagian bawah halaman
2. WHEN sistem menampilkan disclaimer, THE System SHALL menyertakan pesan: "Fitur ini hanya untuk estimasi. Untuk perhitungan pajak yang akurat, konsultasikan dengan konsultan pajak profesional."
3. WHEN pengguna membuka halaman, THE System SHALL menampilkan disclaimer dalam bahasa Indonesia
4. WHEN pengguna membuka halaman, THE System SHALL menampilkan disclaimer dengan warna warning atau info
5. WHEN pengguna membuka halaman, THE System SHALL menampilkan disclaimer yang tidak dapat ditutup atau disembunyikan

### Requirement 20: UI Layout dan Responsivitas

**User Story:** Sebagai pengguna mobile, saya ingin halaman Pajak / SPT Tahunan dapat diakses dengan baik di perangkat mobile dengan desain yang responsif, sehingga saya dapat menggunakan fitur ini di mana saja.

#### Acceptance Criteria

1. WHEN pengguna membuka halaman di perangkat mobile, THE System SHALL menampilkan layout yang responsif dan mudah dibaca
2. WHEN pengguna membuka halaman di perangkat mobile, THE System SHALL menampilkan card dan section dalam urutan vertikal
3. WHEN pengguna membuka halaman di perangkat desktop, THE System SHALL menampilkan layout yang optimal dengan kolom multiple jika diperlukan
4. WHEN pengguna membuka halaman, THE System SHALL menggunakan tema dark premium (#090C12) dengan glassmorphism style
5. WHEN pengguna membuka halaman, THE System SHALL menampilkan semua elemen dengan ukuran font yang mudah dibaca

### Requirement 21: Integrasi dengan Database Existing

**User Story:** Sebagai developer, saya ingin fitur Pajak / SPT Tahunan terintegrasi dengan database existing tanpa mengubah struktur table lama, sehingga sistem tetap stabil dan tidak merusak data existing.

#### Acceptance Criteria

1. WHEN sistem mengambil data pemasukan dan pengeluaran, THE System SHALL menggunakan table Transaction yang sudah ada
2. WHEN sistem mengambil data aset, THE System SHALL menggunakan table Car dan InvestmentSnapshot yang sudah ada
3. WHEN sistem mengambil data hutang dan piutang, THE System SHALL menggunakan table Debt yang sudah ada
4. WHEN sistem menyimpan pengaturan pajak, THE System SHALL membuat table baru tax_settings jika diperlukan tanpa mengubah table existing
5. WHEN sistem menyimpan snapshot laporan pajak, THE System SHALL membuat table baru tax_report_snapshots jika diperlukan tanpa mengubah table existing

### Requirement 22: Tidak Mengubah Logic Transaksi Existing

**User Story:** Sebagai developer, saya ingin memastikan bahwa fitur Pajak / SPT Tahunan tidak mengubah logic transaksi yang sudah ada, sehingga fitur lama tetap berfungsi dengan baik.

#### Acceptance Criteria

1. WHEN fitur Pajak / SPT Tahunan diimplementasikan, THE System SHALL tidak mengubah logic pembuatan transaksi di halaman Transactions
2. WHEN fitur Pajak / SPT Tahunan diimplementasikan, THE System SHALL tidak mengubah logic kategori di halaman Categories
3. WHEN fitur Pajak / SPT Tahunan diimplementasikan, THE System SHALL tidak mengubah logic akun di halaman Accounts
4. WHEN fitur Pajak / SPT Tahunan diimplementasikan, THE System SHALL tidak mengubah logic mobil di halaman Cars
5. WHEN fitur Pajak / SPT Tahunan diimplementasikan, THE System SHALL tidak mengubah logic hutang/piutang di halaman Debts

### Requirement 23: Tidak Menghapus Fitur Lama

**User Story:** Sebagai pengguna, saya ingin semua fitur lama tetap tersedia dan berfungsi, sehingga saya dapat terus menggunakan aplikasi seperti biasa.

#### Acceptance Criteria

1. WHEN pengguna membuka halaman Dashboard, THE System SHALL menampilkan semua widget dan informasi seperti sebelumnya
2. WHEN pengguna membuka halaman Transactions, THE System SHALL menampilkan semua fitur transaksi seperti sebelumnya
3. WHEN pengguna membuka halaman Reports, THE System SHALL menampilkan semua laporan seperti sebelumnya
4. WHEN pengguna membuka halaman Settings, THE System SHALL menampilkan semua pengaturan seperti sebelumnya
5. WHEN fitur Pajak / SPT Tahunan ditambahkan, THE System SHALL menambahkan menu baru tanpa menghapus menu existing

### Requirement 24: Navigasi ke Halaman Pajak / SPT Tahunan

**User Story:** Sebagai pengguna, saya ingin dapat dengan mudah mengakses halaman Pajak / SPT Tahunan dari menu navigasi, sehingga saya dapat menemukan fitur ini dengan cepat.

#### Acceptance Criteria

1. WHEN pengguna membuka aplikasi, THE System SHALL menampilkan menu navigasi dengan opsi "Pajak / SPT Tahunan"
2. WHEN pengguna mengklik menu "Pajak / SPT Tahunan", THE System SHALL menavigasi ke halaman Pajak / SPT Tahunan
3. WHEN pengguna membuka halaman Pajak / SPT Tahunan, THE System SHALL menampilkan breadcrumb atau indikator halaman aktif
4. WHEN pengguna membuka halaman Pajak / SPT Tahunan, THE System SHALL menampilkan title "Pajak / SPT Tahunan" di header
5. WHEN pengguna membuka halaman Pajak / SPT Tahunan, THE System SHALL menampilkan subtitle atau deskripsi singkat tentang halaman

