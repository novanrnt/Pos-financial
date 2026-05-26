# Telegram Bot Setup Guide

## Overview
Telegram bot integration memungkinkan user untuk input transaksi, hutang, dan piutang langsung dari Telegram dengan format natural language.

## Setup Steps

### 1. Create Telegram Bot
1. Open Telegram dan cari `@BotFather`
2. Send `/newbot`
3. Follow instructions untuk membuat bot baru
4. Copy bot token (contoh: `123456789:ABCdefGHIjklmnoPQRstuvWXYZ`)

### 2. Update Environment Variables
Tambahkan ke `.env` file:
```
TELEGRAM_BOT_TOKEN="your_bot_token_here"
TELEGRAM_WEBHOOK_SECRET="your_webhook_secret_here"
```

### 3. Set Webhook
Run command di terminal:
```bash
curl -X POST https://api.telegram.org/8630288238:AAFOUErqnhUog9cxpDj9pprSXeTqZFCleow/setWebhook \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://pos-financial.vercel.app/api/telegram",
    "secret_token": "2482938406604911292422299322423"
  }'
```

Replace:
- `{YOUR_BOT_TOKEN}` dengan token dari BotFather
- `https://your-app-domain.com` dengan domain aplikasi Anda (harus HTTPS)
- `your_webhook_secret_here` dengan secret token

### 4. Test Bot
1. Find bot Anda di Telegram (search by name)
2. Send message dengan format:
   ```
   19 mei 2026 makan 20.000 blue
   ```
3. Bot akan respond dengan konfirmasi

## Message Format

### Pengeluaran (Expense)
```
19 mei 2026 makan 20.000 blue
19 mei 2026 bensin 50.000 cash expense
```

### Pemasukan (Income)
```
19 mei 2026 gaji 500.000 blue income
19 mei 2026 bonus 100.000 cash income
```

### Hutang (Debt)
```
19 mei 2026 pinjam 100.000 blue hutang
```

### Piutang (Receivable)
```
19 mei 2026 pinjamkan 50.000 blue piutang
```

## Format Breakdown
- **Tanggal**: 1-31
- **Bulan**: januari, februari, maret, april, mei, juni, juli, agustus, september, oktober, november, desember (atau singkat: jan, feb, mar, apr, mei, jun, jul, agu, sep, okt, nov, des)
- **Tahun**: 4 digit (2026)
- **Deskripsi**: nama transaksi (makan, bensin, gaji, dll)
- **Nominal**: angka dengan atau tanpa titik (20.000 atau 20000)
- **Rekening**: nama rekening (blue, cash, bca, mandiri, dll) - case insensitive
- **Type** (optional): income, expense (default), hutang, piutang

## Features
✅ Auto-create categories jika belum ada
✅ Auto-update account balance
✅ Support multiple accounts
✅ Support debt/receivable tracking
✅ Real-time dashboard update
✅ Error handling dengan pesan jelas

## Troubleshooting

### Bot tidak merespons
- Pastikan webhook URL sudah benar dan HTTPS
- Check bot token di `.env`
- Verify webhook dengan: `curl https://api.telegram.org/bot{TOKEN}/getWebhookInfo`

### "Rekening tidak ditemukan"
- Pastikan nama rekening sesuai dengan yang ada di aplikasi
- Nama rekening case-insensitive tapi harus ada di database

### "Format tidak valid"
- Check format message sesuai contoh
- Pastikan ada spasi antara setiap bagian
- Nominal harus angka (bisa dengan titik: 20.000 atau 20000)

## Example Workflow

1. User send: `19 mei 2026 makan 20.000 blue`
2. Bot parse message
3. Find account "blue"
4. Create/find category "makan"
5. Create transaction: EXPENSE 20.000 dari blue
6. Update blue balance: -20.000
7. Send confirmation: "✅ Pengeluaran 20000 dari blue tercatat"
8. Dashboard auto-update dengan transaksi baru
