const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#7c3aed" rx="20"/>
  <text y=".85em" x="5" font-size="80" font-family="Arial">🦉</text>
</svg>
`;

async function generateIcons() {
  console.log('Generating PWA icons...');
  
  const buffer = Buffer.from(svgIcon);

  // 192x192
  await sharp(buffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconDir, 'icon-192.png'));
  console.log('✓ Generated icon-192.png');

  // 512x512
  await sharp(buffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconDir, 'icon-512.png'));
  console.log('✓ Generated icon-512.png');

  // Maskable 512x512 (smaller content area)
  const maskableSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#7c3aed"/>
    <g transform="scale(0.8) translate(12.5, 12.5)">
      <text y=".85em" x="5" font-size="80" font-family="Arial">🦉</text>
    </g>
  </svg>
  `;
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconDir, 'icon-512-maskable.png'));
  console.log('✓ Generated icon-512-maskable.png');

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
