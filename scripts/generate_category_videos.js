import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categories = [
  {
    id: 'cat_1791038823348',
    image: 'https://i.postimg.cc/cCV8zJp0/screenshot-1791019217004.png',
  },
  {
    id: 'cat_1791040926301',
    image: 'https://i.postimg.cc/nzMsmYt6/file-0000000003e482118159592126429a07.png',
  },
  {
    id: 'cat_1791040993494',
    image: 'https://i.postimg.cc/Prp7vFKw/young-beautiful-stylish-woman-wedding-dress.jpg',
  },
  {
    id: 'cat_1791041020279',
    image: 'https://i.postimg.cc/ZKq6dK2f/Glamorous-Maroon-Lehenga-Portrait.png',
  },
  {
    id: 'cat_1791041045533',
    image: 'https://i.postimg.cc/TYWYSzD3/fashion-portrait-young-hippie-woman-model-summer-sunny-day-bright-colorful-hipster-clothes-hat.jpg',
  },
  {
    id: 'cat_1791041069272',
    image: 'https://i.postimg.cc/QMPj0SxR/Featured-Image-of-summer-outfit-Ideas-for-women-576x1024.jpg',
  },
  {
    id: 'cat_1791041103747',
    image: 'https://i.postimg.cc/SN5VQMRN/371ef556ad81f7e6d1ca19e51f3f5401e044aff3-original.jpg',
  },
  {
    id: 'cat_1791041121728',
    image: 'https://i.postimg.cc/NFv9PQjs/indian-ethnic-wear-saree-photoshoot-traditional-saree-catalogue-photoshoot-17-orig.jpg',
  },
  {
    id: 'cat_1791041144724',
    image: 'https://i.postimg.cc/brZCLHdJ/Hand-Painted-Red-Organza-Saree2.jpg',
  },
  {
    id: 'cat_1791041161656',
    image: 'https://i.postimg.cc/0j7tL5Gh/ac2592-b-2.webp',
  },
  {
    id: 'cat_1791041181391',
    image: 'https://i.postimg.cc/PrRLBbx4/handloom-cotton-tant-saree-in-red-v1-suua102-1.jpg',
  },
  {
    id: 'cat_1791041200144',
    image: 'https://i.postimg.cc/fb0gxvtw/07f735262f8db36b39c1626aa2a00f4c-jpg-720x720q80.jpg',
  },
  {
    id: 'cat_1791041224436',
    image: 'https://i.postimg.cc/43BbH7wf/modefa-abaya-modest-muslim-woman-abaya-with-niqab-khimar-ecru-1236735249-1800x1800.jpg',
  },
  {
    id: 'cat_1791458017933',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
  },
];

const videosDir = path.join(__dirname, '../public/videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

const tmpDir = '/tmp/cat_images';
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

console.log('Generating 5-second cinematic fashion AI videos for all categories...');

for (const cat of categories) {
  const tmpImg = path.join(tmpDir, `${cat.id}.jpg`);
  const outMp4 = path.join(videosDir, `${cat.id}.mp4`);

  try {
    console.log(`Downloading ${cat.id}...`);
    execSync(`curl -sL "${cat.image}" -o "${tmpImg}" --max-time 15`);
    
    // Check if downloaded file is non-empty
    const stats = fs.statSync(tmpImg);
    if (stats.size < 500) {
      console.warn(`File for ${cat.id} is too small, skipping`);
      continue;
    }

    console.log(`Rendering 5s video for ${cat.id}...`);
    const cmd = `ffmpeg -y -loop 1 -i "${tmpImg}" -vf "scale=480:640:force_original_aspect_ratio=increase,crop=480:640,zoompan=z='min(zoom+0.0012,1.18)':d=150:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=480x640:fps=30" -t 5 -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${outMp4}"`;
    execSync(cmd, { stdio: 'ignore' });
    console.log(`✓ Generated ${cat.id}.mp4 (${(fs.statSync(outMp4).size / 1024).toFixed(0)} KB)`);
  } catch (err) {
    console.error(`Error processing ${cat.id}:`, err.message);
  }
}

console.log('Finished generating category videos.');
