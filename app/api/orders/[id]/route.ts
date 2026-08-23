import { NextResponse } from 'next/server';
import { getOrderByIdAsync, updateOrderStatusAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const order = await getOrderByIdAsync(params.id);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, txHash, deliveredKeys, deliveryNotes } = body;

    const updated = await updateOrderStatusAsync(params.id, status, {
      txHash,
      deliveredKeys,
      deliveryNotes,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
