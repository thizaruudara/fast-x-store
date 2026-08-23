'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import BrandLogo from '@/components/BrandLogo';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Tag,
  Crown,
  Flame,
  Zap,
  Star
} from 'lucide-react';
import { Product, PlanDuration, ProductCategory, WarrantyType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { WARRANTY_OPTIONS, getProductWarranty } from '@/lib/warranty';

const BADGE_PRESETS = [
  { label: '🌟 BEST VALUE', value: 'BEST VALUE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 font-black' },
  { label: '👑 BEST SELLER', value: 'BEST SELLER', color: 'bg-amber-400/20 text-amber-300 border-amber-400/50 font-black' },
  { label: '🔥 HOT', value: 'HOT', color: 'bg-red-500/20 text-red-300 border-red-400/50' },
  { label: '🚀 TRENDING', value: 'TRENDING', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50' },
  { label: '💎 POPULAR', value: 'POPULAR', color: 'bg-purple-500/20 text-purple-300 border-purple-400/50' },
  { label: '⭐ RECOMMENDED', value: 'RECOMMENDED', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50' },
  { label: '📺 4K HDR', value: '4K HDR', color: 'bg-teal-500/20 text-teal-300 border-teal-400/50' },
  { label: '🚫 No Badge', value: '', color: 'bg-zinc-800 text-zinc-400 border-white/10' },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('ai');
  const [formTagline, setFormTagline] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formBadge, setFormBadge] = useState<string>('BEST VALUE');
  const [formCustomBadge, setFormCustomBadge] = useState<string>('');
  const [formLogoUrl, setFormLogoUrl] = useState<string>('/logos/gemini.svg');
  const [formStock, setFormStock] = useState<number>(20);
  const [formFeatures, setFormFeatures] = useState<string>('');
  const [formInstructions, setFormInstructions] = useState<string>('');
  
  // Warranty State
  const [formWarrantyType, setFormWarrantyType] = useState<WarrantyType>('full_period');
  const [formWarrantyCustom, setFormWarrantyCustom] = useState<string>('');

  const [formPlans, setFormPlans] = useState<PlanDuration[]>([
    { id: 'plan-1m', name: '1 Month', durationDays: 30, price: 9.99, originalPrice: 19.99, priceLkr: 3100, savings: '50% OFF' },
    { id: 'plan-3m', name: '3 Months', durationDays: 90, price: 24.99, originalPrice: 59.99, priceLkr: 7750, savings: '58% OFF', popular: true },
  ]);

  const presetLogos = [
    { label: 'Gemini', path: '/logos/gemini.svg' },
    { label: 'CapCut', path: '/logos/capcut.svg' },
    { label: 'Netflix', path: '/logos/netflix.svg' },
    { label: 'Prime Video', path: '/logos/prime-video.svg' },
    { label: 'ChatGPT', path: '/logos/chatgpt.svg' },
    { label: 'Canva', path: '/logos/canva.svg' },
    { label: 'Claude', path: '/logos/claude.svg' },
    { label: 'Spotify', path: '/logos/spotify.svg' },
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) setProducts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Reordering products (Move Up / Move Down)
  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const reordered = [...products];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    setProducts(reordered);

    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reordered),
      });
      showToast(`Position updated! "${reordered[index - 1].name}" moved to #${index}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= products.length - 1) return;
    const reordered = [...products];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    setProducts(reordered);

    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reordered),
      });
      showToast(`Position updated! "${reordered[index + 1].name}" moved down.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('ai');
    setFormTagline('');
    setFormDesc('');
    setFormBadge('BEST VALUE');
    setFormCustomBadge('');
    setFormLogoUrl('/logos/gemini.svg');
    setFormStock(25);
    setFormWarrantyType('full_period');
    setFormWarrantyCustom('');
    setFormFeatures('Full premium access\nInstant email activation\n100% replacement warranty');
    setFormInstructions('Sign in using the provided account credentials or activation key.');
    setFormPlans([
      { id: `p-${Date.now()}-1`, name: '1 Month', durationDays: 30, price: 7.99, originalPrice: 19.99, priceLkr: 2500, savings: '60% OFF' },
      { id: `p-${Date.now()}-2`, name: '3 Months', durationDays: 90, price: 19.99, originalPrice: 59.99, priceLkr: 6200, savings: '67% OFF', popular: true },
      { id: `p-${Date.now()}-3`, name: '1 Year', durationDays: 365, price: 69.99, originalPrice: 239.99, priceLkr: 21700, savings: '71% OFF' }
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormTagline(p.tagline);
    setFormDesc(p.description);
    
    const isPreset = BADGE_PRESETS.some(bp => bp.value === p.badge);
    if (isPreset || !p.badge) {
      setFormBadge(p.badge || '');
      setFormCustomBadge('');
    } else {
      setFormBadge('CUSTOM');
      setFormCustomBadge(p.badge);
    }

    setFormLogoUrl(p.logoUrl || '/logos/gemini.svg');
    setFormStock(p.stockCount);
    setFormWarrantyType(p.warrantyType || 'full_period');
    setFormWarrantyCustom(p.warrantyCustomText || '');
    setFormFeatures(p.features.join('\n'));
    setFormInstructions(p.instructions || '');
    setFormPlans([...p.plans]);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const chosenWarranty = WARRANTY_OPTIONS.find(w => w.type === formWarrantyType);
    const finalBadge = formBadge === 'CUSTOM' ? formCustomBadge.trim() : formBadge;

    const productPayload: Product = {
      id: editingProduct?.id || `prod-${Date.now()}`,
      name: formName.trim(),
      slug: formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: formCategory,
      tagline: formTagline.trim(),
      description: formDesc.trim(),
      icon: editingProduct?.icon || 'Sparkles',
      logoUrl: formLogoUrl || undefined,
      color: editingProduct?.color || 'from-amber-400 via-yellow-500 to-amber-600',
      badge: finalBadge || undefined,
      warrantyType: formWarrantyType,
      warrantyCustomText: formWarrantyType === 'custom' ? formWarrantyCustom.trim() : undefined,
      warrantyText: formWarrantyType === 'custom' ? formWarrantyCustom.trim() : chosenWarranty?.shortBadge,
      features: formFeatures.split('\n').map(f => f.trim()).filter(Boolean),
      plans: formPlans,
      stockCount: formStock,
      deliveryType: 'account_credentials',
      instructions: formInstructions.trim(),
      isActive: editingProduct ? editingProduct.isActive : true,
      rating: editingProduct?.rating || 4.9,
      reviewCount: editingProduct?.reviewCount || 350,
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload),
      });

      if (res.ok) {
        const saved = await res.json();
        if (editingProduct) {
          setProducts(prev => prev.map(p => p.id === saved.id ? saved : p));
          showToast(`"${saved.name}" updated successfully!`);
        } else {
          setProducts(prev => [saved, ...prev]);
          showToast('New product created!');
        }
        setIsModalOpen(false);
      }
    } catch (e) {
      console.error(e);
      showToast('Error saving product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Product deleted');
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleActive = async (product: Product) => {
    const updated = { ...product, isActive: !product.isActive };
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        showToast(`Product ${updated.isActive ? 'activated' : 'disabled'}`);
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Plan Tiers management
  const handleUpdatePlan = (index: number, field: keyof PlanDuration, value: any) => {
    const updated = [...formPlans];
    const current = { ...updated[index], [field]: value };

    // Auto-calculate savings percentage if price or originalPrice changes
    if (field === 'price' || field === 'originalPrice') {
      const p = field === 'price' ? (isNaN(parseFloat(value)) ? 0 : parseFloat(value)) : (Number(current.price) || 0);
      const orig = field === 'originalPrice' ? (isNaN(parseFloat(value)) ? 0 : parseFloat(value)) : (Number(current.originalPrice) || 0);

      if (orig > p && orig > 0 && p > 0) {
        const pct = Math.round(((orig - p) / orig) * 100);
        if (pct > 0 && pct < 100) {
          current.savings = `${pct}% OFF`;
        } else {
          current.savings = '';
        }
      } else {
        current.savings = '';
      }
    }

    updated[index] = current;
    setFormPlans(updated);
  };

  const handleAddPlanTier = () => {
    const price = 9.99;
    const orig = 19.99;
    const priceLkr = 3100;
    const origLkr = 6200;
    const pct = Math.round(((orig - price) / orig) * 100);
    setFormPlans([
      ...formPlans,
      {
        id: `plan-${Date.now()}`,
        name: 'New Duration',
        durationDays: 30,
        price: price,
        originalPrice: orig,
        priceLkr: priceLkr,
        originalPriceLkr: origLkr,
        savings: `${pct}% OFF`,
      }
    ]);
  };

  const handleRemovePlanTier = (index: number) => {
    if (formPlans.length <= 1) return;
    setFormPlans(formPlans.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#07090e] text-zinc-100">
      <AdminSidebar onLogout={() => {}} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 2xl:p-10 w-full min-w-0 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Products & Pricing Management</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Change display order (1st, 2nd, etc.), assign "BEST VALUE" tags, and manage duration pricing.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 hover:from-amber-300 hover:to-yellow-500 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Product</span>
          </button>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-zinc-900 border border-amber-400/40 text-amber-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Mobile Product Cards (Visible on < md: 768px) */}
        <div className="block md:hidden space-y-4 mb-8">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Store Products List ({products.length})
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">Use ⬆️ ⬇️ to set what shows 1st</span>
          </div>

          {products.map((prod, idx) => {
            const warrantyInfo = getProductWarranty(prod);
            return (
              <div 
                key={prod.id} 
                className="glass-card rounded-2xl p-4 border border-white/10 space-y-3.5"
              >
                {/* Top: Position, Logo & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-white/10 text-[11px] font-mono font-black text-amber-400 flex items-center justify-center flex-shrink-0">
                      #{idx + 1}
                    </span>
                    <BrandLogo
                      slug={prod.slug}
                      name={prod.name}
                      logoUrl={prod.logoUrl}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm truncate">{prod.name}</div>
                      <div className="text-[11px] text-zinc-400 truncate">{prod.tagline}</div>
                    </div>
                  </div>

                  {/* Move Up / Down Buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:bg-zinc-800 disabled:opacity-30 text-amber-300"
                      title="Move higher (Show first)"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === products.length - 1}
                      className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:bg-zinc-800 disabled:opacity-30 text-amber-300"
                      title="Move lower"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Badges & Warranty */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {prod.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                      prod.badge.includes('BEST VALUE') 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                        : 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                    }`}>
                      {prod.badge}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${warrantyInfo.badgeColor}`}>
                    {warrantyInfo.shortBadge}
                  </span>
                  <button
                    onClick={() => toggleActive(prod)}
                    className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      prod.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {prod.isActive ? 'Active' : 'Off'}
                  </button>
                </div>

                {/* Duration Plans */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {prod.plans.map((pl) => (
                    <span
                      key={pl.id}
                      className="px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-[11px] font-mono text-amber-300"
                    >
                      {pl.name}: <strong>{formatCurrency(pl.price)}</strong>
                    </span>
                  ))}
                </div>

                {/* Footer / Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Stock: {prod.stockCount} units
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Products Table (Visible on md: 768px+) */}
        <div className="hidden md:block glass-card rounded-3xl p-6 border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider">
                  <th className="pb-3 w-16">Order</th>
                  <th className="pb-3">Logo & Product Name</th>
                  <th className="pb-3">Featured Badge</th>
                  <th className="pb-3">Warranty Term</th>
                  <th className="pb-3">Duration Plans & Prices</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((prod, idx) => {
                  const warrantyInfo = getProductWarranty(prod);
                  return (
                    <tr key={prod.id} className="hover:bg-zinc-900/40">
                      {/* Order Column */}
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-white/10 text-[11px] font-mono font-black text-amber-400 flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <div className="flex flex-col">
                            <button
                              onClick={() => handleMoveUp(idx)}
                              disabled={idx === 0}
                              className="text-zinc-400 hover:text-amber-300 disabled:opacity-20 p-0.5"
                              title="Move higher (Show first)"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMoveDown(idx)}
                              disabled={idx === products.length - 1}
                              className="text-zinc-400 hover:text-amber-300 disabled:opacity-20 p-0.5"
                              title="Move lower"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <BrandLogo
                            slug={prod.slug}
                            name={prod.name}
                            logoUrl={prod.logoUrl}
                            size="sm"
                          />
                          <div>
                            <div className="font-bold text-white text-sm">{prod.name}</div>
                            <div className="text-[11px] text-zinc-400">{prod.tagline}</div>
                          </div>
                        </div>
                      </td>

                      {/* Featured Badge */}
                      <td className="py-4">
                        {prod.badge ? (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            prod.badge.includes('BEST VALUE')
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 font-black'
                              : 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                          }`}>
                            {prod.badge}
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-600">—</span>
                        )}
                      </td>

                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border whitespace-nowrap ${warrantyInfo.badgeColor}`}>
                          {warrantyInfo.shortBadge}
                        </span>
                      </td>

                      <td className="py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {prod.plans.map((pl) => (
                            <span
                              key={pl.id}
                              className="px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-[10px] font-mono text-amber-300"
                            >
                              {pl.name}: <strong>{formatCurrency(pl.price)}</strong>
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 font-mono font-bold text-emerald-400">
                        {prod.stockCount} units
                      </td>

                      <td className="py-4">
                        <button
                          onClick={() => toggleActive(prod)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            prod.isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {prod.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      <td className="py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create or Edit Product */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/10 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  <span>{editingProduct ? 'Edit Product Configuration' : 'Create New Subscription Product'}</span>
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gemini Advanced"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white focus:border-amber-400/60 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white"
                    >
                      <option value="ai">🤖 AI Tools</option>
                      <option value="video">🎬 Video & Audio</option>
                      <option value="streaming">📺 Streaming & Movies</option>
                      <option value="design">🎨 Design & Creative</option>
                      <option value="developer">💻 Developer AI</option>
                    </select>
                  </div>
                </div>

                {/* Featured Badge Selector */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      <span>Featured Tag / Badge (Top Left of Card):</span>
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {BADGE_PRESETS.map((bp) => {
                      const isSelected = formBadge === bp.value;
                      return (
                        <button
                          key={bp.value}
                          type="button"
                          onClick={() => setFormBadge(bp.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? `${bp.color} ring-2 ring-amber-400 shadow-md`
                              : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {bp.label}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setFormBadge('CUSTOM')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        formBadge === 'CUSTOM'
                          ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                          : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      ✍️ Custom Badge
                    </button>
                  </div>

                  {formBadge === 'CUSTOM' && (
                    <div className="pt-2">
                      <input
                        type="text"
                        placeholder="Type custom badge text (e.g. FLASH DEAL, EXCLUSIVE, VIP)..."
                        value={formCustomBadge}
                        onChange={(e) => setFormCustomBadge(e.target.value)}
                        className="w-full px-3.5 py-2 bg-zinc-900 border border-amber-400/40 rounded-xl text-xs text-white uppercase font-bold"
                      />
                    </div>
                  )}
                </div>

                {/* Warranty Policy Selector (Dropdown) */}
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Product Warranty Coverage:</span>
                    </span>
                    {/* Live Preview of Badge */}
                    {(() => {
                      const selectedOpt = WARRANTY_OPTIONS.find(w => w.type === formWarrantyType);
                      return (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${selectedOpt?.badgeColor || 'bg-amber-400/20 text-amber-300'}`}>
                          {formWarrantyType === 'custom' && formWarrantyCustom.trim() ? formWarrantyCustom.trim() : selectedOpt?.shortBadge}
                        </span>
                      );
                    })()}
                  </label>
                  <select
                    value={formWarrantyType}
                    onChange={(e) => setFormWarrantyType(e.target.value as WarrantyType)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:border-amber-400/60 transition-all cursor-pointer"
                  >
                    <option value="full_period">🛡️ Full Subscription Period Guarantee (100% replacement throughout duration)</option>
                    <option value="1_hour">⏱️ 1 Hour Instant Warranty</option>
                    <option value="3_hours">⏱️ 3 Hours Warranty</option>
                    <option value="6_hours">⏱️ 6 Hours Warranty</option>
                    <option value="12_hours">⏱️ 12 Hours Warranty</option>
                    <option value="24_hours">⏱️ 24 Hours / 1 Day Warranty</option>
                    <option value="3_days">📅 3 Days Warranty</option>
                    <option value="5_days">📅 5 Days Warranty</option>
                    <option value="7_days">📅 7 Days / 1 Week Warranty</option>
                    <option value="30_days">📅 30 Days / 1 Month Warranty</option>
                    <option value="no_warranty">🚫 No Warranty (Sold As-Is)</option>
                    <option value="custom">✍️ Custom Warranty Term (Type custom text)</option>
                  </select>

                  {/* Custom warranty text if 'custom' is selected */}
                  {formWarrantyType === 'custom' && (
                    <div className="mt-2.5">
                      <input
                        type="text"
                        placeholder="Type custom warranty text (e.g. 48 Hours Instant Replacement Guarantee)..."
                        value={formWarrantyCustom}
                        onChange={(e) => setFormWarrantyCustom(e.target.value)}
                        className="w-full px-3.5 py-2 bg-zinc-950 border border-amber-400/40 rounded-xl text-xs text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Official Provider Logo Selector */}
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>Official Provider Logo:</span>
                  </label>
                  
                  {/* Preset quick logo buttons */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {presetLogos.map((pLogo) => (
                      <button
                        type="button"
                        key={pLogo.path}
                        onClick={() => setFormLogoUrl(pLogo.path)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                          formLogoUrl === pLogo.path
                            ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                            : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <img src={pLogo.path} alt={pLogo.label} className="w-4 h-4 object-contain" />
                        <span>{pLogo.label}</span>
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Custom logo image path e.g. /logos/gemini.svg or https://..."
                    value={formLogoUrl}
                    onChange={(e) => setFormLogoUrl(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Short Tagline</label>
                    <input
                      type="text"
                      placeholder="e.g. 1M Context + 2TB Google Drive"
                      value={formTagline}
                      onChange={(e) => setFormTagline(e.target.value)}
                      className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-zinc-300">Live Stock Count</label>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                        <span>⚡ Auto from Vault</span>
                      </span>
                    </div>
                    <div className="w-full px-3.5 py-2 bg-zinc-950/90 border border-emerald-500/30 rounded-xl text-xs sm:text-sm font-mono font-bold text-emerald-300 flex items-center justify-between cursor-not-allowed select-none">
                      <span>{formStock} units in vault</span>
                      <span className="text-[10px] font-sans font-normal text-zinc-500">Auto-calculated</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Full Description</label>
                  <textarea
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white"
                  />
                </div>

                {/* Duration Plans & Pricing Tiers */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Pricing & Duration Tiers:
                    </label>
                    <button
                      type="button"
                      onClick={handleAddPlanTier}
                      className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Tier</span>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-56 overflow-y-auto">
                    {formPlans.map((plan, idx) => (
                      <div key={idx} className="p-3 bg-zinc-900 rounded-xl border border-white/5 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-300 text-xs">Plan #{idx + 1} Duration Tier</span>
                          {formPlans.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePlanTier(idx)}
                              className="text-zinc-500 hover:text-red-400 p-1 flex items-center gap-1 text-[11px]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <div className="sm:col-span-4">
                            <label className="text-[10px] text-zinc-400 block mb-0.5">Plan Name</label>
                            <input
                              type="text"
                              value={plan.name}
                              placeholder="e.g. 1 Month VIP"
                              onChange={(e) => handleUpdatePlan(idx, 'name', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-white/10 rounded-lg text-xs text-white"
                            />
                          </div>

                          <div className="sm:col-span-4">
                            <label className="text-[10px] text-amber-300 block mb-0.5 font-bold">Price (USDT / $)</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="9.99"
                              value={plan.price}
                              onChange={(e) => handleUpdatePlan(idx, 'price', parseFloat(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-amber-400/30 rounded-lg text-xs text-amber-300 font-mono font-bold"
                            />
                          </div>

                          <div className="sm:col-span-4">
                            <label className="text-[10px] text-emerald-300 block mb-0.5 font-bold">Price (LKR / Rs.)</label>
                            <input
                              type="number"
                              placeholder="3100"
                              value={plan.priceLkr || (plan.price ? Math.round(plan.price * 310) : '')}
                              onChange={(e) => handleUpdatePlan(idx, 'priceLkr', parseFloat(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 font-mono font-bold"
                            />
                          </div>

                          <div className="sm:col-span-6">
                            <label className="text-[10px] text-zinc-400 block mb-0.5">Retail Price ($ USDT)</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="19.99"
                              value={plan.originalPrice || ''}
                              onChange={(e) => handleUpdatePlan(idx, 'originalPrice', parseFloat(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-white/10 rounded-lg text-xs text-zinc-400 font-mono"
                            />
                          </div>

                          <div className="sm:col-span-6">
                            <label className="text-[10px] text-amber-400 block mb-0.5 font-semibold">Savings Tag (Auto)</label>
                            <input
                              type="text"
                              value={plan.savings || ''}
                              placeholder="e.g. 50% OFF"
                              onChange={(e) => handleUpdatePlan(idx, 'savings', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-amber-400/30 rounded-lg text-xs text-amber-300 font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Key Feature Bullet Points (One per line)</label>
                  <textarea
                    rows={3}
                    placeholder="Full access&#10;Private account&#10;Instant setup"
                    value={formFeatures}
                    onChange={(e) => setFormFeatures(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-400/20"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
