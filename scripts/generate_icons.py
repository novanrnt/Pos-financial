#!/usr/bin/env python3
"""
Icon Generation Script for PWA
Generates base icons (192x192 and 512x512) using PIL
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("❌ PIL (Pillow) not found. Installing...")
    os.system(f"{sys.executable} -m pip install Pillow -q")
    from PIL import Image, ImageDraw, ImageFont

# Brand colors
BRAND_COLOR = '#090C12'
FOREGROUND_COLOR = '#FFFFFF'

# Icon output directory
ICONS_DIR = Path(__file__).parent.parent / 'public' / 'icons'
ICONS_DIR.mkdir(parents=True, exist_ok=True)

def generate_icon(size, filename):
    """Generate icon with specified dimensions"""
    try:
        # Create image with brand color background
        img = Image.new('RGB', (size, size), BRAND_COLOR)
        draw = ImageDraw.Draw(img)
        
        # Try to use a nice font, fallback to default
        try:
            font_size = int(size * 0.4)
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
        
        # Draw "PF" text (POS Finance)
        text = "PF"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x = (size - text_width) // 2
        y = (size - text_height) // 2
        
        draw.text((x, y), text, fill=FOREGROUND_COLOR, font=font)
        
        # Save to file
        filepath = ICONS_DIR / filename
        img.save(filepath, 'PNG', optimize=True)
        
        # Get file size
        file_size_kb = filepath.stat().st_size / 1024
        print(f"✓ Generated {filename} ({size}x{size}px, {file_size_kb:.2f}KB)")
        return True
    except Exception as e:
        print(f"✗ Failed to generate {filename}: {e}")
        return False

def verify_icon(filename, expected_size, max_size_kb):
    """Verify icon file"""
    filepath = ICONS_DIR / filename
    
    if not filepath.exists():
        print(f"✗ File not found: {filename}")
        return False
    
    file_size_kb = filepath.stat().st_size / 1024
    
    if file_size_kb > max_size_kb:
        print(f"✗ {filename} exceeds size limit: {file_size_kb:.2f}KB > {max_size_kb}KB")
        return False
    
    # Verify dimensions
    try:
        img = Image.open(filepath)
        if img.size != (expected_size, expected_size):
            print(f"✗ {filename} has wrong dimensions: {img.size} != ({expected_size}x{expected_size})")
            return False
    except Exception as e:
        print(f"✗ Failed to verify {filename}: {e}")
        return False
    
    print(f"✓ Verified {filename} ({file_size_kb:.2f}KB < {max_size_kb}KB, {expected_size}x{expected_size}px)")
    return True

# Main execution
print("🎨 Generating PWA Icons...\n")

# Generate base icons
icon192_success = generate_icon(192, 'icon-192.png')
icon512_success = generate_icon(512, 'icon-512.png')

if not icon192_success or not icon512_success:
    print("\n✗ Icon generation failed")
    sys.exit(1)

print("\n📋 Verifying icons...\n")

# Verify icons
verify192 = verify_icon('icon-192.png', 192, 50)
verify512 = verify_icon('icon-512.png', 512, 150)

if not verify192 or not verify512:
    print("\n✗ Icon verification failed")
    sys.exit(1)

print(f"\n✅ All icons generated and verified successfully!")
print(f"📁 Icons location: {ICONS_DIR}")
