'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Star, 
  ArrowRight,
  ShoppingCart
} from 'lucide-react';
import { Product, PlanDuration, CurrencyCode } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { getProductWarranty } from '@/lib/warranty';
import BrandLogo from './BrandLogo';

interface ProductDetailModalProps {
  product: Product | null;
  currency?: CurrencyCode;
  isOpen: boolean;
  onClose: () => void;
  onBuyNow: (product: Product, plan: PlanDuration) => void;
  onAddToCart: (product: Product, plan: PlanDuration) => void;
}

export default function ProductDetailModal({
  product,
  currency = 'USDT',
  isOpen,
  onClose,
  onBuyNow,
  onAddToCart,
}: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  const defaultPlan = product.plans.find(p => p.popular) || product.plans[0];
  const [selectedPlan, setSelectedPlan] = useState<PlanDuration>(defaultPlan);
  const [addedToast, setAddedToast] = useState(false);
  const warrantyInfo = getProductWarranty(product);

  // Lock background body scroll when modal is open
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

  const handleAdd = () => {
    onAddToCart(product, selectedPlan);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0e131f] border border-white/15 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-black/90 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6">
          <BrandLogo
            slug={product.slug}
            name={product.name}
            logoUrl={product.logoUrl}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {product.name}
              </h2>
              {product.badge && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-black">
                  {product.badge}
                </span>
              )}
              {/* Dynamic Warranty Pill */}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${warrantyInfo.badgeColor}`}>
                {warrantyInfo.shortBadge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">{product.tagline}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-bold">{product.rating}</span>
              <span className="text-zinc-500">({product.reviewCount} customer reviews)</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6 bg-zinc-900/50 border border-white/5 p-4 rounded-2xl">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
            About This Plan:
          </h4>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Duration Selection */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
            Select Subscription Duration:
          </label>
          <div className={`grid gap-2 ${
            product.plans.length === 1
              ? 'grid-cols-1'
              : product.plans.length === 2
              ? 'grid-cols-2'
              : product.plans.length === 4
              ? 'grid-cols-2 sm:grid-cols-4'
              : 'grid-cols-2 sm:grid-cols-3'
          }`}>
            {product.plans.map((plan) => {
              const isSelected = selectedPlan.id === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-400/15 border-amber-400 text-white shadow-lg shadow-amber-400/10'
                      : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{plan.name}</span>
                    {(() => {
                      const savingsText = plan.savings || (plan.originalPrice && plan.originalPrice > plan.price ? `${Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)}% OFF` : null);
                      return savingsText ? (
                        <span className="text-[10px] font-extrabold text-amber-400 bg-amber-400/20 px-1.5 py-0.5 rounded">
                          {savingsText}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <div className="mt-1 text-sm font-extrabold text-amber-300 font-mono">
                    {formatCurrency(plan.price, currency, plan.priceLkr)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Features Checklist */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">
            What You Get:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {product.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 bg-zinc-900/40 p-2 rounded-xl border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery & Warranty Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-amber-400/5 border border-amber-400/20 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-300">Instant Delivery</p>
              <p className="text-[11px] text-zinc-400">Credentials & 2FA secret displayed on screen & emailed instantly.</p>
            </div>
          </div>
          <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
            warrantyInfo.type === 'no_warranty'
              ? 'bg-zinc-900/50 border-white/10'
              : 'bg-cyan-400/5 border-cyan-400/20'
          }`}>
            <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-cyan-300">{warrantyInfo.label}</p>
              <p className="text-[11px] text-zinc-400">{warrantyInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Bottom Pricing & Checkout Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-zinc-400 block">Total for {selectedPlan.name}:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">
                {formatCurrency(selectedPlan.price, currency, selectedPlan.priceLkr)}
              </span>
              <span className="text-xs text-amber-400 font-mono">
                {currency === 'LKR' ? `≈ $${selectedPlan.price.toFixed(2)} USDT` : `≈ Rs. ${new Intl.NumberFormat('en-LK').format(selectedPlan.priceLkr || Math.round(selectedPlan.price * 310))}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleAdd}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-zinc-900 border border-white/15 hover:border-amber-400/40 text-zinc-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              <span>{addedToast ? 'Added to Cart!' : 'Add to Cart'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onBuyNow(product, selectedPlan);
              }}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 hover:from-emerald-300 hover:to-green-500 text-black font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Buy Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
