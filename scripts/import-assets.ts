import * as fs from 'fs';
import * as path from 'path';

// Function to convert image to base64
function imageToBase64(filePath: string): string {
  try {
    const absolutePath = path.join(process.cwd(), filePath);
    const imageBuffer = fs.readFileSync(absolutePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(filePath).toLowerCase();

    let mimeType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.svg') mimeType = 'image/svg+xml';
    else if (ext === '.webp') mimeType = 'image/webp';

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`Error converting ${filePath}:`, error);
    return '';
  }
}

// Asset mapping with file paths
const assets = [
  {
    filename: 'logo-tagtik.png',
    path: 'client/src/assets/logo-tagtik.png',
    category: 'logo',
    section: 'header',
    alt: 'Tagit Logo'
  },
  {
    filename: 'hero-handshake-3d.png',
    path: 'client/src/assets/hero-handshake-3d.png',
    category: 'hero',
    section: 'hero',
    alt: 'Hero Handshake 3D'
  },
  {
    filename: 'icon-website.png',
    path: 'client/src/assets/icon-website.png',
    category: 'icon',
    section: 'services',
    alt: 'Website Icon'
  },
  {
    filename: 'icon-branding.png',
    path: 'client/src/assets/icon-branding.png',
    category: 'icon',
    section: 'services',
    alt: 'Branding Icon'
  },
  {
    filename: 'icon-content.png',
    path: 'client/src/assets/icon-content.png',
    category: 'icon',
    section: 'services',
    alt: 'Content Icon'
  },
  {
    filename: 'icon-design.png',
    path: 'client/src/assets/icon-design.png',
    category: 'icon',
    section: 'services',
    alt: 'Design Icon'
  },
  {
    filename: 'icon-marketing.png',
    path: 'client/src/assets/icon-marketing.png',
    category: 'icon',
    section: 'services',
    alt: 'Marketing Icon'
  },
  {
    filename: 'icon-social-media.png',
    path: 'client/src/assets/icon-social-media.png',
    category: 'icon',
    section: 'services',
    alt: 'Social Media Icon'
  },
  {
    filename: 'project-moujda.png',
    path: 'client/src/assets/project-moujda.png',
    category: 'project',
    section: 'projects',
    alt: 'Moujda Project'
  },
  {
    filename: 'project-blendimmo.png',
    path: 'client/src/assets/project-blendimmo.png',
    category: 'project',
    section: 'projects',
    alt: 'Blendimmo Project'
  },
  {
    filename: 'project-promotion.png',
    path: 'client/src/assets/project-promotion.png',
    category: 'project',
    section: 'projects',
    alt: 'Promotion Project'
  },
  {
    filename: 'image.png',
    path: 'client/src/assets/image.png',
    category: 'team',
    section: 'team',
    alt: 'Team Member 1'
  },
  {
    filename: 'image-copy.png',
    path: 'client/src/assets/image copy.png',
    category: 'team',
    section: 'team',
    alt: 'Team Member 2'
  },
  {
    filename: 'image-copy-2.png',
    path: 'client/src/assets/image copy copy.png',
    category: 'team',
    section: 'team',
    alt: 'Team Member 3'
  },
  {
    filename: 'robot-3d-orange.png',
    path: 'client/src/assets/robot-3d-orange.png',
    category: 'general',
    section: 'about',
    alt: 'Robot 3D Orange'
  },
  {
    filename: 'services-background.png',
    path: 'client/src/assets/services-background.png',
    category: 'background',
    section: 'services',
    alt: 'Services Background'
  }
];

// Generate SQL update statements
console.log('-- SQL statements to update media library with base64 images\n');

assets.forEach(asset => {
  const base64Data = imageToBase64(asset.path);

  if (base64Data) {
    console.log(`UPDATE media_library SET url = '${base64Data}' WHERE filename = '${asset.filename}';`);
  }
});

console.log('\n-- Update completed');
