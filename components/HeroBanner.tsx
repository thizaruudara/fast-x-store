'use client';

import React from 'react';
import { ShieldCheck, Zap, ArrowRight, DollarSign, Wallet } from 'lucide-react';
import { StoreSettings } from '@/lib/types';

interface HeroBannerProps {
  onExploreClick: () => void;
  showPromoBanner?: boolean;
  promoCode?: string;
  promoText?: string;
  storeName?: string;
  storeTagline?: string;
  settings?: StoreSettings;
}

export default function HeroBanner({ 
  onExploreClick, 
  showPromoBanner,
  promoCode = 'AI2026',
  promoText = 'Save an extra 20% on any plan today!',
  storeName = 'Fast X',
  storeTagline,
  settings 
}: HeroBannerProps) {
  // Respect explicit showPromoBanner prop if provided, else fallback to settings
  const showPromo = showPromoBanner !== undefined 
    ? showPromoBanner 
    : (settings ? settings.showPromoBanner : true);
  const activePromoCode = promoCode || settings?.promoBannerCode || 'AI2026';
  const activePromoText = promoText || settings?.promoBannerText || 'Save an extra 20% on any plan today!';

  return (
    <div className="relative overflow-hidden pt-8 pb-12 md:pt-14 md:pb-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-6 shadow-lg shadow-amber-400/10">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>⚡ Automated Binance Pay & USDT Micro-Verification Active</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Fast X <span className="gradient-text">AI & Streaming</span> Subscription Vault
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base md:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Get instant private access to <span className="text-amber-400 font-semibold">ChatGPT Plus</span>, <span className="text-blue-400 font-semibold">Gemini Advanced</span>, <span className="text-cyan-400 font-semibold">CapCut Pro</span>, <span className="text-red-400 font-semibold">Netflix 4K</span> and more. Complete with 2FA setup guides and instant email delivery.
          </p>

          {/* Promo code badge (Toggleable from Admin Panel) */}
          {showPromo && (
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 p-2 bg-zinc-900/70 border border-white/10 rounded-2xl">
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-300 text-xs font-bold">
                <span>PROMO CODE:</span>
                <span className="font-mono bg-amber-400/20 px-2 py-0.5 rounded text-white tracking-wider">{activePromoCode}</span>
              </div>
              <span className="text-xs text-zinc-400">{activePromoText}</span>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onExploreClick}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 text-black font-bold text-sm sm:text-base shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Browse All Subscriptions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="https://t.me/fastx_owner"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/10 hover:border-cyan-400/40 text-sm sm:text-base font-semibold transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Telegram: @fastx_owner</span>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="glass-card p-3 rounded-xl flex items-center gap-2.5 text-left">
              <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Instant 60s Delivery</p>
                <p className="text-[11px] text-zinc-400">Email, pass & 2FA keys</p>
              </div>
            </div>

            <div className="glass-card p-3 rounded-xl flex items-center gap-2.5 text-left">
              <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Binance Pay & BEP20</p>
                <p className="text-[11px] text-zinc-400">Exact micro-matching</p>
              </div>
            </div>

            <div className="glass-card p-3 rounded-xl flex items-center gap-2.5 text-left">
              <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">100% Replacement</p>
                <p className="text-[11px] text-zinc-400">Full plan warranty</p>
              </div>
            </div>

            <div className="glass-card p-3 rounded-xl flex items-center gap-2.5 text-left">
              <div className="p-2 rounded-lg bg-purple-400/10 text-purple-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Up to 85% Savings</p>
                <p className="text-[11px] text-zinc-400">Direct wholesale pool</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
