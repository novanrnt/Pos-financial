# Telegram Bot Setup Guide

## Overview
Integrasi Telegram memungkinkan Anda untuk input transaksi (pengeluaran, pemasukan), hutang, dan piutang langsung dari Telegram dengan format natural language. Fitur ini sangat berguna untuk mencatat pengeluaran sehari-hari secara real-time.

## Fitur Utama
✅ Input pengeluaran, pemasukan, hutang, dan piutang  
✅ Auto-create kategori jika belum ada  
✅ Auto-update saldo rekening  
✅ Support multiple akun/rekening  
✅ Error handling dengan pesan jelas  
✅ Command-based interface (/start, /help, /accounts)

## Setup Steps

### 1. Create Telegram Bot
1. Buka Telegram dan cari `@BotFather`
2. Kirim `/newbot`
3. Ikuti instruksi untuk membuat bot baru
4. Copy bot token (contoh: `123456789:ABCdefGHIjklmnoPQRstuvWXYZ`)

### 2. Update Environment Variables
Tambahkan ke `.env` file:
```env
TELEGRAM_BOT_TOKEN="your_bot_token_here"
TELEGRAM_WEBHOOK_SECRET="your_webhook_secret_here"
```

**Contoh:**
```env
TELEGRAM_BOT_TOKEN="7123456789:ABCdefGHIjklmnoPQRstuvWXYZ1234567890"
TELEGRAM_WEBHOOK_SECRET="webhook_secret_12345"
```

### 3. Set Webhook
Jalankan command di terminal (replace dengan nilai yang benar):
```bash
curl -X POST https://api.telegram.org/bot{YOUR_BOT_TOKEN}/setWebhook \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://your-app-domain.com/api/telegram",
    "secret_token": "your_webhook_secret_here"
  }'
```

**Contoh dengan nilai nyata:**
```bash
curl -X POST https://api.telegram.org/bot7123456789:ABCdefGHIjklmnoPQRstuvWXYZ1234567890/setWebhook \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://pos-finance.vercel.app/api/telegram",
    "secret_token": "webhook_secret_12345"
  }'
```

**Atau gunakan Python untuk lebih mudah:**
```python
import requests

bot_token = "your_bot_token"
webhook_url = "https://your-app-domain.com/api/telegram"
secret = "your_webhook_secret"

url = f"https://api.telegram.org/bot{bot_token}/setWebhook"
data = {
    "url": webhook_url,
    "secret_token": secret
}

response = requests.post(url, json=data)
print(response.json())
```

### 4. Verify Webhook
Untuk memastikan webhook sudah benar:
```bash
curl https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getWebhookInfo
```

Seharusnya menampilkan:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-app-domain.com/api/telegram",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "...": "..."
  }
}
```

### 5. Test Bot
1. Cari bot Anda di Telegram dengan nama yang telah dibuat
2. Kirim `/start` untuk memulai
3. Kirim `/help` untuk melihat bantuan
4. Kirim `/accounts` untuk melihat daftar akun

## Perintah Bot (Commands)

### /start
Memulai bot dan menampilkan pesan sambutan beserta bantuan singkat.

**Respon:**
```
Selamat datang, [Nama Anda]! 👋

Lihat bantuan dengan /help untuk instruksi lengkap.
```

### /help
Menampilkan bantuan lengkap tentang format input dan contoh transaksi.

**Respon:**
```
📊 POS Keuangan Bot

Format Input Transaksi:
19 mei 2026 makan 20.000 blue

Jenis Transaksi:
• Pengeluaran (default): 19 mei 2026 makan 20.000 blue
• Pemasukan: 19 mei 2026 gaji 500.000 blue income
• Hutang: 19 mei 2026 pinjam 100.000 blue hutang
• Piutang: 19 mei 2026 pinjamkan 50.000 blue piutang

Contoh:
📉 19 mei 2026 bensin 50.000 cash
📈 20 mei 2026 bonus 100.000 bca income
💳 21 mei 2026 utang teman 200.000 mandiri hutang

Perintah Lain:
/accounts - Lihat daftar akun Anda
```

### /accounts
Menampilkan daftar semua akun dengan saldo terkini.

**Respon:**
```
💰 Daftar Akun Anda:

1. Cash (CASH)
   Saldo: Rp 1.500.000

2. BCA (BANK)
   Saldo: Rp 5.000.000

3. Dana (EWALLET)
   Saldo: Rp 2.000.000
```

## Format Input Transaksi

### Pengeluaran (Expense)
Ini adalah tipe default ketika tidak ada keyword khusus.

**Format:**
```
[tanggal] [bulan] [tahun] [deskripsi] [nominal] [rekening]
```

**Contoh:**
```
19 mei 2026 makan 20.000 blue
20 mei 2026 bensin 50.000 cash
21 mei 2026 pulsa 50000 dana
```

### Pemasukan (Income)
Tambahkan keyword `income` di akhir pesan.

**Format:**
```
[tanggal] [bulan] [tahun] [deskripsi] [nominal] [rekening] income
```

**Contoh:**
```
19 mei 2026 gaji 500.000 bca income
20 mei 2026 bonus 100.000 cash income
21 mei 2026 royalti 1000000 blue income
```

### Hutang (Debt)
Tambahkan keyword `hutang` di akhir pesan. Gunakan untuk mencatat utang Anda.

**Format:**
```
[tanggal] [bulan] [tahun] [deskripsi] [nominal] [rekening] hutang
```

**Contoh:**
```
19 mei 2026 pinjam dari teman 100.000 blue hutang
20 mei 2026 kredit mobil 50.000 bca hutang
```

### Piutang (Receivable)
Tambahkan keyword `piutang` di akhir pesan. Gunakan untuk mencatat uang yang dipinjamkan.

**Format:**
```
[tanggal] [bulan] [tahun] [deskripsi] [nominal] [rekening] piutang
```

**Contoh:**
```
19 mei 2026 pinjamkan ke teman 50.000 blue piutang
20 mei 2026 pinjaman ke keluarga 200.000 bca piutang
```

## Format Breakdown

### Tanggal (1-31)
- Nomor hari: 1, 2, ..., 31
- Contoh: `1`, `15`, `31`

### Bulan
Beberapa format yang didukung (case-insensitive):

| Nomor | Lengkap | Singkat |
|-------|---------|---------|
| 1 | januari | jan |
| 2 | februari | feb |
| 3 | maret | mar |
| 4 | april | apr |
| 5 | mei | - |
| 6 | juni | jun |
| 7 | juli | jul |
| 8 | agustus | agu |
| 9 | september | sep |
| 10 | oktober | okt |
| 11 | november | nov |
| 12 | desember | des |

### Tahun (4 digit)
- Format: YYYY
- Contoh: `2026`, `2025`, `2024`

### Deskripsi
- Nama transaksi atau kategori
- Case-insensitive
- Bisa memuat spasi
- Contoh: `makan`, `bensin`, `gaji`, `bonus`, `utang teman`

### Nominal (Amount)
- Angka dengan atau tanpa pemisah ribuan (titik)
- Contoh: `20.000`, `20000`, `1.500.000`, `1500000`
- Didukung desimal dengan dua angka di belakang koma

### Rekening (Account Name)
- Nama rekening yang sudah ada di aplikasi
- Case-insensitive
- Harus cocok dengan yang ada di database
- Contoh: `blue`, `cash`, `bca`, `mandiri`, `dana`, `ovo`

### Type (Optional)
- Default: `expense` (pengeluaran)
- Pilihan: `expense`, `income`, `hutang`, `piutang`
- Case-insensitive

## Contoh Penggunaan Lengkap

### Hari Ini: 19 Mei 2026

**Pengeluaran:**
```
19 mei 2026 makan siang 25.000 cash
19 mei 2026 bensin 50.000 blue
19 mei 2026 minum kopi 15.000 dana
```

**Pemasukan:**
```
19 mei 2026 gaji bulanan 5.000.000 bca income
19 mei 2026 freelance project 500.000 blue income
```

**Hutang:**
```
19 mei 2026 pinjam dari ayah 1.000.000 bca hutang
19 mei 2026 cicilan motor 2.500.000 mandiri hutang
```

**Piutang:**
```
19 mei 2026 pinjamkan ke adi 100.000 cash piutang
19 mei 2026 pinjam uang ke teman 500.000 blue piutang
```

## Fitur Otomatis

### Auto-create Kategori
Jika kategori tidak ditemukan, bot akan membuat kategori baru secara otomatis dengan:
- Nama: sesuai deskripsi yang Anda ketik
- Tipe: INCOME atau EXPENSE (sesuai transaksi)
- Icon: Circle
- Warna: Emerald

### Auto-update Saldo
Saldo akun akan otomatis diperbarui:
- Pemasukan: Saldo +
- Pengeluaran: Saldo -
- Hutang: Saldo + (utang Anda meningkat)
- Piutang: Saldo - (aset Anda berkurang)

## Troubleshooting

### Bot tidak merespons
**Solusi:**
1. Pastikan webhook URL sudah benar dan HTTPS
2. Verifikasi bot token di `.env`
3. Jalankan command untuk verifikasi webhook:
   ```bash
   curl https://api.telegram.org/bot{TOKEN}/getWebhookInfo
   ```
4. Periksa pending updates:
   ```bash
   curl https://api.telegram.org/bot{TOKEN}/getUpdates
   ```

### "User tidak ditemukan"
**Penyebab:** Anda belum setup Telegram di aplikasi POS

**Solusi:**
1. Login ke aplikasi POS Keuangan
2. Pergi ke Settings > Telegram
3. Klik tombol untuk mengaktifkan integrasi Telegram
4. Coba kirim pesan lagi ke bot

### "Rekening tidak ditemukan"
**Penyebab:** Nama rekening tidak sesuai dengan yang ada di aplikasi

**Solusi:**
1. Kirim `/accounts` ke bot untuk melihat daftar rekening
2. Gunakan nama rekening yang benar
3. Nama case-insensitive tapi harus ada di database

### "Format tidak valid"
**Penyebab:** Format pesan tidak sesuai dengan yang diharapkan

**Solusi:**
1. Kirim `/help` untuk melihat format yang benar
2. Pastikan ada spasi antara setiap bagian
3. Periksa bahwa nominal adalah angka
4. Contoh yang benar: `19 mei 2026 makan 20.000 blue`

### Bot tidak membuat transaksi
**Penyebab:** Kemungkinan ada error di database atau server

**Solusi:**
1. Verifikasi format pesan
2. Periksa apakah akun dan kategori sudah ada
3. Cek log aplikasi untuk error detail

## Keamanan

### Secret Token
Webhook secret token digunakan untuk memverifikasi bahwa request benar-benar dari Telegram.

- Pastikan `TELEGRAM_WEBHOOK_SECRET` ada di `.env`
- Gunakan secret yang kuat dan random
- Jangan share secret token dengan siapa saja

### HTTPS Required
- Webhook URL harus HTTPS (tidak boleh HTTP)
- Sertifikat SSL harus valid
- Telegram akan reject webhook jika tidak HTTPS

## Tips & Trik

### Shortcut Bulan
```
1 jan 2026 = 1 januari 2026
19 feb 2026 = 19 februari 2026
15 mar 2026 = 15 maret 2026
```

### Format Nominal Fleksibel
Semua cara berikut valid:
```
20.000 (dengan titik)
20000 (tanpa titik)
20,000 (tanpa karakter khusus)
```

### Nama Rekening Fleksibel
Nama rekening tidak case-sensitive dan bisa partial match:
```
"blue" cocok dengan "Blue", "BLUE", "BlueMoney"
"bca" cocok dengan "BCA", "bca", "BCA Savings"
```

### Transaksi Masa Lalu
Anda bisa mencatat transaksi untuk hari yang lalu:
```
18 mei 2026 makan 30.000 cash   (kemarin)
15 mei 2026 bensin 50.000 blue  (4 hari lalu)
1 mei 2026 gaji 5.000.000 bca income  (bulan ini)
```

## Integrasi dengan Aplikasi Utama
Semua transaksi yang dicatat melalui Telegram akan:
- Muncul di dashboard aplikasi
- Dimasukkan ke laporan bulanan
- Mempengaruhi grafik dan analisis
- Terupdate dalam real-time
- Dapat diedit melalui aplikasi jika perlu

Sumber transaksi dari Telegram akan ditandai dengan label `[Telegram]` di aplikasi.

## Example Workflow

1. User send: `19 mei 2026 makan 20.000 blue`
2. Bot parse message
3. Find account "blue"
4. Create/find category "makan"
5. Create transaction: EXPENSE 20.000 dari blue
6. Update blue balance: -20.000
7. Send confirmation: "✅ Pengeluaran 20000 dari blue tercatat"
8. Dashboard auto-update dengan transaksi baru
