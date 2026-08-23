'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Copy, 
  Check, 
  Clock, 
  QrCode, 
  AlertTriangle, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  RefreshCw,
  Wallet
} from 'lucide-react';
import { Order } from '@/lib/types';
import { formatUsdt, truncateAddress, getExpiryCountdown } from '@/lib/utils';

interface BinancePayWidgetProps {
  order: Order;
  onVerify: (txHash?: string) => Promise<void>;
  isVerifying: boolean;
}

export default function BinancePayWidget({
  order,
  onVerify,
  isVerifying,
}: BinancePayWidgetProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [txHashInput, setTxHashInput] = useState('');
  const [countdown, setCountdown] = useState(getExpiryCountdown(order.expiresAt));

  // Generate QR Code
  useEffect(() => {
    // Generate QR code with either BEP20 address or Binance Pay payload
    const qrPayload = `ethereum:${order.paymentDetails.bep20Address}?value=0&gas=100000`;
    QRCode.toDataURL(qrPayload || order.paymentDetails.bep20Address, {
      width: 260,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#F0B90B',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [order]);

  // Countdown timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getExpiryCountdown(order.expiresAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [order.expiresAt]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-400/30 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Countdown */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center font-extrabold shadow-lg shadow-amber-400/20">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Binance Pay / USDT Transfer</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                ACTIVE
              </span>
            </h3>
            <p className="text-xs text-zinc-400">Order #{order.id}</p>
          </div>
        </div>

        {/* Live Expiration Timer */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
          countdown.minutes < 3 
            ? 'bg-red-500/15 border-red-500/30 text-red-400 animate-pulse'
            : 'bg-zinc-900 border-white/10 text-amber-300'
        }`}>
          <Clock className="w-4 h-4" />
          <span>Expires in: {countdown.formatted}</span>
        </div>
      </div>

      {/* Exact Amount Notification Banner */}
      <div className="my-6 p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold text-amber-300">
              IMPORTANT: Send the EXACT Amount Shown Below
            </p>
            <p className="mt-1 text-zinc-300 text-xs">
              We added a unique <strong className="text-amber-400 font-mono">+{order.verificationFee.toFixed(4)} USDT</strong> micro-offset to your order. Our Binance API automatically matches this exact decimal to activate your subscription instantly!
            </p>
          </div>
        </div>
      </div>

      {/* Grid: QR Code & Payment Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* QR Code Column */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-zinc-950/80 rounded-2xl border border-white/10">
          <div className="relative p-2 bg-amber-400 rounded-xl shadow-xl shadow-amber-400/15">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Binance Pay / BEP20 QR Code" className="w-48 h-48 rounded-lg" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-black font-bold">
                <QrCode className="w-12 h-12 animate-pulse" />
              </div>
            )}
          </div>
          <span className="text-[11px] text-zinc-400 mt-2 font-medium">Scan with Binance App or Web3 Wallet</span>
        </div>

        {/* Payment Copy Fields */}
        <div className="md:col-span-7 space-y-3.5">
          {/* Field 1: Exact Total USDT to Send */}
          <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-amber-400/40">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span className="font-semibold text-amber-300">EXACT AMOUNT TO SEND (USDT):</span>
              <span className="text-[10px] text-zinc-500 font-mono">Includes +0.0123 verification fee</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xl sm:text-2xl font-extrabold text-white">
                {order.totalAmount.toFixed(4)} <span className="text-amber-400 text-base">USDT</span>
              </span>
              <button
                onClick={() => copyToClipboard(order.totalAmount.toFixed(4), 'amount')}
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-amber-400/30"
              >
                {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'amount' ? 'Copied!' : 'Copy Amount'}</span>
              </button>
            </div>
          </div>

          {/* Field 2: Binance Pay ID */}
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
            <div className="text-xs text-zinc-400 mb-1 font-semibold">
              OPTION A: BINANCE PAY ID (0 Fee Instant Transfer)
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm sm:text-base font-bold text-zinc-200">
                {order.paymentDetails.binancePayId}
              </span>
              <button
                onClick={() => copyToClipboard(order.paymentDetails.binancePayId, 'payid')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all flex items-center gap-1"
              >
                {copiedField === 'payid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'payid' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Field 3: USDT BEP-20 Wallet Address */}
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1 font-semibold">
              <span>OPTION B: BEP-20 USDT ADDRESS (BNB Smart Chain)</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs sm:text-sm text-zinc-300 truncate max-w-[240px]">
                {order.paymentDetails.bep20Address}
              </span>
              <button
                onClick={() => copyToClipboard(order.paymentDetails.bep20Address, 'address')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all flex items-center gap-1"
              >
                {copiedField === 'address' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'address' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Action Bar */}
      <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
        {/* Optional Tx Hash input */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
            Already Transferred? Enter Transaction Hash / TxID (Optional for faster verification):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. 0x9a8f23... or Binance Internal Transfer TxID"
              value={txHashInput}
              onChange={(e) => setTxHashInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-amber-400/50"
            />
            <button
              onClick={() => onVerify(txHashInput)}
              disabled={isVerifying}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-400/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Checking Binance API...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-black" />
                  <span>I Have Paid (Verify Now)</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 text-center">
          Payment confirmation usually takes 30-90 seconds. Once confirmed, your subscription credentials and license keys will appear right on this page!
        </p>
      </div>
    </div>
  );
}
