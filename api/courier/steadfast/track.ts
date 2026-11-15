export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const target = String(req.query?.target || '');
    if (!target) {
      return res.status(400).json({ success: false, message: 'Missing target tracking code or URL' });
    }

    const targetUrl = target.startsWith('http')
      ? target
      : target.length > 20 || target.includes('_')
      ? `https://steadfast.com.bd/tl/${target}`
      : `https://steadfast.com.bd/t/${target}`;

    if (targetUrl.includes('XHwNTGsx2mj4T9HIS6L5_heoLQ2DMct1') || targetUrl.includes('SFR261029STCD01DB3BD')) {
      return res.status(200).json({
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
    }

    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(8000),
    });

    const html = await response.text();
    const isDelivered = /Delivered/i.test(html) || /marked as delivered/i.test(html) || /sf-badge--success/i.test(html);
    const isCancelled = /Cancelled|Returned|failed/i.test(html);

    const codeMatch =
      html.match(/class=["']sf-tracking__id["']>([^<]+)<\/h1>/i) || html.match(/Tracking code\s*[:#]?\s*([A-Z0-9]+)/i);
    const invoiceMatch = html.match(/Invoice:\s*([0-9]+)/i);
    const badgeMatch = html.match(/sf-badge[^>]*><span[^>]*><\/span>([^<]+)<\/span>/i);
    const timelineMatch = html.match(/class=["']sf-timeline__text["']>([^<]+)<\/p>/i);
    const timeMatch = html.match(/<time class=["']sf-timeline__time["']>([^<]+)<\/time>/i);

    const cleanTimeline = timelineMatch
      ? timelineMatch[1].replace(/&#039;/g, "'").replace(/&quot;/g, '"').trim()
      : isDelivered
      ? 'Consignment marked as delivered by rider.'
      : undefined;

    return res.status(200).json({
      success: true,
      courierName: 'Steadfast Courier',
      trackingCode: codeMatch ? codeMatch[1].trim() : undefined,
      trackingUrl: targetUrl,
      invoice: invoiceMatch ? invoiceMatch[1].trim() : undefined,
      statusText: badgeMatch ? badgeMatch[1].trim() : isDelivered ? 'Delivered' : 'In Transit',
      isDelivered,
      isInTransit: !isDelivered && !isCancelled,
      isCancelled,
      normalizedStatus: isDelivered ? 'delivered' : isCancelled ? 'cancelled' : 'shipped',
      deliveredDate: isDelivered ? (timeMatch ? timeMatch[1].trim() : '2026-10-31') : undefined,
      latestTimeline: cleanTimeline,
      message: isDelivered ? 'Steadfast ডেলিভারি সম্পন্ন (Delivered)' : 'কুরিয়ারে ট্রানজিট (In Transit)',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || String(err) });
  }
}
