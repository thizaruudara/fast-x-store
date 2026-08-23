import { Product, Coupon, StoreSettings, DigitalKey } from './types';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: "Fast X",
  storeTagline: "Premium AI, Video & Streaming Subscriptions at Wholesale Crypto Rates. Instant Binance Delivery.",
  announcementText: "⚡ FAST X: Use code 'AI2026' for 20% OFF | Automated Binance Pay +0.0123 USDT Verification Active",
  announcementActive: true,
  showPromoBanner: true,
  promoBannerCode: "AI2026",
  promoBannerText: "Save an extra 20% on any plan today!",
  binancePayId: "982341098",
  bep20WalletAddress: "0x71C836eB68685121b658d55B77a16E5D72605Ea2",
  trc20WalletAddress: "TYDzsYUEpvnYmQk4zGP9sWWcTEd3TgLMro",
  binanceApiKey: "",
  binanceApiSecret: "",
  enableLiveBinanceApi: false,
  microFeeAmount: 0.0123,
  telegramSupportHandle: "@fastx_owner",
  whatsappSupportNumber: "+1234567890",
  adminPasscode: process.env.ADMIN_PASSCODE || "admin1234",
  emailProvider: "resend",
  resendApiKey: "",
  senderEmail: "orders@fast-x.store",
  senderName: "Fast X Solutions",
  smtpHost: "smtp.resend.com",
  smtpPort: 587,
  smtpUser: "resend",
  smtpPass: "",
  sendOrderConfirmationEmail: true,
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-gemini-adv",
    name: "Gemini Advanced (Google One AI)",
    slug: "gemini-advanced",
    category: "ai",
    tagline: "Gemini 1.5/2.0 Pro with 1M+ Token Context & 2TB Cloud Storage",
    description: "Get full unlimited access to Google's flagship Gemini Advanced model. Includes 2TB Google Drive storage, deep code reasoning, multimodal document analysis, and Google Workspace AI integration.",
    icon: "Sparkles",
    logoUrl: "/logos/gemini.svg",
    loginUrl: "https://gemini.google.com",
    color: "from-blue-500 via-indigo-500 to-purple-600",
    badge: "BESTSELLER",
    features: [
      "Gemini 2.0 / 1.5 Pro with 1M+ Context Window",
      "2 TB Google Drive Cloud Storage included",
      "Priority access during peak hours",
      "Integrated into Docs, Gmail, Sheets & Slides",
      "Private Google Account credentials provided",
      "Full 30-day replacement warranty"
    ],
    plans: [
      { id: "gem-1m", name: "1 Month", durationDays: 30, price: 7.99, originalPrice: 19.99, savings: "60% OFF" },
      { id: "gem-3m", name: "3 Months", durationDays: 90, price: 19.99, originalPrice: 59.99, savings: "67% OFF", popular: true },
      { id: "gem-1y", name: "1 Year", durationDays: 365, price: 69.99, originalPrice: 239.99, savings: "71% OFF" }
    ],
    stockCount: 18,
    deliveryType: "account_credentials",
    instructions: "1. Go to gemini.google.com and sign in with the Email & Password.\n2. If 2FA is required, enter the 2FA secret at 2fa.online to get your 6-digit login code.",
    isActive: true,
    rating: 4.9,
    reviewCount: 342
  },
  {
    id: "prod-capcut-pro",
    name: "CapCut Pro VIP (PC + Mobile + Web)",
    slug: "capcut-pro",
    category: "video",
    tagline: "Unlock all VIP Effects, Auto Captions & 4K 60FPS Export",
    description: "Supercharge your video editing with CapCut Pro VIP. Access all AI cutout tools, smart auto-captions with custom animated presets, 4K 60FPS export, and hundreds of pro transitions without watermarks.",
    icon: "Video",
    logoUrl: "/logos/capcut.svg",
    loginUrl: "https://www.capcut.com",
    color: "from-cyan-400 via-teal-500 to-emerald-500",
    badge: "HOT",
    features: [
      "Works on PC (Windows/Mac), Android & iOS",
      "Auto Subtitles / Captions with bilingual translation",
      "AI Smart Cutout, Motion Tracking & Body Effects",
      "4K 60FPS High-Bitrate Export",
      "100GB CapCut Cloud Space",
      "Instant activation code / pre-activated VIP account"
    ],
    plans: [
      { id: "cap-1m", name: "1 Month", durationDays: 30, price: 4.99, originalPrice: 9.99, savings: "50% OFF" },
      { id: "cap-3m", name: "3 Months", durationDays: 90, price: 12.99, originalPrice: 29.99, savings: "57% OFF", popular: true },
      { id: "cap-1y", name: "1 Year", durationDays: 365, price: 39.99, originalPrice: 89.99, savings: "56% OFF" }
    ],
    stockCount: 24,
    deliveryType: "account_credentials",
    instructions: "Sign into capcut.com or the CapCut desktop/mobile app with the Email & Password provided.",
    isActive: true,
    rating: 4.8,
    reviewCount: 512
  },
  {
    id: "prod-netflix-uhd",
    name: "Netflix Premium Ultra HD 4K",
    slug: "netflix-premium-4k",
    category: "streaming",
    tagline: "4K HDR Dolby Atmos with Private PIN Profile",
    description: "Watch your favorite shows and blockbuster movies in stunning 4K HDR quality. You get a dedicated personal profile with a custom PIN lock, zero interruptions, and guaranteed auto-renewal.",
    icon: "Film",
    logoUrl: "/logos/netflix.svg",
    loginUrl: "https://netflix.com",
    color: "from-red-600 via-rose-600 to-orange-600",
    badge: "PROMO",
    features: [
      "Ultra HD (4K) and HDR resolution",
      "Spatial Audio & Dolby Atmos support",
      "Dedicated Private Profile with custom PIN",
      "Works on Smart TVs, PC, iOS, Android, Consoles",
      "No household lock issues / geo-unrestricted",
      "Auto-replacement warranty for duration"
    ],
    plans: [
      { id: "nfx-1m", name: "1 Month", durationDays: 30, price: 3.99, originalPrice: 22.99, savings: "82% OFF" },
      { id: "nfx-3m", name: "3 Months", durationDays: 90, price: 10.99, originalPrice: 68.99, savings: "84% OFF", popular: true },
      { id: "nfx-6m", name: "6 Months", durationDays: 180, price: 19.99, originalPrice: 137.99, savings: "85% OFF" },
      { id: "nfx-1y", name: "1 Year", durationDays: 365, price: 36.99, originalPrice: 275.99, savings: "86% OFF" }
    ],
    stockCount: 35,
    deliveryType: "account_credentials",
    instructions: "Sign into Netflix app or browser using the provided Email:Password. Click on your assigned profile name.",
    isActive: true,
    rating: 5.0,
    reviewCount: 890
  },
  {
    id: "prod-prime-video",
    name: "Amazon Prime Video + Gaming",
    slug: "amazon-prime-video",
    category: "streaming",
    tagline: "4K UHD Originals, The Boys, Rings of Power & Prime Gaming",
    description: "Enjoy full Amazon Prime Video access including top global exclusives, 4K UHD streaming, downloadable offline viewing, and free Twitch / Prime Gaming monthly loot drops.",
    icon: "Tv",
    logoUrl: "/logos/prime-video.svg",
    loginUrl: "https://primevideo.com",
    color: "from-sky-500 via-blue-600 to-indigo-700",
    badge: "HOT",
    features: [
      "Ad-free Amazon Originals & Exclusives in 4K HDR",
      "Download and watch offline anywhere",
      "X-Ray tech powered by IMDb",
      "Includes Prime Gaming benefits & Twitch channel sub",
      "Worldwide access with multiple language subtitles",
      "Instant account delivery"
    ],
    plans: [
      { id: "prm-1m", name: "1 Month", durationDays: 30, price: 2.99, originalPrice: 14.99, savings: "80% OFF" },
      { id: "prm-6m", name: "6 Months", durationDays: 180, price: 13.99, originalPrice: 89.99, savings: "84% OFF", popular: true },
      { id: "prm-1y", name: "1 Year", durationDays: 365, price: 24.99, originalPrice: 179.99, savings: "86% OFF" }
    ],
    stockCount: 20,
    deliveryType: "account_credentials",
    instructions: "Log in at primevideo.com with the provided Email and Password.",
    isActive: true,
    rating: 4.7,
    reviewCount: 230
  },
  {
    id: "prod-chatgpt-plus",
    name: "ChatGPT Plus / Team (GPT-4o)",
    slug: "chatgpt-plus-gpt4o",
    category: "ai",
    tagline: "Unlimited GPT-4o, Canvas, Advanced Voice & DALL-E 3",
    description: "The world's most capable AI assistant. Access OpenAI's flagship GPT-4o model with ultra-fast responses, real-time voice mode, code canvas workspace, web browsing, and custom GPT builder.",
    icon: "Bot",
    logoUrl: "/logos/chatgpt.svg",
    loginUrl: "https://chatgpt.com",
    color: "from-emerald-500 via-teal-600 to-cyan-600",
    badge: "BESTSELLER",
    features: [
      "GPT-4o with unlimited reasoning & code generation",
      "Interactive Canvas workspace for programming & writing",
      "DALL-E 3 high-definition image generator",
      "Real-Time Advanced Voice Mode on Mobile",
      "Access to all custom GPTs in the GPT Store",
      "100% private account or workspace invite"
    ],
    plans: [
      { id: "gpt-1m", name: "1 Month", durationDays: 30, price: 9.99, originalPrice: 20.00, savings: "50% OFF" },
      { id: "gpt-3m", name: "3 Months", durationDays: 90, price: 26.99, originalPrice: 60.00, savings: "55% OFF", popular: true },
      { id: "gpt-1y", name: "1 Year", durationDays: 365, price: 89.99, originalPrice: 240.00, savings: "62% OFF" }
    ],
    stockCount: 15,
    deliveryType: "account_credentials",
    instructions: "1. Go to chatgpt.com and enter your Email and Password.\n2. If 2FA Code is requested: Copy your 2FA Secret Key, open 2fa.online, paste it, and copy the 6-digit code to log in.",
    isActive: true,
    rating: 4.9,
    reviewCount: 780
  },
  {
    id: "prod-canva-pro",
    name: "Canva Pro VIP (Edu / Lifetime)",
    slug: "canva-pro-vip",
    category: "design",
    tagline: "100M+ Stock Assets, Magic AI Studio & Background Remover",
    description: "Design anything effortlessly. Unlock 100M+ premium stock templates, photos, fonts, AI Magic Eraser, brand kits, and 1TB cloud storage directly on your own personal email!",
    icon: "Palette",
    logoUrl: "/logos/canva.svg",
    loginUrl: "https://canva.com",
    color: "from-purple-500 via-fuchsia-500 to-pink-500",
    badge: "50% OFF",
    features: [
      "Upgrades directly to your OWN personal Canva email",
      "100+ Million premium stock photos, graphics, videos",
      "One-click AI Background Remover & Magic Resize",
      "AI Magic Studio: Magic Write, Magic Expand & Text-to-Image",
      "1000+ Brand kits with custom fonts and palettes",
      "Lifetime or duration warranty"
    ],
    plans: [
      { id: "can-1m", name: "1 Month", durationDays: 30, price: 2.99, originalPrice: 12.99, savings: "77% OFF" },
      { id: "can-1y", name: "1 Year", durationDays: 365, price: 14.99, originalPrice: 119.99, savings: "87% OFF", popular: true },
      { id: "can-lt", name: "Lifetime VIP", durationDays: 3650, price: 24.99, originalPrice: 299.99, savings: "92% OFF" }
    ],
    stockCount: 50,
    deliveryType: "instant_key",
    instructions: "Click the invitation link provided in your order to instantly bind Canva Pro VIP to your email.",
    isActive: true,
    rating: 4.9,
    reviewCount: 620
  },
  {
    id: "prod-claude-pro",
    name: "Claude Pro (Anthropic Sonnet 3.5)",
    slug: "claude-pro-anthropic",
    category: "ai",
    tagline: "Claude 3.5 Sonnet & Artifacts with 5x Message Limits",
    description: "Anthropic's industry-leading coding & reasoning model. Features instant interactive Artifacts, full code execution preview, 200K token context window, and high-frequency usage limits.",
    icon: "Cpu",
    logoUrl: "/logos/claude.svg",
    loginUrl: "https://claude.ai",
    color: "from-amber-500 via-orange-500 to-red-500",
    badge: "HOT",
    features: [
      "Claude 3.5 Sonnet - Top-rated benchmark coding model",
      "Interactive Artifacts with live React & HTML preview",
      "5x higher usage limits than free tier",
      "Projects workspace to upload entire repositories & docs",
      "Priority access during high-traffic times",
      "Private account delivery"
    ],
    plans: [
      { id: "cld-1m", name: "1 Month", durationDays: 30, price: 11.99, originalPrice: 20.00, savings: "40% OFF" },
      { id: "cld-3m", name: "3 Months", durationDays: 90, price: 31.99, originalPrice: 60.00, savings: "47% OFF", popular: true },
      { id: "cld-1y", name: "1 Year", durationDays: 365, price: 99.99, originalPrice: 240.00, savings: "58% OFF" }
    ],
    stockCount: 12,
    deliveryType: "account_credentials",
    instructions: "1. Go to claude.ai and log in with the Email & Password.\n2. If 2FA is prompted, paste the 2FA Secret Key into 2fa.online to receive your 6-digit login token.",
    isActive: true,
    rating: 4.9,
    reviewCount: 290
  },
  {
    id: "prod-spotify-prem",
    name: "Spotify Premium (Private / Upgrade)",
    slug: "spotify-premium",
    category: "streaming",
    tagline: "Ad-Free Music, Offline Listening & Extreme 320kbps Audio",
    description: "Stream unlimited music and podcasts without ads, download your playlists for offline listening, and enjoy 320kbps extreme audio quality.",
    icon: "Music",
    logoUrl: "/logos/spotify.svg",
    loginUrl: "https://spotify.com",
    color: "from-green-500 via-emerald-500 to-teal-600",
    badge: "HOT",
    features: [
      "Ad-free uninterrupted streaming",
      "Download songs & playlists for offline listening",
      "High Fidelity 320kbps audio bitrate",
      "Unlimited skips and on-demand playback",
      "Upgrade your existing Spotify account or get a new one",
      "Full warranty duration"
    ],
    plans: [
      { id: "spt-1m", name: "1 Month", durationDays: 30, price: 2.49, originalPrice: 10.99, savings: "77% OFF" },
      { id: "spt-6m", name: "6 Months", durationDays: 180, price: 9.99, originalPrice: 65.99, savings: "85% OFF", popular: true },
      { id: "spt-1y", name: "1 Year", durationDays: 365, price: 16.99, originalPrice: 129.99, savings: "87% OFF" }
    ],
    stockCount: 42,
    deliveryType: "instant_key",
    instructions: "Use the automated family invite key or login credentials sent to your order details page.",
    isActive: true,
    rating: 4.8,
    reviewCount: 415
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: "coup-ai2026",
    code: "AI2026",
    discountType: "percentage",
    discountValue: 20,
    minOrderAmount: 5,
    maxUses: 500,
    usedCount: 38,
    isActive: true,
    expiresAt: "2027-01-01"
  },
  {
    id: "coup-welcome5",
    code: "WELCOME5",
    discountType: "fixed",
    discountValue: 2.00,
    minOrderAmount: 10,
    maxUses: 1000,
    usedCount: 142,
    isActive: true
  },
  {
    id: "coup-vip10",
    code: "VIP10",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 0,
    maxUses: 100,
    usedCount: 19,
    isActive: true
  }
];

export const INITIAL_KEYS: DigitalKey[] = [
  {
    id: "key-1",
    productId: "prod-chatgpt-plus",
    planId: "gpt-1m",
    content: "gpt_pro_user2026@fastxmail.com:FastXPass#2026:JBSWY3DPEHPK3PXP",
    email: "gpt_pro_user2026@fastxmail.com",
    password: "FastXPass#2026",
    twoFactorSecret: "JBSWY3DPEHPK3PXP",
    isUsed: false,
    createdAt: "2026-08-23T14:30:00.000Z"
  },
  {
    id: "key-2",
    productId: "prod-gemini-adv",
    planId: "gem-1m",
    content: "gemini_vip_fastx@fastxmail.com:GoogleFastX#99:MZXW633PN5XW6MZX",
    email: "gemini_vip_fastx@fastxmail.com",
    password: "GoogleFastX#99",
    twoFactorSecret: "MZXW633PN5XW6MZX",
    isUsed: false,
    createdAt: "2026-08-23T14:30:00.000Z"
  },
  {
    id: "key-3",
    productId: "prod-capcut-pro",
    planId: "cap-1m",
    content: "capcut_vip_pro88@fastxmail.com:CapCutPass#88",
    email: "capcut_vip_pro88@fastxmail.com",
    password: "CapCutPass#88",
    isUsed: false,
    createdAt: "2026-08-23T14:30:00.000Z"
  },
  {
    id: "key-4",
    productId: "prod-netflix-uhd",
    planId: "nfx-1m",
    content: "netflix_4k_vip@fastxmail.com:NetPass#4K88 (Profile: User 2, PIN: 1234)",
    email: "netflix_4k_vip@fastxmail.com",
    password: "NetPass#4K88 (Profile: User 2, PIN: 1234)",
    isUsed: false,
    createdAt: "2026-08-23T14:30:00.000Z"
  },
  {
    id: "key-5",
    productId: "prod-canva-pro",
    planId: "can-lt",
    content: "https://www.canva.com/brand/join?token=fastx_vip_canva_invite_9981",
    isUsed: false,
    createdAt: "2026-08-23T14:30:00.000Z"
  }
];
