'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import QuickCheckoutModal from '@/components/QuickCheckoutModal';
import CartDrawer, { CartItem } from '@/components/CartDrawer';
import CustomerOrdersModal from '@/components/CustomerOrdersModal';
import CommunityPopupModal from '@/components/CommunityPopupModal';
import TrustBadges from '@/components/TrustBadges';
import Testimonials from '@/components/Testimonials';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';
import { Product, PlanDuration, ProductCategory, StoreSettings, CurrencyCode } from '@/lib/types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '@/lib/initialData';
import { CustomerUser, getSavedCustomer, removeCustomer } from '@/lib/auth';
import { Sparkles, Layers, Zap, ShoppingBag } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USDT');
  
  // Customer Auth State
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modals state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const productSectionRef = useRef<HTMLDivElement | null>(null);

  // Check saved customer session
  useEffect(() => {
    const saved = getSavedCustomer();
    if (saved) setCustomerUser(saved);
  }, []);

  // Fetch live products & settings from API
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setProducts(data);
      })
      .catch((err) => console.error('Failed to load products:', err));

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.storeName) setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch((err) => console.error('Failed to load settings:', err));
  }, []);

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    if (!p.isActive) return false;
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = 
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleScrollToProducts = () => {
    productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add to cart
  const handleAddToCart = (product: Product, plan: PlanDuration) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.plan.id === plan.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.plan.id === plan.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, plan, quantity: 1 }];
    });
  };

  // Direct Buy Now
  const handleBuyNow = (product: Product, plan: PlanDuration) => {
    setCheckoutItems([{ product, plan, quantity: 1 }]);
    setIsCheckoutOpen(true);
  };

  // Checkout from Cart
  const handleCheckoutFromCart = () => {
    if (cart.length === 0) return;
    setCheckoutItems([...cart]);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Cart quantity updates
  const handleUpdateQuantity = (productId: string, planId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.plan.id === planId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string, planId: string) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.plan.id === planId)));
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col relative z-10 bg-transparent text-zinc-100 selection:bg-amber-400 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          handleScrollToProducts();
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        currency={currency}
        onCurrencyChange={(curr) => setCurrency(curr)}
        announcement={settings.announcementActive ? settings.announcementText : undefined}
        telegramHandle={settings.telegramSupportHandle}
        user={customerUser}
        onOpenOrders={() => setIsOrdersModalOpen(true)}
        onLoginSuccess={(user) => setCustomerUser(user)}
      />

      {/* Hero Section */}
      <HeroBanner
        storeName={settings.storeName}
        storeTagline={settings.storeTagline}
        onExploreClick={handleScrollToProducts}
        showPromoBanner={settings.showPromoBanner}
        promoCode={settings.promoBannerCode}
        promoText={settings.promoBannerText}
      />

      {/* Main Content & Products Grid */}
      <main ref={productSectionRef} className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Verified VIP Subscriptions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {activeCategory === 'all' ? 'All Subscription Plans' : `${activeCategory.toUpperCase()} Subscriptions`}
            </h2>
          </div>

          <span className="text-xs text-zinc-400 font-mono">
            Showing <strong className="text-amber-400">{filteredProducts.length}</strong> available products
          </span>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-950/40 rounded-3xl border border-white/5 p-8">
            <Layers className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No plans match your filter</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Try searching with another keyword (e.g. Gemini, Netflix, CapCut) or switch category filters.
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                onBuyNow={handleBuyNow}
                onAddToCart={handleAddToCart}
                onViewDetails={(p) => setDetailProduct(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Trust & Guarantee Section */}
      <TrustBadges />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer />

      {/* Fast X Community Popup Modal on Reload / First Visit */}
      <CommunityPopupModal />

      {/* Customer Orders & Account Modal */}
      <CustomerOrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        user={customerUser}
        onLogout={() => {
          removeCustomer();
          setCustomerUser(null);
        }}
      />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={detailProduct}
        currency={currency}
        isOpen={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        onBuyNow={handleBuyNow}
        onAddToCart={handleAddToCart}
      />

      <QuickCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={checkoutItems}
        onClearCart={() => setCart([])}
        initialEmail={customerUser?.email || ''}
        user={customerUser}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckoutFromCart}
      />
    </div>
  );
}
