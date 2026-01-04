#!/usr/bin/env node

import { execSync } from 'child_process';
import { mkdirSync, existsSync, rmSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const svgPath = join(projectRoot, 'src/renderer/assets/logo.svg');
const buildDir = join(projectRoot, 'build');
const iconsetDir = join(buildDir, 'icon.iconset');
const icnsPath = join(buildDir, 'icon.icns');

const sizes = [16, 32, 64, 128, 256, 512, 1024];

async function generateIcons() {
  console.log('🎨 Generating macOS icons from SVG...');

  if (!existsSync(buildDir)) {
    mkdirSync(buildDir, { recursive: true });
  }

  if (existsSync(iconsetDir)) {
    rmSync(iconsetDir, { recursive: true });
  }
  mkdirSync(iconsetDir);

  const tempPng = join(buildDir, 'temp_1024.png');
  
  try {
    execSync(`qlmanage -t -s 1024 -o "${buildDir}" "${svgPath}"`, { stdio: 'pipe' });
    const generatedPng = join(buildDir, 'logo.svg.png');
    if (existsSync(generatedPng)) {
      copyFileSync(generatedPng, tempPng);
      rmSync(generatedPng);
    }
  } catch (e) {
    try {
      execSync(`rsvg-convert -w 1024 -h 1024 "${svgPath}" -o "${tempPng}"`, { stdio: 'pipe' });
    } catch (e2) {
      console.log('⚠️  Could not find qlmanage or rsvg-convert. Creating placeholder PNG...');
      execSync(`sips -s format png --resampleWidth 1024 "${svgPath}" --out "${tempPng}" 2>/dev/null || echo "SVG conversion failed"`, { stdio: 'pipe' });
      
      if (!existsSync(tempPng)) {
        console.log('📦 Please install rsvg-convert: brew install librsvg');
        console.log('   Or manually create a 1024x1024 PNG at: build/temp_1024.png');
        process.exit(1);
      }
    }
  }

  if (!existsSync(tempPng)) {
    console.error('❌ Failed to generate PNG from SVG');
    process.exit(1);
  }

  console.log('📐 Generating icon sizes...');
  
  for (const size of sizes) {
    execSync(`sips -z ${size} ${size} "${tempPng}" --out "${join(iconsetDir, `icon_${size}x${size}.png`)}"`, { stdio: 'pipe' });
    
    if (size <= 512) {
      execSync(`sips -z ${size * 2} ${size * 2} "${tempPng}" --out "${join(iconsetDir, `icon_${size}x${size}@2x.png`)}"`, { stdio: 'pipe' });
    }
  }

  console.log('🔨 Creating .icns file...');
  execSync(`iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`, { stdio: 'inherit' });

  rmSync(iconsetDir, { recursive: true });
  rmSync(tempPng);

  console.log(`✅ Icon generated: ${icnsPath}`);
  
  const distAssetsDir = join(projectRoot, 'dist', 'assets');
  if (!existsSync(distAssetsDir)) {
    mkdirSync(distAssetsDir, { recursive: true });
  }
  copyFileSync(svgPath, join(distAssetsDir, 'logo.svg'));
  console.log('✅ Copied logo.svg to dist/assets/');
}

generateIcons().catch(console.error);
