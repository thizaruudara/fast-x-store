'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  CreditCard, 
  Lock, 
  Tag, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Zap,
  Wallet
} from 'lucide-react';
import { Product, PlanDuration } from '@/lib/types';
import { formatCurrency, calculateOrderTotal } from '@/lib/utils';
import BrandLogo from './BrandLogo';

import { CustomerUser } from '@/lib/auth';

interface CheckoutItem {
  product: Product;
  plan: PlanDuration;
  quantity: number;
}

interface QuickCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CheckoutItem[];
  onClearCart?: () => void;
  initialEmail?: string;
  user?: CustomerUser | null;
}

export default function QuickCheckoutModal({
  isOpen,
  onClose,
  items,
  onClearCart,
  initialEmail = '',
  user,
}: QuickCheckoutModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [telegram, setTelegram] = useState('');

  // Lock background body scroll when checkout modal is open
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

  // Sync initial email when modal opens or user logs in
  React.useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail, isOpen]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'binance_pay' | 'card' | 'paypal'>('binance_pay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen || items.length === 0) return null;

  const subtotal = items.reduce((sum, item) => sum + item.plan.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const { discountedSubtotal, microFee, totalUsdt } = calculateOrderTotal(subtotal, discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          orderAmount: subtotal,
        }),
      });

      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountAmount: data.discountAmount,
        });
        setCouponError('');
      } else {
        setCouponError(data.error || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setFormError('Please enter a valid delivery email');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: email.trim(),
          telegramUsername: telegram.trim() || undefined,
          items: items.map(i => ({
            productId: i.product.id,
            productName: i.product.name,
            planId: i.plan.id,
            planName: i.plan.name,
            price: i.plan.price,
            quantity: i.quantity,
            logoUrl: i.product.logoUrl,
          })),
          couponCode: appliedCoupon?.code,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create order');
      }

      const order = await res.json();
      if (onClearCart) onClearCart();
      onClose();
      router.push(`/order/${order.id}`);
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong placing your order.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#0e131f] border border-white/15 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-black/90 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold shadow-lg shadow-amber-400/20">
            <Zap className="w-6 h-6 fill-black" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Instant Checkout</h2>
            <p className="text-xs text-zinc-400">Complete your order with Binance Pay / USDT</p>
          </div>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateOrder} className="space-y-5">
          {/* Order Items Summary with Logos */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2.5 max-h-48 overflow-y-auto">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <BrandLogo
                    slug={item.product.slug}
                    name={item.product.name}
                    logoUrl={item.product.logoUrl}
                    size="sm"
                  />
                  <div className="truncate">
                    <span className="font-bold text-white block truncate">{item.product.name}</span>
                    <span className="text-zinc-400 text-[11px]">({item.plan.name} x{item.quantity})</span>
                  </div>
                </div>
                <span className="font-mono text-amber-300 font-semibold flex-shrink-0 ml-2">
                  {formatCurrency(item.plan.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Delivery Contact Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Your Email Address <span className="text-amber-400">*</span> (Where credentials will be sent):
              </label>
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Telegram Username (Optional - for priority concierge delivery):
              </label>
              <input
                type="text"
                placeholder="@yourusername"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60 transition-all"
              />
            </div>
          </div>

          {/* Coupon Code Section */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Have a Discount Coupon?
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Enter code (e.g. AI2026)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white font-mono uppercase focus:outline-none focus:border-amber-400/60"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-xs font-bold text-zinc-200 hover:text-white transition-all"
              >
                {couponLoading ? 'Checking...' : 'Apply'}
              </button>
            </div>

            {appliedCoupon && (
              <p className="mt-1.5 text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-3.5 h-3.5" />
                <span>Coupon '{appliedCoupon.code}' applied! Saved {formatCurrency(appliedCoupon.discountAmount)}</span>
              </p>
            )}
            {couponError && (
              <p className="mt-1.5 text-xs text-red-400 font-medium">{couponError}</p>
            )}
          </div>

          {/* 3 Payment Methods Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2.5">
              Select Payment Method:
            </label>

            <div className="space-y-2">
              {/* Method 1: Binance Pay / USDT (Active) */}
              <div 
                onClick={() => setSelectedPaymentMethod('binance_pay')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedPaymentMethod === 'binance_pay'
                    ? 'bg-amber-400/10 border-amber-400 text-white shadow-lg shadow-amber-400/10'
                    : 'bg-zinc-900/60 border-white/10 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-black flex items-center justify-center font-extrabold">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">Binance Pay & Crypto (USDT)</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-400 text-black">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">BEP-20 (BNB Smart Chain) / Binance Pay ID</p>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-amber-400 bg-amber-400 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                </div>
              </div>

              {/* Method 2: Credit / Debit Card (Coming Soon) */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/30 border border-white/5 opacity-60 flex items-center justify-between cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-400">Credit / Debit Card (Stripe)</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-400 border border-white/10">
                        COMING SOON
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500">Visa, Mastercard, American Express</p>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-zinc-600" />
              </div>

              {/* Method 3: PayPal / Local Pay (Coming Soon) */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/30 border border-white/5 opacity-60 flex items-center justify-between cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-xs">
                    PP
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-400">PayPal & Local Bank Transfer</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-400 border border-white/10">
                        COMING SOON
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500">Instant gateway under integration</p>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-zinc-600" />
              </div>
            </div>
          </div>

          {/* Pricing Breakdown with Micro-Verification Fee */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal:</span>
              <span className="font-mono text-zinc-200">{formatCurrency(subtotal)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-400">
                <span>Coupon Discount ({appliedCoupon.code}):</span>
                <span className="font-mono">-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-amber-300">
              <span className="flex items-center gap-1">
                <span>Verification Micro-Offset:</span>
                <span className="text-[10px] text-zinc-500">(for instant API match)</span>
              </span>
              <span className="font-mono">+{microFee.toFixed(4)} USDT</span>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
              <span className="font-extrabold text-sm text-white">Total Amount to Pay:</span>
              <div className="text-right">
                <span className="font-mono text-lg font-extrabold text-emerald-400">
                  {totalUsdt.toFixed(4)} USDT
                </span>
                <span className="block text-[10px] text-zinc-400">
                  ≈ ${Number(subtotal - discountAmount).toFixed(2)} USD / {formatCurrency(subtotal - discountAmount, 'LKR')}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button - Emerald Green */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 hover:from-emerald-300 hover:to-green-500 text-black font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Generating Binance Payment Session...</span>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-black" />
                <span>Pay with Binance Pay / USDT</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
