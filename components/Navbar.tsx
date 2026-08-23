import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ShoppingCart, 
  Search, 
  MessageSquare, 
  Lock, 
  Menu, 
  X,
  Zap,
  ShoppingBag,
  User
} from 'lucide-react';
import { ProductCategory } from '@/lib/types';
import { CustomerUser } from '@/lib/auth';
import GoogleAuthButton from './GoogleAuthButton';

interface NavbarProps {
  activeCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  announcement?: string;
  telegramHandle?: string;
  user?: CustomerUser | null;
  currency?: 'USDT' | 'LKR';
  onCurrencyChange?: (curr: 'USDT' | 'LKR') => void;
  onOpenOrders?: () => void;
  onLoginSuccess?: (user: CustomerUser) => void;
}

export default function Navbar({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
  currency = 'USDT',
  onCurrencyChange,
  announcement = "⚡ FAST X: Use code 'AI2026' for 20% OFF | Automated Binance Pay +0.0123 USDT Verification Active",
  telegramHandle = "@fastx_owner",
  user,
  onOpenOrders,
  onLoginSuccess,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories: { id: ProductCategory; label: string }[] = [
    { id: 'all', label: 'All Plans' },
    { id: 'ai', label: '🤖 AI Tools' },
    { id: 'video', label: '🎬 Video & Audio' },
    { id: 'streaming', label: '📺 Streaming & 4K' },
    { id: 'design', label: '🎨 Design & Creative' },
    { id: 'developer', label: '💻 Developer AI' },
  ];

  const tgUrl = `https://t.me/${telegramHandle.replace('@', '')}`;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#07090e]/85 border-b border-white/[0.06]">
      {/* Top Flash Announcement Bar */}
      {announcement && (
        <div className="bg-gradient-to-r from-amber-500/15 via-cyan-500/15 to-purple-500/15 border-b border-white/[0.06] py-1.5 px-4 text-center">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs md:text-sm font-medium text-amber-300">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>{announcement}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-black border border-white/20 overflow-hidden flex items-center justify-center shadow-lg shadow-amber-400/10 group-hover:scale-105 group-hover:border-amber-400/50 transition-all flex-shrink-0">
              <img
                src="/fastx-logo.jpg"
                alt="Fast X Solutions"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-white whitespace-nowrap flex items-center">
                FAST&nbsp;<span className="text-amber-400">X</span>
              </span>
              <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold rounded bg-amber-400/15 text-amber-300 border border-amber-400/30 whitespace-nowrap">
                SOLUTIONS
              </span>
            </div>
          </Link>

          {/* Search Input (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search plans (ChatGPT, Gemini, CapCut, Netflix)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/90 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector (USDT / LKR) */}
            {onCurrencyChange && (
              <div className="flex items-center p-0.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-bold shadow-sm">
                <button
                  type="button"
                  onClick={() => onCurrencyChange('USDT')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    currency === 'USDT'
                      ? 'bg-amber-400 text-black shadow-md font-extrabold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Show prices in USDT"
                >
                  USDT
                </button>
                <button
                  type="button"
                  onClick={() => onCurrencyChange('LKR')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    currency === 'LKR'
                      ? 'bg-emerald-400 text-black shadow-md font-extrabold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Show prices in Sri Lankan Rupees (LKR)"
                >
                  LKR
                </button>
              </div>
            )}

            {/* Binance Pay badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-xs font-semibold text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Binance Pay Active</span>
            </div>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-white hover:border-amber-400/40 transition-all flex items-center gap-2"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-amber-400 text-black font-bold text-xs flex items-center justify-center shadow-lg shadow-amber-400/30">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Telegram Support Link */}
            <a
              href={tgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-300 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-cyan-500/40 rounded-xl transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>{telegramHandle}</span>
            </a>

            {/* Google User Profile or Sign-In */}
            {user ? (
              <button
                onClick={onOpenOrders}
                className="flex items-center gap-1.5 p-1 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-amber-400/40 text-white transition-all shadow-md group"
                title="View My Purchases & Subscriptions"
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-amber-400/50 flex-shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-black font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold">
                  <span className="max-w-[90px] truncate text-zinc-200">{user.name.split(' ')[0]}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                    Orders
                  </span>
                </div>
              </button>
            ) : onLoginSuccess ? (
              <div className="hidden lg:flex items-center">
                <GoogleAuthButton compact onLoginSuccess={onLoginSuccess} />
              </div>
            ) : null}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 flex flex-col gap-3.5 bg-black/90 backdrop-blur-xl px-2 rounded-b-2xl">
            {/* Google Sign-In prompt inside mobile menu if not signed in */}
            {!user && onLoginSuccess && (
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-amber-400/20 flex flex-col items-center gap-2 text-center">
                <span className="text-xs text-zinc-300 font-medium">Sign in to track orders & keys:</span>
                <GoogleAuthButton onLoginSuccess={(u) => { onLoginSuccess(u); setMobileMenuOpen(false); }} />
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search plans (Gemini, CapCut, Netflix)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-900 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            
            {/* Category pills inside mobile menu */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-amber-400 text-black font-extrabold shadow-md'
                      : 'bg-zinc-800/80 text-zinc-300 border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-cyan-400 font-semibold"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Telegram Support: {telegramHandle}</span>
              </a>
            </div>
          </div>
        )}

        {/* Desktop Category Navigation Pills */}
        <div className="hidden md:flex items-center gap-2 py-2.5 overflow-x-auto no-scrollbar border-t border-white/[0.04]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold shadow-md shadow-amber-400/20'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-white/5'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
