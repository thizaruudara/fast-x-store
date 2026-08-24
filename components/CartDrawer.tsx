'use client';

import React from 'react';
import { 
  X, 
  Trash2, 
  ShoppingCart, 
  ArrowRight, 
  Plus, 
  Minus,
  Zap
} from 'lucide-react';
import { Product, PlanDuration, CurrencyCode } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import BrandLogo from './BrandLogo';

export interface CartItem {
  product: Product;
  plan: PlanDuration;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency?: CurrencyCode;
  onUpdateQuantity: (productId: string, planId: string, delta: number) => void;
  onRemoveItem: (productId: string, planId: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  currency = 'USDT',
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  // Lock background body scroll when cart drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotalUsdt = items.reduce((sum, item) => sum + item.plan.price * item.quantity, 0);
  const subtotalLkr = items.reduce((sum, item) => sum + (item.plan.priceLkr || Math.round(item.plan.price * 310)) * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-y-0 right-0 max-w-full flex w-full justify-end">
        <div className="w-full max-w-md bg-[#0d121d] border-l border-white/10 p-4 sm:p-6 flex flex-col h-full justify-between shadow-2xl overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-black flex items-center justify-center font-bold">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-extrabold text-white">Your Cart ({items.length})</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto py-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-400" />
                <p className="text-sm font-semibold text-zinc-400">Your cart is empty</p>
                <p className="text-xs text-zinc-500 mt-1">Explore our AI & streaming plans above!</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.product.id}-${item.plan.id}`}
                  className="p-4 rounded-2xl bg-zinc-900/70 border border-white/5 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <BrandLogo
                        slug={item.product.slug}
                        name={item.product.name}
                        logoUrl={item.product.logoUrl}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{item.product.name}</h4>
                        <p className="text-xs text-amber-400 font-semibold">{item.plan.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.product.id, item.plan.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 transition-colors flex-shrink-0"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 bg-zinc-950 px-2 py-1 rounded-lg border border-white/10">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.plan.id, -1)}
                        className="p-1 text-zinc-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold text-white px-1.5">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.plan.id, 1)}
                        className="p-1 text-zinc-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-white">
                        {formatCurrency(item.plan.price * item.quantity, currency, (item.plan.priceLkr || Math.round(item.plan.price * 310)) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Checkout Section */}
          {items.length > 0 && (
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Estimated Subtotal:</span>
                <span className="font-mono text-lg font-bold text-white">
                  {formatCurrency(subtotalUsdt, currency, subtotalLkr)}
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>+0.0123 USDT micro-verification fee added at checkout</span>
              </p>

              <button
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 text-black font-extrabold text-sm shadow-xl shadow-amber-400/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Crypto Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
