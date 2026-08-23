import { NextResponse } from 'next/server';
import { getCoupons, saveCoupon, deleteCoupon } from '@/lib/db';
import { Coupon } from '@/lib/types';

export async function GET() {
  try {
    const coupons = getCoupons();
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: Coupon = await req.json();
    if (!body.code || !body.discountValue) {
      return NextResponse.json({ error: 'Missing required coupon fields' }, { status: 400 });
    }

    if (!body.id) {
      body.id = `coup-${Date.now()}`;
    }
    body.code = body.code.toUpperCase().trim();
    if (body.usedCount === undefined) body.usedCount = 0;
    if (body.isActive === undefined) body.isActive = true;

    const saved = saveCoupon(body);
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save coupon' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    deleteCoupon(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
