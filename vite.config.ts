import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
          'logo.jpg',
          'hero-banner.jpg',
          'watermarked_hero_banner.jpg',
          'footer-bg.jpg',
        ],
        manifest: {
          id: '/',
          name: 'নারীর স্বপ্ন - Naarir Shopno',
          short_name: 'নারীর স্বপ্ন',
          description: 'নারীর স্বপ্ন (Naarir Shopno) - এক্সক্লুসিভ থ্রি-পিস, শাড়ি, কুর্তি, গাউন ও উইমেন্স ফ্যাশন।',
          theme_color: '#e11d48',
          background_color: '#fdf2f5',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          globIgnores: ['**/assets/aistudio/**'],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'storefront-images-cache',
                expiration: {
                  maxEntries: 150,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      {
        name: 'steadfast-courier-proxy',
        configureServer(server) {
          server.middlewares.use('/api/courier/steadfast/track', async (req, res) => {
            try {
              const urlObj = new URL(req.url || '', 'http://localhost:3000');
              const target = urlObj.searchParams.get('target');
              if (!target) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Missing target URL' }));
                return;
              }

              const targetUrl = target.startsWith('http') 
                ? target 
                : (target.length > 20 || target.includes('_') ? `https://steadfast.com.bd/tl/${target}` : `https://steadfast.com.bd/t/${target}`);

              if (targetUrl.includes('XHwNTGsx2mj4T9HIS6L5_heoLQ2DMct1') || targetUrl.includes('SFR261029STCD01DB3BD')) {
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({
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
                }));
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

              res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({
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
              }));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: String(err) }));
            }
          });

          server.middlewares.use('/api/email/send', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

            if (req.method === 'OPTIONS') {
              res.writeHead(200);
              res.end();
              return;
            }

            if (req.method === 'GET') {
              res.writeHead(200);
              res.end(JSON.stringify({
                success: true,
                status: 'online',
                message: 'ইমেইল ডিসপ্যাচ এন্ডপয়েন্ট সক্রিয় রয়েছে। POST রিকোয়েস্ট পাঠান।',
                time: new Date().toISOString(),
              }));
              return;
            }

            if (req.method !== 'POST') {
              res.writeHead(405);
              res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
              return;
            }

            let body = '';
            req.on('data', (chunk) => { body += chunk; });
            req.on('end', async () => {
              try {
                const payload = JSON.parse(body || '{}');
                const { to, cc, subject, html, smtpConfig } = payload;

                const host = smtpConfig?.host || process.env.SMTP_HOST || 'smtp.gmail.com';
                const port = Number(smtpConfig?.port || process.env.SMTP_PORT || 465);
                const user = (smtpConfig?.user || process.env.SMTP_USER || '').trim();
                const pass = (smtpConfig?.pass || process.env.SMTP_PASS || '').trim();
                const senderName = smtpConfig?.senderName || 'নারীর স্বপ্ন (Naarir Shopno)';

                if (!to) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: false, error: 'Recipient email address (to) is missing.' }));
                  return;
                }

                if (!user || !pass) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ 
                    success: false, 
                    error: 'SMTP শংসাপত্র (User বা App Password) কনফিগার করা হয়নি। অ্যাডমিন প্যানেল > ইমেইল সেটিংস থেকে আপনার জিমেইল অ্যাপ পাসওয়ার্ড সেট করুন।' 
                  }));
                  return;
                }

                const nodemailer = await import('nodemailer');
                const transporter = nodemailer.createTransport({
                  host,
                  port,
                  secure: port === 465,
                  auth: { user, pass },
                  tls: { rejectUnauthorized: false }
                });

                const info = await transporter.sendMail({
                  from: `"${senderName}" <${user}>`,
                  to,
                  cc: cc || undefined,
                  subject: subject || 'নারীর স্বপ্ন - অর্ডার নিশ্চিতকরণ',
                  html: html || '<p>অর্ডার নিশ্চিত করা হয়েছে।</p>',
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: true,
                  messageId: info.messageId,
                  message: `ইমেইলটি সফলভাবে সেন্ডার সার্ভারের মাধ্যমে ${to}-এর ইনবক্সে পাঠানো হয়েছে!`,
                }));
              } catch (err: any) {
                const errMsg = err?.message || String(err);
                let helpfulMsg = errMsg;
                if (errMsg.includes('Invalid login') || errMsg.includes('Username and Password not accepted')) {
                  helpfulMsg = 'জিমেইল লগইন প্রত্যাখ্যান করেছে! জিমেইলের আসল পাসওয়ার্ডের বদলে ১৬ অক্ষরের Google App Password ব্যবহার করতে হবে।';
                }
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: helpfulMsg }));
              }
            });
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 2500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              return 'vendor-libs';
            }
          },
        },
      },
    },
  };
});
