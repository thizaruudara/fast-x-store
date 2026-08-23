'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Check, 
  Calendar, 
  Percent, 
  DollarSign, 
  CheckCircle2 
} from 'lucide-react';
import { Coupon } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minOrder, setMinOrder] = useState<number>(0);
  const [maxUses, setMaxUses] = useState<number>(500);
  const [expiresAt, setExpiresAt] = useState('');

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) setCoupons(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const payload: Partial<Coupon> = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrder),
      maxUses: Number(maxUses),
      expiresAt: expiresAt || undefined,
      isActive: true,
    };

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setCode('');
        setDiscountValue(20);
        showToast('Coupon code created successfully!');
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' });
      setCoupons(coupons.filter(c => c.id !== id));
      showToast('Coupon removed.');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#07090e] text-zinc-100">
      <AdminSidebar onLogout={() => {}} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 2xl:p-10 w-full min-w-0 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Coupons & Promo Codes</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Create and manage promotional discount codes for flash sales and VIP customers.
            </p>
          </div>
        </div>

        {toastMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create Coupon Form */}
          <div className="lg:col-span-5 glass-card rounded-3xl p-6 border border-white/10 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Create New Coupon</h2>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI2026, SUMMER50"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm font-mono text-white placeholder-zinc-500 uppercase focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Value {discountType === 'percentage' ? '(%)' : '($)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Min Order ($)</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Max Usages</label>
                  <input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-400/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 font-bold" />
                <span>Save Coupon</span>
              </button>
            </form>
          </div>

          {/* Coupons Table */}
          <div className="lg:col-span-7 glass-card rounded-3xl p-6 border border-white/10">
            <h2 className="text-base font-bold text-white mb-4">Active Coupon Codes</h2>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[450px] text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-2.5">Code</th>
                    <th className="pb-2.5">Discount</th>
                    <th className="pb-2.5">Usage</th>
                    <th className="pb-2.5">Expiry</th>
                    <th className="pb-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-900/40">
                      <td className="py-3 font-mono font-bold text-amber-400 text-sm">
                        {c.code}
                      </td>
                      <td className="py-3 font-bold text-white">
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                      </td>
                      <td className="py-3 text-zinc-400">
                        {c.usedCount} / {c.maxUses || '∞'}
                      </td>
                      <td className="py-3 text-zinc-400">
                        {c.expiresAt ? c.expiresAt : 'Never'}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(c.id)}
                          className="p-1 rounded bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
