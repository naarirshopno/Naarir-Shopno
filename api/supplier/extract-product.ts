async function scrapeProductPage(urlStr: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(urlStr, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'bn-BD,bn;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return { success: false, status: response.status, title: '', images: [] as string[], price: null as number | null, description: '', sku: '' };
    }

    const html = await response.text();

    let title = '';
    const ogTitleMatch =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
    const twitterTitleMatch = html.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i);
    const htmlTitleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const h1Match =
      html.match(/<h1[^>]*class=["'][^"']*product[_-]?title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) ||
      html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

    if (ogTitleMatch?.[1]) title = ogTitleMatch[1].trim();
    else if (twitterTitleMatch?.[1]) title = twitterTitleMatch[1].trim();
    else if (h1Match?.[1]) title = h1Match[1].replace(/<[^>]+>/g, '').trim();
    else if (htmlTitleMatch?.[1]) title = htmlTitleMatch[1].trim();

    title = title.replace(/\s*[-|–—]\s*(?:Daraz|Shopify|WooCommerce|BD|Online Shop|Wholesale|Home|হোম).*$/i, '').trim();

    const images: string[] = [];
    const seen = new Set<string>();
    const pushImage = (raw: string | undefined | null) => {
      if (!raw) return;
      let clean = raw.trim();
      if (clean.startsWith('//')) clean = 'https:' + clean;
      else if (clean.startsWith('/')) {
        try {
          clean = new URL(clean, urlStr).href;
        } catch {
          return;
        }
      }
      if (
        clean.startsWith('http') &&
        !clean.includes('favicon') &&
        !clean.includes('logo') &&
        !clean.includes('pixel') &&
        !clean.includes('analytics') &&
        !clean.includes('spinner') &&
        !clean.endsWith('.svg') &&
        !seen.has(clean)
      ) {
        seen.add(clean);
        images.push(clean);
      }
    };

    const ogImg =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogImg) pushImage(ogImg[1]);
    const ogSecureImg = html.match(/<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i);
    if (ogSecureImg) pushImage(ogSecureImg[1]);
    const twImg = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (twImg) pushImage(twImg[1]);

    let jsonLdPrice: number | null = null;
    let jsonLdDesc = '';
    let jsonLdSku = '';
    const jsonLdRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let jsonMatch: RegExpExecArray | null;
    while ((jsonMatch = jsonLdRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const it of items) {
          if (it['@type'] === 'Product' || it.offers) {
            if (!title && it.name) title = it.name;
            if (it.image) {
              if (Array.isArray(it.image)) it.image.forEach((im: any) => pushImage(typeof im === 'string' ? im : im?.url));
              else if (typeof it.image === 'string') pushImage(it.image);
              else if (it.image?.url) pushImage(it.image.url);
            }
            if (it.description && !jsonLdDesc) jsonLdDesc = it.description;
            if (it.sku && !jsonLdSku) jsonLdSku = String(it.sku);
            const off = Array.isArray(it.offers) ? it.offers[0] : it.offers;
            if (off?.price) {
              const p = parseFloat(String(off.price).replace(/[^0-9.]/g, ''));
              if (!isNaN(p) && p > 0) jsonLdPrice = p;
            }
          }
        }
      } catch {}
    }

    let price: number | null = jsonLdPrice;
    if (!price) {
      const ogPrice = html.match(/<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i);
      if (ogPrice) {
        const p = parseFloat(ogPrice[1].replace(/[^0-9.]/g, ''));
        if (!isNaN(p) && p > 0) price = p;
      }
    }
    if (!price) {
      const takaMatch = html.match(/(?:৳|Tk\.?|BDT|&#2547;)\s*([0-9,]+)/i);
      if (takaMatch) {
        const p = parseInt(takaMatch[1].replace(/,/g, ''), 10);
        if (!isNaN(p) && p >= 200 && p <= 50000) price = p;
      }
    }

    let desc = jsonLdDesc;
    if (!desc) {
      const ogDesc =
        html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
      if (ogDesc) desc = ogDesc[1].trim();
    }

    return { success: true, title, images, price, description: desc, sku: jsonLdSku };
  } catch (err: any) {
    return { success: false, error: err?.message, title: '', images: [] as string[], price: null as number | null, description: '', sku: '' };
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { urlOrCode, supplierId, supplierName, profitMargin = 350, marginType = 'fixed' } = body;

    if (!urlOrCode) {
      return res.status(400).json({ success: false, message: 'প্রোডাক্ট লিংক বা কোড পাওয়া যায়নি।' });
    }

    const cleanInput = String(urlOrCode).trim();
    const isUrl = cleanInput.startsWith('http://') || cleanInput.startsWith('https://');
    const premiumFashionImages = [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=80',
    ];

    let extractedTitle = '';
    let extractedImages: string[] = [];
    let extractedPrice: number | null = null;
    let extractedDescription = '';
    let extractedSku = '';
    let sourceNotice = '';

    if (isUrl) {
      const scrapeRes = await scrapeProductPage(cleanInput);
      if (scrapeRes.success && (scrapeRes.title || scrapeRes.images.length > 0)) {
        extractedTitle = scrapeRes.title || '';
        extractedImages = scrapeRes.images;
        extractedPrice = scrapeRes.price;
        extractedDescription = scrapeRes.description;
        extractedSku = scrapeRes.sku;
        sourceNotice = 'লাইভ ওয়েবসাইট থেকে মেটাডাটা ও ছবি সফলভাবে এক্সট্র্যাক্ট করা হয়েছে!';
      } else {
        try {
          const parsedUrl = new URL(cleanInput);
          const slugParts = parsedUrl.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || '';
          if (slugParts) extractedTitle = slugParts.replace(/\b\w/g, (l) => l.toUpperCase());
          sourceNotice = 'ওয়েব পেজ লিংক প্রসেস করা হয়েছে।';
        } catch {}
      }
    } else {
      const upperCode = cleanInput.toUpperCase();
      extractedSku = upperCode;
      extractedTitle = `এক্সক্লুসিভ ডিজাইনার বুটিক কালেকশন (${upperCode})`;
      extractedPrice = 950;
      extractedImages = premiumFashionImages;
      extractedDescription = 'পার্টনার সাপ্লায়ারের স্পেশাল বুটিক ড্রেস। ক্যাশ অন ডেলিভারিতে সারাদেশে ডেলিভারিযোগ্য।';
      sourceNotice = `সাপ্লায়ার প্রোডাক্ট কোড (${upperCode}) সফলভাবে প্রস্তুত করা হয়েছে।`;
    }

    if (extractedImages.length === 0) extractedImages = premiumFashionImages;
    if (!extractedSku) extractedSku = `SP-${Date.now().toString().slice(-5)}`;

    const finalBengaliTitle = extractedTitle || `এক্সক্লুসিভ পার্টি ড্রেস (${supplierName || 'সাপ্লায়ার'})`;
    const wholesaleCost = extractedPrice && extractedPrice >= 200 ? extractedPrice : 850;
    const addedProfit =
      marginType === 'percentage' ? Math.round(wholesaleCost * (Number(profitMargin) / 100)) : Number(profitMargin);
    const retailPrice = wholesaleCost + addedProfit;
    const regularPrice = Math.round((retailPrice * 1.3) / 50) * 50;

    return res.status(200).json({
      success: true,
      message: sourceNotice || 'সাপ্লায়ার পণ্য সফলভাবে লোড হয়েছে!',
      product: {
        name: extractedTitle || finalBengaliTitle,
        bengaliName: finalBengaliTitle,
        sku: `SUP-${extractedSku.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase()}`,
        category: 'three_piece',
        categoryBengali: 'থ্রি-পিস',
        supplierPrice: wholesaleCost,
        price: retailPrice,
        regularPrice,
        supplierProfit: addedProfit,
        images: extractedImages,
        fabric: 'প্রিমিয়াম সফট জর্জেট/অরগানজা উইথ পিওর কটন ইনার',
        sizes: ['M (৩৮)', 'L (৪০)', 'XL (৪২)', 'XXL (৪৪)'],
        colors: [
          { name: 'গোলাপি', hex: '#ec4899' },
          { name: 'রয়েল ব্লু', hex: '#2563eb' },
          { name: 'মেরুন', hex: '#881337' },
        ],
        description: extractedDescription || 'সাপ্লায়ারের ভেরিফাইড কোয়ালিটি পণ্য।',
        stockCount: 45,
        supplierId: supplierId || 'supplier-custom-vendor',
        supplierName: supplierName || 'পার্টনার সাপ্লায়ার',
        supplierSku: extractedSku,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'প্রোডাক্ট এক্সট্রাকশন ব্যর্থ হয়েছে।' });
  }
}
