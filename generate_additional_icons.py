#!/usr/bin/env python3
"""
Generate additional icons for PWA iOS:
- apple-touch-icon (180x180px)
- shortcut-transaksi (192x192px)
- shortcut-savings (192x192px)
- screenshot-540 (540x720px)
- screenshot-1280 (1280x720px)
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_apple_touch_icon(input_path, output_path, size=180, brand_color="#090C12"):
    """Create apple-touch-icon from base icon."""
    img = Image.open(input_path)
    
    # Resize to target size
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    
    # Convert to RGB (apple-touch-icon should be RGB, not RGBA)
    if resized.mode == 'RGBA':
        rgb_img = Image.new('RGB', resized.size, (9, 12, 18))  # Brand color background
        rgb_img.paste(resized, mask=resized.split()[3] if len(resized.split()) == 4 else None)
        resized = rgb_img
    
    resized.save(output_path, 'PNG', optimize=True)
    file_size = os.path.getsize(output_path) / 1024
    print(f"✓ Generated {os.path.basename(output_path)} ({file_size:.2f}KB, {size}x{size}px)")
    return file_size

def create_shortcut_icon(output_path, size=192, icon_type="transaksi"):
    """Create shortcut icon with visual distinction."""
    # Create a new image with brand color background
    img = Image.new('RGB', (size, size), (9, 12, 18))  # Brand color #090C12
    draw = ImageDraw.Draw(img)
    
    # Add visual distinction based on icon type
    if icon_type == "transaksi":
        # Draw transaction icon (arrow up/down)
        center_x, center_y = size // 2, size // 2
        radius = size // 4
        
        # Draw circle background
        draw.ellipse(
            [center_x - radius, center_y - radius, center_x + radius, center_y + radius],
            fill=(241, 243, 247),  # Light color
            outline=(241, 243, 247)
        )
        
        # Draw arrow (simplified)
        arrow_size = radius // 2
        # Up arrow
        draw.polygon(
            [
                (center_x, center_y - arrow_size),
                (center_x - arrow_size // 2, center_y),
                (center_x + arrow_size // 2, center_y)
            ],
            fill=(9, 12, 18)  # Brand color
        )
        # Down arrow
        draw.polygon(
            [
                (center_x, center_y + arrow_size),
                (center_x - arrow_size // 2, center_y),
                (center_x + arrow_size // 2, center_y)
            ],
            fill=(9, 12, 18)  # Brand color
        )
        
    elif icon_type == "savings":
        # Draw savings icon (piggy bank / coin)
        center_x, center_y = size // 2, size // 2
        radius = size // 4
        
        # Draw circle background
        draw.ellipse(
            [center_x - radius, center_y - radius, center_x + radius, center_y + radius],
            fill=(241, 243, 247),  # Light color
            outline=(241, 243, 247)
        )
        
        # Draw coin/circle inside
        coin_radius = radius // 2
        draw.ellipse(
            [center_x - coin_radius, center_y - coin_radius, center_x + coin_radius, center_y + coin_radius],
            fill=(9, 12, 18),  # Brand color
            outline=(9, 12, 18)
        )
        
        # Draw dollar sign or S
        draw.text(
            (center_x - 5, center_y - 8),
            "$",
            fill=(241, 243, 247),
            font=None
        )
    
    img.save(output_path, 'PNG', optimize=True)
    file_size = os.path.getsize(output_path) / 1024
    print(f"✓ Generated {os.path.basename(output_path)} ({file_size:.2f}KB, {size}x{size}px)")
    return file_size

def create_screenshot(output_path, width=540, height=720):
    """Create a screenshot mockup."""
    # Create image with brand color background
    img = Image.new('RGB', (width, height), (9, 12, 18))  # Brand color #090C12
    draw = ImageDraw.Draw(img)
    
    # Add some visual elements to simulate app UI
    # Status bar area
    draw.rectangle([0, 0, width, 40], fill=(20, 25, 35))
    
    # Header area
    draw.rectangle([0, 40, width, 100], fill=(20, 25, 35))
    draw.text((20, 50), "POS Finance", fill=(241, 243, 247), font=None)
    
    # Content area with some cards
    card_height = 80
    card_y = 120
    
    for i in range(3):
        y = card_y + (i * (card_height + 20))
        if y + card_height < height - 100:  # Leave space for bottom nav
            # Card background
            draw.rectangle([20, y, width - 20, y + card_height], fill=(30, 35, 45), outline=(50, 55, 65))
            # Card text
            draw.text((30, y + 10), f"Item {i + 1}", fill=(241, 243, 247), font=None)
            draw.text((30, y + 40), "Rp 1.000.000", fill=(100, 200, 100), font=None)
    
    # Bottom navigation area
    nav_height = 80
    nav_y = height - nav_height
    draw.rectangle([0, nav_y, width, height], fill=(20, 25, 35), outline=(50, 55, 65))
    
    # Navigation items
    nav_items = ["Home", "Stats", "Wallet", "Business", "Profile"]
    item_width = width // len(nav_items)
    for i, item in enumerate(nav_items):
        x = i * item_width + item_width // 2 - 20
        draw.text((x, nav_y + 30), item, fill=(241, 243, 247), font=None)
    
    img.save(output_path, 'PNG', optimize=True)
    file_size = os.path.getsize(output_path) / 1024
    print(f"✓ Generated {os.path.basename(output_path)} ({file_size:.2f}KB, {width}x{height}px)")
    return file_size

def main():
    icons_dir = "public/icons"
    
    print("📋 Generating additional icons...\n")
    
    # Generate apple-touch-icon
    try:
        size = create_apple_touch_icon(
            os.path.join(icons_dir, "icon-192.png"),
            os.path.join(icons_dir, "apple-touch-icon.png"),
            180
        )
        assert size < 50, f"apple-touch-icon.png is {size:.2f}KB, should be < 50KB"
    except Exception as e:
        print(f"✗ Failed to generate apple-touch-icon.png: {e}")
        return False
    
    # Generate shortcut icons
    try:
        size = create_shortcut_icon(
            os.path.join(icons_dir, "shortcut-transaksi.png"),
            192,
            "transaksi"
        )
        assert size < 30, f"shortcut-transaksi.png is {size:.2f}KB, should be < 30KB"
    except Exception as e:
        print(f"✗ Failed to generate shortcut-transaksi.png: {e}")
        return False
    
    try:
        size = create_shortcut_icon(
            os.path.join(icons_dir, "shortcut-savings.png"),
            192,
            "savings"
        )
        assert size < 30, f"shortcut-savings.png is {size:.2f}KB, should be < 30KB"
    except Exception as e:
        print(f"✗ Failed to generate shortcut-savings.png: {e}")
        return False
    
    # Generate screenshots
    try:
        size = create_screenshot(
            os.path.join(icons_dir, "screenshot-540.png"),
            540,
            720
        )
        assert size < 200, f"screenshot-540.png is {size:.2f}KB, should be < 200KB"
    except Exception as e:
        print(f"✗ Failed to generate screenshot-540.png: {e}")
        return False
    
    try:
        size = create_screenshot(
            os.path.join(icons_dir, "screenshot-1280.png"),
            1280,
            720
        )
        assert size < 200, f"screenshot-1280.png is {size:.2f}KB, should be < 200KB"
    except Exception as e:
        print(f"✗ Failed to generate screenshot-1280.png: {e}")
        return False
    
    print("\n✅ All additional icons generated successfully!")
    print(f"📁 Icons location: {os.path.abspath(icons_dir)}")
    
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
