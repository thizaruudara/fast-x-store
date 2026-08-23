import { NextResponse } from 'next/server';
import { getProductByIdAsync, deleteProductAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const product = await getProductByIdAsync(params.id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const success = await deleteProductAsync(params.id);
  return NextResponse.json({ success });
}
