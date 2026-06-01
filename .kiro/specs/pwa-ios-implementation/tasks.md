# PWA iOS Implementation - Task List

## Overview
Task list untuk implementasi Progressive Web App (PWA) iOS pada POS Finance Dashboard. Setiap task dirancang untuk fokus pada satu aspek implementasi dengan acceptance criteria yang terukur.

---

## 1. Icon Generation Tasks

### T1: Generate Base Icon Files (192x192 dan 512x512)

**ID:** T1  
**Category:** Icon Generation  
**Priority:** High  
**Estimated Effort:** 1-2 hours  
**Dependencies:** None

**Description:**
Generate icon files dasar untuk web dan Android dengan ukuran 192x192px dan 512x512px. Icon menggunakan brand color #090C12 sebagai background dengan desain yang jelas dan profesional.

**Acceptance Criteria:**
- [x] File `public/icons/icon-192.png` tersedia dengan dimensi 192x192px
- [ ] File `public/icons/icon-512.png` tersedia dengan dimensi 512x512px
- [ ] Kedua file menggunakan format PNG dengan optimasi
- [ ] Icon menggunakan brand color #090C12 sebagai background
- [ ] Icon memiliki white/light foreground yang kontras
- [ ] File size icon-192.png < 50KB
- [ ] File size icon-512.png < 150KB
- [ ] Icon dapat dibuka dan ditampilkan dengan benar di browser

**Implementation Notes:**
- Gunakan salah satu metode: Node.js + Sharp, Online Tool (realfavicongenerator.net), atau ImageMagick
- Pastikan icon memiliki padding yang sesuai untuk readability
- Verifikasi dimensi dengan image viewer atau DevTools

**Verification:**
```bash
# Verifikasi file ada
ls -la public/icons/icon-*.png

# Verifikasi dimensi (jika ImageMagick tersedia)
identify public/icons/icon-192.png
identify public/icons/icon-512.png
```

---

### T2: Generate Maskable Icons (192x192-maskable dan 512x512-maskable)

**ID:** T2  
**Category:** Icon Generation  
**Priority:** High  
**Estimated Effort:** 1-2 hours  
**Dependencies:** T1

**Description:**
Generate maskable icon files untuk Android adaptive icon dengan ukuran 192x192px dan 512x512px. Maskable icon memiliki safe zone 40% padding untuk memastikan icon terlihat baik saat di-mask oleh sistem operasi.

**Acceptance Criteria:**
- [ ] File `public/icons/icon-192-maskable.png` tersedia dengan dimensi 192x192px
- [ ] File `public/icons/icon-512-maskable.png` tersedia dengan dimensi 512x512px
- [ ] Kedua file menggunakan format PNG dengan optimasi
- [ ] Icon memiliki safe zone 40% padding dari edge
- [ ] Icon menggunakan brand color #090C12 sebagai background
- [ ] File size icon-192-maskable.png < 50KB
- [ ] File size icon-512-maskable.png < 150KB
- [ ] Icon dapat ditampilkan dengan benar di Android adaptive icon preview

**Implementation Notes:**
- Maskable icon harus memiliki konten penting di area tengah (safe zone)
- Gunakan online tool atau script untuk generate maskable variant dari base icon
- Verifikasi dengan Android adaptive icon preview tool

**Verification:**
```bash
# Verifikasi file ada
ls -la public/icons/icon-*-maskable.png

# Verifikasi dimensi
identify public/icons/icon-192-maskable.png
identify public/icons/icon-512-maskable.png
```

---

### T3: Generate Apple Touch Icon, Shortcuts, dan Screenshots

**ID:** T3  
**Category:** Icon Generation  
**Priority:** High  
**Estimated Effort:** 2-3 hours  
**Dependencies:** T1, T2

**Description:**
Generate icon dan screenshot tambahan untuk iOS dan web: apple-touch-icon (180x180px), shortcut icons untuk "Tambah Transaksi" dan "Lihat Tabungan" (192x192px masing-masing), serta screenshot untuk narrow (540x720px) dan wide (1280x720px) form factor.

**Acceptance Criteria:**
- [ ] File `public/icons/apple-touch-icon.png` tersedia dengan dimensi 180x180px
- [ ] File `public/icons/shortcut-transaksi.png` tersedia dengan dimensi 192x192px
- [ ] File `public/icons/shortcut-savings.png` tersedia dengan dimensi 192x192px
- [ ] File `public/icons/screenshot-540.png` tersedia dengan dimensi 540x720px
- [ ] File `public/icons/screenshot-1280.png` tersedia dengan dimensi 1280x720px
- [ ] Semua file menggunakan format PNG dengan optimasi
- [ ] Apple touch icon menggunakan brand color #090C12
- [ ] Shortcut icons memiliki visual yang berbeda dan jelas
- [ ] Screenshots menampilkan UI aplikasi dengan tema dark (#090C12)
- [ ] File size apple-touch-icon.png < 50KB
- [ ] File size shortcut icons < 30KB masing-masing
- [ ] File size screenshots < 200KB masing-masing

**Implementation Notes:**
- Apple touch icon: Gunakan base icon atau custom design untuk iOS Home Screen
- Shortcut icons: Buat visual yang berbeda untuk setiap shortcut (transaksi vs savings)
- Screenshots: Ambil dari aplikasi yang sudah berjalan atau design mockup
- Pastikan screenshots menampilkan fitur utama aplikasi

**Verification:**
```bash
# Verifikasi semua file ada
ls -la public/icons/apple-touch-icon.png
ls -la public/icons/shortcut-*.png
ls -la public/icons/screenshot-*.png

# Verifikasi dimensi
identify public/icons/apple-touch-icon.png
identify public/icons/shortcut-transaksi.png
identify public/icons/shortcut-savings.png
identify public/icons/screenshot-540.png
identify public/icons/screenshot-1280.png
```

---

## 2. Metadata Verification Tasks

### T4: Verify manifest.json Configuration

**ID:** T4  
**Category:** Metadata Verification  
**Priority:** High  
**Estimated Effort:** 1 hour  
**Dependencies:** T1, T2, T3

**Description:**
Verifikasi dan update manifest.json dengan konfigurasi lengkap untuk PWA iOS. Manifest harus berisi metadata aplikasi, icon references, shortcuts, dan screenshots.

**Acceptance Criteria:**
- [ ] File `public/manifest.json` ada dan valid JSON
- [ ] Field `name` berisi "POS Finance - Personal Finance & Bisnis Mobil"
- [ ] Field `short_name` berisi "POS Finance"
- [ ] Field `description` berisi "Dashboard keuangan pribadi dan tracking bisnis mobil dengan fitur lengkap"
- [ ] Field `start_url` berisi "/dashboard"
- [ ] Field `scope` berisi "/"
- [ ] Field `display` berisi "fullscreen"
- [ ] Field `orientation` berisi "portrait-primary"
- [ ] Field `theme_color` berisi "#090C12"
- [ ] Field `background_color` berisi "#090C12"
- [ ] Field `categories` berisi ["finance", "productivity"]
- [ ] Field `icons` berisi 6 icon entries (icon-192, icon-512, icon-192-maskable, icon-512-maskable, apple-touch-icon, shortcut icons)
- [ ] Semua icon paths di manifest.json sesuai dengan file yang ada di public/icons/
- [ ] Field `shortcuts` berisi 2 shortcut entries (Tambah Transaksi, Lihat Tabungan)
- [ ] Field `screenshots` berisi 2 screenshot entries (narrow 540x720, wide 1280x720)
- [ ] Manifest dapat di-parse tanpa error

**Implementation Notes:**
- Gunakan JSON validator untuk memastikan syntax valid
- Verifikasi semua icon paths relatif terhadap public/
- Pastikan icon sizes dan types sesuai dengan file yang ada
- Shortcut harus memiliki url, icons, dan short_name

**Verification:**
```bash
# Validate JSON
cat public/manifest.json | jq .

# Check file references
ls -la public/icons/icon-192.png
ls -la public/icons/icon-512.png
# ... dst untuk semua icon yang direferensikan
```

---

### T5: Verify app/layout.tsx Meta Tags

**ID:** T5  
**Category:** Metadata Verification  
**Priority:** High  
**Estimated Effort:** 1 hour  
**Dependencies:** T4

**Description:**
Verifikasi dan update app/layout.tsx dengan semua meta tags yang diperlukan untuk PWA iOS. Meta tags harus mencakup apple-mobile-web-app configuration, viewport settings, dan theme color.

**Acceptance Criteria:**
- [ ] File `app/layout.tsx` memiliki metadata export dengan tipe Metadata
- [ ] Metadata memiliki field `manifest` dengan value '/manifest.json'
- [ ] Metadata memiliki field `appleWebApp` dengan `capable: true`
- [ ] Metadata memiliki field `appleWebApp` dengan `statusBarStyle: 'black-translucent'`
- [ ] Metadata memiliki field `appleWebApp` dengan `title: 'POS Finance'`
- [ ] Metadata memiliki field `viewport` dengan `viewportFit: 'cover'`
- [ ] Metadata memiliki field `viewport` dengan `width: 'device-width'`
- [ ] Metadata memiliki field `viewport` dengan `initialScale: 1`
- [ ] Metadata memiliki field `viewport` dengan `maximumScale: 1`
- [ ] Metadata memiliki field `viewport` dengan `userScalable: false`
- [ ] Metadata memiliki field `themeColor` dengan value '#090C12'
- [ ] File tidak memiliki TypeScript errors
- [ ] Build berhasil tanpa error

**Implementation Notes:**
- Gunakan Next.js Metadata API (bukan manual meta tags)
- Pastikan semua field sesuai dengan Next.js type definitions
- Verifikasi dengan TypeScript compiler

**Verification:**
```bash
# Check TypeScript errors
npx tsc --noEmit

# Check build
npm run build
```

---

## 3. Safe-Area CSS Tasks

### T6: Verify app/globals.css Safe-Area CSS Variables

**ID:** T6  
**Category:** Safe-Area CSS  
**Priority:** High  
**Estimated Effort:** 1 hour  
**Dependencies:** None

**Description:**
Verifikasi dan update app/globals.css dengan CSS variables untuk safe-area insets. CSS variables harus menggunakan env() function untuk membaca device safe-area values dengan fallback ke 0.

**Acceptance Criteria:**
- [ ] File `app/globals.css` memiliki `:root` selector
- [ ] `:root` memiliki CSS variable `--safe-area-inset-top` dengan value `env(safe-area-inset-top, 0)`
- [ ] `:root` memiliki CSS variable `--safe-area-inset-right` dengan value `env(safe-area-inset-right, 0)`
- [ ] `:root` memiliki CSS variable `--safe-area-inset-bottom` dengan value `env(safe-area-inset-bottom, 0)`
- [ ] `:root` memiliki CSS variable `--safe-area-inset-left` dengan value `env(safe-area-inset-left, 0)`
- [ ] `body` selector memiliki `padding-bottom: var(--safe-area-inset-bottom)`
- [ ] `body` selector memiliki `background: #090C12`
- [ ] `body` selector memiliki `color: #F1F3F7`
- [ ] `body` selector memiliki `color-scheme: dark`
- [ ] CSS variables dapat diakses dari JavaScript dan CSS
- [ ] Fallback values (0) diterapkan pada browser yang tidak support env()

**Implementation Notes:**
- CSS variables harus didefinisikan di `:root` untuk global access
- env() function adalah CSS standard untuk safe-area
- Fallback value 0 memastikan kompatibilitas dengan browser lama
- Verifikasi dengan browser DevTools (Computed styles)

**Verification:**
```bash
# Check CSS syntax
npx stylelint app/globals.css

# Build dan check
npm run build
```

---

### T7: Verify CSS Variables Applied Correctly in Components

**ID:** T7  
**Category:** Safe-Area CSS  
**Priority:** High  
**Estimated Effort:** 1 hour  
**Dependencies:** T6

**Description:**
Verifikasi bahwa CSS variables dari T6 diterapkan dengan benar di components yang memerlukan safe-area clearance, terutama bottom-navigation dan FAB.

**Acceptance Criteria:**
- [ ] CSS variables `--safe-area-inset-*` dapat diakses dari components
- [ ] Bottom navigation menggunakan `var(--safe-area-inset-bottom)` untuk padding
- [ ] FAB menggunakan `var(--safe-area-inset-bottom)` dalam perhitungan posisi
- [ ] Tidak ada hardcoded safe-area values di components
- [ ] CSS variables fallback ke 0 pada browser yang tidak support
- [ ] Computed styles menampilkan correct values di browser DevTools

**Implementation Notes:**
- Verifikasi dengan browser DevTools (Computed styles tab)
- Test di berbagai browser (Safari, Chrome, Firefox)
- Pastikan fallback values diterapkan dengan benar

**Verification:**
```bash
# Build
npm run build

# Test di browser DevTools
# 1. Open app in browser
# 2. Inspect body element
# 3. Check Computed styles for --safe-area-inset-* variables
# 4. Verify values match device safe-area insets
```

---

## 4. Component Updates Tasks

### T8: Verify bottom-navigation.tsx Safe-Area Padding

**ID:** T8  
**Category:** Component Updates  
**Priority:** High  
**Estimated Effort:** 1 hour  
**Dependencies:** T6, T7

**Description:**
Verifikasi bahwa bottom-navigation.tsx menerapkan safe-area padding dengan benar. Bottom navigation harus memiliki padding-bottom yang menggunakan CSS variable untuk clearance dari home indicator.

**Acceptance Criteria:**
- [ ] File `components/bottom-navigation.tsx` ada
- [ ] Component memiliki `md:hidden` class untuk hide di desktop
- [ ] Component memiliki `fixed bottom-0 left-0 right-0` untuk positioning
- [ ] Component memiliki `z-40` untuk z-index
- [ ] Component memiliki `style={{ paddingBottom: 'var(--safe-area-inset-bottom)' }}`
- [ ] Component memiliki height 80px (5rem) untuk navigation items
- [ ] Component memiliki 5 navigation items: Home, Stats, Wallet, Business, Profile
- [ ] Component memiliki `backdrop-blur` untuk glass morphism effect
- [ ] Component memiliki `border-top` untuk visual separation
- [ ] Component tidak memiliki TypeScript errors
- [ ] Component dapat di-render tanpa error

**Implementation Notes:**
- Verifikasi dengan browser DevTools (Inspect element)
- Test di iPhone Safari dengan Add to Home Screen
- Pastikan bottom navigation tidak tertutup oleh home indicator

**Verification:**
```bash
# Check TypeScript errors
npx tsc --noEmit

# Build
npm run build

# Test di browser
# 1. Open app in browser
# 2. Inspect bottom-navigation element
# 3. Check computed styles for padding-bottom
# 4. Verify value matches safe-area-inset-bottom
```

---

### T9: Verify transaction-form.tsx FAB Positioning

**ID:** T9  
**Category:** Component Updates  
**Priority:** High  
**Estimated Effort:** 1 hour  
**Dependencies:** T6, T7, T8

**Description:**
Verifikasi bahwa transaction-form.tsx FAB (Floating Action Button) diposisikan dengan benar di atas bottom navigation dengan mempertimbangkan safe-area insets.

**Acceptance Criteria:**
- [ ] File `components/transaction-form.tsx` ada
- [ ] FAB button memiliki `md:hidden` class untuk hide di desktop
- [ ] FAB button memiliki `fixed` positioning
- [ ] FAB button memiliki `z-40` untuk z-index
- [ ] FAB button memiliki `right-4` (1rem) margin dari right edge
- [ ] FAB button memiliki `bottom` style dengan formula: `calc(1rem + var(--safe-area-inset-bottom) + 5rem)`
- [ ] FAB button memiliki height 56px (h-14) dan width 56px (w-14)
- [ ] FAB button memiliki `rounded-full` untuk circular shape
- [ ] FAB button memiliki Plus icon (size 24)
- [ ] FAB button tidak memiliki TypeScript errors
- [ ] FAB button dapat di-render tanpa error
- [ ] FAB button terlihat di atas bottom navigation

**Implementation Notes:**
- Formula bottom positioning: 1rem (margin) + safe-area-inset-bottom + 5rem (bottom nav height)
- Verifikasi dengan browser DevTools (Inspect element)
- Test di iPhone Safari dengan Add to Home Screen
- Pastikan FAB tidak tertutup oleh bottom navigation atau home indicator

**Verification:**
```bash
# Check TypeScript errors
npx tsc --noEmit

# Build
npm run build

# Test di browser
# 1. Open app in browser
# 2. Inspect FAB button element
# 3. Check computed styles for bottom position
# 4. Verify FAB is above bottom navigation
# 5. Verify FAB is not hidden by home indicator
```

---

## 5. Build & Testing Tasks

### T10: Run npm run build and Verify No Errors

**ID:** T10  
**Category:** Build & Testing  
**Priority:** High  
**Estimated Effort:** 30 minutes  
**Dependencies:** T5, T8, T9

**Description:**
Jalankan npm run build untuk memastikan tidak ada error atau warning. Build harus berhasil menghasilkan optimized bundle tanpa TypeScript errors.

**Acceptance Criteria:**
- [ ] Command `npm run build` berhasil dijalankan
- [ ] Build tidak menghasilkan error
- [ ] Build tidak menghasilkan TypeScript errors
- [ ] Build menghasilkan optimized bundle
- [ ] Build output menampilkan "✓ Ready in Xs"
- [ ] Tidak ada warning tentang missing dependencies
- [ ] Tidak ada warning tentang unused code
- [ ] .next folder berisi build artifacts

**Implementation Notes:**
- Jalankan build di clean environment (hapus .next folder jika perlu)
- Verifikasi tidak ada error di console output
- Pastikan semua dependencies terinstall dengan `npm install`

**Verification:**
```bash
# Clean build
rm -rf .next
npm run build

# Verify build output
ls -la .next/
```

---

### T11: Test on iPhone Safari (Add to Home Screen)

**ID:** T11  
**Category:** Build & Testing  
**Priority:** High  
**Estimated Effort:** 1-2 hours  
**Dependencies:** T10

**Description:**
Test aplikasi di iPhone Safari dengan fitur "Add to Home Screen". Verifikasi bahwa aplikasi dapat diinstal, menampilkan fullscreen mode, dan safe-area clearance bekerja dengan benar.

**Acceptance Criteria:**
- [ ] Aplikasi dapat diakses di iPhone Safari
- [ ] Aplikasi dapat di-add to Home Screen (Share → Add to Home Screen)
- [ ] Aplikasi dapat diluncurkan dari Home Screen
- [ ] Aplikasi menampilkan fullscreen mode (tanpa Safari UI)
- [ ] Status bar terlihat dengan warna translucent
- [ ] Notch tidak menghalangi konten aplikasi
- [ ] Home indicator terlihat di bagian bawah
- [ ] Bottom navigation terlihat di atas home indicator
- [ ] FAB terlihat di atas bottom navigation
- [ ] Semua navigation items dapat diklik
- [ ] FAB dapat diklik untuk membuka form
- [ ] Form input dapat diisi dengan keyboard
- [ ] Keyboard tidak merusak form atau tombol submit
- [ ] Semua halaman dapat diakses dari navigation
- [ ] Dark theme (#090C12) konsisten di semua halaman

**Implementation Notes:**
- Gunakan iPhone fisik atau simulator (Xcode)
- Pastikan iPhone terhubung ke WiFi yang sama dengan development machine
- Akses aplikasi melalui IP address atau ngrok tunnel
- Test di berbagai iPhone models (iPhone 12, 13, 14, SE)

**Verification:**
```bash
# Start development server
npm run dev

# Access from iPhone Safari
# 1. Get local IP: ipconfig getifaddr en0 (macOS) atau ipconfig (Windows)
# 2. Open http://<IP>:3000 in iPhone Safari
# 3. Share → Add to Home Screen
# 4. Launch from Home Screen
# 5. Verify fullscreen mode and safe-area clearance
```

---

### T12: Test on Android Chrome (Install App)

**ID:** T12  
**Category:** Build & Testing  
**Priority:** High  
**Estimated Effort:** 1-2 hours  
**Dependencies:** T10

**Description:**
Test aplikasi di Android Chrome dengan fitur "Install app". Verifikasi bahwa aplikasi dapat diinstal, menampilkan fullscreen mode, dan adaptive icon ditampilkan dengan benar.

**Acceptance Criteria:**
- [ ] Aplikasi dapat diakses di Android Chrome
- [ ] Install prompt muncul di Android Chrome
- [ ] Aplikasi dapat di-install (Menu → Install app)
- [ ] Aplikasi dapat diluncurkan dari Home Screen
- [ ] Aplikasi menampilkan fullscreen mode
- [ ] Adaptive icon ditampilkan dengan benar di Home Screen
- [ ] App shortcuts tersedia (Tambah Transaksi, Lihat Tabungan)
- [ ] Semua navigation items dapat diklik
- [ ] FAB dapat diklik untuk membuka form
- [ ] Form input dapat diisi dengan keyboard
- [ ] Semua halaman dapat diakses dari navigation
- [ ] Dark theme (#090C12) konsisten di semua halaman

**Implementation Notes:**
- Gunakan Android fisik atau emulator (Android Studio)
- Pastikan Android terhubung ke WiFi yang sama dengan development machine
- Akses aplikasi melalui IP address atau ngrok tunnel
- Test di berbagai Android devices dan Chrome versions

**Verification:**
```bash
# Start development server
npm run dev

# Access from Android Chrome
# 1. Get local IP: ipconfig getifaddr en0 (macOS) atau ipconfig (Windows)
# 2. Open http://<IP>:3000 in Android Chrome
# 3. Menu → Install app
# 4. Launch from Home Screen
# 5. Verify fullscreen mode and adaptive icon
```

---

## 6. Deployment Tasks

### T13: Deploy to Vercel

**ID:** T13  
**Category:** Deployment  
**Priority:** High  
**Estimated Effort:** 30 minutes  
**Dependencies:** T10, T11, T12

**Description:**
Deploy aplikasi ke Vercel. Verifikasi bahwa deployment berhasil dan aplikasi dapat diakses dari production URL.

**Acceptance Criteria:**
- [ ] Code di-push ke repository (main branch)
- [ ] Vercel deployment triggered automatically
- [ ] Deployment berhasil tanpa error
- [ ] Aplikasi dapat diakses dari production URL
- [ ] manifest.json dapat diakses dari production URL
- [ ] Semua icon files dapat diakses dari production URL
- [ ] Build logs tidak menampilkan error atau warning
- [ ] Deployment status menampilkan "Ready"

**Implementation Notes:**
- Pastikan repository terhubung dengan Vercel
- Verifikasi environment variables di Vercel dashboard
- Check deployment logs di Vercel dashboard
- Pastikan build command dan output directory benar

**Verification:**
```bash
# Push to repository
git add .
git commit -m "PWA iOS implementation"
git push origin main

# Check Vercel deployment
# 1. Open Vercel dashboard
# 2. Check deployment status
# 3. Verify build logs
# 4. Access production URL
```

---

### T14: Final Verification on Production

**ID:** T14  
**Category:** Deployment  
**Priority:** High  
**Estimated Effort:** 1-2 hours  
**Dependencies:** T13

**Description:**
Final verification bahwa PWA iOS implementation bekerja dengan benar di production environment. Test di berbagai devices dan browsers untuk memastikan pengalaman pengguna optimal.

**Acceptance Criteria:**
- [ ] Aplikasi dapat diakses dari production URL di iPhone Safari
- [ ] Aplikasi dapat di-add to Home Screen di iPhone
- [ ] Aplikasi menampilkan fullscreen mode di iPhone
- [ ] Safe-area clearance bekerja dengan benar di iPhone
- [ ] Bottom navigation terlihat di atas home indicator
- [ ] FAB terlihat di atas bottom navigation
- [ ] Aplikasi dapat diakses dari production URL di Android Chrome
- [ ] Aplikasi dapat di-install di Android Chrome
- [ ] Adaptive icon ditampilkan dengan benar di Android
- [ ] Aplikasi dapat diakses dari production URL di Desktop Chrome
- [ ] Install prompt muncul di Desktop Chrome
- [ ] Semua fitur aplikasi berfungsi dengan benar
- [ ] Dark theme (#090C12) konsisten di semua halaman
- [ ] Tidak ada console errors atau warnings
- [ ] Performance metrics acceptable (Lighthouse score > 90)

**Implementation Notes:**
- Test di berbagai devices: iPhone 12/13/14/SE, Android phones, Desktop
- Test di berbagai browsers: Safari, Chrome, Firefox, Edge
- Gunakan Lighthouse untuk performance audit
- Monitor error logs di Vercel dashboard

**Verification:**
```bash
# Access production URL
# 1. Open https://<production-url> in various devices/browsers
# 2. Test Add to Home Screen on iPhone
# 3. Test Install app on Android
# 4. Test Install app on Desktop
# 5. Verify fullscreen mode and safe-area clearance
# 6. Run Lighthouse audit
# 7. Check browser console for errors

# Lighthouse audit
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Run audit for PWA
# 4. Verify score > 90
```

---

## Task Dependencies Graph

```
T1 (Base Icons)
  ↓
T2 (Maskable Icons) → T3 (Apple Touch Icon, Shortcuts, Screenshots)
  ↓                    ↓
  └────────────────────┴─→ T4 (Verify manifest.json)
                            ↓
                        T5 (Verify app/layout.tsx)
                            ↓
T6 (Safe-Area CSS Variables)
  ↓
T7 (CSS Variables Applied)
  ↓
T8 (Bottom Navigation Safe-Area)
  ↓
T9 (FAB Positioning)
  ↓
T10 (Build & Verify)
  ↓
T11 (Test iPhone Safari) ─┐
                          ├─→ T13 (Deploy to Vercel)
T12 (Test Android Chrome) ┘    ↓
                          T14 (Final Verification)
```

---

## Summary

**Total Tasks:** 14  
**Total Estimated Effort:** 12-18 hours

### Task Breakdown by Category:
- **Icon Generation (T1-T3):** 4-7 hours
- **Metadata Verification (T4-T5):** 2 hours
- **Safe-Area CSS (T6-T7):** 2 hours
- **Component Updates (T8-T9):** 2 hours
- **Build & Testing (T10-T12):** 2-4 hours
- **Deployment (T13-T14):** 1-2 hours

### Key Milestones:
1. ✅ Icon generation complete (T1-T3)
2. ✅ Metadata configuration complete (T4-T5)
3. ✅ Safe-area CSS implementation complete (T6-T7)
4. ✅ Component updates complete (T8-T9)
5. ✅ Build verification complete (T10)
6. ✅ Device testing complete (T11-T12)
7. ✅ Production deployment complete (T13-T14)

### Success Criteria:
- ✅ Semua 14 tasks completed
- ✅ Aplikasi dapat diakses di iPhone Safari dengan Add to Home Screen
- ✅ Aplikasi dapat diakses di Android Chrome dengan Install app
- ✅ Safe-area clearance bekerja dengan benar
- ✅ Fullscreen mode berfungsi
- ✅ Semua fitur aplikasi tetap berfungsi
- ✅ Dark theme konsisten di semua halaman
- ✅ Deployed ke Vercel dan accessible

