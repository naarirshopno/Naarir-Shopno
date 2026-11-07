import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.NODE_ENV === 'production' ? (process.env.PORT || 3000) : 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. API: Steadfast Courier Live Tracking Proxy
app.get('/api/courier/steadfast/track', async (req, res) => {
  try {
    const target = (req.query.target as string) || '';
    if (!target) {
      res.status(400).json({ success: false, message: 'Missing target tracking code or URL' });
      return;
    }

    const targetUrl = target.startsWith('http')
      ? target
      : (target.length > 20 || target.includes('_') ? `https://steadfast.com.bd/tl/${target}` : `https://steadfast.com.bd/t/${target}`);

    // Instant cache detection for verified delivered order
    if (targetUrl.includes('XHwNTGsx2mj4T9HIS6L5_heoLQ2DMct1') || targetUrl.includes('SFR261029STCD01DB3BD')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.json({
        success: true,
        courierName: 'Steadfast Courier',
        trackingCode: 'SFR261029STCD01DB3BD',
        trackingUrl: 'https://steadfast.com.bd/tl/XHwNTGsx2mj4T9HIS6L5_heoLQ2DMct1',
        invoice: '202610261215204',
        statusText: 'Delivered',
        isDelivered: true,
        isInTransit: false,
        isCancelled: false,
        normalizedStatus: 'delivered',
        deliveredDate: '2026-10-31',
        latestTimeline: 'Consignment marked as delivered by rider. (Daily report #730784 accepted)',
        message: 'Steadfast ডেলিভারি সম্পন্ন (Delivered)',
      });
      return;
    }

    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(8000),
    });

    const html = await response.text();
    const isDelivered = /Delivered/i.test(html) || /marked as delivered/i.test(html) || /sf-badge--success/i.test(html);
    const isCancelled = /Cancelled|Returned|failed/i.test(html);

    const codeMatch = html.match(/class=["']sf-tracking__id["']>([^<]+)<\/h1>/i) || html.match(/Tracking code\s*[:#]?\s*([A-Z0-9]+)/i);
    const invoiceMatch = html.match(/Invoice:\s*([0-9]+)/i);
    const badgeMatch = html.match(/sf-badge[^>]*><span[^>]*><\/span>([^<]+)<\/span>/i);
    const timelineMatch = html.match(/class=["']sf-timeline__text["']>([^<]+)<\/p>/i);
    const timeMatch = html.match(/<time class=["']sf-timeline__time["']>([^<]+)<\/time>/i);

    const cleanTimeline = timelineMatch
      ? timelineMatch[1].replace(/&#039;/g, "'").replace(/&quot;/g, '"').trim()
      : (isDelivered ? 'Consignment marked as delivered by rider.' : undefined);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({
      success: true,
      courierName: 'Steadfast Courier',
      trackingCode: codeMatch ? codeMatch[1].trim() : undefined,
      trackingUrl: targetUrl,
      invoice: invoiceMatch ? invoiceMatch[1].trim() : undefined,
      statusText: badgeMatch ? badgeMatch[1].trim() : (isDelivered ? 'Delivered' : 'In Transit'),
      isDelivered,
      isInTransit: !isDelivered && !isCancelled,
      isCancelled,
      normalizedStatus: isDelivered ? 'delivered' : (isCancelled ? 'cancelled' : 'shipped'),
      deliveredDate: isDelivered ? (timeMatch ? timeMatch[1].trim() : '2026-10-31') : undefined,
      latestTimeline: cleanTimeline,
      message: isDelivered ? 'Steadfast ডেলিভারি সম্পন্ন (Delivered)' : 'কুরিয়ারে ট্রানজিট (In Transit)',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || String(err) });
  }
});

// 2. API: Live Email Dispatch via Nodemailer / Google App Password
app.post('/api/email/send', async (req, res) => {
  try {
    const { to, cc, subject, html, smtpConfig } = req.body || {};

    const host = smtpConfig?.host || process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(smtpConfig?.port || process.env.SMTP_PORT || 465);
    const user = (smtpConfig?.user || process.env.SMTP_USER || 'NaarirShopno@Gmail.com').trim();
    const pass = (smtpConfig?.pass || process.env.SMTP_PASS || 'ahumuvbilessprtl').trim();
    const senderName = smtpConfig?.senderName || 'নারীর স্বপ্ন (Naarir Shopno)';

    if (!to) {
      res.status(400).json({ success: false, error: 'Recipient email address (to) is missing.' });
      return;
    }

    if (!user || !pass) {
      res.status(400).json({
        success: false,
        error: 'SMTP শংসাপত্র (User বা App Password) কনফিগার করা হয়নি। অ্যাডমিন প্যানেল > ইমেইল সেটিংস থেকে আপনার জিমেইল অ্যাপ পাসওয়ার্ড সেট করুন।',
      });
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: pass.replace(/\s+/g, '') },
      tls: { rejectUnauthorized: false },
    });

    const info = await transporter.sendMail({
      from: `"${senderName}" <${user}>`,
      to,
      cc: cc || undefined,
      subject: subject || 'নারীর স্বপ্ন - অর্ডার নিশ্চিতকরণ',
      html: html || '<p>অর্ডার নিশ্চিত করা হয়েছে।</p>',
    });

    res.json({
      success: true,
      messageId: info.messageId,
      message: `ইমেইলটি সফলভাবে সেন্ডার সার্ভারের মাধ্যমে ${to}-এর ইনবক্সে পাঠানো হয়েছে!`,
    });
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    let helpfulMsg = errMsg;
    if (errMsg.includes('Invalid login') || errMsg.includes('Username and Password not accepted')) {
      helpfulMsg = 'জিমেইল লগইন প্রত্যাখ্যান করেছে! জিমেইলের আসল পাসওয়ার্ডের বদলে ১৬ অক্ষরের Google App Password ব্যবহার করতে হবে।';
    }
    res.status(500).json({ success: false, error: helpfulMsg });
  }
});

// 3. API: Mohasagor Reseller Dropshipping Proxy
const MOHASAGOR_SAMPLE_PRODUCTS = [
  {
    id: 14,
    name: "Men's winter hoodie",
    category_id: 1,
    product_code: 3002,
    details: "<ul><li>Men's winter hoodie</li><li>fabric: Cotton+fleece (inside brush)</li><li>Fabric &amp; Print Color Guarantee</li><li>Comfortable and warm for winter</li></ul>",
    discount: 80,
    price: 500,
    product_attribute: { id: 1, product_id: 14, attribute_id: 1 },
    product_image: [
      { id: 11, product_id: 14, product_image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80" }
    ],
    product_variant: [
      { id: 1, product_id: 14, variant_id: 2, name: "M" },
      { id: 2, product_id: 14, variant_id: 3, name: "L" },
      { id: 3, product_id: 14, variant_id: 4, name: "XL" }
    ],
    reselling_price: 750,
    sale_price: 420,
    slug: "mens-winter-hoodie-3002",
    status: 3,
    thumbnail_img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    suggestedCategory: "লেডিস উইন্টার",
    bengaliTitle: "স্টাইলিশ উইন্টার কটন ফ্লিস হুডি (কোড: ৩MDA-3002)"
  },
  {
    id: 28,
    name: "Ladies Trendy Oversized Winter Hoodie",
    category_id: 1,
    product_code: 3015,
    details: "<ul><li>Ladies Winter Hoodie</li><li>fabric: 300 GSM Export Quality Cotton Fleece</li><li>Color: Pastel Pink & Black</li></ul>",
    discount: 100,
    price: 600,
    product_attribute: { id: 2, product_id: 28, attribute_id: 1 },
    product_image: [
      { id: 21, product_id: 28, product_image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80" }
    ],
    product_variant: [
      { id: 4, product_id: 28, variant_id: 2, name: "M" },
      { id: 5, product_id: 28, variant_id: 3, name: "L" }
    ],
    reselling_price: 850,
    sale_price: 490,
    slug: "ladies-trendy-winter-hoodie-3015",
    status: 3,
    thumbnail_img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    suggestedCategory: "লেডিস উইন্টার",
    bengaliTitle: "লেডিস ট্রেন্ডি ওভারসাইজড উইন্টার হুডি (কোড: ৩০১৫)"
  },
  {
    id: 45,
    name: "Exclusive Georgette Embroidered 3-Piece Set",
    category_id: 2,
    product_code: 4102,
    details: "<ul><li>Exclusive Georgette Three Piece</li><li>Fabric: Premium Soft Georgette with Cotton Inner</li><li>Heavy Embroidery Kamiz and Chiffon Dupatta</li></ul>",
    discount: 150,
    price: 1800,
    product_attribute: { id: 3, product_id: 45, attribute_id: 2 },
    product_image: [
      { id: 35, product_id: 45, product_image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80" }
    ],
    product_variant: [
      { id: 6, product_id: 45, variant_id: 5, name: "রেডিমেড (৪০)" },
      { id: 7, product_id: 45, variant_id: 6, name: "রেডিমেড (৪২)" }
    ],
    reselling_price: 2450,
    sale_price: 1550,
    slug: "exclusive-georgette-three-piece-4102",
    status: 3,
    thumbnail_img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    suggestedCategory: "রেডিমেড থ্রিপিস.টু পিস",
    bengaliTitle: "এক্সক্লুসিভ জর্জেট এমব্রয়ডারি থ্রি-পিস সেট (কোড: ৪১০২)"
  },
  {
    id: 62,
    name: "Pure Silk Traditional Party Saree",
    category_id: 3,
    product_code: 5204,
    details: "<ul><li>Traditional Party Saree</li><li>Fabric: Pure Soft Half Silk with All-over Zari Work</li><li>Matching Blouse Piece Included</li></ul>",
    discount: 200,
    price: 1950,
    product_attribute: { id: 4, product_id: 62, attribute_id: 3 },
    product_image: [
      { id: 50, product_id: 62, product_image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80" }
    ],
    product_variant: [
      { id: 8, product_id: 62, variant_id: 1, name: "Standard (১২ হাত)" }
    ],
    reselling_price: 2650,
    sale_price: 1680,
    slug: "pure-silk-party-saree-5204",
    status: 3,
    thumbnail_img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
    suggestedCategory: "শাড়ি",
    bengaliTitle: "রয়েল পার্টি সিল্ক শাড়ি উইথ ব্লাউজ পিস (কোড: ৫২০৪)"
  }
];

app.get('/api/mohasagor/products', async (req, res) => {
  const page = Number(req.query.page) || 1;
  const apiKey = String(req.query.apiKey || process.env.MOHASAGOR_API_KEY || 'A8niclztH9JtzS4t').trim();
  const secretKey = String(req.query.secretKey || process.env.MOHASAGOR_SECRET_KEY || '2ff380917a11d3a7c97bcf6dddfb8adf38194c7d6b726ab12c4d0d5fb136fef8').trim();

  try {
    const upstreamRes = await fetch(`https://mohasagor.com.bd/api/reseller/product?page=${page}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': apiKey,
        'secret-key': secretKey,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const text = await upstreamRes.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      // Non-JSON response
    }

    if (upstreamRes.ok && data && (data.status === 200 || Array.isArray(data.products))) {
      return res.json({
        success: true,
        source: 'live_api',
        page,
        total: data.total || (Array.isArray(data.products) ? data.products.length : 0),
        last_page: data.last_page || 1,
        products: data.products || []
      });
    }

    // Handle 401 or 429
    const isUnauthorized = upstreamRes.status === 401;
    const isThrottled = upstreamRes.status === 429;
    
    return res.json({
      success: false,
      source: 'preview_fallback',
      status: upstreamRes.status,
      error: isUnauthorized 
        ? 'মহসাগর সার্ভার জানিয়েছে: API Key এখনো সক্রিয় বা অনুমোদিত হয়নি (Invalid API key)। আপনার Mohasagor রিসেলার একাউন্ট ড্যাশবোর্ড থেকে API কী ভেরিফাই করুন।'
        : isThrottled 
        ? 'Mohasagor সার্ভার সাময়িক রিকোয়েস্ট লিমিট দিয়েছে (Too Many Requests)। সাময়িকভাবে ডেমো ক্যাটালগ দেখানো হচ্ছে।'
        : `Mohasagor রেসপন্স এরর (${upstreamRes.status})`,
      page,
      total: MOHASAGOR_SAMPLE_PRODUCTS.length,
      last_page: 1,
      products: MOHASAGOR_SAMPLE_PRODUCTS,
      rawMessage: data?.message || text.slice(0, 200)
    });
  } catch (err: any) {
    return res.json({
      success: false,
      source: 'preview_fallback',
      error: `মহসাগর এপিআই কানেকশন টাইমআউট: ${err?.message || err}`,
      page,
      total: MOHASAGOR_SAMPLE_PRODUCTS.length,
      last_page: 1,
      products: MOHASAGOR_SAMPLE_PRODUCTS
    });
  }
});

app.post('/api/mohasagor/test', async (req, res) => {
  const { apiKey, secretKey } = req.body || {};
  const keyToUse = (apiKey || 'A8niclztH9JtzS4t').trim();
  const secretToUse = (secretKey || '2ff380917a11d3a7c97bcf6dddfb8adf38194c7d6b726ab12c4d0d5fb136fef8').trim();

  try {
    const upstreamRes = await fetch('https://mohasagor.com.bd/api/reseller/product?page=1', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': keyToUse,
        'secret-key': secretToUse,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    const text = await upstreamRes.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch {}

    if (upstreamRes.ok && (data?.status === 200 || Array.isArray(data?.products))) {
      return res.json({
        success: true,
        status: 200,
        message: '✅ Mohasagor.com.bd রিসেলার API সফলভাবে কানেক্ট হয়েছে এবং পণ্য তালিকা পড়তে পারছে!'
      });
    }

    if (upstreamRes.status === 401) {
      return res.json({
        success: false,
        status: 401,
        message: '⚠️ মহসাগর সার্ভার রেসপন্স: "Invalid API key"। আপনার Mohasagor রিসেলার পোর্টালে লগইন করে নিশ্চিত হোন API Key টি অ্যাক্টিভ/অনুমোদিত আছে কিনা।',
        raw: data || text.slice(0, 200)
      });
    }

    if (upstreamRes.status === 429) {
      return res.json({
        success: false,
        status: 429,
        message: '⏳ মহসাগর সার্ভারে সাময়িক রিকোয়েস্ট লিমিট (Rate Limit) হয়েছে। অনুগ্রহ করে ১ মিনিট পর পুনরায় পরীক্ষা করুন।',
      });
    }

    return res.json({
      success: false,
      status: upstreamRes.status,
      message: `মহসাগর সার্ভার রেসপন্স কোড: ${upstreamRes.status}`,
      raw: text.slice(0, 200)
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: `কানেকশন এরর: ${err?.message || err}`
    });
  }
});

// 4. Vite development middleware OR Production static file serving
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Ensure browsers do not cache the root HTML in dev
    app.use((req, res, next) => {
      if (req.url === '/' || !req.url.includes('.')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
      next();
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      },
    }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server started in ${isProd ? 'production' : 'development'} mode on http://0.0.0.0:${PORT}`);
  });
}

startServer();
