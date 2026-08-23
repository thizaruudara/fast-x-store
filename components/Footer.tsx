'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, MessageSquare, Lock, Wallet, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#07090e] pt-12 pb-8 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-black border border-white/20 overflow-hidden flex items-center justify-center shadow-lg shadow-black/80 flex-shrink-0">
                <img
                  src="/fastx-logo.jpg"
                  alt="Fast X Solutions"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-extrabold text-lg text-white">
                FAST <span className="text-amber-400">X</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Wholesale crypto marketplace for ChatGPT Plus, Gemini Advanced, CapCut Pro VIP, and 4K streaming plans with instant 2FA credentials.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/20 font-bold text-[10px] flex items-center gap-1">
                <Wallet className="w-3 h-3" />
                <span>Binance Pay Verified</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
              Popular Subscriptions
            </h4>
            <ul className="space-y-2">
              <li><span className="hover:text-amber-300 cursor-pointer">ChatGPT Plus (GPT-4o)</span></li>
              <li><span className="hover:text-amber-300 cursor-pointer">Gemini Advanced (Google One)</span></li>
              <li><span className="hover:text-amber-300 cursor-pointer">CapCut Pro VIP (PC/Mobile)</span></li>
              <li><span className="hover:text-amber-300 cursor-pointer">Netflix Premium 4K HDR</span></li>
              <li><span className="hover:text-amber-300 cursor-pointer">Claude Pro (Anthropic Sonnet 3.5)</span></li>
            </ul>
          </div>

          {/* Payment Methods Info */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
              Payment & Security
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 text-emerald-400">
                <Zap className="w-3.5 h-3.5" />
                <span>Binance Pay (Active)</span>
              </li>
              <li className="flex items-center gap-1.5 text-emerald-400">
                <Zap className="w-3.5 h-3.5" />
                <span>USDT BEP-20 (Active)</span>
              </li>
              <li className="text-zinc-500">Credit / Debit Cards (Coming Soon)</li>
              <li className="text-zinc-500">PayPal / Local Bank (Coming Soon)</li>
              <li className="text-zinc-400">256-Bit SSL Encrypted</li>
            </ul>
          </div>

          {/* Support & Admin */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
              Customer Support
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://t.me/fastX_vpnpro" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>VIP Telegram: @fastX_vpnpro</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://chat.whatsapp.com/HjiKPBRCYVhEP89wHqohu9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1.5 font-bold"
                >
                  <span>💬 WhatsApp VIP Community</span>
                </a>
              </li>
              <li className="text-zinc-400">Response Time: Under 10 Minutes</li>
              <li className="text-zinc-400">100% Replacement Warranty</li>
              <li className="text-emerald-400 font-medium">⚡ 24/7 Automated Instant Dispatch</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          <p>© {new Date().getFullYear()} Fast X Subscriptions Store. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-300 cursor-pointer">Warranty Agreement</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
