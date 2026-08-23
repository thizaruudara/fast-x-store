'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  Key, 
  Plus, 
  Trash2, 
  Upload, 
  Copy, 
  Check, 
  Mail, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  Link as LinkIcon,
  Sparkles
} from 'lucide-react';
import { Product, DigitalKey, DeliveryMethodType } from '@/lib/types';

interface AccountRow {
  id: string;
  email: string;
  password: string;
  twoFactorSecret?: string;
  couponCode?: string;
  inviteUrl?: string;
}

export default function AdminInventoryPage() {
  const [keys, setKeys] = useState<DigitalKey[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Product & Plan Selection
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');
  const [uploadFeedback, setUploadFeedback] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delivery Type: 'account_credentials' | 'coupon_key' | 'invite_link'
  const [deliveryType, setDeliveryType] = useState<DeliveryMethodType>('account_credentials');

  // Account Rows State
  const [accountRows, setAccountRows] = useState<AccountRow[]>([
    { id: 'row-1', email: '', password: '', twoFactorSecret: '', couponCode: '', inviteUrl: '' },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [keysRes, prodsRes] = await Promise.all([
        fetch('/api/admin/keys'),
        fetch('/api/products'),
      ]);
      if (keysRes.ok) setKeys(await keysRes.json());
      if (prodsRes.ok) {
        const prods = await prodsRes.json();
        setProducts(prods);
        if (prods.length > 0 && !selectedProductId) {
          setSelectedProductId(prods[0].id);
          setSelectedPlanId(prods[0].plans[0]?.id || '');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddRow = () => {
    setAccountRows([
      ...accountRows,
      { id: `row-${Date.now()}`, email: '', password: '', twoFactorSecret: '', couponCode: '', inviteUrl: '' },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (accountRows.length <= 1) {
      setAccountRows([{ id: 'row-1', email: '', password: '', twoFactorSecret: '', couponCode: '', inviteUrl: '' }]);
      return;
    }
    setAccountRows(accountRows.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: keyof AccountRow, value: string) => {
    const updated = [...accountRows];
    updated[index] = { ...updated[index], [field]: value };
    setAccountRows(updated);
  };

  const handleSaveAccounts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    let payloadAccounts: any[] = [];

    if (deliveryType === 'account_credentials') {
      payloadAccounts = accountRows
        .filter(r => r.email.trim() && r.password.trim())
        .map(r => ({
          email: r.email.trim(),
          password: r.password.trim(),
          twoFactorSecret: r.twoFactorSecret ? r.twoFactorSecret.trim() : undefined,
          deliveryType: 'account_credentials'
        }));
      if (payloadAccounts.length === 0) {
        alert('Please fill in at least one valid Email and Password.');
        return;
      }
    } else if (deliveryType === 'coupon_key') {
      payloadAccounts = accountRows
        .filter(r => (r.couponCode && r.couponCode.trim()))
        .map(r => ({
          couponCode: r.couponCode?.trim(),
          content: r.couponCode?.trim() || '',
          deliveryType: 'coupon_key'
        }));
      if (payloadAccounts.length === 0) {
        alert('Please enter at least one Coupon / License Key.');
        return;
      }
    } else if (deliveryType === 'invite_link') {
      payloadAccounts = accountRows
        .filter(r => (r.inviteUrl && r.inviteUrl.trim()))
        .map(r => ({
          inviteUrl: r.inviteUrl?.trim(),
          content: r.inviteUrl?.trim() || '',
          deliveryType: 'invite_link'
        }));
      if (payloadAccounts.length === 0) {
        alert('Please enter at least one Activation / Invite URL Link.');
        return;
      }
    }

    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          planId: selectedPlanId,
          accounts: payloadAccounts,
          deliveryType
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUploadFeedback(`✅ Successfully deposited ${data.count} items! Stock amount has been automatically updated.`);
        setAccountRows([{ id: 'row-1', email: '', password: '', twoFactorSecret: '', couponCode: '', inviteUrl: '' }]);
        fetchData();
        setTimeout(() => setUploadFeedback(''), 4500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await fetch(`/api/admin/keys?id=${id}`, { method: 'DELETE' });
      setKeys(keys.filter(k => k.id !== id));
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const copyKeyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentProduct = products.find(p => p.id === selectedProductId);
  const filteredKeys = filterProduct === 'all' 
    ? keys 
    : keys.filter(k => k.productId === filterProduct);

  const availableCount = filteredKeys.filter(k => !k.isUsed).length;
  const usedCount = filteredKeys.filter(k => k.isUsed).length;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#07090e] text-zinc-100">
      <AdminSidebar onLogout={() => {}} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 2xl:p-10 w-full min-w-0 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Digital Key Vault & Stock Inventory</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Deposit accounts, coupon keys, or invite links. Stock amounts calculate automatically in real-time.
            </p>
          </div>
        </div>

        {uploadFeedback && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{uploadFeedback}</span>
          </div>
        )}

        {/* Section 1: Deposit Form */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-black flex items-center justify-center font-bold shadow-lg shadow-amber-400/20 flex-shrink-0">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Deposit Stock Inventory</h2>
                <p className="text-xs text-zinc-400">Choose delivery format and select product</p>
              </div>
            </div>

            {/* Product and Plan Selectors */}
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Target Product:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const prod = products.find(p => p.id === e.target.value);
                    if (prod && prod.plans.length > 0) {
                      setSelectedPlanId(prod.plans[0].id);
                    }
                  }}
                  className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {currentProduct && currentProduct.plans.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Duration Tier:</label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white"
                  >
                    {currentProduct.plans.map((pl) => (
                      <option key={pl.id} value={pl.id}>{pl.name} (${pl.price.toFixed(2)})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Method Tabs Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-300">
              Select Delivery Format / Type:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('account_credentials')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  deliveryType === 'account_credentials'
                    ? 'bg-amber-400/15 border-amber-400/60 shadow-md shadow-amber-400/10'
                    : 'bg-zinc-900/60 border-white/5 hover:border-white/15'
                }`}
              >
                <div className={`p-2 rounded-xl ${deliveryType === 'account_credentials' ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">🔑 Account Login</h4>
                  <p className="text-[11px] text-zinc-400">Email, Password & 2FA Key</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('coupon_key')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  deliveryType === 'coupon_key'
                    ? 'bg-cyan-400/15 border-cyan-400/60 shadow-md shadow-cyan-400/10'
                    : 'bg-zinc-900/60 border-white/5 hover:border-white/15'
                }`}
              >
                <div className={`p-2 rounded-xl ${deliveryType === 'coupon_key' ? 'bg-cyan-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">🎟️ Coupon / Promo Code</h4>
                  <p className="text-[11px] text-zinc-400">Redeemable License Key</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('invite_link')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  deliveryType === 'invite_link'
                    ? 'bg-emerald-400/15 border-emerald-400/60 shadow-md shadow-emerald-400/10'
                    : 'bg-zinc-900/60 border-white/5 hover:border-white/15'
                }`}
              >
                <div className={`p-2 rounded-xl ${deliveryType === 'invite_link' ? 'bg-emerald-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">🔗 Activation / Invite Link</h4>
                  <p className="text-[11px] text-zinc-400">User clicks & activates on own email</p>
                </div>
              </button>
            </div>
          </div>

          {/* Account Rows Form */}
          <form onSubmit={handleSaveAccounts} className="space-y-4">
            <div className="space-y-3">
              {accountRows.map((row, idx) => (
                <div 
                  key={row.id} 
                  className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Item #{idx + 1}</span>
                    </span>
                    {accountRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="text-zinc-500 hover:text-red-400 p-1 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  {/* Mode 1: Account Credentials */}
                  {deliveryType === 'account_credentials' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-bold text-cyan-300 mb-1 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-cyan-400" />
                          <span>1. Email / Login Username *</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. user2026@gmail.com"
                          value={row.email}
                          onChange={(e) => handleUpdateRow(idx, 'email', e.target.value)}
                          className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white font-mono placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>2. Account Password *</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SecretPass#888"
                          value={row.password}
                          onChange={(e) => handleUpdateRow(idx, 'password', e.target.value)}
                          className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white font-mono placeholder-zinc-600 focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-bold text-emerald-300 mb-1 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>3. 2FA Secret Key (Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. JBSWY3DPEHPK3PXP"
                          value={row.twoFactorSecret}
                          onChange={(e) => handleUpdateRow(idx, 'twoFactorSecret', e.target.value)}
                          className="w-full px-3.5 py-2 bg-zinc-900 border border-emerald-500/30 rounded-xl text-xs sm:text-sm text-emerald-300 font-mono placeholder-zinc-600 focus:border-emerald-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Coupon / Promo Code */}
                  {deliveryType === 'coupon_key' && (
                    <div>
                      <label className="block text-[11px] font-bold text-cyan-300 mb-1 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-cyan-400" />
                        <span>Coupon / License Promo Key *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CAPCUT-VIP-99482-DISCOUNT"
                        value={row.couponCode}
                        onChange={(e) => handleUpdateRow(idx, 'couponCode', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-cyan-400/30 rounded-xl text-xs sm:text-sm text-cyan-300 font-mono placeholder-zinc-600 focus:border-cyan-400 focus:outline-none uppercase"
                      />
                    </div>
                  )}

                  {/* Mode 3: Activation / Invite Link */}
                  {deliveryType === 'invite_link' && (
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-300 mb-1 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3 text-emerald-400" />
                        <span>Direct Activation / Invite URL Link * (Customer clicks to activate on personal email)</span>
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="e.g. https://www.canva.com/brand/join?token=fastx_invite_token_8899"
                        value={row.inviteUrl}
                        onChange={(e) => handleUpdateRow(idx, 'inviteUrl', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-emerald-400/30 rounded-xl text-xs sm:text-sm text-emerald-300 font-mono placeholder-zinc-600 focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddRow}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>+ Add Another Row</span>
              </button>

              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-400/20 hover:scale-[1.01] transition-all flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Save & Auto-Calculate Stock ({accountRows.length})</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Vault Accounts Inventory Table */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Current Stock Vault Inventory</h2>
              <p className="text-xs text-zinc-400">All available and claimed inventory stored in database</p>
            </div>

            {/* Filter by Product */}
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white"
            >
              <option value="all">All Products ({keys.length})</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <p className="text-[10px] uppercase font-bold text-emerald-300">Available Stock</p>
              <p className="text-xl font-mono font-extrabold">{availableCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400">
              <p className="text-[10px] uppercase font-bold text-zinc-300">Claimed / Delivered</p>
              <p className="text-xl font-mono font-extrabold">{usedCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-bold text-amber-300">Total Deposited</p>
              <p className="text-xl font-mono font-extrabold">{filteredKeys.length}</p>
            </div>
          </div>

          {/* Keys Table */}
          {loading ? (
            <div className="text-center py-12 text-zinc-500 text-xs">Loading stock vault...</div>
          ) : filteredKeys.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-xs">
              <Key className="w-12 h-12 mx-auto mb-2 opacity-30 text-amber-400" />
              <p>No inventory found. Use the deposit form above to add stock!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Delivery Content / Credentials</th>
                    <th className="pb-3">Format</th>
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredKeys.map((k) => {
                    const prod = products.find(p => p.id === k.productId);
                    const isLink = k.content?.startsWith('http://') || k.content?.startsWith('https://');
                    const isCred = k.email || (k.content?.includes(':') && !isLink);
                    
                    return (
                      <tr key={k.id} className="hover:bg-zinc-900/40">
                        {/* Content Column */}
                        <td className="py-3.5">
                          {isLink ? (
                            <div className="flex items-center gap-2 max-w-sm">
                              <LinkIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              <a 
                                href={k.content} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-emerald-300 font-mono underline truncate hover:text-emerald-200"
                              >
                                {k.content}
                              </a>
                            </div>
                          ) : isCred ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 font-mono text-white font-bold">
                                <Mail className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                                <span>{k.email || k.content.split(':')[0]}</span>
                              </div>
                              <div className="flex items-center gap-1.5 font-mono text-zinc-400 text-[11px]">
                                <Lock className="w-3 h-3 text-amber-400 flex-shrink-0" />
                                <span>{k.password || k.content.split(':')[1] || '••••••'}</span>
                                {k.twoFactorSecret && (
                                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded ml-2">
                                    2FA: {k.twoFactorSecret}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 font-mono text-cyan-300 font-bold">
                              <Tag className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                              <span>{k.content}</span>
                            </div>
                          )}
                        </td>

                        {/* Format Tag */}
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                            isLink 
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : isCred
                              ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                              : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          }`}>
                            {isLink ? '🔗 Invite Link' : isCred ? '🔑 Credentials' : '🎟️ Coupon Code'}
                          </span>
                        </td>

                        {/* Product Column */}
                        <td className="py-3.5 text-zinc-300">
                          <div className="font-bold text-white">{prod?.name || k.productId}</div>
                          <div className="text-[10px] text-zinc-500">{new Date(k.createdAt).toLocaleDateString()}</div>
                        </td>

                        {/* Status Column */}
                        <td className="py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            k.isUsed
                              ? 'bg-zinc-800 text-zinc-500'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {k.isUsed ? 'Claimed' : 'Available'}
                          </span>
                        </td>

                        {/* Actions Column */}
                        <td className="py-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => copyKeyText(k.content, k.id)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                            title="Copy to clipboard"
                          >
                            {copiedId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteKey(k.id)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
