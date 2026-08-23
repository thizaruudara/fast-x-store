import { NextResponse } from 'next/server';
import { getProductsAsync, saveProductAsync, reorderProductsAsync } from '@/lib/db';
import { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await getProductsAsync();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (Array.isArray(body)) {
      const updated = await reorderProductsAsync(body);
      return NextResponse.json({ success: true, products: updated });
    }

    const prodBody: Product = body;
    if (!prodBody.name || !prodBody.plans || prodBody.plans.length === 0) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    if (!prodBody.id) {
      prodBody.id = `prod-${Date.now()}`;
    }
    if (!prodBody.slug) {
      prodBody.slug = prodBody.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    const saved = await saveProductAsync(prodBody);
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save product' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (Array.isArray(body)) {
      const updated = await reorderProductsAsync(body);
      return NextResponse.json({ success: true, products: updated });
    }
    return NextResponse.json({ error: 'Expected array of products' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reorder products' }, { status: 500 });
  }
}
