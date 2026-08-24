'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  MessageSquare, 
  ArrowLeft, 
  Clock, 
  AlertCircle, 
  Key, 
  RefreshCw, 
  Zap,
  Mail,
  Lock,
  ShieldCheck,
  ExternalLink,
  HelpCircle,
  QrCode
} from 'lucide-react';
import BinancePayWidget from '@/components/BinancePayWidget';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BrandLogo from '@/components/BrandLogo';
import { Order } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{ success?: boolean; message?: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      const [orderRes, settingsRes] = await Promise.all([
        fetch(`/api/orders/${orderId}`),
        fetch('/api/settings')
      ]);

      if (!orderRes.ok) throw new Error('Order not found');
      const data: Order = await orderRes.json();
      const settingsData = settingsRes.ok ? await settingsRes.json() : null;

      if (settingsData && data.paymentDetails) {
        if (settingsData.binancePayId) data.paymentDetails.binancePayId = settingsData.binancePayId;
        if (settingsData.bep20WalletAddress) data.paymentDetails.bep20Address = settingsData.bep20WalletAddress;
      }

      setOrder(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Polling loop if order is pending
  useEffect(() => {
    if (!order || order.status === 'delivered') return;

    const interval = setInterval(() => {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.status) {
            setOrder(data);
            if (data.status === 'delivered' || data.status === 'paid') {
              clearInterval(interval);
            }
          }
        })
        .catch((e) => console.error(e));
    }, 6000);

    return () => clearInterval(interval);
  }, [order?.status, orderId]);

  // Trigger celebration confetti when delivered
  useEffect(() => {
    if (order?.status === 'delivered' || order?.status === 'paid') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F0B90B', '#00F0FF', '#10B981'],
      });
    }
  }, [order?.status]);

  const handleVerify = async (txHash?: string) => {
    if (!order) return;
    setIsVerifying(true);
    setVerificationFeedback(null);

    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          txHash: txHash || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setVerificationFeedback({ success: true, message: data.message });
        setOrder(data.order);
      } else {
        setVerificationFeedback({ success: false, message: data.message });
      }
    } catch (err) {
      setVerificationFeedback({ success: false, message: 'Verification error. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const copyText = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(identifier);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Helper to parse key string into structured credential
  const parseKey = (keyString: string) => {
    let clean = keyString;
    let prefix = '';

    if (keyString.startsWith('[') && keyString.includes(']: ')) {
      const splitIdx = keyString.indexOf(']: ');
      prefix = keyString.substring(1, splitIdx);
      clean = keyString.substring(splitIdx + 3).trim();
    } else if (keyString.includes('): ')) {
      const splitIdx = keyString.indexOf('): ');
      prefix = keyString.substring(0, splitIdx + 1);
      clean = keyString.substring(splitIdx + 3).trim();
    }

    const parts = clean.split(':').map((p) => p.trim());
    if (parts.length >= 2 && parts[0].includes('@')) {
      return {
        prefix,
        isAccount: true,
        email: parts[0],
        password: parts[1],
        twoFactorSecret: parts.length >= 3 ? parts[2] : undefined,
        raw: clean,
      };
    }

    return {
      prefix,
      isAccount: false,
      raw: clean,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center animate-spin mb-4">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-zinc-300 font-bold text-sm">Retrieving order details from blockchain ledger...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 max-w-md">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-white">Order Not Found</h2>
          <p className="text-xs text-zinc-400 mt-1">{error || 'Please check your Order ID and try again.'}</p>
          <Link href="/" className="inline-block mt-4 px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold">
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = order.status === 'delivered' || order.status === 'paid';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        activeCategory="all"
        onSelectCategory={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
        cartCount={0}
        onOpenCart={() => {}}
      />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fast X Storefront</span>
        </Link>

        {/* Order Header Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Order ID:</span>
                <span className="font-mono text-base font-extrabold text-amber-400">{order.id}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Delivery Email: <strong className="text-white">{order.customerEmail}</strong>
              </p>
            </div>

            {/* Status Pill */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse'
              }`}>
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                <span className="uppercase">
                  {order.status === 'delivered' ? 'DELIVERED & ACTIVE' : order.status === 'paid' ? 'PAYMENT VERIFIED' : 'AWAITING PAYMENT'}
                </span>
              </span>
            </div>
          </div>

          {/* Verification Feedback Banner */}
          {verificationFeedback && (
            <div className={`mt-6 p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-2.5 ${
              verificationFeedback.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-400/10 border-amber-400/30 text-amber-200'
            }`}>
              {verificationFeedback.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{verificationFeedback.success ? 'Success!' : 'Notice'}</p>
                <p className="mt-0.5">{verificationFeedback.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* COMPLETED STATUS: Display Digital Credentials & 2FA Helper */}
        {isCompleted ? (
          <div className="space-y-6">
            {/* Success Hero Card */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/40 relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center font-bold flex-shrink-0 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    Subscription Activated & Ready!
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                    Your payment of <strong className="text-amber-400 font-mono">{order.totalAmount.toFixed(4)} USDT</strong> was matched and confirmed.
                  </p>
                </div>
              </div>

              {/* Digital Account Credentials List */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Your Subscription Account Credentials:</span>
                </h4>

                {order.deliveredKeys && order.deliveredKeys.length > 0 ? (
                  <div className="space-y-4">
                    {order.deliveredKeys.map((keyContent, idx) => {
                      const parsed = parseKey(keyContent);

                      if (parsed.isAccount && parsed.email && parsed.password) {
                        return (
                          <div
                            key={idx}
                            className="p-5 rounded-2xl bg-zinc-950 border border-emerald-500/40 space-y-3"
                          >
                            {parsed.prefix && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold mb-1">
                                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                                <span>{parsed.prefix}</span>
                              </div>
                            )}

                            {/* Email Box */}
                            <div className="flex items-center justify-between gap-3 p-3 bg-zinc-900/80 rounded-xl border border-white/5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                                <div>
                                  <span className="text-[10px] text-zinc-400 block uppercase font-bold">Account Email / Username</span>
                                  <span className="font-mono text-sm text-white font-bold truncate block">{parsed.email}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => copyText(parsed.email!, `email-${idx}`)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1 flex-shrink-0 transition-all"
                              >
                                {copiedField === `email-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedField === `email-${idx}` ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>

                            {/* Password Box */}
                            <div className="flex items-center justify-between gap-3 p-3 bg-zinc-900/80 rounded-xl border border-white/5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                <div>
                                  <span className="text-[10px] text-zinc-400 block uppercase font-bold">Account Password</span>
                                  <span className="font-mono text-sm text-white font-bold truncate block">{parsed.password}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => copyText(parsed.password!, `pass-${idx}`)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1 flex-shrink-0 transition-all"
                              >
                                {copiedField === `pass-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedField === `pass-${idx}` ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>

                            {/* 2FA Secret Key Box (if available) */}
                            {parsed.twoFactorSecret && (
                              <div className="flex items-center justify-between gap-3 p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                  <div>
                                    <span className="text-[10px] text-emerald-300 block uppercase font-bold">2FA Secret Key (For Login Code)</span>
                                    <span className="font-mono text-sm text-emerald-200 font-bold truncate block">{parsed.twoFactorSecret}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => copyText(parsed.twoFactorSecret!, `2fa-${idx}`)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold flex items-center gap-1 flex-shrink-0 transition-all shadow-sm"
                                >
                                  {copiedField === `2fa-${idx}` ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span>{copiedField === `2fa-${idx}` ? 'Copied' : 'Copy 2FA Key'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Generic license code / link
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-between gap-3"
                        >
                          <div className="font-mono text-xs sm:text-sm text-emerald-300 break-all">
                            {keyContent}
                          </div>
                          <button
                            onClick={() => copyText(keyContent, `raw-${idx}`)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1 flex-shrink-0"
                          >
                            {copiedField === `raw-${idx}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedField === `raw-${idx}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-400/30 text-xs text-zinc-300 space-y-2">
                    <p className="text-amber-300 font-bold">⚡ Order Confirmed & Queued for Instant Dispatch</p>
                    <p>Our concierge staff has been notified. Your account invite/credentials are being generated and dispatched to <strong className="text-white">{order.customerEmail}</strong>.</p>
                  </div>
                )}

                {/* 2FA How-To Instructions Guide */}
                <div className="mt-6 p-5 rounded-2xl bg-zinc-900/90 border border-amber-400/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>How to Login & Get Your 2FA Code</span>
                  </div>

                  <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
                    <p>
                      <strong>Step 1:</strong> Go to the official login page (e.g. <span className="text-white font-mono">chatgpt.com</span>, <span className="text-white font-mono">gemini.google.com</span>, <span className="text-white font-mono">capcut.com</span>, <span className="text-white font-mono">netflix.com</span>) and sign in using your <strong>Email</strong> and <strong>Password</strong> above.
                    </p>
                    <p>
                      <strong>Step 2:</strong> If prompted for a <strong>2FA Verification Code</strong>:
                    </p>
                    <div className="pl-3 border-l-2 border-amber-400/50 space-y-1.5">
                      <p>• Copy your <strong>2FA Secret Key</strong> shown in the green box above.</p>
                      <p>• Open <a href="https://2fa.online" target="_blank" rel="noopener noreferrer" className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1"><span>2fa.online</span> <ExternalLink className="w-3 h-3 inline" /></a> (or <a href="https://2fa.live" target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-bold hover:underline inline-flex items-center gap-1"><span>2fa.live</span></a>).</p>
                      <p>• Paste your 2FA key into the website and copy the generated <strong>6-digit code</strong> to complete your sign-in.</p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <a
                      href="https://2fa.online"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>Open 2fa.online</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Extra Notes */}
                {order.deliveryNotes && (
                  <div className="mt-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/5 text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                    <strong className="text-white block mb-1">Additional Information:</strong>
                    {order.deliveryNotes}
                  </div>
                )}
              </div>

              {/* Telegram Support Footer */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-zinc-400">Need personal assistance or replacement?</p>
                <a
                  href="https://t.me/fastx_owner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/15 hover:border-cyan-400/40 text-xs font-semibold text-cyan-300 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Contact Fast X Support: @fastx_owner</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* PENDING STATUS: Show Live Binance Pay Payment Widget */
          <div className="space-y-6">
            <BinancePayWidget
              order={order}
              onVerify={handleVerify}
              isVerifying={isVerifying}
            />

            {/* Order Items Breakdown with Brand Logos */}
            <div className="glass-card rounded-3xl p-6 border border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Purchased Subscriptions:
              </h3>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs sm:text-sm py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <BrandLogo
                        name={item.productName}
                        logoUrl={item.logoUrl}
                        size="sm"
                      />
                      <div>
                        <span className="font-bold text-white">{item.productName}</span>
                        <span className="text-amber-400 ml-2">({item.planName} x{item.quantity})</span>
                      </div>
                    </div>
                    <span className="font-mono text-zinc-200 font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
