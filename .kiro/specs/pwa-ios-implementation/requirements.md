# PWA iOS Implementation Requirements

## Introduction

POS Finance Dashboard memerlukan implementasi Progressive Web App (PWA) yang lengkap untuk memberikan pengalaman seperti aplikasi native iOS ketika diakses melalui "Add to Home Screen" di Safari iPhone. Sistem harus mendukung notch/Dynamic Island, home indicator, keyboard handling, dan responsive design mobile-first dengan tema dark premium (#090C12).

## Glossary

- **PWA**: Progressive Web App - aplikasi web yang dapat diinstal dan dijalankan seperti aplikasi native
- **Safe-Area**: Area aman di layar yang tidak tertutup oleh notch, Dynamic Island, atau home indicator
- **Notch**: Potongan layar di bagian atas iPhone untuk kamera dan sensor
- **Dynamic Island**: Fitur pada iPhone 14+ yang menampilkan notifikasi interaktif
- **Home Indicator**: Area di bagian bawah layar iPhone untuk gesture navigasi
- **Maskable Icon**: Icon yang dapat disesuaikan bentuknya oleh sistem operasi
- **Manifest**: File JSON yang mendefinisikan metadata PWA
- **Viewport Fit**: Properti CSS yang mengontrol bagaimana konten ditampilkan di area safe-area
- **Status Bar**: Bar di bagian atas layar yang menampilkan waktu, sinyal, baterai
- **FAB**: Floating Action Button - tombol aksi utama yang mengambang
- **Bottom Navigation**: Navigasi di bagian bawah layar untuk perpindahan halaman
- **Responsive**: Desain yang menyesuaikan dengan berbagai ukuran layar
- **Dark Theme**: Tema dengan warna gelap untuk mengurangi kelelahan mata
- **Premium Color**: Warna brand utama (#090C12) untuk konsistensi visual

## Requirements

### Requirement 1: Icon Generation dan Asset Management

**User Story:** Sebagai pengguna iOS, saya ingin aplikasi memiliki icon yang jelas dan konsisten di Home Screen, sehingga aplikasi mudah dikenali dan terlihat profesional.

#### Acceptance Criteria

1. WHEN aplikasi diakses di iPhone, THE System SHALL menyediakan icon 192x192px untuk Android dan web
2. WHEN aplikasi diakses di iPhone, THE System SHALL menyediakan icon 512x512px untuk splash screen dan app store
3. WHEN aplikasi diakses di Android, THE System SHALL menyediakan maskable icon 192x192px dan 512x512px untuk adaptive icon
4. WHEN aplikasi diakses di iPhone, THE System SHALL menyediakan apple-touch-icon 180x180px untuk Home Screen
5. WHEN aplikasi diakses di iPhone, THE System SHALL menyediakan shortcut icon 192x192px untuk "Tambah Transaksi"
6. WHEN aplikasi diakses di iPhone, THE System SHALL menyediakan shortcut icon 192x192px untuk "Lihat Tabungan"
7. WHEN aplikasi diakses di web, THE System SHALL menyediakan screenshot 540x720px untuk narrow form factor
8. WHEN aplikasi diakses di web, THE System SHALL menyediakan screenshot 1280x720px untuk wide form factor
9. WHERE icon generation, THE System SHALL menggunakan warna brand (#090C12) sebagai background
10. WHERE icon generation, THE System SHALL memastikan semua icon tersimpan di public/icons/ directory

### Requirement 2: PWA Metadata dan Manifest Configuration

**User Story:** Sebagai pengguna, saya ingin aplikasi dapat diinstal dari browser dan menampilkan informasi yang benar saat diakses, sehingga pengalaman instalasi mulus dan profesional.

#### Acceptance Criteria

1. WHEN aplikasi dimuat, THE System SHALL menyediakan manifest.json dengan nama lengkap "POS Finance - Personal Finance & Bisnis Mobil"
2. WHEN aplikasi dimuat, THE System SHALL menyediakan manifest.json dengan short_name "POS Finance"
3. WHEN aplikasi dimuat, THE System SHALL menyediakan manifest.json dengan display mode "fullscreen"
4. WHEN aplikasi dimuat, THE System SHALL menyediakan manifest.json dengan orientation "portrait-primary"
5. WHEN aplikasi dimuat, THE System SHALL menyediakan manifest.json dengan theme_color "#090C12"
6. WHEN aplikasi dimuat, THE System SHALL menyediakan manifest.json dengan background_color "#090C12"
7. WHEN aplikasi dimuat, THE System SHALL menyediakan manifest.json dengan start_url "/dashboard"
8. WHEN aplikasi dimuat, THE System SHALL menyediakan manifest.json dengan scope "/"
9. WHEN aplikasi dimuat, THE System SHALL menyediakan manifest.json dengan categories ["finance", "productivity"]
10. WHEN aplikasi dimuat, THE System SHALL menyediakan manifest.json dengan app shortcuts untuk "Tambah Transaksi" dan "Lihat Tabungan"
11. WHEN aplikasi dimuat, THE System SHALL menyediakan manifest.json dengan screenshot definitions untuk narrow dan wide form factor

### Requirement 3: iOS Web App Configuration

**User Story:** Sebagai pengguna iPhone, saya ingin aplikasi terlihat dan berperilaku seperti aplikasi native iOS, sehingga pengalaman seamless dan familiar.

#### Acceptance Criteria

1. WHEN aplikasi diakses di iPhone, THE System SHALL mengatur apple-mobile-web-app-capable ke "yes"
2. WHEN aplikasi diakses di iPhone, THE System SHALL mengatur apple-mobile-web-app-status-bar-style ke "black-translucent"
3. WHEN aplikasi diakses di iPhone, THE System SHALL mengatur apple-mobile-web-app-title ke "POS Finance"
4. WHEN aplikasi diakses di iPhone, THE System SHALL mengatur theme-color ke "#090C12"
5. WHEN aplikasi diakses di iPhone, THE System SHALL mengatur viewport fit cover untuk mendukung notch dan Dynamic Island
6. WHEN aplikasi diakses di iPhone, THE System SHALL mengatur viewport width ke "device-width"
7. WHEN aplikasi diakses di iPhone, THE System SHALL mengatur viewport initial-scale ke 1
8. WHEN aplikasi diakses di iPhone, THE System SHALL mengatur viewport maximum-scale ke 1
9. WHEN aplikasi diakses di iPhone, THE System SHALL mengatur viewport user-scalable ke false
10. WHEN aplikasi diakses di iPhone, THE System SHALL mengatur format-detection telephone ke false

### Requirement 4: Safe-Area CSS Implementation

**User Story:** Sebagai pengguna iPhone dengan notch atau Dynamic Island, saya ingin konten aplikasi tidak tertutup oleh notch atau home indicator, sehingga semua informasi dapat dibaca dengan jelas.

#### Acceptance Criteria

1. WHEN aplikasi dimuat, THE System SHALL mendefinisikan CSS variable --safe-area-inset-top dari env(safe-area-inset-top)
2. WHEN aplikasi dimuat, THE System SHALL mendefinisikan CSS variable --safe-area-inset-right dari env(safe-area-inset-right)
3. WHEN aplikasi dimuat, THE System SHALL mendefinisikan CSS variable --safe-area-inset-bottom dari env(safe-area-inset-bottom)
4. WHEN aplikasi dimuat, THE System SHALL mendefinisikan CSS variable --safe-area-inset-left dari env(safe-area-inset-left)
5. WHEN aplikasi dimuat, THE System SHALL mengatur body padding-bottom ke var(--safe-area-inset-bottom)
6. WHEN aplikasi dimuat, THE System SHALL mengatur color-scheme ke "dark"
7. WHEN aplikasi dimuat, THE System SHALL mengatur background body ke "#090C12"
8. WHEN aplikasi dimuat, THE System SHALL memastikan CSS variable fallback ke 0 jika tidak tersedia

### Requirement 5: Bottom Navigation Safe-Area Clearance

**User Story:** Sebagai pengguna iPhone, saya ingin bottom navigation tidak tertutup oleh home indicator, sehingga semua tombol navigasi dapat diklik dengan mudah.

#### Acceptance Criteria

1. WHEN aplikasi dimuat di iPhone, THE BottomNavigation SHALL menerapkan padding-bottom menggunakan var(--safe-area-inset-bottom)
2. WHEN aplikasi dimuat di iPhone, THE BottomNavigation SHALL memiliki height 80px (5rem) untuk konten navigasi
3. WHEN aplikasi dimuat di iPhone, THE BottomNavigation SHALL tersembunyi di desktop (md:hidden)
4. WHEN aplikasi dimuat di iPhone, THE BottomNavigation SHALL memiliki z-index 40 untuk tetap di atas konten
5. WHEN aplikasi dimuat di iPhone, THE BottomNavigation SHALL menampilkan 5 item navigasi: Home, Stats, Wallet, Business, Profile
6. WHEN aplikasi dimuat di iPhone, THE BottomNavigation SHALL menggunakan backdrop-blur untuk efek glass morphism
7. WHEN aplikasi dimuat di iPhone, THE BottomNavigation SHALL memiliki border-top untuk pemisahan visual

### Requirement 6: Floating Action Button Safe-Area Positioning

**User Story:** Sebagai pengguna iPhone, saya ingin tombol "Tambah Transaksi" tidak tertutup oleh bottom navigation atau home indicator, sehingga dapat diakses dengan mudah.

#### Acceptance Criteria

1. WHEN aplikasi dimuat di iPhone, THE FAB SHALL diposisikan di atas bottom navigation
2. WHEN aplikasi dimuat di iPhone, THE FAB SHALL mempertimbangkan safe-area-inset-bottom dalam perhitungan posisi
3. WHEN aplikasi dimuat di iPhone, THE FAB SHALL memiliki z-index lebih tinggi dari bottom navigation
4. WHEN aplikasi dimuat di iPhone, THE FAB SHALL tetap terlihat dan dapat diklik di semua ukuran layar
5. WHEN aplikasi dimuat di iPhone, THE FAB SHALL menggunakan fixed positioning untuk tetap terlihat saat scroll

### Requirement 7: Fullscreen Display Mode

**User Story:** Sebagai pengguna iPhone, saya ingin aplikasi ditampilkan dalam mode fullscreen tanpa Safari UI, sehingga pengalaman seperti aplikasi native.

#### Acceptance Criteria

1. WHEN aplikasi dibuka dari Home Screen di iPhone, THE System SHALL menampilkan aplikasi dalam mode fullscreen
2. WHEN aplikasi dibuka dari Home Screen di iPhone, THE System SHALL menyembunyikan Safari address bar dan toolbar
3. WHEN aplikasi dibuka dari Home Screen di iPhone, THE System SHALL menampilkan status bar dengan warna translucent
4. WHEN aplikasi dibuka dari Home Screen di iPhone, THE System SHALL mempertahankan gesture navigasi iOS (swipe back)
5. WHEN aplikasi dibuka dari Home Screen di iPhone, THE System SHALL menampilkan home indicator di bagian bawah

### Requirement 8: Keyboard Handling dan Form Input

**User Story:** Sebagai pengguna iPhone, saya ingin keyboard tidak merusak form input atau menghalangi tombol submit, sehingga dapat mengisi form dengan nyaman.

#### Acceptance Criteria

1. WHEN keyboard muncul di iPhone, THE System SHALL mengatur viewport-fit cover untuk menghindari keyboard overlap
2. WHEN keyboard muncul di iPhone, THE System SHALL memastikan form input scroll ke atas saat keyboard aktif
3. WHEN keyboard muncul di iPhone, THE System SHALL memastikan tombol submit tetap terlihat dan dapat diklik
4. WHEN keyboard muncul di iPhone, THE System SHALL menggunakan input type yang sesuai (email, tel, number, date)
5. WHEN keyboard muncul di iPhone, THE System SHALL mengatur format-detection telephone ke false untuk mencegah auto-linking
6. WHEN form input difokus di iPhone, THE System SHALL menampilkan keyboard yang sesuai dengan tipe input

### Requirement 9: Mobile-First Responsive Design

**User Story:** Sebagai pengguna dengan berbagai ukuran layar, saya ingin aplikasi responsif dan terlihat baik di semua perangkat, sehingga pengalaman konsisten.

#### Acceptance Criteria

1. WHEN aplikasi diakses di layar mobile (< 768px), THE System SHALL menampilkan bottom navigation
2. WHEN aplikasi diakses di layar mobile (< 768px), THE System SHALL menyembunyikan desktop navigation
3. WHEN aplikasi diakses di layar desktop (>= 768px), THE System SHALL menampilkan desktop navigation
4. WHEN aplikasi diakses di layar mobile (< 768px), THE System SHALL menggunakan single column layout
5. WHEN aplikasi diakses di layar tablet (768px - 1024px), THE System SHALL menggunakan 2 column layout
6. WHEN aplikasi diakses di layar desktop (> 1024px), THE System SHALL menggunakan 3+ column layout
7. WHEN aplikasi diakses di layar mobile, THE System SHALL memastikan padding dan margin sesuai untuk layar kecil
8. WHEN aplikasi diakses di layar mobile, THE System SHALL memastikan font size readable tanpa zoom

### Requirement 10: Dark Theme Consistency

**User Story:** Sebagai pengguna, saya ingin aplikasi mempertahankan tema dark premium di semua halaman, sehingga pengalaman visual konsisten dan menyenangkan.

#### Acceptance Criteria

1. WHEN aplikasi dimuat, THE System SHALL menggunakan background color "#090C12" di semua halaman
2. WHEN aplikasi dimuat, THE System SHALL menggunakan text color "#F1F3F7" untuk teks utama
3. WHEN aplikasi dimuat, THE System SHALL menggunakan muted text color "#7F8490" untuk teks sekunder
4. WHEN aplikasi dimuat, THE System SHALL menggunakan border color rgba(255,255,255,0.07) untuk border
5. WHEN aplikasi dimuat, THE System SHALL menggunakan glass morphism dengan backdrop-blur untuk card
6. WHEN aplikasi dimuat, THE System SHALL menggunakan gradient radial untuk background effect
7. WHEN aplikasi dimuat, THE System SHALL memastikan contrast ratio memenuhi WCAG AA standard
8. WHEN aplikasi dimuat, THE System SHALL menggunakan theme-color "#090C12" untuk status bar

### Requirement 11: Status Bar dan Splash Screen Styling

**User Story:** Sebagai pengguna iPhone, saya ingin status bar dan splash screen sesuai dengan tema aplikasi, sehingga pengalaman visual seamless dari awal.

#### Acceptance Criteria

1. WHEN aplikasi dibuka dari Home Screen, THE System SHALL menampilkan status bar dengan warna translucent
2. WHEN aplikasi dibuka dari Home Screen, THE System SHALL menampilkan splash screen dengan background "#090C12"
3. WHEN aplikasi dibuka dari Home Screen, THE System SHALL menampilkan app icon di splash screen
4. WHEN aplikasi dibuka dari Home Screen, THE System SHALL menampilkan app name "POS Finance" di splash screen
5. WHEN aplikasi dimuat, THE System SHALL mengatur status bar style ke "black-translucent"
6. WHEN aplikasi dimuat, THE System SHALL memastikan status bar tidak menghalangi konten aplikasi

### Requirement 12: Manifest Icons dan Screenshots

**User Story:** Sebagai pengguna, saya ingin aplikasi menampilkan icon dan screenshot yang tepat di app store dan install prompt, sehingga pengalaman instalasi menarik.

#### Acceptance Criteria

1. WHEN aplikasi diakses di browser, THE System SHALL menampilkan icon 192x192px di install prompt
2. WHEN aplikasi diakses di browser, THE System SHALL menampilkan icon 512x512px di splash screen
3. WHEN aplikasi diakses di Android, THE System SHALL menampilkan maskable icon untuk adaptive icon
4. WHEN aplikasi diakses di browser, THE System SHALL menampilkan screenshot 540x720px untuk narrow form factor
5. WHEN aplikasi diakses di browser, THE System SHALL menampilkan screenshot 1280x720px untuk wide form factor
6. WHEN aplikasi diakses di browser, THE System SHALL menampilkan app shortcuts untuk "Tambah Transaksi" dan "Lihat Tabungan"
7. WHEN aplikasi diakses di browser, THE System SHALL menampilkan app description "Dashboard keuangan pribadi dan tracking bisnis mobil dengan fitur lengkap"

### Requirement 13: Existing Functionality Preservation

**User Story:** Sebagai pengguna, saya ingin semua fitur aplikasi tetap berfungsi dengan baik setelah PWA implementation, sehingga tidak ada regresi.

#### Acceptance Criteria

1. WHEN aplikasi dimuat, THE System SHALL mempertahankan semua fitur personal finance
2. WHEN aplikasi dimuat, THE System SHALL mempertahankan semua fitur bisnis mobil
3. WHEN aplikasi dimuat, THE System SHALL mempertahankan authentication dan authorization
4. WHEN aplikasi dimuat, THE System SHALL mempertahankan database schema dan data
5. WHEN aplikasi dimuat, THE System SHALL mempertahankan semua halaman dan routing
6. WHEN aplikasi dimuat, THE System SHALL mempertahankan semua modal dan form
7. WHEN aplikasi dimuat, THE System SHALL mempertahankan semua API endpoint

### Requirement 14: Build dan Deployment Verification

**User Story:** Sebagai developer, saya ingin memastikan build berhasil dan tidak ada error, sehingga dapat deploy dengan percaya diri.

#### Acceptance Criteria

1. WHEN menjalankan npm run build, THE System SHALL berhasil build tanpa error
2. WHEN menjalankan npm run build, THE System SHALL berhasil build tanpa TypeScript error
3. WHEN menjalankan npm run build, THE System SHALL menghasilkan optimized bundle
4. WHEN aplikasi di-deploy ke Vercel, THE System SHALL dapat diakses dari iPhone Safari
5. WHEN aplikasi di-deploy ke Vercel, THE System SHALL dapat di-add to Home Screen
6. WHEN aplikasi di-deploy ke Vercel, THE System SHALL menampilkan fullscreen mode

### Requirement 15: Testing dan Verification

**User Story:** Sebagai QA, saya ingin memverifikasi PWA implementation bekerja dengan baik di berbagai perangkat, sehingga pengalaman pengguna optimal.

#### Acceptance Criteria

1. WHEN aplikasi diakses di iPhone Safari, THE System SHALL dapat di-add to Home Screen
2. WHEN aplikasi dibuka dari Home Screen di iPhone, THE System SHALL menampilkan fullscreen mode
3. WHEN aplikasi dibuka dari Home Screen di iPhone, THE System SHALL menampilkan notch clearance
4. WHEN aplikasi dibuka dari Home Screen di iPhone, THE System SHALL menampilkan home indicator clearance
5. WHEN aplikasi dibuka dari Home Screen di iPhone, THE System SHALL menampilkan bottom navigation di atas home indicator
6. WHEN aplikasi dibuka dari Home Screen di iPhone, THE System SHALL menampilkan FAB di atas bottom navigation
7. WHEN keyboard muncul di iPhone, THE System SHALL tidak merusak form input atau tombol
8. WHEN aplikasi diakses di Android Chrome, THE System SHALL dapat di-install sebagai app
9. WHEN aplikasi diakses di desktop Chrome, THE System SHALL dapat di-install sebagai app
10. WHEN aplikasi di-refresh, THE System SHALL tetap dalam fullscreen mode

