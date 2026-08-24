import fs from 'fs';
import path from 'path';
import { Product, Order, Coupon, StoreSettings, DigitalKey, DeliveryMethodType } from './types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_COUPONS, INITIAL_KEYS } from './initialData';
import { supabase } from './supabase';

const DATA_DIR = path.join(process.cwd(), '.data');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    // Ignore read-only filesystem errors on Vercel
  }
}

function readJsonFile<T>(filename: string, defaultData: T): T {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return defaultData;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    return defaultData;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    // Read-only on serverless
  }
}

// ----------------------------------------------------
// Products (Supabase Persistent)
// ----------------------------------------------------
export async function getProductsAsync(): Promise<Product[]> {
  try {
    const { data: dbProducts, error: prodErr } = await supabase
      .from('products')
      .select('*');

    const { data: dbKeys } = await supabase
      .from('digital_keys')
      .select('product_id, is_used')
      .eq('is_used', false);

    // Read custom product order array from store_settings
    const { data: dbSettings } = await supabase
      .from('store_settings')
      .select('usdt_trc20_address')
      .eq('id', 'default')
      .single();

    let productOrder: string[] = [];
    if (dbSettings?.usdt_trc20_address && dbSettings.usdt_trc20_address.startsWith('{')) {
      try {
        const parsed = JSON.parse(dbSettings.usdt_trc20_address);
        if (Array.isArray(parsed.productOrder)) {
          productOrder = parsed.productOrder;
        }
      } catch (e) {}
    }

    if (!prodErr && dbProducts && dbProducts.length > 0) {
      let mapped: Product[] = dbProducts.map((p: any) => {
        const availableCount = (dbKeys || []).filter((k: any) => k.product_id === p.id).length;
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category,
          tagline: p.tagline || '',
          description: p.description || '',
          icon: 'Sparkles',
          logoUrl: p.logo_url || '/logos/gemini.svg',
          badge: p.badge || undefined,
          features: p.features || [],
          plans: p.plans || [],
          stockCount: availableCount > 0 ? availableCount : (p.stock_count || 0),
          isActive: p.is_active ?? true,
          warrantyType: p.warranty_type || 'full_period',
          warrantyCustomText: p.warranty_custom_text || undefined,
          instructions: '',
          deliveryType: 'account_credentials',
          color: 'from-amber-400 via-yellow-500 to-amber-600',
          rating: 4.9,
          reviewCount: 350,
          sortOrder: 99
        };
      });

      // Apply saved custom sort order
      if (productOrder.length > 0) {
        mapped.sort((a, b) => {
          const idxA = productOrder.indexOf(a.id);
          const idxB = productOrder.indexOf(b.id);
          if (idxA === -1 && idxB === -1) return 0;
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        });
      }

      mapped = mapped.map((p, i) => ({ ...p, sortOrder: i + 1 }));
      return mapped;
    }
  } catch (err) {
    console.error('getProductsAsync error:', err);
  }

  return getProducts();
}

export function getProducts(): Product[] {
  const products = readJsonFile<Product[]>('products.json', INITIAL_PRODUCTS);
  const keys = getDigitalKeys();

  return products.map((prod) => {
    const availableKeys = keys.filter(k => k.productId === prod.id && !k.isUsed);
    return {
      ...prod,
      stockCount: availableKeys.length > 0 ? availableKeys.length : (prod.stockCount || 0)
    };
  });
}

export async function getProductByIdAsync(id: string): Promise<Product | undefined> {
  const products = await getProductsAsync();
  return products.find(p => p.id === id);
}

export function getProductById(id: string): Product | undefined {
  const products = getProducts();
  return products.find(p => p.id === id);
}

export async function saveProductAsync(product: Product): Promise<Product> {
  const products = readJsonFile<Product[]>('products.json', INITIAL_PRODUCTS);
  const index = products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.unshift(product);
  }
  writeJsonFile('products.json', products);

  try {
    await supabase.from('products').upsert({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      tagline: product.tagline || null,
      description: product.description || null,
      logo_url: product.logoUrl || null,
      badge: product.badge || null,
      features: product.features || [],
      plans: product.plans || [],
      stock_count: product.stockCount || 0,
      is_active: product.isActive ?? true,
      warranty_type: product.warrantyType || 'full_period',
      warranty_custom_text: product.warrantyCustomText || null,
    }, { onConflict: 'id' });
  } catch (err) {
    console.error('saveProductAsync Supabase error:', err);
  }

  return product;
}

export function saveProduct(product: Product): Product {
  saveProductAsync(product);
  return product;
}

export async function reorderProductsAsync(reorderedProducts: Product[]): Promise<Product[]> {
  const updated = reorderedProducts.map((p, idx) => ({
    ...p,
    sortOrder: idx + 1
  }));
  writeJsonFile('products.json', updated);

  try {
    const productOrder = reorderedProducts.map(p => p.id);

    // Read current store_settings extra JSON
    const { data: dbSettings } = await supabase
      .from('store_settings')
      .select('usdt_trc20_address')
      .eq('id', 'default')
      .single();

    let extra: any = {};
    if (dbSettings?.usdt_trc20_address && dbSettings.usdt_trc20_address.startsWith('{')) {
      try {
        extra = JSON.parse(dbSettings.usdt_trc20_address);
      } catch (e) {}
    }

    extra.productOrder = productOrder;

    await supabase.from('store_settings').upsert({
      id: 'default',
      usdt_trc20_address: JSON.stringify(extra)
    }, { onConflict: 'id' });
  } catch (err) {
    console.error('reorderProductsAsync Supabase error:', err);
  }

  return updated;
}

export function reorderProducts(reorderedProducts: Product[]): Product[] {
  reorderProductsAsync(reorderedProducts);
  return reorderedProducts.map((p, idx) => ({ ...p, sortOrder: idx + 1 }));
}

export async function deleteProductAsync(id: string): Promise<boolean> {
  const products = readJsonFile<Product[]>('products.json', INITIAL_PRODUCTS);
  const filtered = products.filter(p => p.id !== id);
  writeJsonFile('products.json', filtered);

  try {
    await supabase.from('products').delete().eq('id', id);

    // Remove from productOrder array in Supabase
    const { data: dbSettings } = await supabase
      .from('store_settings')
      .select('usdt_trc20_address')
      .eq('id', 'default')
      .single();

    if (dbSettings?.usdt_trc20_address && dbSettings.usdt_trc20_address.startsWith('{')) {
      try {
        const extra = JSON.parse(dbSettings.usdt_trc20_address);
        if (Array.isArray(extra.productOrder)) {
          extra.productOrder = extra.productOrder.filter((pid: string) => pid !== id);
          await supabase.from('store_settings').upsert({
            id: 'default',
            usdt_trc20_address: JSON.stringify(extra)
          }, { onConflict: 'id' });
        }
      } catch (e) {}
    }
  } catch (err) {
    console.error('deleteProductAsync error:', err);
  }

  return true;
}

export function deleteProduct(id: string): boolean {
  deleteProductAsync(id);
  return true;
}

// ----------------------------------------------------
// Orders (Supabase Persistent)
// ----------------------------------------------------
export async function getOrdersAsync(): Promise<Order[]> {
  try {
    const settings = await getSettingsAsync();
    const { data: dbOrders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && dbOrders && dbOrders.length > 0) {
      return dbOrders.map((o: any) => ({
        id: o.id,
        customerEmail: o.customer_email,
        telegramUsername: o.customer_telegram || '',
        items: o.items || [],
        discountAmount: o.discount || 0,
        subtotal: o.subtotal || 0,
        verificationFee: o.micro_fee || 0.0123,
        totalAmount: o.total_amount,
        paymentMethod: o.payment_method || 'binance_pay',
        paymentDetails: {
          exactUsdtAmount: o.total_amount,
          bep20Address: o.payment_address || settings.bep20WalletAddress,
          binancePayId: settings.binancePayId,
          txHash: o.tx_hash,
          network: 'BEP-20 (BNB Smart Chain)'
        },
        status: o.status,
        deliveredKeys: o.delivered_keys || [],
        deliveryNotes: o.delivery_notes,
        couponCode: o.coupon_code,
        createdAt: o.created_at,
        expiresAt: new Date(new Date(o.created_at).getTime() + 20 * 60 * 1000).toISOString(),
        paidAt: o.paid_at,
        deliveredAt: o.delivered_at
      }));
    }
  } catch (err) {
    console.error('getOrdersAsync error:', err);
  }

  return readJsonFile<Order[]>('orders.json', []);
}

export function getOrders(): Order[] {
  return readJsonFile<Order[]>('orders.json', []);
}

export async function getOrderByIdAsync(id: string): Promise<Order | undefined> {
  const orders = await getOrdersAsync();
  return orders.find(o => o.id === id);
}

export function getOrderById(id: string): Order | undefined {
  const orders = getOrders();
  return orders.find(o => o.id === id);
}

export async function saveOrderAsync(order: Order): Promise<Order> {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === order.id);
  if (index >= 0) {
    orders[index] = order;
  } else {
    orders.unshift(order);
  }
  writeJsonFile('orders.json', orders);

  try {
    const anyOrder = order as any;
    await supabase.from('orders').upsert({
      id: order.id,
      customer_email: order.customerEmail,
      customer_telegram: anyOrder.customerTelegram || order.telegramUsername || null,
      customer_user_id: anyOrder.customerUserId || null,
      items: order.items,
      subtotal: order.subtotal,
      discount: anyOrder.discount || order.discountAmount || 0,
      micro_fee: anyOrder.microFee || order.verificationFee || 0.0123,
      total_amount: order.totalAmount,
      status: order.status,
      payment_method: order.paymentMethod,
      payment_address: anyOrder.paymentAddress || order.paymentDetails?.bep20Address || null,
      tx_hash: order.paymentDetails?.txHash || null,
      delivered_keys: order.deliveredKeys || [],
      delivery_notes: order.deliveryNotes || null,
      coupon_code: order.couponCode || null,
      created_at: order.createdAt,
      paid_at: order.paidAt || null,
      delivered_at: order.deliveredAt || null,
    }, { onConflict: 'id' });
  } catch (err) {
    console.error('saveOrderAsync error:', err);
  }

  return order;
}

export function saveOrder(order: Order): Order {
  saveOrderAsync(order);
  return order;
}

export async function updateOrderStatusAsync(
  id: string, 
  status: Order['status'], 
  extra?: { txHash?: string; deliveredKeys?: string[]; deliveryNotes?: string }
): Promise<Order | undefined> {
  const orders = await getOrdersAsync();
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return undefined;

  const order = orders[index];
  order.status = status;
  if (status === 'paid') {
    order.paidAt = new Date().toISOString();
  }
  if (status === 'delivered') {
    order.deliveredAt = new Date().toISOString();
  }
  if (extra?.txHash) {
    order.paymentDetails.txHash = extra.txHash;
  }
  if (extra?.deliveredKeys) {
    order.deliveredKeys = extra.deliveredKeys;
  }
  if (extra?.deliveryNotes) {
    order.deliveryNotes = extra.deliveryNotes;
  }

  try {
    await supabase.from('orders').update({
      status: order.status,
      paid_at: order.paidAt || null,
      delivered_at: order.deliveredAt || null,
      tx_hash: order.paymentDetails?.txHash || null,
      delivered_keys: order.deliveredKeys || [],
      delivery_notes: order.deliveryNotes || null,
    }).eq('id', id);
  } catch (err) {
    console.error('updateOrderStatusAsync error:', err);
  }

  return order;
}

export function updateOrderStatus(
  id: string, 
  status: Order['status'], 
  extra?: { txHash?: string; deliveredKeys?: string[]; deliveryNotes?: string }
): Order | undefined {
  updateOrderStatusAsync(id, status, extra);
  return getOrderById(id);
}

// ----------------------------------------------------
// Coupons (Supabase Persistent)
// ----------------------------------------------------
export async function getCouponsAsync(): Promise<Coupon[]> {
  try {
    const { data: dbCoupons, error } = await supabase.from('coupons').select('*');
    if (!error && dbCoupons && dbCoupons.length > 0) {
      return dbCoupons.map((c: any) => ({
        id: c.id,
        code: c.code,
        discountType: 'percentage',
        discountValue: c.discount_percent || 10,
        minOrderAmount: 0,
        maxUses: c.max_uses,
        usedCount: c.usage_count || 0,
        expiresAt: c.expires_at,
        isActive: c.is_active ?? true
      }));
    }
  } catch (err) {
    console.error('getCouponsAsync error:', err);
  }
  return readJsonFile<Coupon[]>('coupons.json', INITIAL_COUPONS);
}

export function getCoupons(): Coupon[] {
  return readJsonFile<Coupon[]>('coupons.json', INITIAL_COUPONS);
}

export async function getCouponByCodeAsync(code: string): Promise<Coupon | undefined> {
  const coupons = await getCouponsAsync();
  return coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
}

export function getCouponByCode(code: string): Coupon | undefined {
  const coupons = getCoupons();
  return coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
}

export async function saveCouponAsync(coupon: Coupon): Promise<Coupon> {
  const coupons = getCoupons();
  const index = coupons.findIndex(c => c.id === coupon.id);
  if (index >= 0) {
    coupons[index] = coupon;
  } else {
    coupons.unshift(coupon);
  }
  writeJsonFile('coupons.json', coupons);

  try {
    const anyCoupon = coupon as any;
    await supabase.from('coupons').upsert({
      id: coupon.id,
      code: coupon.code.toUpperCase(),
      discount_percent: anyCoupon.discountPercent || coupon.discountValue || 0,
      is_active: coupon.isActive ?? true,
      usage_count: anyCoupon.usageCount || coupon.usedCount || 0,
      max_uses: coupon.maxUses || null,
      expires_at: coupon.expiresAt || null,
    }, { onConflict: 'id' });
  } catch (err) {
    console.error('saveCouponAsync error:', err);
  }

  return coupon;
}

export function saveCoupon(coupon: Coupon): Coupon {
  saveCouponAsync(coupon);
  return coupon;
}

export async function deleteCouponAsync(id: string): Promise<boolean> {
  const coupons = getCoupons();
  const filtered = coupons.filter(c => c.id !== id);
  writeJsonFile('coupons.json', filtered);

  try {
    await supabase.from('coupons').delete().eq('id', id);
  } catch (err) {
    console.error('deleteCouponAsync error:', err);
  }

  return true;
}

export function deleteCoupon(id: string): boolean {
  deleteCouponAsync(id);
  return true;
}

// ----------------------------------------------------
// Settings (Supabase Persistent)
// ----------------------------------------------------
export async function getSettingsAsync(): Promise<StoreSettings> {
  try {
    const { data: dbSettings, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (!error && dbSettings) {
      let extraConfig: any = {};
      if (dbSettings.usdt_trc20_address && dbSettings.usdt_trc20_address.startsWith('{')) {
        try {
          extraConfig = JSON.parse(dbSettings.usdt_trc20_address);
        } catch (e) {}
      }

      return {
        ...INITIAL_SETTINGS,
        storeName: extraConfig.storeName || INITIAL_SETTINGS.storeName,
        storeTagline: extraConfig.storeTagline || INITIAL_SETTINGS.storeTagline,
        announcementText: dbSettings.announcement_bar || INITIAL_SETTINGS.announcementText,
        announcementActive: dbSettings.is_promo_banner_active ?? true,
        showPromoBanner: dbSettings.is_promo_banner_active ?? true,
        promoBannerCode: dbSettings.promo_banner_code || INITIAL_SETTINGS.promoBannerCode,
        promoBannerText: dbSettings.promo_banner_text || INITIAL_SETTINGS.promoBannerText,
        binancePayId: dbSettings.binance_pay_id || INITIAL_SETTINGS.binancePayId,
        bep20WalletAddress: dbSettings.usdt_bep20_address || INITIAL_SETTINGS.bep20WalletAddress,
        trc20WalletAddress: extraConfig.trc20 || (dbSettings.usdt_trc20_address?.startsWith('{') ? '' : dbSettings.usdt_trc20_address) || INITIAL_SETTINGS.trc20WalletAddress,
        telegramSupportHandle: dbSettings.telegram_support_handle || INITIAL_SETTINGS.telegramSupportHandle,
        adminPasscode: dbSettings.admin_passcode || process.env.ADMIN_PASSCODE || INITIAL_SETTINGS.adminPasscode,
        resendApiKey: extraConfig.resendApiKey || process.env.RESEND_API_KEY || INITIAL_SETTINGS.resendApiKey,
        senderEmail: extraConfig.senderEmail || INITIAL_SETTINGS.senderEmail,
        senderName: extraConfig.senderName || INITIAL_SETTINGS.senderName,
        emailProvider: extraConfig.emailProvider || INITIAL_SETTINGS.emailProvider,
        sendOrderConfirmationEmail: extraConfig.sendOrderConfirmationEmail ?? INITIAL_SETTINGS.sendOrderConfirmationEmail,
        binanceApiKey: extraConfig.binanceApiKey || INITIAL_SETTINGS.binanceApiKey,
        binanceApiSecret: extraConfig.binanceApiSecret || INITIAL_SETTINGS.binanceApiSecret,
        enableLiveBinanceApi: extraConfig.enableLiveBinanceApi ?? INITIAL_SETTINGS.enableLiveBinanceApi,
      };
    }
  } catch (err) {
    console.error('getSettingsAsync error:', err);
  }

  return getSettings();
}

export function getSettings(): StoreSettings {
  return readJsonFile<StoreSettings>('settings.json', INITIAL_SETTINGS);
}

export async function updateSettingsAsync(newSettings: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getSettingsAsync();
  const updated = { ...current, ...newSettings };
  writeJsonFile('settings.json', updated);

  try {
    const extraPayload = JSON.stringify({
      resendApiKey: updated.resendApiKey || '',
      senderEmail: updated.senderEmail || 'orders@fast-x.store',
      senderName: updated.senderName || 'Fast X Solutions',
      emailProvider: updated.emailProvider || 'resend',
      sendOrderConfirmationEmail: updated.sendOrderConfirmationEmail ?? true,
      storeName: updated.storeName || 'Fast X',
      storeTagline: updated.storeTagline || 'AI & Subscriptions Vault',
      binanceApiKey: updated.binanceApiKey || '',
      binanceApiSecret: updated.binanceApiSecret || '',
      enableLiveBinanceApi: updated.enableLiveBinanceApi ?? false,
      trc20: updated.trc20WalletAddress || ''
    });

    const anySettings = updated as any;
    await supabase.from('store_settings').upsert({
      id: 'default',
      usdt_bep20_address: updated.bep20WalletAddress || anySettings.usdtBep20Address || null,
      usdt_trc20_address: extraPayload,
      binance_pay_id: updated.binancePayId || anySettings.binancePayId || null,
      telegram_support_handle: updated.telegramSupportHandle || anySettings.telegramSupportHandle || null,
      announcement_bar: updated.announcementText || null,
      promo_banner_code: updated.promoBannerCode || null,
      promo_banner_text: updated.promoBannerText || null,
      is_promo_banner_active: updated.showPromoBanner ?? true,
      admin_passcode: updated.adminPasscode || anySettings.adminPasscode || null,
      auto_dispatch_keys: anySettings.autoDispatchKeys ?? true,
    }, { onConflict: 'id' });
  } catch (err) {
    console.error('updateSettingsAsync Supabase error:', err);
  }

  return updated;
}

export function updateSettings(newSettings: Partial<StoreSettings>): StoreSettings {
  updateSettingsAsync(newSettings);
  return { ...getSettings(), ...newSettings };
}

// ----------------------------------------------------
// Digital Keys Vault (Supabase Persistent)
// ----------------------------------------------------
export async function getDigitalKeysAsync(productId?: string): Promise<DigitalKey[]> {
  try {
    let query = supabase.from('digital_keys').select('*').order('created_at', { ascending: false });
    if (productId) {
      query = query.eq('product_id', productId);
    }
    const { data: dbKeys, error } = await query;

    if (!error && dbKeys && dbKeys.length > 0) {
      return dbKeys.map((k: any) => ({
        id: k.id,
        productId: k.product_id,
        planId: k.plan_id,
        content: k.content,
        email: k.email,
        password: k.password,
        twoFactorSecret: k.two_factor_secret,
        deliveryType: 'account_credentials' as const,
        isUsed: k.is_used,
        assignedToOrderId: k.claimed_by_order_id,
        usedAt: k.claimed_at,
        createdAt: k.created_at
      }));
    }
  } catch (err) {
    console.error('getDigitalKeysAsync error:', err);
  }

  return getDigitalKeys(productId);
}

export function getDigitalKeys(productId?: string): DigitalKey[] {
  const keys = readJsonFile<DigitalKey[]>('keys.json', INITIAL_KEYS);
  if (productId) {
    return keys.filter(k => k.productId === productId);
  }
  return keys;
}

export interface NewKeyInput {
  productId: string;
  planId?: string;
  deliveryType?: DeliveryMethodType;
  content: string;
  email?: string;
  password?: string;
  twoFactorSecret?: string;
  couponCode?: string;
  inviteUrl?: string;
}

export async function addDigitalKeysAsync(newKeys: NewKeyInput[]): Promise<DigitalKey[]> {
  const created: DigitalKey[] = newKeys.map(k => {
    let email = k.email;
    let password = k.password;
    let twoFactorSecret = k.twoFactorSecret;
    let couponCode = k.couponCode;
    let inviteUrl = k.inviteUrl;
    let deliveryType: DeliveryMethodType = k.deliveryType || 'account_credentials';

    if (!email && !couponCode && !inviteUrl && k.content) {
      if (k.content.startsWith('http://') || k.content.startsWith('https://')) {
        deliveryType = 'invite_link';
        inviteUrl = k.content.trim();
      } else if (k.content.includes(':')) {
        deliveryType = 'account_credentials';
        const parts = k.content.split(':').map(p => p.trim());
        if (parts.length >= 2) {
          email = parts[0];
          password = parts[1];
          if (parts.length >= 3) {
            twoFactorSecret = parts[2];
          }
        }
      } else {
        deliveryType = 'coupon_key';
        couponCode = k.content.trim();
      }
    }

    return {
      id: `key-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId: k.productId,
      planId: k.planId || '',
      deliveryType,
      content: k.content || (inviteUrl || couponCode || `${email}:${password}${twoFactorSecret ? ':' + twoFactorSecret : ''}`),
      email,
      password,
      twoFactorSecret,
      couponCode,
      inviteUrl,
      isUsed: false,
      createdAt: new Date().toISOString()
    };
  });

  try {
    const dbRows = created.map(k => ({
      id: k.id,
      product_id: k.productId,
      plan_id: k.planId,
      content: k.content,
      email: k.email || null,
      password: k.password || null,
      two_factor_secret: k.twoFactorSecret || null,
      is_used: false,
      created_at: k.createdAt,
    }));

    await supabase.from('digital_keys').insert(dbRows);

    if (created.length > 0) {
      const targetProductId = created[0].productId;
      const { count } = await supabase
        .from('digital_keys')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', targetProductId)
        .eq('is_used', false);

      await supabase
        .from('products')
        .update({ stock_count: count || 0 })
        .eq('id', targetProductId);
    }
  } catch (err) {
    console.error('addDigitalKeysAsync error:', err);
  }

  return created;
}

export function addDigitalKeys(newKeys: NewKeyInput[]): DigitalKey[] {
  addDigitalKeysAsync(newKeys);
  return [];
}

export async function claimKeyForOrderAsync(productId: string, planId: string, orderId: string): Promise<DigitalKey | null> {
  try {
    const { data: availableKey, error } = await supabase
      .from('digital_keys')
      .select('*')
      .eq('product_id', productId)
      .eq('is_used', false)
      .limit(1)
      .maybeSingle();

    if (availableKey) {
      const usedAt = new Date().toISOString();
      await supabase
        .from('digital_keys')
        .update({
          is_used: true,
          claimed_by_order_id: orderId,
          claimed_at: usedAt,
        })
        .eq('id', availableKey.id);

      const { count } = await supabase
        .from('digital_keys')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId)
        .eq('is_used', false);

      await supabase
        .from('products')
        .update({ stock_count: count || 0 })
        .eq('id', productId);

      return {
        id: availableKey.id,
        productId: availableKey.product_id,
        planId: availableKey.plan_id,
        content: availableKey.content,
        email: availableKey.email,
        password: availableKey.password,
        twoFactorSecret: availableKey.two_factor_secret,
        deliveryType: 'account_credentials',
        isUsed: true,
        assignedToOrderId: orderId,
        usedAt,
        createdAt: availableKey.created_at
      };
    }
  } catch (err) {
    console.error('claimKeyForOrderAsync error:', err);
  }

  return null;
}

export function claimKeyForOrder(productId: string, planId: string, orderId: string): DigitalKey | null {
  claimKeyForOrderAsync(productId, planId, orderId);
  return null;
}

export async function deleteDigitalKeyAsync(id: string): Promise<boolean> {
  try {
    const { data: targetKey } = await supabase
      .from('digital_keys')
      .select('product_id')
      .eq('id', id)
      .single();

    await supabase.from('digital_keys').delete().eq('id', id);

    if (targetKey) {
      const { count } = await supabase
        .from('digital_keys')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', targetKey.product_id)
        .eq('is_used', false);

      await supabase
        .from('products')
        .update({ stock_count: count || 0 })
        .eq('id', targetKey.product_id);
    }
  } catch (err) {
    console.error('deleteDigitalKeyAsync error:', err);
  }

  return true;
}

export function deleteDigitalKey(id: string): boolean {
  deleteDigitalKeyAsync(id);
  return true;
}
