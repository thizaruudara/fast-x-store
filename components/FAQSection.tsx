'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Zap, ShieldCheck } from 'lucide-react';

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does the Binance Pay & +0.0123 USDT verification work?",
      a: "To verify your payment automatically without requiring manual staff checks, our system adds a distinctive micro-fee (e.g. +0.0123 USDT) to your order. When you transfer the exact amount (e.g. 19.9923 USDT) via Binance Pay or BEP-20, our Binance ledger API instantly identifies your specific payment and delivers your credentials in seconds."
    },
    {
      q: "How fast do I receive my subscription after payment?",
      a: "Instant! If the product has digital keys in our stock vault (like CapCut codes, Canva invite links, Netflix profiles), the credentials will immediately unlock on your order tracking page as soon as the blockchain confirms your transaction."
    },
    {
      q: "What payment networks and coins are supported?",
      a: "Currently, USDT via BEP-20 (BNB Smart Chain) and zero-fee internal Binance Pay ID transfers are fully active. We also display Credit Cards (Stripe) and PayPal as 'Coming Soon' while their merchant integrations finish."
    },
    {
      q: "What is your 100% Replacement Warranty?",
      a: "If any subscription ceases to work or gets locked during your purchased duration, message our 24/7 Telegram concierge (@NexusAISupport) with your Order ID for an immediate replacement account/key or store credit."
    },
    {
      q: "Can I use discount coupons on top of the discounted prices?",
      a: "Yes! You can enter promotional coupons (such as 'AI2026') during checkout to receive additional percentage or fixed dollar discounts on your total order."
    }
  ];

  return (
    <section className="py-14 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-bold mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Got Questions? We've Got Answers.
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="glass-card rounded-2xl border border-white/[0.08] overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:text-amber-300 transition-colors"
              >
                <span className="text-sm sm:text-base font-bold text-white">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-amber-400 flex-shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/5">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
