#!/usr/bin/env node
/**
 * PWA Icon Generator Script
 *
 * This script generates PWA icons from the source SVG.
 *
 * Requirements:
 * - Node.js 18+
 * - sharp package: npm install sharp --save-dev
 *
 * Usage:
 * node scripts/generate-icons.js
 *
 * Alternative: Use online tools like:
 * - https://realfavicongenerator.net/
 * - https://www.pwabuilder.com/imageGenerator
 */

const fs = require('fs');
const path = require('path');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SOURCE_SVG = path.join(__dirname, '../public/icons/icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

async function generateIcons() {
  let sharp;

  try {
    sharp = require('sharp');
  } catch (e) {
    console.log('Sharp not installed. Installing...');
    console.log('Run: npm install sharp --save-dev');
    console.log('\nAlternatively, use online tools:');
    console.log('- https://realfavicongenerator.net/');
    console.log('- https://www.pwabuilder.com/imageGenerator');

    // Create placeholder files
    console.log('\nCreating placeholder icons for development...');
    await createPlaceholders();
    return;
  }

  console.log('Generating PWA icons from SVG...\n');

  const svgBuffer = fs.readFileSync(SOURCE_SVG);

  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated: icon-${size}x${size}.png`);
  }

  // Generate favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '../public/favicon.png'));

  console.log('✓ Generated: favicon.png');

  // Generate Apple touch icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));

  console.log('✓ Generated: apple-touch-icon.png');

  console.log('\n✅ All icons generated successfully!');
}

async function createPlaceholders() {
  // Create minimal 1x1 transparent PNG as placeholder
  const transparentPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    fs.writeFileSync(outputPath, transparentPng);
    console.log(`✓ Created placeholder: icon-${size}x${size}.png`);
  }

  console.log('\n⚠️  Placeholder icons created (1x1 transparent).');
  console.log('For production, generate proper icons from icon.svg');
}

generateIcons().catch(console.error);
