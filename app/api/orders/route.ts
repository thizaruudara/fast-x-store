import { NextResponse } from 'next/server';
import { getOrders, saveOrder, getSettings, getCouponByCode, saveCoupon } from '@/lib/db';
import { generateOrderId, calculateOrderTotal } from '@/lib/utils';
import { Order } from '@/lib/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const email = searchParams.get('email');

    let orders = getOrders();
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

    const settings = getSettings();
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    let discountAmount = 0;
    if (couponCode) {
      const coupon = getCouponByCode(couponCode);
      if (coupon && coupon.isActive) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
        } else {
          discountAmount = Math.min(subtotal, coupon.discountValue);
        }
        // Increment coupon usage
        coupon.usedCount += 1;
        saveCoupon(coupon);
      }
    }

    // Fetch active pending order totals to guarantee 100% collision-free micro-fee verification
    const allOrders = getOrders();
    const activePendingTotals = allOrders
      .filter((o) => o.status === 'pending' && new Date(o.expiresAt).getTime() > Date.now())
      .map((o) => o.totalAmount);

    // Generate guaranteed unique micro-fee (e.g. +0.0124, +0.0287, +0.0541 USDT)
    const { discountedSubtotal, microFee, totalUsdt } = calculateOrderTotal(
      subtotal, 
      discountAmount, 
      activePendingTotals
    );

    const orderId = generateOrderId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 20 * 60 * 1000).toISOString(); // 20 min expiration

    const newOrder: Order = {
      id: orderId,
      customerEmail: customerEmail.trim(),
      telegramUsername: telegramUsername ? telegramUsername.trim() : undefined,
      items,
      couponCode: couponCode || undefined,
      discountAmount: Number(discountAmount.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      verificationFee: microFee,
      totalAmount: totalUsdt,
      paymentMethod: 'binance_pay',
      paymentDetails: {
        exactUsdtAmount: totalUsdt,
        bep20Address: settings.bep20WalletAddress,
        binancePayId: settings.binancePayId,
        network: 'BEP-20 (BNB Smart Chain) / Binance Pay'
      },
      status: 'pending',
      createdAt: now.toISOString(),
      expiresAt: expiresAt,
    };

    const saved = saveOrder(newOrder);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
