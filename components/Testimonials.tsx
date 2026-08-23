'use client';

import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      name: "Alex Vance",
      handle: "@alex_vfx",
      rating: 5,
      product: "CapCut Pro VIP (1 Year)",
      text: "Paid with Binance Pay, and literally 45 seconds later my activation code popped up on screen. Working flawlessly on both PC and iPhone!",
      date: "2 hours ago"
    },
    {
      name: "Sophia Chen",
      handle: "@sophia_ai_art",
      rating: 5,
      product: "Gemini Advanced + Google One 2TB",
      text: "Gemini 2.0 Pro with 1M context is insane for my research. Saved over $170 compared to buying directly from Google. Will renew next year!",
      date: "Yesterday"
    },
    {
      name: "Marcus Miller",
      handle: "@marcus_dev",
      rating: 5,
      product: "ChatGPT Plus & Netflix 4K",
      text: "The exact micro USDT decimal payment verification worked like a charm. No need to wait for manual email checks.",
      date: "3 days ago"
    }
  ];

  return (
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-bold mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>4.9 / 5 Average Rating (1,400+ Reviews)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            What Our Customers Say
          </h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-md">
          Verified purchasers who paid with Binance Pay & USDT on NexusAI Store.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="glass-card p-6 rounded-2xl border border-white/[0.08] relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-zinc-500">{rev.date}</span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed mb-4">
                "{rev.text}"
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{rev.name}</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                </p>
                <p className="text-[11px] text-zinc-500">{rev.handle}</p>
              </div>
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">
                {rev.product}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
