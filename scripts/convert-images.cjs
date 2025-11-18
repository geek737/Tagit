const fs = require('fs');
const path = require('path');

// List of images to convert
const images = [
  'logo-tagtik.png',
  'hero-handshake-3d.png',
  'icon-website.png',
  'icon-branding.png',
  'icon-content.png',
  'icon-design.png',
  'icon-marketing.png',
  'icon-social-media.png',
  'project-moujda.png',
  'project-blendimmo.png',
  'project-promotion.png',
  'image.png',
  'image copy.png',
  'image copy copy.png',
  'robot-3d-orange.png',
  'services-background.png'
];

const assetsDir = path.join(__dirname, '..', 'client', 'src', 'assets');

console.log('Converting images to base64...\n');

const conversions = [];

images.forEach(filename => {
  const filePath = path.join(assetsDir, filename);

  try {
    if (fs.existsSync(filePath)) {
      const imageBuffer = fs.readFileSync(filePath);
      const base64 = imageBuffer.toString('base64');
      const ext = path.extname(filename).toLowerCase();

      let mimeType = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';

      const dataUrl = `data:${mimeType};base64,${base64}`;

      conversions.push({
        filename,
        dataUrl,
        size: imageBuffer.length
      });

      console.log(`✓ Converted: ${filename} (${(imageBuffer.length / 1024).toFixed(2)} KB)`);
    } else {
      console.log(`✗ Not found: ${filename}`);
    }
  } catch (error) {
    console.error(`✗ Error converting ${filename}:`, error.message);
  }
});

// Generate SQL statements
console.log('\n\n-- SQL UPDATE statements:\n');

conversions.forEach(({ filename, dataUrl }) => {
  const escapedUrl = dataUrl.replace(/'/g, "''");
  console.log(`UPDATE media_library SET url = '${escapedUrl}' WHERE filename = '${filename}';`);
});

// Save to file for manual execution
const sqlOutput = conversions.map(({ filename, dataUrl }) => {
  const escapedUrl = dataUrl.replace(/'/g, "''");
  return `UPDATE media_library SET url = '${escapedUrl}' WHERE filename = '${filename}';`;
}).join('\n');

fs.writeFileSync(
  path.join(__dirname, 'update-media-urls.sql'),
  sqlOutput
);

console.log('\n✓ SQL file saved to: scripts/update-media-urls.sql');
console.log(`\nTotal images converted: ${conversions.length}`);
