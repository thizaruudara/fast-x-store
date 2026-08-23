'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  Settings, 
  Save, 
  Check, 
  Wallet, 
  Key, 
  Bell, 
  Tag,
  Mail,
  Send,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { StoreSettings } from '@/lib/types';
import { INITIAL_SETTINGS } from '@/lib/initialData';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  // Test Email State
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<{ success: boolean; msg: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setFeedback('Fast X Store settings updated successfully!');
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      setTestEmailStatus({ success: false, msg: 'Please enter a valid email address' });
      return;
    }

    setSendingTestEmail(true);
    setTestEmailStatus(null);

    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: testEmailRecipient,
          settings: settings,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailStatus({ success: true, msg: data.message || 'Test email dispatched successfully!' });
      } else {
        setTestEmailStatus({ success: false, msg: data.error || 'Failed to send test email' });
      }
    } catch (err: any) {
      setTestEmailStatus({ success: false, msg: err.message || 'Error communicating with server' });
    } finally {
      setSendingTestEmail(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#07090e] text-zinc-100">
      <AdminSidebar onLogout={() => {}} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 2xl:p-10 w-full min-w-0 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Fast X Store Settings</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Configure crypto wallet deposit addresses, promo code banner display, Telegram handles, and 2FA settings.
            </p>
          </div>
        </div>

        {feedback && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Promo Code Banner Display Controller */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Storefront Promo Code Banner Display</h2>
                <p className="text-xs text-zinc-400">Control whether the promotional code pill is displayed in the hero section</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-950 border border-white/10">
              <input
                type="checkbox"
                id="showPromoBanner"
                checked={settings.showPromoBanner ?? true}
                onChange={(e) => setSettings({ ...settings, showPromoBanner: e.target.checked })}
                className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-amber-400 focus:ring-0"
              />
              <label htmlFor="showPromoBanner" className="text-sm font-bold text-white cursor-pointer">
                Display Promo Code Banner on Storefront Hero
              </label>
            </div>

            {(settings.showPromoBanner ?? true) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Banner Promo Code</label>
                  <input
                    type="text"
                    value={settings.promoBannerCode || 'AI2026'}
                    onChange={(e) => setSettings({ ...settings, promoBannerCode: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-amber-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Banner Promo Subtext</label>
                  <input
                    type="text"
                    value={settings.promoBannerText || 'Save an extra 20% on any plan today!'}
                    onChange={(e) => setSettings({ ...settings, promoBannerText: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Binance Pay & Crypto Verification */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Binance Pay & Crypto Settings</h2>
                <p className="text-xs text-zinc-400">Manage payment destinations and automated micro-fee matching</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Binance Pay ID (0-fee Transfer ID)
                </label>
                <input
                  type="text"
                  required
                  value={settings.binancePayId}
                  onChange={(e) => setSettings({ ...settings, binancePayId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white font-mono"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Your Binance User ID / Pay ID shown on the payment screen.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center justify-between">
                  <span>Automated Verification Micro-Offset</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wide border border-emerald-500/30">
                    ⚡ Dynamic Active
                  </span>
                </label>
                <div className="p-2.5 bg-zinc-950 border border-amber-400/30 rounded-xl">
                  <div className="text-xs font-mono font-bold text-amber-400">
                    +0.0101 to +0.0999 USDT (Unique per Order)
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1 leading-tight">
                    Every active pending order gets a distinct 4-decimal total amount (e.g. $8.0184 vs $8.0420) so Binance deposits match 100% uniquely without collisions.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                USDT BEP-20 Wallet Address (BNB Smart Chain)
              </label>
              <input
                type="text"
                required
                value={settings.bep20WalletAddress}
                onChange={(e) => setSettings({ ...settings, bep20WalletAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white font-mono"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Your direct BEP-20 receiving wallet for customers paying on-chain.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <span>Binance Read-Only API Integration</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] lowercase font-normal">optional</span>
                </h3>
              </div>

              {/* Explanatory Guide Box */}
              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-white/10 text-xs space-y-2 text-zinc-300">
                <p className="font-semibold text-amber-300">💡 How Live Binance Verification Works:</p>
                <ul className="space-y-1.5 list-disc list-inside text-zinc-400 text-[11px]">
                  <li><strong className="text-zinc-200">When Enabled (Live Mode):</strong> The store automatically queries Binance's official Deposit History API using your <em>Read-Only</em> API keys. When an incoming USDT transfer matching the exact order amount arrives in your Binance account, the order marks as paid and credentials auto-deliver instantly.</li>
                  <li><strong className="text-zinc-200">When Disabled (Test / Manual Mode):</strong> You can test orders freely without API keys, and customers can submit their Transaction Hash (TxID) to complete verification.</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Binance API Key (Read-Only)</label>
                  <input
                    type="password"
                    placeholder="Enter Binance API Key"
                    value={settings.binanceApiKey}
                    onChange={(e) => setSettings({ ...settings, binanceApiKey: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Binance API Secret</label>
                  <input
                    type="password"
                    placeholder="Enter Binance Secret"
                    value={settings.binanceApiSecret}
                    onChange={(e) => setSettings({ ...settings, binanceApiSecret: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-zinc-900/60 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="enableLiveBinanceApi"
                  checked={settings.enableLiveBinanceApi}
                  onChange={(e) => setSettings({ ...settings, enableLiveBinanceApi: e.target.checked })}
                  className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-amber-400 focus:ring-0"
                />
                <label htmlFor="enableLiveBinanceApi" className="text-xs text-zinc-300 cursor-pointer">
                  <strong>Enable Live Binance API Polling</strong> (Queries your real Binance deposit history)
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Storefront & Support Branding */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="p-2 rounded-xl bg-cyan-400/10 text-cyan-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Storefront Announcements & Support</h2>
                <p className="text-xs text-zinc-400">Customise the top announcement banner and customer contact links</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Store Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Telegram Support Handle</label>
                <input
                  type="text"
                  value={settings.telegramSupportHandle}
                  onChange={(e) => setSettings({ ...settings, telegramSupportHandle: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Top Announcement Bar Text</label>
              <input
                type="text"
                value={settings.announcementText}
                onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="announcementActive"
                checked={settings.announcementActive}
                onChange={(e) => setSettings({ ...settings, announcementActive: e.target.checked })}
                className="rounded bg-zinc-900 border-white/20 text-amber-400"
              />
              <label htmlFor="announcementActive" className="text-xs text-zinc-300">
                Show top announcement bar on storefront
              </label>
            </div>
          </div>

          {/* Section 4: Automated Domain Email System (fast-x.store) */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="p-2 rounded-xl bg-emerald-400/10 text-emerald-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Automated Domain Email System (fast-x.store)</h2>
                <p className="text-xs text-zinc-400">Send order receipts, login credentials, and 2FA keys directly to customer inboxes</p>
              </div>
            </div>

            {/* Email Toggle */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-950 border border-white/10">
              <input
                type="checkbox"
                id="sendOrderConfirmationEmail"
                checked={settings.sendOrderConfirmationEmail}
                onChange={(e) => setSettings({ ...settings, sendOrderConfirmationEmail: e.target.checked })}
                className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-amber-400"
              />
              <div>
                <label htmlFor="sendOrderConfirmationEmail" className="text-xs sm:text-sm font-bold text-white block cursor-pointer">
                  Auto-email login credentials upon verified payment
                </label>
                <p className="text-[11px] text-zinc-400">
                  Customers will automatically receive a dark-mode branded receipt containing their account email, password, and 2FA key.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Email Dispatch Provider</label>
                <select
                  value={settings.emailProvider}
                  onChange={(e) => setSettings({ ...settings, emailProvider: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="resend">Resend.com (Recommended for Cloudflare)</option>
                  <option value="disabled">Disabled (Do not send emails)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Resend API Key</label>
                <input
                  type="password"
                  placeholder="re_123456789_..."
                  value={settings.resendApiKey}
                  onChange={(e) => setSettings({ ...settings, resendApiKey: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Get your free API key from <a href="https://resend.com/api-keys" target="_blank" className="text-amber-400 hover:underline">resend.com/api-keys</a> (3,000 free emails/mo).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Sender Email Address</label>
                <input
                  type="email"
                  placeholder="orders@fast-x.store"
                  value={settings.senderEmail}
                  onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-1">e.g. <code className="text-emerald-400">orders@fast-x.store</code> or <code className="text-emerald-400">support@fast-x.store</code></p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Sender Display Name</label>
                <input
                  type="text"
                  placeholder="Fast X Solutions"
                  value={settings.senderName}
                  onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white"
                />
              </div>
            </div>

            {/* Test Email Dispatch Box */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send a Live Test Email</span>
                </h4>
                <span className="text-[10px] text-zinc-400">Verifies Cloudflare DNS & Resend</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="email"
                  placeholder="Enter your personal email (e.g. yourname@gmail.com)"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  className="w-full sm:flex-1 px-3.5 py-2 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={sendingTestEmail || !testEmailRecipient}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-800 hover:bg-amber-400 hover:text-black text-zinc-200 text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>{sendingTestEmail ? 'Sending...' : 'Send Test'}</span>
                </button>
              </div>

              {testEmailStatus && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  testEmailStatus.success 
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/10 text-red-300 border border-red-500/30'
                }`}>
                  {testEmailStatus.success ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                  <span>{testEmailStatus.msg}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Security & Passcode */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="p-2 rounded-xl bg-purple-400/10 text-purple-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Admin Security Passcode</h2>
                <p className="text-xs text-zinc-400">Passcode used to unlock this admin panel</p>
              </div>
            </div>

            <div className="max-w-xs">
              <label className="block text-xs font-bold text-zinc-300 mb-1">Admin Passcode</label>
              <input
                type="text"
                required
                value={settings.adminPasscode}
                onChange={(e) => setSettings({ ...settings, adminPasscode: e.target.value })}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white font-mono"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-sm sm:text-base shadow-xl shadow-amber-400/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Store Configuration'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
