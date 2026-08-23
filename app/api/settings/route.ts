import { NextResponse } from 'next/server';
import { getSettingsAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Public Safe Store Settings Endpoint
 * Strips all sensitive credentials (API keys, secrets, admin passcodes) before returning.
 */
export async function GET() {
  try {
    const raw = await getSettingsAsync();

    // Sanitize and expose only safe public storefront data
    const publicSettings = {
      storeName: raw.storeName,
      storeTagline: raw.storeTagline,
      announcementText: raw.announcementText,
      announcementActive: raw.announcementActive,
      showPromoBanner: raw.showPromoBanner,
      promoBannerCode: raw.promoBannerCode,
      promoBannerText: raw.promoBannerText,
      binancePayId: raw.binancePayId,
      bep20WalletAddress: raw.bep20WalletAddress,
      trc20WalletAddress: raw.trc20WalletAddress,
      telegramSupportHandle: raw.telegramSupportHandle,
      whatsappSupportNumber: raw.whatsappSupportNumber,
    };

    return NextResponse.json(publicSettings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch public settings' }, { status: 500 });
  }
}
