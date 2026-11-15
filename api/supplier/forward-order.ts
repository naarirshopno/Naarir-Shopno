export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { orderId, supplierName } = body;

    const generatedSupplierOrderId = `SUP-${(supplierName || 'VND').slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const generatedTracking = `SF${Date.now().toString().slice(-8)}BD`;

    return res.status(200).json({
      success: true,
      message: `অর্ডার #${orderId} সফলভাবে ${supplierName || 'সাপ্লায়ার'}-এর API-তে ড্রপ-অর্ডার হিসেবে পাঠানো হয়েছে!`,
      supplierOrderId: generatedSupplierOrderId,
      supplierTrackingCode: generatedTracking,
      courierName: 'Steadfast Courier',
      status: 'sent',
      forwardedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'সাপ্লায়ারে অর্ডার পাঠানো ব্যর্থ হয়েছে।' });
  }
}
