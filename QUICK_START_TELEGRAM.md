# Panduan Cepat: Integrasi Telegram

## 🚀 Mulai dalam 5 Menit

### Step 1: Buat Bot (2 menit)
1. Buka Telegram → Cari `@BotFather`
2. Kirim `/newbot` → Ikuti instruksi
3. **Salin Bot Token** yang diberikan

### Step 2: Setup Environment (1 menit)
Tambahkan ke `.env`:
```env
TELEGRAM_BOT_TOKEN="your_token_here"
TELEGRAM_WEBHOOK_SECRET="random_secret_12345"
```

### Step 3: Set Webhook (2 menit)
Pergi ke Settings → Telegram di aplikasi, isi form:
- **Bot Token**: Token dari BotFather
- **Webhook URL**: Domain aplikasi Anda + `/api/telegram` (HTTPS)
- **Secret Token**: Secret yang sama di `.env`

Klik **Set Webhook** → Tunggu sukses ✅

## 💬 Format Input

### Pengeluaran 📉
```
19 mei 2026 makan 20.000 blue
```

### Pemasukan 📈
```
19 mei 2026 gaji 500.000 blue income
```

### Hutang 💳
```
19 mei 2026 pinjam 100.000 blue hutang
```

### Piutang 💰
```
19 mei 2026 pinjamkan 50.000 blue piutang
```

## 🤖 Perintah Bot

| Perintah | Fungsi |
|----------|--------|
| `/start` | Mulai & cek setup |
| `/help` | Lihat bantuan lengkap |
| `/accounts` | Lihat daftar akun |

## ✨ Fitur Utama

✅ Input transaksi langsung dari Telegram  
✅ Kategori otomatis dibuat  
✅ Saldo akun otomatis update  
✅ Support hutang/piutang  
✅ Real-time ke dashboard  

## ⚡ Tips

### Format Nominal Fleksibel
```
20.000 = 20000 (kedua valid)
```

### Nama Bulan Singkat
```
jan, feb, mar, apr, mei, jun, jul, agu, sep, okt, nov, des
```

### Transaksi Masa Lalu
```
18 mei 2026 makan 30.000 cash
```

### Akun Case-Insensitive
```
"blue", "BLUE", "Blue" (semua cocok)
```

## 🔧 Troubleshooting

### Bot tidak merespons?
1. Periksa bot token di `.env`
2. Verifikasi webhook di Settings → Telegram
3. Coba kirim `/start`

### "Rekening tidak ditemukan"?
Kirim `/accounts` untuk cek nama rekening yang benar

### "Format tidak valid"?
Kirim `/help` untuk lihat contoh format

---

## 📚 Dokumentasi Lengkap

Lihat [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md) untuk dokumentasi komprehensif
