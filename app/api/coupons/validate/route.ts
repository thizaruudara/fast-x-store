import { NextResponse } from 'next/server';
import { getCouponByCode } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { code, orderAmount } = await req.json();
    if (!code) {
      return NextResponse.json({ valid: false, error: 'Coupon code required' }, { status: 400 });
    }

    const coupon = getCouponByCode(code);
    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, error: 'Invalid or inactive coupon code' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ valid: false, error: 'This coupon has expired' });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: 'Coupon usage limit reached' });
    }

    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return NextResponse.json({ 
        valid: false, 
        error: `Minimum order amount of $${coupon.minOrderAmount.toFixed(2)} required` 
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100;
    } else {
      discount = Math.min(orderAmount, coupon.discountValue);
    }

    return NextResponse.json({
      valid: true,
      coupon,
      discountAmount: Number(discount.toFixed(2)),
      message: `Coupon '${coupon.code}' applied! Saved $${discount.toFixed(2)}`
    });
  } catch (error) {
    return NextResponse.json({ valid: false, error: 'Failed to validate coupon' }, { status: 500 });
  }
}
