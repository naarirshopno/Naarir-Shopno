import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import https from 'https';
import http from 'http';

const outputDir = path.resolve('public/videos/products');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Download helper
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: HTTP ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    });
    req.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Product list with their first image (where model is wearing clothes)
const productsToGenerate = [
  // Firestore real products
  { id: 'ns-0081', image: 'https://shopbasebd.com/public/uploads/shop/products/1788251698_L_4.jpeg' },
  { id: 'ns-0424', image: 'https://shopbasebd.com/public/uploads/shop/products/1719994211_L_3.jpg' },
  { id: 'ns-1903', image: 'https://shopbasebd.com/public/uploads/shop/products/1777549638_L_4.jpg' },
  { id: 'ns-2845', image: 'https://shopbasebd.com/public/uploads/shop/products/1719995352_L_2.jpg' },
  { id: 'ns-3189', image: 'https://shopbasebd.com/public/uploads/shop/products/1777548305_L_2.jpg' },
  { id: 'ns-3594', image: 'https://shopbasebd.com/public/uploads/shop/products/1741801575_L_1.jpg' },
  { id: 'ns-4281', image: 'https://shopbasebd.com/public/uploads/shop/products/1789042392_L_1.jpeg' },
  { id: 'ns-4656', image: 'https://shopbasebd.com/public/uploads/shop/products/1746281247_L_2.jpg' },
  { id: 'ns-6126', image: 'https://shopbasebd.com/public/uploads/shop/products/1790250943_L_1.jpeg' },
  { id: 'ns-7069', image: 'https://shopbasebd.com/public/uploads/shop/products/1791295955_L_1.png' },
  { id: 'ns-8371', image: 'https://shopbasebd.com/public/uploads/shop/products/1789751286_L_5.jpeg' },
  { id: 'ns-8689', image: 'https://shopbasebd.com/public/uploads/shop/products/1788096032_L_2.jpeg' },
  { id: 'ns-9018', image: 'https://shopbasebd.com/public/uploads/shop/products/1741801712_L_1.jpg' },
  { id: 'ns-9834', image: 'https://shopbasebd.com/public/uploads/shop/products/1778319333_L_2.jpeg' },

  // Sample demo products
  { id: 'ns-01', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80' },
  { id: 'ns-02', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80' },
  { id: 'ns-03', image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=80' },
  { id: 'ns-04', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80' },
  { id: 'ns-05', image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80' },
  { id: 'ns-06', image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=800&q=80' },
  { id: 'ns-07', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80' },
  { id: 'ns-08', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80' },
  { id: 'ns-09', image: 'https://images.unsplash.com/photo-1610030469839-86c52643a6fb?auto=format&fit=crop&w=800&q=80' },
  { id: 'ns-10', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80' },
];

async function main() {
  console.log(`Starting generation of ${productsToGenerate.length} product model videos...`);
  const tempDir = path.resolve('public/videos/temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  for (const item of productsToGenerate) {
    const outVideo = path.join(outputDir, `prod_${item.id}.mp4`);
    const tempImg = path.join(tempDir, `${item.id}.jpg`);

    try {
      console.log(`Processing ${item.id}...`);
      await downloadFile(item.image, tempImg);

      // FFmpeg command: 5-second cinematic zoom and pan focused on the model wearing the dress
      const ffmpegCmd = `ffmpeg -y -loop 1 -i "${tempImg}" -vf "zoompan=z='min(zoom+0.0014,1.20)':x='iw/2-(iw/zoom/2)':y='ih/3-(ih/zoom/3)':d=150:s=480x640:fps=30" -c:v libx264 -t 5 -pix_fmt yuv420p -movflags +faststart "${outVideo}"`;
      execSync(ffmpegCmd, { stdio: 'ignore' });
      console.log(`Created: ${outVideo} (${(fs.statSync(outVideo).size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`Error on ${item.id}:`, err.message);
    }
  }

  // Clean temp
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {}

  console.log('All product model videos generated successfully!');
}

main();
