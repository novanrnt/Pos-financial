#!/usr/bin/env python3
"""
Verify manifest.json configuration against acceptance criteria.
"""

import json
import os

def verify_manifest():
    """Verify manifest.json configuration."""
    manifest_path = "public/manifest.json"
    
    print("📋 Verifying manifest.json...\n")
    
    # Check if file exists
    if not os.path.exists(manifest_path):
        print(f"✗ File {manifest_path} not found")
        return False
    
    # Load and parse JSON
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
        print("✓ manifest.json is valid JSON")
    except json.JSONDecodeError as e:
        print(f"✗ manifest.json is not valid JSON: {e}")
        return False
    
    # Verify required fields
    checks = [
        ("name", "POS Finance - Personal Finance & Bisnis Mobil"),
        ("short_name", "POS Finance"),
        ("description", "Dashboard keuangan pribadi dan tracking bisnis mobil dengan fitur lengkap"),
        ("start_url", "/dashboard"),
        ("scope", "/"),
        ("display", "fullscreen"),
        ("orientation", "portrait-primary"),
        ("theme_color", "#090C12"),
        ("background_color", "#090C12"),
    ]
    
    all_ok = True
    for field, expected_value in checks:
        if field not in manifest:
            print(f"✗ Field '{field}' missing")
            all_ok = False
        elif manifest[field] != expected_value:
            print(f"✗ Field '{field}' has value '{manifest[field]}', expected '{expected_value}'")
            all_ok = False
        else:
            print(f"✓ Field '{field}' = '{expected_value}'")
    
    # Verify categories
    if "categories" not in manifest:
        print("✗ Field 'categories' missing")
        all_ok = False
    elif manifest["categories"] != ["finance", "productivity"]:
        print(f"✗ Field 'categories' has value {manifest['categories']}, expected ['finance', 'productivity']")
        all_ok = False
    else:
        print(f"✓ Field 'categories' = {manifest['categories']}")
    
    # Verify icons
    if "icons" not in manifest:
        print("✗ Field 'icons' missing")
        all_ok = False
    else:
        icons = manifest["icons"]
        expected_icons = [
            ("icon-192.png", "192x192", "any"),
            ("icon-512.png", "512x512", "any"),
            ("icon-192-maskable.png", "192x192", "maskable"),
            ("icon-512-maskable.png", "512x512", "maskable"),
        ]
        
        if len(icons) < len(expected_icons):
            print(f"✗ Field 'icons' has {len(icons)} entries, expected at least {len(expected_icons)}")
            all_ok = False
        else:
            print(f"✓ Field 'icons' has {len(icons)} entries")
            
            for expected_src, expected_size, expected_purpose in expected_icons:
                found = False
                for icon in icons:
                    if icon.get("src") == f"/icons/{expected_src}":
                        if icon.get("sizes") == expected_size and icon.get("purpose") == expected_purpose:
                            print(f"  ✓ Icon {expected_src} ({expected_size}, {expected_purpose})")
                            found = True
                        else:
                            print(f"  ✗ Icon {expected_src} has incorrect sizes or purpose")
                            all_ok = False
                            found = True
                        break
                
                if not found:
                    print(f"  ✗ Icon {expected_src} not found")
                    all_ok = False
    
    # Verify shortcuts
    if "shortcuts" not in manifest:
        print("✗ Field 'shortcuts' missing")
        all_ok = False
    else:
        shortcuts = manifest["shortcuts"]
        if len(shortcuts) < 2:
            print(f"✗ Field 'shortcuts' has {len(shortcuts)} entries, expected at least 2")
            all_ok = False
        else:
            print(f"✓ Field 'shortcuts' has {len(shortcuts)} entries")
            
            # Check first shortcut
            if shortcuts[0].get("name") == "Tambah Transaksi":
                print(f"  ✓ Shortcut 1: Tambah Transaksi")
            else:
                print(f"  ✗ Shortcut 1 name incorrect")
                all_ok = False
            
            # Check second shortcut
            if shortcuts[1].get("name") == "Lihat Tabungan":
                print(f"  ✓ Shortcut 2: Lihat Tabungan")
            else:
                print(f"  ✗ Shortcut 2 name incorrect")
                all_ok = False
    
    # Verify screenshots
    if "screenshots" not in manifest:
        print("✗ Field 'screenshots' missing")
        all_ok = False
    else:
        screenshots = manifest["screenshots"]
        if len(screenshots) < 2:
            print(f"✗ Field 'screenshots' has {len(screenshots)} entries, expected at least 2")
            all_ok = False
        else:
            print(f"✓ Field 'screenshots' has {len(screenshots)} entries")
            
            # Check narrow screenshot
            narrow_found = False
            for screenshot in screenshots:
                if screenshot.get("sizes") == "540x720" and screenshot.get("form_factor") == "narrow":
                    print(f"  ✓ Screenshot: 540x720 (narrow)")
                    narrow_found = True
                    break
            
            if not narrow_found:
                print(f"  ✗ Narrow screenshot (540x720) not found")
                all_ok = False
            
            # Check wide screenshot
            wide_found = False
            for screenshot in screenshots:
                if screenshot.get("sizes") == "1280x720" and screenshot.get("form_factor") == "wide":
                    print(f"  ✓ Screenshot: 1280x720 (wide)")
                    wide_found = True
                    break
            
            if not wide_found:
                print(f"  ✗ Wide screenshot (1280x720) not found")
                all_ok = False
    
    # Verify icon files exist
    print("\n📁 Verifying icon files exist...")
    icon_files = [
        "icon-192.png",
        "icon-512.png",
        "icon-192-maskable.png",
        "icon-512-maskable.png",
        "apple-touch-icon.png",
        "shortcut-transaksi.png",
        "shortcut-savings.png",
        "screenshot-540.png",
        "screenshot-1280.png",
    ]
    
    for icon_file in icon_files:
        icon_path = os.path.join("public/icons", icon_file)
        if os.path.exists(icon_path):
            print(f"✓ {icon_file} exists")
        else:
            print(f"✗ {icon_file} not found")
            all_ok = False
    
    print()
    if all_ok:
        print("✅ manifest.json verification passed!")
    else:
        print("❌ manifest.json verification failed!")
    
    return all_ok

if __name__ == "__main__":
    success = verify_manifest()
    exit(0 if success else 1)
