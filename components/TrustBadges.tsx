'use client';

import React from 'react';
import { Zap, ShieldCheck, RefreshCw, MessageSquare, Lock, Award } from 'lucide-react';

export default function TrustBadges() {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "Instant 60s Delivery",
      description: "Our automated key vault reveals your license keys & credentials the second payment is verified on-chain."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />,
      title: "Binance Micro-Verification",
      description: "Automated match using unique +0.0123 USDT decimals. Zero human intervention needed for fast order clearing."
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-emerald-400" />,
      title: "100% Replacement Warranty",
      description: "Full warranty for your entire subscription duration with instant replacement or credit guarantee."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-purple-400" />,
      title: "24/7 Telegram Concierge",
      description: "Direct human assistance ready around the clock for activation help, upgrades, and custom orders."
    }
  ];

  return (
    <section className="py-12 border-t border-b border-white/[0.06] bg-zinc-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Why 10,000+ Creators & Pros Trust <span className="gradient-text">Fast X</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            The safest, fastest crypto marketplace for digital AI tools & streaming plans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="glass-card p-6 rounded-2xl border border-white/[0.08] hover:border-amber-400/30 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-900/90 border border-white/10 flex items-center justify-center mb-4">
                {feat.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{feat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
