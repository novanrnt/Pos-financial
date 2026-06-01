# Quick Commands for PWA Setup

## Build & Test

```bash
# Build the project
npm run build

# Start development server
npm run dev

# Run on specific port
npm run dev -- -p 3000
```

## Icon Generation (Choose One)

### Option 1: Using Online Tool
1. Go to: https://realfavicongenerator.net/
2. Upload your app logo
3. Download all files
4. Extract to `public/icons/`

### Option 2: Using ImageMagick (Windows)
```bash
# Install ImageMagick from: https://imagemagick.org/script/download.php#windows

# Then run these commands (replace source-icon.png with your icon):
magick convert source-icon.png -resize 192x192 public/icons/icon-192.png
magick convert source-icon.png -resize 512x512 public/icons/icon-512.png
magick convert source-icon.png -resize 192x192 public/icons/icon-192-maskable.png
magick convert source-icon.png -resize 512x512 public/icons/icon-512-maskable.png
magick convert source-icon.png -resize 180x180 public/icons/apple-touch-icon.png
```

### Option 3: Using Node.js + Sharp
```bash
# Install sharp
npm install --save-dev sharp

# Create public/icons directory
mkdir public/icons

# Create a script file: scripts/generate-icons.js
# (See PWA_SETUP_GUIDE.md for full script)

# Run it
node scripts/generate-icons.js
```

## Testing on iPhone

### Local Network Testing:
```bash
# 1. Get your local IP address
ipconfig

# 2. Start dev server
npm run dev

# 3. On iPhone Safari, visit:
http://YOUR_LOCAL_IP:3000

# 4. Tap Share → Add to Home Screen
# 5. Launch from home screen and test
```

### Production Testing:
```bash
# Build for production
npm run build

# Start production server
npm start

# Then test on iPhone with your IP
```

## Verify PWA Setup

```bash
# Check if manifest.json is accessible
curl http://localhost:3000/manifest.json

# Check if icons are accessible
curl http://localhost:3000/icons/icon-192.png

# Build and check for errors
npm run build
```

## Troubleshooting

### Icons not showing on home screen:
- Verify icons exist in `public/icons/`
- Check manifest.json paths are correct
- Clear browser cache and try again
- Restart dev server

### App not going fullscreen on iPhone:
- Verify `apple-mobile-web-app-capable` is in layout.tsx
- Check manifest.json has `"display": "fullscreen"`
- Clear Safari cache: Settings → Safari → Clear History and Website Data

### Bottom navigation overlapping home indicator:
- Verify safe-area CSS is in globals.css
- Check bottom-navigation.tsx has safe-area padding
- Test on actual iPhone (simulator may not show home indicator)

### FAB button overlapping home indicator:
- Verify transaction-form.tsx has safe-area positioning
- Check CSS variable is being applied
- Test on actual iPhone

## File Locations

```
c:\Project\Pos-financial\
├── app/
│   ├── layout.tsx                    ✅ PWA metadata added
│   └── globals.css                   ✅ Safe-area CSS added
├── components/
│   ├── bottom-navigation.tsx         ✅ Safe-area padding added
│   └── transaction-form.tsx          ✅ FAB safe-area positioning added
├── public/
│   ├── manifest.json                 ✅ Already configured
│   └── icons/                        ⏳ Need to create icon files here
├── PWA_SETUP_GUIDE.md                📖 Detailed setup guide
├── PWA_IMPLEMENTATION_COMPLETE.md    📖 Implementation summary
└── QUICK_COMMANDS.md                 📖 This file
```

## Summary

✅ **Done:**
- PWA metadata in layout.tsx
- Safe-area CSS in globals.css
- Bottom navigation safe-area padding
- FAB button safe-area positioning
- Manifest.json configured

⏳ **To Do:**
- Generate icon files in `public/icons/`
- Test on iPhone and Android

🚀 **Ready to Deploy After:**
- Icons are created
- Build succeeds (`npm run build`)
- Testing on devices is complete

---

**Need help?** See `PWA_SETUP_GUIDE.md` for detailed instructions.
