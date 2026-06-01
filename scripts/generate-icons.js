#!/usr/bin/env node

/**
 * Icon Generation Script
 * Generates PWA icons using Canvas API
 * 
 * Icons generated:
 * - icon-192.png (192x192px)
 * - icon-512.png (512x512px)
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Brand colors
const BRAND_COLOR = '#090C12';
const FOREGROUND_COLOR = '#FFFFFF';

// Icon output directory
const ICONS_DIR = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
  console.log(`✓ Created directory: ${ICONS_DIR}`);
}

/**
 * Generate icon with specified dimensions
 * @param {number} size - Icon size (192 or 512)
 * @param {string} filename - Output filename
 */
function generateIcon(size, filename) {
  try {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fill background with brand color
    ctx.fillStyle = BRAND_COLOR;
    ctx.fillRect(0, 0, size, size);

    // Draw "PF" text (POS Finance)
    ctx.fillStyle = FOREGROUND_COLOR;
    ctx.font = `bold ${Math.round(size * 0.4)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PF', size / 2, size / 2);

    // Save to file
    const buffer = canvas.toBuffer('image/png');
    const filepath = path.join(ICONS_DIR, filename);
    fs.writeFileSync(filepath, buffer);

    // Get file size
    const stats = fs.statSync(filepath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    console.log(`✓ Generated ${filename} (${size}x${size}px, ${fileSizeKB}KB)`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to generate ${filename}:`, error.message);
    return false;
  }
}

/**
 * Verify icon file
 * @param {string} filename - Icon filename
 * @param {number} expectedSize - Expected dimensions
 * @param {number} maxSizeKB - Maximum file size in KB
 */
function verifyIcon(filename, expectedSize, maxSizeKB) {
  const filepath = path.join(ICONS_DIR, filename);

  if (!fs.existsSync(filepath)) {
    console.error(`✗ File not found: ${filename}`);
    return false;
  }

  const stats = fs.statSync(filepath);
  const fileSizeKB = stats.size / 1024;

  if (fileSizeKB > maxSizeKB) {
    console.error(`✗ ${filename} exceeds size limit: ${fileSizeKB.toFixed(2)}KB > ${maxSizeKB}KB`);
    return false;
  }

  console.log(`✓ Verified ${filename} (${fileSizeKB.toFixed(2)}KB < ${maxSizeKB}KB)`);
  return true;
}

// Main execution
console.log('🎨 Generating PWA Icons...\n');

// Generate base icons
const icon192Success = generateIcon(192, 'icon-192.png');
const icon512Success = generateIcon(512, 'icon-512.png');

if (!icon192Success || !icon512Success) {
  console.error('\n✗ Icon generation failed');
  process.exit(1);
}

console.log('\n📋 Verifying icons...\n');

// Verify icons
const verify192 = verifyIcon('icon-192.png', 192, 50);
const verify512 = verifyIcon('icon-512.png', 512, 150);

if (!verify192 || !verify512) {
  console.error('\n✗ Icon verification failed');
  process.exit(1);
}

console.log('\n✅ All icons generated and verified successfully!');
console.log(`📁 Icons location: ${ICONS_DIR}`);
