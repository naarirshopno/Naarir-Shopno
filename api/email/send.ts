import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      status: 'online',
      message: 'ইমেইল ডিসপ্যাচ এন্ডপয়েন্ট সক্রিয় রয়েছে। POST রিকোয়েস্ট পাঠান।',
      time: new Date().toISOString(),
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { to, cc, subject, html, smtpConfig } = body;

    const host = smtpConfig?.host || process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(smtpConfig?.port || process.env.SMTP_PORT || 465);
    const user = (smtpConfig?.user || process.env.SMTP_USER || 'NaarirShopno@Gmail.com').trim();
    const pass = (smtpConfig?.pass || process.env.SMTP_PASS || 'ahumuvbilessprtl').trim();
    const senderName = smtpConfig?.senderName || 'নারীর স্বপ্ন (Naarir Shopno)';

    if (!to) {
      return res.status(400).json({ success: false, error: 'গ্রাহকের ইমেইল অ্যাড্রেস (to) পাওয়া যায়নি।' });
    }

    if (!user || !pass) {
      return res.status(400).json({
        success: false,
        error: 'SMTP শংসাপত্র (User বা App Password) কনফিগার করা হয়নি।',
      });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: pass.replace(/\s+/g, '') },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 12000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const info = await transporter.sendMail({
      from: `"${senderName}" <${user}>`,
      to,
      cc: cc || undefined,
      subject: subject || 'নারীর স্বপ্ন - অর্ডার নিশ্চিতকরণ',
      html: html || '<p>অর্ডার নিশ্চিত করা হয়েছে।</p>',
    });

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: `ইমেইলটি সফলভাবে সেন্ডার সার্ভারের মাধ্যমে ${to}-এর ইনবক্সে পাঠানো হয়েছে!`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || String(err) });
  }
}
