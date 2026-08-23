import { NextResponse } from 'next/server';
import { getProductById, deleteProduct } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const product = getProductById(params.id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const success = deleteProduct(params.id);
  return NextResponse.json({ success });
}
