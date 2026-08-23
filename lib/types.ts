export type ProductCategory = 
  | 'all'
  | 'ai'
  | 'video'
  | 'streaming'
  | 'productivity'
  | 'design'
  | 'developer';

export type CurrencyCode = 'USDT' | 'LKR';

export interface PlanDuration {
  id: string;
  name: string; // e.g. "1 Month", "3 Months", "1 Year", "Lifetime"
  durationDays: number;
  price: number; // in USDT / USD
  priceLkr?: number; // in LKR (Sri Lankan Rupee)
  originalPrice?: number;
  originalPriceLkr?: number;
  popular?: boolean;
  savings?: string; // e.g. "Save 35%"
}

export type DeliveryMethodType = 'account_credentials' | 'coupon_key' | 'invite_link';

export interface DigitalKey {
  id: string;
  productId: string;
  planId: string;
  deliveryType?: DeliveryMethodType;
  content: string; // "email:pass" or "email:pass:2faSecret" or "COUPON-CODE" or "https://invite.link"
  email?: string;
  password?: string;
  twoFactorSecret?: string;
  couponCode?: string;
  inviteUrl?: string;
  isUsed: boolean;
  assignedToOrderId?: string;
  createdAt: string;
  usedAt?: string;
}

export type WarrantyType = 
  | 'full_period'
  | '1_hour'
  | '3_hours'
  | '6_hours'
  | '12_hours'
  | '24_hours'
  | '3_days'
  | '5_days'
  | '7_days'
  | '30_days'
  | 'no_warranty'
  | 'custom';

export interface Product {
  id: string;
  name: string; // e.g. "Gemini Advanced (Google One)"
  slug: string;
  category: ProductCategory;
  tagline: string;
  description: string;
  icon: string; // Icon identifier or image URL
  logoUrl?: string; // Official Provider Logo URL
  color: string; // Gradient / accent color
  badge?: string; // e.g. 'BEST VALUE', 'BEST SELLER', 'HOT', 'TRENDING', 'POPULAR', 'RECOMMENDED', etc.
  sortOrder?: number; // Display order index (1 = First on storefront)
  warrantyType?: WarrantyType;
  warrantyCustomText?: string;
  warrantyText?: string;
  features: string[];
  plans: PlanDuration[];
  stockCount: number;
  deliveryType: 'instant_key' | 'account_credentials' | 'manual_delivery';
  loginUrl?: string; // e.g. "https://chatgpt.com" or "https://gemini.google.com"
  instructions: string;
  isActive: boolean;
  rating: number;
  reviewCount: number;
}

export type OrderStatus = 
  | 'pending'
  | 'verifying'
  | 'paid'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string; // e.g. "ORD-982341"
  customerEmail: string;
  telegramUsername?: string;
  items: {
    productId: string;
    productName: string;
    planId: string;
    planName: string;
    price: number;
    quantity: number;
    icon: string;
    logoUrl?: string;
  }[];
  couponCode?: string;
  discountAmount: number;
  subtotal: number;
  verificationFee: number; // e.g. 0.0123 USDT
  totalAmount: number; // e.g. 19.99 + 0.0123 = 20.0023
  paymentMethod: 'binance_pay' | 'card_coming_soon' | 'paypal_coming_soon';
  paymentDetails: {
    exactUsdtAmount: number;
    bep20Address: string;
    binancePayId: string;
    txHash?: string;
    network: string; // 'BEP-20 (BNB Smart Chain)' or 'Binance Pay'
  };
  status: OrderStatus;
  deliveredKeys?: string[];
  deliveryNotes?: string;
  createdAt: string;
  expiresAt: string; // 20 minutes from creation
  paidAt?: string;
  deliveredAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 20 for 20% or 5 for $5
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  announcementText: string;
  announcementActive: boolean;
  showPromoBanner: boolean; // Toggle to display or hide the promo code banner
  promoBannerCode: string; // e.g. "AI2026"
  promoBannerText: string; // e.g. "Save an extra 20% on any plan today!"
  binancePayId: string;
  bep20WalletAddress: string;
  trc20WalletAddress?: string;
  binanceApiKey: string;
  binanceApiSecret: string;
  enableLiveBinanceApi: boolean;
  microFeeAmount: number; // default 0.0123
  telegramSupportHandle: string;
  whatsappSupportNumber: string;
  adminPasscode: string; // default passcode
  // Email System Settings (fast-x.store)
  emailProvider: 'resend' | 'smtp' | 'disabled';
  resendApiKey: string;
  senderEmail: string; // e.g. "orders@fast-x.store" or "support@fast-x.store"
  senderName: string; // e.g. "Fast X Solutions"
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  sendOrderConfirmationEmail: boolean;
}
