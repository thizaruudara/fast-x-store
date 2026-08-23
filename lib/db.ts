import fs from 'fs';
import path from 'path';
import { Product, Order, Coupon, StoreSettings, DigitalKey, DeliveryMethodType } from './types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_COUPONS, INITIAL_KEYS } from './initialData';
import { supabase } from './supabase';

const DATA_DIR = path.join(process.cwd(), '.data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filename: string, defaultData: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return defaultData;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
  }
}

// ----------------------------------------------------
// Products (with dynamic stock calculation from Digital Key Vault)
// ----------------------------------------------------
export function getProducts(): Product[] {
  const products = readJsonFile<Product[]>('products.json', INITIAL_PRODUCTS);
  const keys = getDigitalKeys();

  // Dynamically calculate live stock count from available unused keys in vault
  return products.map((prod) => {
    const availableKeys = keys.filter(k => k.productId === prod.id && !k.isUsed);
    return {
      ...prod,
      stockCount: availableKeys.length > 0 ? availableKeys.length : (prod.stockCount || 0)
    };
  });
}

export function getProductById(id: string): Product | undefined {
  const products = getProducts();
  return products.find(p => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  const products = getProducts();
  return products.find(p => p.slug === slug);
}

export function saveProduct(product: Product): Product {
  const products = readJsonFile<Product[]>('products.json', INITIAL_PRODUCTS);
  const keys = getDigitalKeys();
  const availableKeys = keys.filter(k => k.productId === product.id && !k.isUsed);
  if (availableKeys.length > 0) {
    product.stockCount = availableKeys.length;
  }

  const index = products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.unshift(product);
  }
  writeJsonFile('products.json', products);

  // Sync to Supabase in background
  supabase.from('products').upsert({
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
  }, { onConflict: 'id' }).then(({ error }) => {
    if (error) console.error('Supabase saveProduct error:', error);
  });

  return product;
}

export function reorderProducts(reorderedProducts: Product[]): Product[] {
  const updated = reorderedProducts.map((p, idx) => ({
    ...p,
    sortOrder: idx + 1
  }));
  writeJsonFile('products.json', updated);
  return updated;
}

export function deleteProduct(id: string): boolean {
  const products = readJsonFile<Product[]>('products.json', INITIAL_PRODUCTS);
  const filtered = products.filter(p => p.id !== id);
  writeJsonFile('products.json', filtered);

  // Sync delete to Supabase
  supabase.from('products').delete().eq('id', id).then(({ error }) => {
    if (error) console.error('Supabase deleteProduct error:', error);
  });

  return true;
}

// ----------------------------------------------------
// Orders (with Supabase sync)
// ----------------------------------------------------
export function getOrders(): Order[] {
  return readJsonFile<Order[]>('orders.json', []);
}

export function getOrderById(id: string): Order | undefined {
  const orders = getOrders();
  return orders.find(o => o.id === id);
}

export function saveOrder(order: Order): Order {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === order.id);
  if (index >= 0) {
    orders[index] = order;
  } else {
    orders.unshift(order);
  }
  writeJsonFile('orders.json', orders);

  // Sync to Supabase in background
  const anyOrder = order as any;
  supabase.from('orders').upsert({
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
  }, { onConflict: 'id' }).then(({ error }) => {
    if (error) console.error('Supabase saveOrder error:', error);
  });

  return order;
}

export function updateOrderStatus(
  id: string, 
  status: Order['status'], 
  extra?: { txHash?: string; deliveredKeys?: string[]; deliveryNotes?: string }
): Order | undefined {
  const orders = getOrders();
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

  orders[index] = order;
  writeJsonFile('orders.json', orders);

  // Sync status update to Supabase
  supabase.from('orders').update({
    status: order.status,
    paid_at: order.paidAt || null,
    delivered_at: order.deliveredAt || null,
    tx_hash: order.paymentDetails?.txHash || null,
    delivered_keys: order.deliveredKeys || [],
    delivery_notes: order.deliveryNotes || null,
  }).eq('id', id).then(({ error }) => {
    if (error) console.error('Supabase updateOrderStatus error:', error);
  });

  return order;
}

// ----------------------------------------------------
// Coupons (with Supabase sync)
// ----------------------------------------------------
export function getCoupons(): Coupon[] {
  return readJsonFile<Coupon[]>('coupons.json', INITIAL_COUPONS);
}

export function getCouponByCode(code: string): Coupon | undefined {
  const coupons = getCoupons();
  return coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
}

export function saveCoupon(coupon: Coupon): Coupon {
  const coupons = getCoupons();
  const index = coupons.findIndex(c => c.id === coupon.id);
  if (index >= 0) {
    coupons[index] = coupon;
  } else {
    coupons.unshift(coupon);
  }
  writeJsonFile('coupons.json', coupons);

  // Sync to Supabase
  const anyCoupon = coupon as any;
  supabase.from('coupons').upsert({
    id: coupon.id,
    code: coupon.code.toUpperCase(),
    discount_percent: anyCoupon.discountPercent || coupon.discountValue || 0,
    is_active: coupon.isActive ?? true,
    usage_count: anyCoupon.usageCount || coupon.usedCount || 0,
    max_uses: coupon.maxUses || null,
    expires_at: coupon.expiresAt || null,
  }, { onConflict: 'id' }).then(({ error }) => {
    if (error) console.error('Supabase saveCoupon error:', error);
  });

  return coupon;
}

export function deleteCoupon(id: string): boolean {
  const coupons = getCoupons();
  const filtered = coupons.filter(c => c.id !== id);
  writeJsonFile('coupons.json', filtered);

  supabase.from('coupons').delete().eq('id', id).then(({ error }) => {
    if (error) console.error('Supabase deleteCoupon error:', error);
  });

  return true;
}

// ----------------------------------------------------
// Settings (with Supabase sync)
// ----------------------------------------------------
export function getSettings(): StoreSettings {
  return readJsonFile<StoreSettings>('settings.json', INITIAL_SETTINGS);
}

export function updateSettings(newSettings: Partial<StoreSettings>): StoreSettings {
  const current = getSettings();
  const updated = { ...current, ...newSettings };
  writeJsonFile('settings.json', updated);

  // Sync to Supabase
  const anySettings = updated as any;
  supabase.from('store_settings').upsert({
    id: 'default',
    usdt_bep20_address: anySettings.usdtBep20Address || null,
    usdt_trc20_address: anySettings.usdtTrc20Address || null,
    binance_pay_id: anySettings.binancePayId || null,
    telegram_support_handle: anySettings.telegramSupportHandle || null,
    announcement_bar: updated.announcementText || null,
    promo_banner_code: updated.promoBannerCode || null,
    promo_banner_text: updated.promoBannerText || null,
    is_promo_banner_active: updated.showPromoBanner ?? true,
    admin_passcode: anySettings.adminPasscode || null,
    auto_dispatch_keys: anySettings.autoDispatchKeys ?? true,
  }, { onConflict: 'id' }).then(({ error }) => {
    if (error) console.error('Supabase updateSettings error:', error);
  });

  return updated;
}

// ----------------------------------------------------
// Digital Keys Vault (Credentials / Coupons / Invite Links)
// ----------------------------------------------------
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

export function addDigitalKeys(newKeys: NewKeyInput[]): DigitalKey[] {
  const keys = getDigitalKeys();
  const created: DigitalKey[] = newKeys.map(k => {
    let email = k.email;
    let password = k.password;
    let twoFactorSecret = k.twoFactorSecret;
    let couponCode = k.couponCode;
    let inviteUrl = k.inviteUrl;
    let deliveryType: DeliveryMethodType = k.deliveryType || 'account_credentials';

    // Auto-detect format if raw content string passed
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

  keys.push(...created);
  writeJsonFile('keys.json', keys);

  // Sync insert to Supabase
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

  supabase.from('digital_keys').insert(dbRows).then(({ error }) => {
    if (error) console.error('Supabase addDigitalKeys error:', error);
  });

  // Automatically update the product's stock count in Supabase and products.json
  if (created.length > 0) {
    const targetProductId = created[0].productId;
    const availableCount = keys.filter(k => k.productId === targetProductId && !k.isUsed).length;
    
    const products = readJsonFile<Product[]>('products.json', INITIAL_PRODUCTS);
    const prodIndex = products.findIndex(p => p.id === targetProductId);
    if (prodIndex >= 0) {
      products[prodIndex].stockCount = availableCount;
      writeJsonFile('products.json', products);
      supabase.from('products').update({ stock_count: availableCount }).eq('id', targetProductId).then();
    }
  }

  return created;
}

export function claimKeyForOrder(productId: string, planId: string, orderId: string): DigitalKey | null {
  const keys = getDigitalKeys();
  const availableKey = keys.find(k => k.productId === productId && (!k.planId || k.planId === planId) && !k.isUsed);
  if (!availableKey) return null;

  availableKey.isUsed = true;
  availableKey.assignedToOrderId = orderId;
  availableKey.usedAt = new Date().toISOString();
  writeJsonFile('keys.json', keys);

  // Sync claim update to Supabase
  supabase.from('digital_keys').update({
    is_used: true,
    claimed_by_order_id: orderId,
    claimed_at: availableKey.usedAt,
  }).eq('id', availableKey.id).then(({ error }) => {
    if (error) console.error('Supabase claimKey error:', error);
  });

  // Decrement product stock count in Supabase and local cache
  const availableCount = keys.filter(k => k.productId === productId && !k.isUsed).length;
  const products = readJsonFile<Product[]>('products.json', INITIAL_PRODUCTS);
  const prodIndex = products.findIndex(p => p.id === productId);
  if (prodIndex >= 0) {
    products[prodIndex].stockCount = availableCount;
    writeJsonFile('products.json', products);
    supabase.from('products').update({ stock_count: availableCount }).eq('id', productId).then();
  }

  return availableKey;
}

export function deleteDigitalKey(id: string): boolean {
  const keys = getDigitalKeys();
  const targetKey = keys.find(k => k.id === id);
  const filtered = keys.filter(k => k.id !== id);
  writeJsonFile('keys.json', filtered);

  supabase.from('digital_keys').delete().eq('id', id).then(({ error }) => {
    if (error) console.error('Supabase deleteDigitalKey error:', error);
  });

  // Recalculate stock count for product
  if (targetKey) {
    const availableCount = filtered.filter(k => k.productId === targetKey.productId && !k.isUsed).length;
    const products = readJsonFile<Product[]>('products.json', INITIAL_PRODUCTS);
    const prodIndex = products.findIndex(p => p.id === targetKey.productId);
    if (prodIndex >= 0) {
      products[prodIndex].stockCount = availableCount;
      writeJsonFile('products.json', products);
      supabase.from('products').update({ stock_count: availableCount }).eq('id', targetKey.productId).then();
    }
  }

  return true;
}
