import { Order, StoreSettings } from './types';
import { getSettings } from './db';

/**
 * Builds a styled, dark-mode HTML email receipt with credentials and 2FA instructions
 */
export function generateOrderReceiptHtml(order: Order, settings: StoreSettings): string {
  const tgHandle = settings.telegramSupportHandle || '@fastx_owner';
  const tgUrl = `https://t.me/${tgHandle.replace('@', '')}`;
  const storeName = settings.storeName || 'Fast X Solutions';

  // Format delivered keys into HTML cards
  let credentialsHtml = '';
  if (order.deliveredKeys && order.deliveredKeys.length > 0) {
    credentialsHtml = order.deliveredKeys.map((keyContent, idx) => {
      let label = `Item #${idx + 1}`;
      let clean = keyContent;

      if (keyContent.startsWith('[') && keyContent.includes(']: ')) {
        const splitIdx = keyContent.indexOf(']: ');
        label = keyContent.substring(1, splitIdx);
        clean = keyContent.substring(splitIdx + 3).trim();
      } else if (keyContent.includes('): ')) {
        const splitIdx = keyContent.indexOf('): ');
        label = keyContent.substring(0, splitIdx + 1);
        clean = keyContent.substring(splitIdx + 3).trim();
      }

      const parts = clean.split(':').map((p) => p.trim());
      const isAccount = parts.length >= 2 && parts[0].includes('@');

      if (isAccount) {
        const email = parts[0];
        const pass = parts[1];
        const twoFa = parts.length >= 3 ? parts[2] : null;

        return `
          <div style="background: #0f141e; border: 1px solid #22c55e40; border-radius: 12px; padding: 16px; margin-bottom: 14px;">
            <div style="font-size: 13px; font-weight: bold; color: #fbbf24; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
              ⚡ ${label}
            </div>
            <table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #9ca3af; width: 120px; font-weight: bold;">Login Email:</td>
                <td style="padding: 6px 0; color: #ffffff; font-weight: bold; word-break: break-all;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #9ca3af; font-weight: bold;">Password:</td>
                <td style="padding: 6px 0; color: #38bdf8; font-weight: bold; word-break: break-all;">${pass}</td>
              </tr>
              ${twoFa ? `
              <tr>
                <td style="padding: 6px 0; color: #9ca3af; font-weight: bold;">2FA Secret Key:</td>
                <td style="padding: 6px 0; color: #34d399; font-weight: bold; word-break: break-all;">${twoFa}</td>
              </tr>
              ` : ''}
            </table>
          </div>
        `;
      }

      // Generic license / invite link
      return `
        <div style="background: #0f141e; border: 1px solid #fbbf2440; border-radius: 12px; padding: 16px; margin-bottom: 14px;">
          <div style="font-size: 13px; font-weight: bold; color: #fbbf24; margin-bottom: 8px;">
            ⚡ ${label}
          </div>
          <div style="font-family: monospace; font-size: 13px; color: #ffffff; word-break: break-all; background: #07090e; padding: 10px; border-radius: 8px;">
            ${clean}
          </div>
        </div>
      `;
    }).join('');
  }

  // Items summary list
  const itemsHtml = order.items.map((item) => `
    <tr>
      <td style="padding: 8px 0; color: #ffffff; font-weight: bold;">
        ${item.productName} <span style="color: #fbbf24; font-size: 12px;">(${item.planName})</span> x${item.quantity || 1}
      </td>
      <td style="padding: 8px 0; color: #34d399; font-weight: bold; text-align: right;">
        $${((item.price || 0) * (item.quantity || 1)).toFixed(2)} USDT
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Order Receipt & Credentials - ${order.id}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #07090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e7eb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #07090e; padding: 30px 10px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #0c1017; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
              
              <!-- Header Bar -->
              <tr>
                <td style="padding: 24px 30px; background: linear-gradient(135deg, #181d28 0%, #0c1017 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
                  <img 
                    src="https://fast-x.store/fastx-logo.jpg" 
                    width="64" 
                    height="64" 
                    alt="Fast X Solutions" 
                    style="display: inline-block; margin-bottom: 8px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.2); background-color: #000000;" 
                  />
                  <div style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                    FAST <span style="color: #fbbf24;">X</span>
                  </div>
                  <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">
                    AI & Subscriptions Vault • Verified Delivery
                  </div>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 30px;">
                  
                  <!-- Success Banner -->
                  <div style="background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; text-align: center;">
                    <div style="color: #4ade80; font-size: 16px; font-weight: bold;">
                      Payment Confirmed & Order Delivered! 🎉
                    </div>
                    <div style="color: #9ca3af; font-size: 12px; margin-top: 4px;">
                      Order ID: <strong style="color: #ffffff; font-family: monospace;">${order.id}</strong>
                    </div>
                  </div>

                  <!-- Purchased Items Summary -->
                  <div style="margin-bottom: 24px;">
                    <div style="font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                      Order Summary
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px;">
                      ${itemsHtml}
                      <tr>
                        <td style="padding: 12px 0 6px; color: #e5e7eb; font-weight: bold;">Total Paid (USDT):</td>
                        <td style="padding: 12px 0 6px; color: #fbbf24; font-weight: 900; font-size: 16px; text-align: right;">
                          $${order.totalAmount.toFixed(4)} USDT
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Subscription Credentials Section -->
                  <div style="margin-bottom: 24px;">
                    <div style="font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                      🔑 Your Subscription Credentials
                    </div>
                    ${credentialsHtml || '<p style="color:#9ca3af; font-size:13px;">No digital credentials attached to this order.</p>'}
                  </div>

                  <!-- 2FA How-To Guide Box -->
                  <div style="background: #111827; border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                    <div style="font-size: 13px; font-weight: bold; color: #fbbf24; margin-bottom: 8px;">
                      🛡️ How to use 2FA Secret Key (6-Digit Code)
                    </div>
                    <ol style="margin: 0; padding-left: 20px; font-size: 12px; color: #d1d5db; line-height: 1.6;">
                      <li>Copy your <strong>2FA Secret Key</strong> from above.</li>
                      <li>Visit <a href="https://2fa.online" target="_blank" style="color: #38bdf8; font-weight: bold; text-decoration: underline;">2fa.online</a> or <a href="https://2fa.live" target="_blank" style="color: #38bdf8; font-weight: bold; text-decoration: underline;">2fa.live</a>.</li>
                      <li>Paste the 2FA key to get your instant 6-digit authentication code.</li>
                      <li>Log in and enjoy your subscription!</li>
                    </ol>
                  </div>

                  <!-- Direct Telegram Support CTA Button -->
                  <div style="text-align: center; margin-bottom: 20px;">
                    <a href="${tgUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);">
                      💬 Need Help? Contact Us on Telegram (${tgHandle})
                    </a>
                  </div>

                  <div style="text-align: center;">
                    <p style="font-size: 11px; color: #6b7280; margin: 0;">
                      Fast X Telegram: <a href="${tgUrl}" style="color: #9ca3af; text-decoration: underline;">${tgHandle}</a> • 24/7 Automated Delivery
                    </p>
                  </div>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 16px 30px; background-color: #07090e; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
                  <p style="font-size: 11px; color: #4b5563; margin: 0;">
                    © ${new Date().getFullYear()} ${storeName}. All rights reserved. • Domain: fast-x.store
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
 * Sends order credentials email to customer
 */
export async function sendOrderCredentialsEmail(order: Order): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = getSettings();

    // Check if customer email exists and email delivery is enabled
    if (!order.customerEmail || !order.customerEmail.includes('@')) {
      return { success: false, error: 'No valid customer email on order' };
    }

    if (settings.emailProvider === 'disabled' || !settings.sendOrderConfirmationEmail) {
      console.log('Email delivery is disabled in Fast X store settings.');
      return { success: false, error: 'Email delivery is disabled in settings' };
    }

    const htmlContent = generateOrderReceiptHtml(order, settings);
    const fromAddress = `${settings.senderName || 'Fast X Solutions'} <${settings.senderEmail || 'orders@fast-x.store'}>`;
    const subject = `🎉 Order Delivered: Your Fast X Subscription Credentials [${order.id}]`;

    // 1. Resend API Dispatch
    if (settings.emailProvider === 'resend') {
      const apiKey = settings.resendApiKey || process.env.RESEND_API_KEY;

      if (!apiKey) {
        console.warn('Resend API key is not configured in Fast X settings.');
        return { success: false, error: 'Resend API key is missing. Add it in Admin Settings.' };
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [order.customerEmail],
          subject: subject,
          html: htmlContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Resend API Error:', data);
        return { success: false, error: data.message || 'Failed to send email via Resend' };
      }

      console.log(`Successfully dispatched credentials email to ${order.customerEmail} (ID: ${data.id})`);
      return { success: true };
    }

    return { success: false, error: 'Unsupported email provider' };
  } catch (error: any) {
    console.error('Error sending order credentials email:', error);
    return { success: false, error: error.message || 'Internal email error' };
  }
}

/**
 * Sends a test email to verify Cloudflare DNS / Resend setup
 */
export async function sendTestEmail(toEmail: string, customSettings?: Partial<StoreSettings>): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const currentSettings = getSettings();
    const settings = { ...currentSettings, ...customSettings };

    const apiKey = settings.resendApiKey || process.env.RESEND_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'Resend API key is required to send emails.' };
    }

    const fromAddress = `${settings.senderName || 'Fast X Solutions'} <${settings.senderEmail || 'orders@fast-x.store'}>`;
    const tgHandle = settings.telegramSupportHandle || '@fastx_owner';

    const testHtml = `
      <div style="background-color: #07090e; color: #ffffff; padding: 30px; font-family: sans-serif; border-radius: 12px;">
        <h2 style="color: #fbbf24;">⚡ Fast X Solutions — Email System Test</h2>
        <p style="color: #9ca3af;">Congratulations! Your Cloudflare domain <strong>fast-x.store</strong> is verified and connected to the Fast X email engine.</p>
        <div style="background: #111827; padding: 15px; border-radius: 8px; border: 1px solid #374151; margin: 15px 0;">
          <p style="margin: 0; color: #34d399; font-weight: bold;">✔ Status: Operational</p>
          <p style="margin: 5px 0 0; color: #9ca3af; font-size: 13px;">Sender: ${fromAddress}</p>
          <p style="margin: 5px 0 0; color: #9ca3af; font-size: 13px;">Support Telegram: ${tgHandle}</p>
        </div>
        <p style="font-size: 12px; color: #6b7280;">Sent automatically from Fast X Store Admin Console.</p>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toEmail],
        subject: `⚡ Test Email from fast-x.store (${settings.storeName})`,
        html: testHtml,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || 'Resend error while sending test email' };
    }

    return { success: true, message: `Test email sent successfully to ${toEmail}!` };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to dispatch test email' };
  }
}
