#!/usr/bin/env python3
"""
Generate maskable icons from base icons.
Maskable icons have a safe zone (40% padding) for Android adaptive icons.
"""

from PIL import Image, ImageDraw
import os

def create_maskable_icon(input_path, output_path, size, brand_color="#090C12"):
    """
    Create a maskable icon with safe zone padding.
    
    Args:
        input_path: Path to input icon
        output_path: Path to output maskable icon
        size: Icon size (192 or 512)
        brand_color: Brand color hex code
    """
    # Open the base icon
    img = Image.open(input_path)
    
    # Create a new image with the same size
    maskable = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    
    # Calculate safe zone (40% padding from edge)
    # Safe zone means the important content should be in the center 60% of the icon
    safe_zone_padding = int(size * 0.2)  # 20% on each side = 40% total padding
    safe_zone_size = size - (safe_zone_padding * 2)
    
    # Resize the base icon to fit in the safe zone
    resized = img.resize((safe_zone_size, safe_zone_size), Image.Resampling.LANCZOS)
    
    # Paste the resized icon in the center
    maskable.paste(resized, (safe_zone_padding, safe_zone_padding), resized if resized.mode == 'RGBA' else None)
    
    # Save the maskable icon
    maskable.save(output_path, 'PNG', optimize=True)
    
    # Get file size
    file_size = os.path.getsize(output_path) / 1024  # KB
    
    print(f"✓ Generated {os.path.basename(output_path)} ({file_size:.2f}KB, {size}x{size}px)")
    
    return file_size

def main():
    icons_dir = "public/icons"
    
    print("📋 Generating maskable icons...\n")
    
    # Generate 192x192 maskable icon
    try:
        size_192 = create_maskable_icon(
            os.path.join(icons_dir, "icon-192.png"),
            os.path.join(icons_dir, "icon-192-maskable.png"),
            192
        )
        assert size_192 < 50, f"icon-192-maskable.png is {size_192:.2f}KB, should be < 50KB"
    except Exception as e:
        print(f"✗ Failed to generate icon-192-maskable.png: {e}")
        return False
    
    # Generate 512x512 maskable icon
    try:
        size_512 = create_maskable_icon(
            os.path.join(icons_dir, "icon-512.png"),
            os.path.join(icons_dir, "icon-512-maskable.png"),
            512
        )
        assert size_512 < 150, f"icon-512-maskable.png is {size_512:.2f}KB, should be < 150KB"
    except Exception as e:
        print(f"✗ Failed to generate icon-512-maskable.png: {e}")
        return False
    
    print("\n✅ All maskable icons generated successfully!")
    print(f"📁 Icons location: {os.path.abspath(icons_dir)}")
    
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
