import { NextResponse } from 'next/server';
import { getOrdersAsync, saveOrderAsync, getSettingsAsync, getCouponByCodeAsync, saveCouponAsync } from '@/lib/db';
import { generateOrderId, calculateOrderTotal } from '@/lib/utils';
import { Order } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const email = searchParams.get('email');

    let orders = await getOrdersAsync();
    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    if (email) {
      orders = orders.filter(o => o.customerEmail.toLowerCase() === email.toLowerCase());
    }

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerEmail, telegramUsername, items, couponCode } = body;

    if (!customerEmail || !items || items.length === 0) {
      return NextResponse.json({ error: 'Email and at least one item are required' }, { status: 400 });
    }

    const settings = await getSettingsAsync();
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    let discountAmount = 0;
    if (couponCode) {
      const coupon = await getCouponByCodeAsync(couponCode);
      if (coupon && coupon.isActive) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
        } else {
          discountAmount = Math.min(subtotal, coupon.discountValue);
        }
        // Increment coupon usage
        coupon.usedCount += 1;
        await saveCouponAsync(coupon);
      }
    }

    // Fetch active pending order totals to guarantee 100% collision-free micro-fee verification
    const allOrders = await getOrdersAsync();
    const activePendingTotals = allOrders
      .filter((o) => o.status === 'pending' && new Date(o.expiresAt).getTime() > Date.now())
      .map((o) => o.totalAmount);

    // Generate guaranteed unique micro-fee (e.g. +0.0124, +0.0287, +0.0541 USDT)
    const { discountedSubtotal, microFee, totalUsdt } = calculateOrderTotal(
      subtotal,
      discountAmount,
      activePendingTotals
    );

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 20 * 60 * 1000); // 20 mins expiry

    const newOrder: Order = {
      id: generateOrderId(),
      customerEmail: customerEmail.trim(),
      telegramUsername: telegramUsername ? telegramUsername.trim() : undefined,
      items,
      couponCode: couponCode || undefined,
      discountAmount,
      subtotal,
      verificationFee: microFee,
      totalAmount: totalUsdt,
      paymentMethod: 'binance_pay',
      paymentDetails: {
        exactUsdtAmount: totalUsdt,
        bep20Address: settings.bep20WalletAddress,
        binancePayId: settings.binancePayId,
        network: 'BEP-20 (BNB Smart Chain)',
      },
      status: 'pending',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    const saved = await saveOrderAsync(newOrder);
    return NextResponse.json(saved);
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
