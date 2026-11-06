import { Order, FirestoreEmailLog } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export interface EmailLogEntry {
  id: string;
  to: string;
  cc?: string;
  orderId: string;
  customerName: string;
  total: number;
  subject: string;
  html: string;
  createdAt: string;
  status: 'sent' | 'queued' | 'simulated';
}

/**
 * Generate responsive Bengali + English HTML email template for Naarir Shopno
 */
export function generateOrderEmailHtml(
  order: Order, 
  appUrlOrSettings?: string | { emailSettings?: any; storeName?: string }
): string {
  const hotline = '09617-541717';
  const appUrl = typeof appUrlOrSettings === 'string'
    ? appUrlOrSettings
    : typeof window !== 'undefined'
    ? window.location.origin
    : 'https://naarirshopno.com';
  const trackingLink = `${appUrl}/track-order`;

  const itemsRows = (order.items || [])
    .map((item) => {
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
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #ffe4e6; box-shadow: 0 4px 16px rgba(225, 29, 72, 0.08);">
          
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
 * Dispatches real email through the backend server /api/email/send
 */
export async function sendLiveEmailViaBackend(payload: {
  to: string;
  cc?: string;
  subject: string;
  html: string;
  smtpConfig?: {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
    senderName?: string;
  };
}): Promise<{ success: boolean; messageId?: string; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'ইমেইল ডিসপ্যাচ সার্ভারের সাথে সংযোগ করা যায়নি।',
    };
  }
}

/**
 * Triggers the automated email notification pipeline upon order placement:
 * 1. Attempts live SMTP dispatch if credentials exist
 * 2. Writes to Firestore /mail collection (Firebase Trigger Email extension compatible)
 * 3. Keeps local fallback log for immediate in-app administrative auditing
 */
export async function triggerOrderEmailNotification(
  order: Order,
  adminEmailOrSettings: string | { emailSettings?: any; officeEmail?: string } = 'NaarirShopno@Gmail.com'
): Promise<{ success: boolean; targetEmail: string; mailId: string; realDispatched?: boolean; messageId?: string; error?: string }> {
  const emailSettings = typeof adminEmailOrSettings === 'object' && adminEmailOrSettings !== null
    ? (adminEmailOrSettings as any).emailSettings
    : undefined;

  const defaultAdminEmail = typeof adminEmailOrSettings === 'string'
    ? adminEmailOrSettings
    : emailSettings?.senderEmail || emailSettings?.adminNotificationEmail || (adminEmailOrSettings as any)?.officeEmail || 'NaarirShopno@Gmail.com';

  const targetEmail = order.customerEmail || defaultAdminEmail;
  const subject = `[নারীর স্বপ্ন] আপনার অর্ডার #${order.id} সফলভাবে গৃহীত হয়েছে`;
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://naarirshopno.com';
  const html = generateOrderEmailHtml(order, appUrl);
  const mailId = `mail-${order.id}-${Date.now()}`;

  let realDispatched = false;
  let dispatchError: string | undefined = undefined;
  let messageId: string | undefined = undefined;

  // Attempt live SMTP transmission if credentials exist
  if (emailSettings?.smtpPass && (emailSettings?.smtpUser || emailSettings?.senderEmail)) {
    const dispatchRes = await sendLiveEmailViaBackend({
      to: targetEmail,
      cc: order.customerEmail && order.customerEmail !== defaultAdminEmail ? defaultAdminEmail : undefined,
      subject,
      html,
      smtpConfig: {
        host: emailSettings.smtpHost || (emailSettings.provider === 'gmail' ? 'smtp.gmail.com' : 'smtp.gmail.com'),
        port: emailSettings.smtpPort || (emailSettings.provider === 'gmail' ? 465 : 587),
        user: (emailSettings.smtpUser || emailSettings.senderEmail || defaultAdminEmail).trim(),
        pass: emailSettings.smtpPass.trim(),
        senderName: emailSettings.senderName || 'নারীর স্বপ্ন (Naarir Shopno)',
      },
    });

    realDispatched = Boolean(dispatchRes.success);
    if (!dispatchRes.success) {
      dispatchError = dispatchRes.error;
    } else {
      messageId = dispatchRes.messageId;
    }
  } else {
    dispatchError = 'SMTP অ্যাপ পাসওয়ার্ড এখনো কনফিগার করা হয়নি। অ্যাডমিন প্যানেল > ইমেইল সেটিংসে জিমেইল অ্যাপ পাসওয়ার্ড দিন।';
  }

  const mailPayload = {
    to: targetEmail,
    cc: order.customerEmail && order.customerEmail !== defaultAdminEmail ? defaultAdminEmail : null,
    message: {
      subject,
      html,
    },
    metadata: {
      orderId: order.id,
      customerName: order.customerName,
      customerPhone: order.phone,
      total: order.total,
      createdAt: new Date().toISOString(),
      status: realDispatched ? 'delivered' : 'queued',
      realDispatched,
      error: dispatchError || null,
    },
  };

  // 1. Write to /mail collection in Firestore
  try {
    await setDoc(doc(db, 'mail', mailId), mailPayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `mail/${mailId}`);
  }

  // 2. Also save to local storage email notification log for preview & offline tracking
  try {
    const existingLogs: EmailLogEntry[] = JSON.parse(
      localStorage.getItem('ns_email_notifications') || '[]'
    );
    const newEntry: EmailLogEntry = {
      id: mailId,
      to: targetEmail,
      cc: order.customerEmail && order.customerEmail !== defaultAdminEmail ? defaultAdminEmail : undefined,
      orderId: order.id,
      customerName: order.customerName,
      total: order.total,
      subject,
      html,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: realDispatched ? 'sent' : 'queued',
    };
    localStorage.setItem(
      'ns_email_notifications',
      JSON.stringify([newEntry, ...existingLogs.slice(0, 49)])
    );
  } catch {
    // ignore
  }

  return {
    success: realDispatched,
    realDispatched,
    targetEmail,
    mailId,
    messageId,
    error: dispatchError,
  };
}

/**
 * Creates a pre-filled direct Gmail draft link for 1-click fallback sending
 */
export function createGmailDraftUrl(order: Order, recipientEmail?: string): string {
  const target = recipientEmail || order.customerEmail || 'NaarirShopno@Gmail.com';
  const subject = encodeURIComponent(`[নারীর স্বপ্ন] আপনার অর্ডার #${order.id} নিশ্চিতকরণ`);
  const bodyText = encodeURIComponent(
    `প্রিয় ${order.customerName},\n\n` +
    `নারীর স্বপ্ন-এ আপনার অর্ডার #${order.id} সফলভাবে নথিভুক্ত হয়েছে।\n\n` +
    `মোট পরিশোধযোগ্য মূল্য: ৳${order.total}\n` +
    `পেমেন্ট পদ্ধতি: ${order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : order.paymentMethod.toUpperCase()}\n` +
    `ডেলিভারি ঠিকানা: ${order.address}, ${order.thana ? order.thana + ', ' : ''}${order.district}\n\n` +
    `যেকোনো প্রয়োজনে হটলাইনে যোগাযোগ করুন: 09617-541717\n` +
    `ধন্যবাদ,\nনারীর স্বপ্ন (Naarir Shopno)`
  );

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(target)}&su=${subject}&body=${bodyText}`;
}

export function parseFirestoreMailDoc(docSnap: any): FirestoreEmailLog {
  const data = docSnap.data() || {};
  const metadata = data.metadata || {};
  const message = data.message || {};
  const delivery = data.delivery || {};

  let status: 'delivered' | 'queued' | 'failed' = 'queued';
  if (metadata.realDispatched || metadata.status === 'delivered' || delivery.state === 'SUCCESS') {
    status = 'delivered';
  } else if (metadata.error || delivery.state === 'ERROR') {
    status = 'failed';
  }

  let orderId = metadata.orderId || '';
  if (!orderId && docSnap.id) {
    const raw = docSnap.id.replace('mail-', '').split('-')[0];
    orderId = raw ? (raw.startsWith('NS') ? raw : `NS-${raw}`) : 'N/A';
  }

  return {
    id: docSnap.id,
    to: data.to || metadata.to || 'N/A',
    cc: data.cc || undefined,
    subject: message.subject || metadata.subject || 'নারীর স্বপ্ন - অর্ডার নিশ্চিতকরণ',
    html: message.html || '',
    orderId: orderId || 'N/A',
    customerName: metadata.customerName || 'সম্মানিত গ্রাহক',
    customerPhone: metadata.customerPhone || 'N/A',
    total: typeof metadata.total === 'number' ? metadata.total : 0,
    createdAt: metadata.createdAt || data.createdAt || new Date().toISOString(),
    status,
    realDispatched: Boolean(metadata.realDispatched || delivery.state === 'SUCCESS'),
    error: metadata.error || delivery.error || null,
    deliveryState: delivery.state || undefined,
  };
}

/**
 * Queries the Firestore database /mail collection to retrieve sent & queued customer email notifications
 */
export async function fetchFirestoreEmailLogs(): Promise<FirestoreEmailLog[]> {
  try {
    const mailCol = collection(db, 'mail');
    const snap = await getDocs(mailCol);
    if (!snap.empty) {
      const logs = snap.docs.map(parseFirestoreMailDoc);
      logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return logs;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'mail');
  }
  return [];
}

/**
 * Subscribes in real-time to Firestore /mail collection changes
 */
export function subscribeToFirestoreEmailLogs(
  callback: (logs: FirestoreEmailLog[]) => void
): () => void {
  try {
    const mailCol = collection(db, 'mail');
    return onSnapshot(
      mailCol,
      (snapshot) => {
        const logs = snapshot.docs.map(parseFirestoreMailDoc);
        logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(logs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'mail');
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'mail');
    return () => {};
  }
}

/**
 * Deletes all automated email notifications from Firestore /mail collection and resets local storage logs
 */
export async function clearAllFirestoreEmailLogs(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const mailCol = collection(db, 'mail');
    const snapshot = await getDocs(mailCol);
    if (!snapshot.empty) {
      const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(doc(db, 'mail', docSnap.id)));
      await Promise.all(deletePromises);
    }

    try {
      localStorage.removeItem('ns_email_notifications');
    } catch {}

    return {
      success: true,
      count: snapshot.size,
    };
  } catch (err: any) {
    console.error('Failed to clear Firestore email logs:', err);
    return {
      success: false,
      count: 0,
      error: err?.message || 'ডাটাবেস থেকে ইমেইল লগ মুছতে সমস্যা হয়েছে',
    };
  }
}
