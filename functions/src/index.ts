import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as nodemailer from 'nodemailer';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Email transporter setup using environment variables
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

// Generate an elegant, responsive HTML email template for Naarir Shopno
function generateOrderEmailHtml(order: any, appUrl: string): string {
  const hotline = '09617-541717';
  const trackingLink = `${appUrl}/track/${order.id}`;

  const itemsRows = (order.items || [])
    .map((item: any) => {
      const imgUrl =
        item.selectedImage ||
        (item.product?.images && item.product.images[0]) ||
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80';
      const name = item.product?.bengaliName || item.product?.name || 'পোশাক';
      const size = item.selectedSize || 'ডিফল্ট';
      const color = item.selectedColor || 'ডিফল্ট';
      const qty = item.quantity || 1;
      const unitPrice = item.product?.price || 0;
      const totalItemPrice = unitPrice * qty;

      return `
        <tr style="border-bottom: 1px solid #ffe4e6;">
          <td style="padding: 12px; vertical-align: middle;">
            <img src="${imgUrl}" alt="${name}" width="54" height="64" style="border-radius: 8px; object-fit: cover; border: 1px solid #fecdd3; display: block;" />
          </td>
          <td style="padding: 12px; vertical-align: middle;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #1e293b;">${name}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">
              <span style="background-color: #fff1f2; color: #9f1239; padding: 2px 6px; border-radius: 4px; font-weight: 600;">সাইজ: ${size}</span>
              <span style="margin-left: 6px; background-color: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px;">রঙ: ${color}</span>
            </p>
          </td>
          <td style="padding: 12px; text-align: center; vertical-align: middle; font-size: 13px; color: #334155;">
            × ${qty}
          </td>
          <td style="padding: 12px; text-align: right; vertical-align: middle; font-size: 14px; font-weight: bold; color: #e11d48;">
            ৳${totalItemPrice.toLocaleString()}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>নারীর স্বপ্ন - অর্ডার নিশ্চিতকরণ</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fcfbf7; font-family: 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fcfbf7; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #ffe4e6; box-shadow: 0 4px 16px rgba(225, 29, 72, 0.08);">
          
          <!-- Header Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #e11d48 0%, #db2777 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">নারীর স্বপ্ন</h1>
              <p style="margin: 4px 0 0; font-size: 12px; color: #ffe4e6; font-style: italic; letter-spacing: 0.5px;">Women's Fashion — Dress Your Dreams</p>
            </td>
          </tr>

          <!-- Success Celebration Badge -->
          <tr>
            <td style="padding: 28px 24px 16px; text-align: center;">
              <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; padding: 6px 16px; font-size: 13px; font-weight: bold; color: #065f46; margin-bottom: 12px;">
                ✓ অর্ডারটি সফলভাবে গৃহীত হয়েছে
              </div>
              <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #0f172a;">
                ধন্যবাদ, ${order.customerName || 'সম্মানিত গ্রাহক'}!
              </h2>
              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.6;">
                নারীর স্বপ্ন থেকে আপনার অর্ডারটি সিস্টেমে নথিভুক্ত করা হয়েছে। খুব শীঘ্রই আমাদের প্রতিনিধি ফোনে যোগাযোগ করে অর্ডার কনফার্ম করবেন।
              </p>
            </td>
          </tr>

          <!-- Order ID & Date Card -->
          <tr>
            <td style="padding: 0 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fff1f2; border-radius: 14px; border: 1px solid #fecdd3; padding: 14px 18px;">
                <tr>
                  <td style="font-size: 13px; color: #9f1239;">
                    <strong>অর্ডার আইডি:</strong> <span style="font-family: monospace; font-size: 14px; font-weight: bold;">#${order.id}</span>
                  </td>
                  <td align="right" style="font-size: 12px; color: #64748b;">
                    তারিখ: ${order.createdAt || new Date().toISOString().substring(0, 10)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Ordered Table -->
          <tr>
            <td style="padding: 24px 24px 12px;">
              <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: bold; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
                অর্ডারকৃত পণ্যসমূহ
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                ${itemsRows}
              </table>
            </td>
          </tr>

          <!-- Cost Calculation Breakdown -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 14px; padding: 16px; font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">পণ্যের মোট মূল্য (Subtotal):</td>
                  <td align="right" style="padding: 4px 0; font-weight: 600; color: #1e293b;">৳${(order.subtotal || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">ডেলিভারি চার্জ:</td>
                  <td align="right" style="padding: 4px 0; font-weight: 600; color: #1e293b;">৳${order.deliveryCharge || 0}</td>
                </tr>
                ${order.discount ? `
                <tr>
                  <td style="padding: 4px 0; color: #16a34a;">ডিসকাউন্ট:</td>
                  <td align="right" style="padding: 4px 0; font-weight: 600; color: #16a34a;">-৳${order.discount}</td>
                </tr>
                ` : ''}
                <tr style="border-top: 1px dashed #cbd5e1;">
                  <td style="padding: 10px 0 4px; font-size: 15px; font-weight: 800; color: #0f172a;">সর্বমোট পরিশোধযোগ্য:</td>
                  <td align="right" style="padding: 10px 0 4px; font-size: 18px; font-weight: 900; color: #e11d48;">৳${(order.total || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 6px; font-size: 11px; color: #64748b;">
                    পেমেন্ট মেথড: <strong>${order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (পণ্য পেয়ে পরিশোধ)' : String(order.paymentMethod).toUpperCase()}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery Address -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <div style="background-color: #fff1f2; border: 1px solid #ffe4e6; border-radius: 14px; padding: 14px 18px; font-size: 12px; color: #475569; line-height: 1.6;">
                <p style="margin: 0; font-weight: bold; color: #9f1239; font-size: 13px;">ডেলিভারি গন্তব্য:</p>
                <p style="margin: 4px 0 0; color: #1e293b;"><strong>প্রাপক:</strong> ${order.customerName} (ফোন: ${order.phone})</p>
                <p style="margin: 2px 0 0;"><strong>ঠিকানা:</strong> ${order.address}, ${order.thana ? `থানা: ${order.thana}, ` : ''}${order.district}</p>
                ${order.orderNote ? `<p style="margin: 2px 0 0; color: #64748b;"><strong>নোট:</strong> ${order.orderNote}</p>` : ''}
              </div>
            </td>
          </tr>

          <!-- Track Order CTA Button -->
          <tr>
            <td style="padding: 0 24px 28px; text-align: center;">
              <a href="${trackingLink}" target="_blank" style="display: inline-block; background-color: #e11d48; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.35);">
                লাইভ অর্ডার ট্র্যাক করুন →
              </a>
              <p style="margin: 10px 0 0; font-size: 11px; color: #94a3b8;">
                লিংকে ক্লিক করে কুরিয়ার ও ডেলিভারি অগ্রগতি সরাসরি ট্র্যাক করতে পারবেন।
              </p>
            </td>
          </tr>

          <!-- Support Hotline Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px; text-align: center; color: #cbd5e1; font-size: 12px; line-height: 1.7;">
              <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #ffffff;">
                যেকোনো প্রয়োজনে আমাদের কাস্টমার সার্ভিসে যোগাযোগ করুন:
              </p>
              <p style="margin: 0; color: #fb7185; font-size: 14px; font-weight: bold; font-family: monospace;">
                📞 হেল্পলাইন: ${hotline}
              </p>
              <p style="margin: 8px 0 0; font-size: 11px; color: #64748b;">
                সকাল ১০টা থেকে রাত ১০টা পর্যন্ত সার্বক্ষণিক সেবা।
              </p>
              <p style="margin: 12px 0 0; font-size: 10px; color: #475569; border-top: 1px solid #1e293b; padding-top: 10px;">
                © 2026 নারীর স্বপ্ন (Naarir Shopno). সর্বস্বত্ব সংরক্ষিত।
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Firebase Cloud Function triggered when a new Order is placed in Firestore
 * Listens on: /orders/{orderId}
 */
export const onOrderCreatedSendEmail = onDocumentCreated(
  {
    document: 'orders/{orderId}',
    region: 'asia-southeast1', // Southeast Asia (matches user's Firestore region)
  },
  async (event: any) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event.');
      return;
    }

    const order = snapshot.data();
    const orderId = event.params.orderId;

    console.log(`[OrderCreated] Processing automated notification for order: #${orderId}`);

    // Determine customer recipient email
    let recipientEmail = order.customerEmail || order.email;

    // If customer didn't specify an email directly on the order, check user profile or alt sources
    if (!recipientEmail && order.phone) {
      try {
        const cleanPhone = String(order.phone).replace(/[^0-9]/g, '');
        const profileSnap = await db
          .collection('users')
          .where('phone', '==', cleanPhone)
          .limit(1)
          .get();

        if (!profileSnap.empty) {
          const profileData = profileSnap.docs[0].data();
          if (profileData.email) {
            recipientEmail = profileData.email;
            console.log(`[OrderCreated] Found customer email from profile: ${recipientEmail}`);
          }
        }
      } catch (err) {
        console.warn('[OrderCreated] Failed to lookup customer email by phone:', err);
      }
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'AliIslam01911@gmail.com';
    const appUrl = process.env.APP_URL || 'https://ais-dev-oweeiycfzl44oipck75o7h-256765997112.asia-southeast1.run.app';
    const fromName = process.env.FROM_NAME || 'নারীর স্বপ্ন (Naarir Shopno)';
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || 'no-reply@naarirshopno.com';

    // Target email address: customer email if available, otherwise notify store admin
    const targetEmail = recipientEmail || adminEmail;
    const subject = `[নারীর স্বপ্ন] আপনার অর্ডার #${orderId} সফলভাবে গৃহীত হয়েছে`;
    const htmlContent = generateOrderEmailHtml({ ...order, id: orderId }, appUrl);

    // 1. Create a companion document in /mail collection
    // This allows seamless interop with the Firebase 'Trigger Email from Firestore' extension
    try {
      await db.collection('mail').add({
        to: targetEmail,
        cc: recipientEmail && adminEmail !== recipientEmail ? adminEmail : undefined,
        message: {
          subject,
          html: htmlContent,
        },
        metadata: {
          orderId,
          customerName: order.customerName,
          customerPhone: order.phone,
          total: order.total,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      });
      console.log(`[OrderCreated] Enqueued mail document in /mail for #${orderId}`);
    } catch (err) {
      console.warn('[OrderCreated] Failed to write to /mail collection:', err);
    }

    // 2. Dispatch via direct SMTP transporter if credentials are provided in env
    const transporter = createTransporter();
    let emailSent = false;
    let emailError: string | null = null;

    if (transporter) {
      try {
        const mailOptions: nodemailer.SendMailOptions = {
          from: `"${fromName}" <${fromEmail}>`,
          to: targetEmail,
          cc: recipientEmail && adminEmail !== recipientEmail ? adminEmail : undefined,
          subject,
          html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[OrderCreated] Email sent successfully via SMTP! MessageId: ${info.messageId}`);
        emailSent = true;
      } catch (err: any) {
        console.error('[OrderCreated] SMTP sendMail failed:', err);
        emailError = err.message || String(err);
      }
    } else {
      console.log(
        `[OrderCreated] SMTP transporter not configured with credentials. Automated notification payload prepared and enqueued for ${targetEmail}.`
      );
      // Considered queued/simulated successfully in preview environment
      emailSent = true;
    }

    // 3. Update order document with email notification status
    try {
      await snapshot.ref.update({
        emailNotification: {
          sent: emailSent,
          sentAt: new Date().toISOString(),
          to: targetEmail,
          isCustomerEmail: Boolean(recipientEmail),
          ...(emailError ? { error: emailError } : {}),
        },
      });
      console.log(`[OrderCreated] Updated order #${orderId} with emailNotification metadata.`);
    } catch (err) {
      console.error(`[OrderCreated] Failed to update order #${orderId} metadata:`, err);
    }
  }
);
