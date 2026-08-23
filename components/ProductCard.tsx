'use client';

import React, { useState } from 'react';
import { 
  Check, 
  Zap, 
  ShoppingCart, 
  Star, 
  Info,
  ShieldCheck,
} from 'lucide-react';
import { Product, PlanDuration, CurrencyCode } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { getProductWarranty } from '@/lib/warranty';
import BrandLogo from './BrandLogo';

interface ProductCardProps {
  product: Product;
  currency?: CurrencyCode;
  onBuyNow: (product: Product, plan: PlanDuration) => void;
  onAddToCart: (product: Product, plan: PlanDuration) => void;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({
  product,
  currency = 'USDT',
  onBuyNow,
  onAddToCart,
  onViewDetails,
}: ProductCardProps) {
  // Select popular plan by default, or first plan
  const defaultPlan = product.plans.find(p => p.popular) || product.plans[0];
  const [selectedPlan, setSelectedPlan] = useState<PlanDuration>(defaultPlan);
  const [justAdded, setJustAdded] = useState(false);
  const warrantyInfo = getProductWarranty(product);

  const handleAdd = () => {
    onAddToCart(product, selectedPlan);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between relative group border border-white/[0.08] hover:border-amber-400/40">
      {/* Top Badge & Rating */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {product.badge && (() => {
            const b = product.badge.toUpperCase();
            let badgeClass = 'bg-amber-400/20 text-amber-300 border-amber-400/30';
            if (b.includes('BEST VALUE') || b.includes('TOP VALUE')) {
              badgeClass = 'bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500 text-black shadow-md shadow-emerald-400/30 font-black';
            } else if (b.includes('BEST SELLER') || b.includes('BESTSELLER')) {
              badgeClass = 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md shadow-amber-400/30 font-black';
            } else if (b.includes('HOT')) {
              badgeClass = 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md shadow-red-500/20';
            } else if (b.includes('TRENDING')) {
              badgeClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40';
            } else if (b.includes('POPULAR')) {
              badgeClass = 'bg-purple-500/20 text-purple-300 border-purple-400/40';
            } else if (b.includes('4K') || b.includes('HDR')) {
              badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
            }
            return (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase border border-white/10 ${badgeClass}`}>
                {b.includes('BEST VALUE') ? '🌟 ' + product.badge : product.badge}
              </span>
            );
          })()}
          {/* Dynamic Warranty Badge */}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${warrantyInfo.badgeColor}`}>
            {warrantyInfo.shortBadge}
          </span>
        </div>

        {/* Rating */}
        <div className="text-[11px] text-zinc-400 flex items-center gap-1 flex-shrink-0">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="font-semibold text-white">{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>
      </div>

      {/* Product Header with Official Brand Logo */}
      <div className="flex items-start gap-3.5 mb-3">
        <BrandLogo
          slug={product.slug}
          name={product.name}
          logoUrl={product.logoUrl}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors truncate">
            {product.name}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-1">{product.tagline}</p>
        </div>
      </div>

      {/* Plan Duration Selector Tabs */}
      <div className="my-3">
        <p className="text-[11px] font-semibold text-zinc-400 mb-1.5 flex items-center justify-between">
          <span>SELECT DURATION:</span>
          {(() => {
            const savingsText = selectedPlan.savings || (selectedPlan.originalPrice && selectedPlan.originalPrice > selectedPlan.price ? `${Math.round(((selectedPlan.originalPrice - selectedPlan.price) / selectedPlan.originalPrice) * 100)}% OFF` : null);
            return savingsText ? <span className="text-amber-400 font-bold">{savingsText}</span> : null;
          })()}
        </p>
        {/* Dynamic Grid for 1, 2, 3, 4+ plans */}
        <div className={`grid gap-1.5 ${
          product.plans.length === 1
            ? 'grid-cols-1'
            : product.plans.length === 2
            ? 'grid-cols-2'
            : product.plans.length === 4
            ? 'grid-cols-2 sm:grid-cols-4'
            : 'grid-cols-3'
        }`}>
          {product.plans.map((plan) => {
            const isSelected = selectedPlan.id === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all text-center border ${
                  isSelected
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-sm shadow-amber-400/20'
                    : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
                }`}
              >
                <div className="truncate">{plan.name}</div>
                <div className="text-[10px] font-mono text-zinc-300">
                  {formatCurrency(plan.price, currency, plan.priceLkr)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Key Features List Preview */}
      <div className="space-y-1.5 my-3 pt-2 border-t border-white/5">
        {product.features.slice(0, 3).map((feat, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{feat}</span>
          </div>
        ))}
      </div>

      {/* Pricing & CTA */}
      <div className="pt-3 border-t border-white/5 mt-auto">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              {formatCurrency(selectedPlan.price, currency, selectedPlan.priceLkr)}
            </span>
            {selectedPlan.originalPrice && (
              <span className="ml-2 text-xs text-zinc-500 line-through">
                {formatCurrency(selectedPlan.originalPrice, currency, selectedPlan.originalPriceLkr)}
              </span>
            )}
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            {currency === 'LKR' ? `≈ $${selectedPlan.price.toFixed(2)} USDT` : `≈ Rs. ${new Intl.NumberFormat('en-LK').format(selectedPlan.priceLkr || Math.round(selectedPlan.price * 310))}`}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-5 gap-2">
          {/* Quick Buy Button - Emerald Green */}
          <button
            onClick={() => onBuyNow(product, selectedPlan)}
            className="col-span-3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 hover:from-emerald-300 hover:to-green-500 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>Buy Now</span>
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            className={`col-span-1 p-2.5 rounded-xl border transition-all flex items-center justify-center ${
              justAdded
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-white hover:border-amber-400/40'
            }`}
            title="Add to Cart"
          >
            {justAdded ? <Check className="w-4 h-4 text-emerald-400" /> : <ShoppingCart className="w-4 h-4" />}
          </button>

          {/* View Details Modal Button */}
          <button
            onClick={() => onViewDetails(product)}
            className="col-span-1 p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-cyan-400/40 transition-all flex items-center justify-center"
            title="View Full Details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
