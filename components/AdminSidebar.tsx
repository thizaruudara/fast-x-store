'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Key, 
  Tag, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Store,
  Menu,
  X
} from 'lucide-react';

interface AdminSidebarProps {
  onLogout: () => void;
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products & Pricing', icon: Package },
    { href: '/admin/inventory', label: 'Digital Key Vault', icon: Key },
    { href: '/admin/coupons', label: 'Coupons & Discounts', icon: Tag },
    { href: '/admin/orders', label: 'Orders & Crypto Verifier', icon: ShoppingBag },
    { href: '/admin/settings', label: 'Binance & Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header (Displayed on mobile screens, hidden on desktop) */}
      <div className="md:hidden sticky top-0 z-40 w-full bg-[#0a0e17] border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-black border border-white/20 overflow-hidden flex items-center justify-center flex-shrink-0">
            <img
              src="/fastx-logo.jpg"
              alt="Fast X Solutions"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-xs tracking-tight">FAST X <span className="text-amber-400">ADMIN</span></h2>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-over / Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-5 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-black border border-white/20 overflow-hidden flex items-center justify-center">
                  <img
                    src="/fastx-logo.jpg"
                    alt="Fast X Solutions"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm">FAST X <span className="text-amber-400">ADMIN</span></h3>
                  <p className="text-[10px] text-zinc-400">Store Management Console</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                        : 'text-zinc-300 hover:bg-zinc-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-300 bg-zinc-900/80 border border-white/5 hover:text-white"
            >
              <Store className="w-4 h-4 text-cyan-400" />
              <span>View Live Storefront</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Lock / Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Only visible on md screens 768px+) */}
      <aside className="hidden md:flex w-64 bg-[#0a0e17] border-r border-white/10 flex-col justify-between p-4 min-h-screen flex-shrink-0">
        <div>
          {/* Admin Brand */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl bg-black border border-white/20 overflow-hidden flex items-center justify-center shadow-md shadow-black/80 flex-shrink-0">
              <img
                src="/fastx-logo.jpg"
                alt="Fast X Solutions"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-sm tracking-tight">FAST X <span className="text-amber-400">ADMIN</span></h2>
              <p className="text-[10px] text-zinc-400">Store Management Console</p>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
          >
            <Store className="w-4 h-4 text-cyan-400" />
            <span>View Live Storefront</span>
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Lock / Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
