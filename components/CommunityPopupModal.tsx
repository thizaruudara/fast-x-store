'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ExternalLink,
  Gift,
  Bell
} from 'lucide-react';

interface CommunityPopupModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CommunityPopupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check if user chose not to see popup in this session
    const dismissed = sessionStorage.getItem('fastx_community_popup_dismissed');
    if (!dismissed) {
      // Trigger popup 1 second after page load/reload
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem('fastx_community_popup_hide', 'true');
    }
    sessionStorage.setItem('fastx_community_popup_dismissed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0e131f] border border-amber-400/40 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-amber-400/10 my-auto text-center overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-gradient-to-r from-amber-400/20 via-cyan-400/20 to-emerald-400/20 blur-xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white transition-all z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon / Badge */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-black border border-amber-400/40 p-2 shadow-lg shadow-amber-400/20 flex items-center justify-center">
            <img
              src="/fastx-logo.jpg"
              alt="Fast X Solutions"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-black"></span>
          </span>
        </div>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold mb-2.5">
          <Gift className="w-3.5 h-3.5" />
          <span>Exclusive VIP Drops & Free Giveaways</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Join Fast X Official <span className="gradient-text">Communities</span>
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed px-1">
          Get instant access to daily account restocks, promo discount codes, 24/7 priority support, and flash giveaways!
        </p>

        {/* Community Action Buttons */}
        <div className="mt-5 space-y-2.5 text-left">
          {/* Button 1: Telegram Channel 1 */}
          <a
            href="https://t.me/fastX_vpnpro"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDismiss}
            className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 border border-[#0088cc]/40 hover:border-[#0088cc] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0088cc] text-white flex items-center justify-center shadow-md shadow-[#0088cc]/30 flex-shrink-0 group-hover:scale-105 transition-transform">
                <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs sm:text-sm text-white">Fast X VIP Telegram</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#0088cc]/30 text-cyan-200 border border-[#0088cc]/40">
                    VIP 1
                  </span>
                </div>
                <p className="text-[11px] text-cyan-200/80">@fastX_vpnpro • Daily Stock & Drops</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* Button 2: Telegram Channel 2 */}
          <a
            href="https://t.me/fastxvpnpro"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDismiss}
            className="group flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/30 to-cyan-900/30 hover:from-blue-900/50 hover:to-cyan-900/50 border border-cyan-400/30 hover:border-cyan-400 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-black flex items-center justify-center shadow-md shadow-cyan-400/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 fill-black" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs sm:text-sm text-white">Fast X Updates & Promo</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                    VIP 2
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">@fastxvpnpro • Flash Codes & Announcements</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* Button 3: WhatsApp Community */}
          <a
            href="https://chat.whatsapp.com/HjiKPBRCYVhEP89wHqohu9"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDismiss}
            className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 hover:border-[#25D366] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-black flex items-center justify-center shadow-md shadow-[#25D366]/30 flex-shrink-0 group-hover:scale-105 transition-transform font-bold">
                <MessageCircle className="w-5 h-5 fill-black text-black" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs sm:text-sm text-white">WhatsApp VIP Community</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#25D366]/30 text-emerald-200 border border-[#25D366]/40">
                    CHAT
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/80">Direct Customer Chat & Admin Support</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Footer / Continue to store */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
          <label className="flex items-center gap-2 text-[11px] text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-white/20 bg-zinc-900 text-amber-400 focus:ring-0"
            />
            <span>Don't show again</span>
          </label>

          <button
            onClick={handleDismiss}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all"
          >
            Continue to Store →
          </button>
        </div>
      </div>
    </div>
  );
}
