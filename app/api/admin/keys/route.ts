import { NextResponse } from 'next/server';
import { getDigitalKeys, addDigitalKeys, deleteDigitalKey } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') || undefined;

    // Fetch from Supabase
    let query = supabase.from('digital_keys').select('*').order('created_at', { ascending: false });
    if (productId) {
      query = query.eq('product_id', productId);
    }
    const { data: dbKeys, error } = await query;

    if (!error && dbKeys && dbKeys.length > 0) {
      const mapped = dbKeys.map((k: any) => ({
        id: k.id,
        productId: k.product_id,
        planId: k.plan_id,
        content: k.content,
        email: k.email,
        password: k.password,
        twoFactorSecret: k.two_factor_secret,
        isUsed: k.is_used,
        assignedToOrderId: k.claimed_by_order_id,
        usedAt: k.claimed_at,
        createdAt: k.created_at
      }));
      return NextResponse.json(mapped);
    }

    const keys = getDigitalKeys(productId);
    return NextResponse.json(keys);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch keys' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, planId, rawKeys, accounts } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    let keyObjects: { productId: string; planId?: string; content: string }[] = [];

    // Structured 3-box accounts submission
    if (Array.isArray(accounts) && accounts.length > 0) {
      keyObjects = accounts
        .filter((acc: any) => acc.email?.trim() && acc.password?.trim())
        .map((acc: any) => {
          const email = acc.email.trim();
          const pass = acc.password.trim();
          const twoFactor = acc.twoFactorSecret ? acc.twoFactorSecret.trim() : '';
          const content = twoFactor ? `${email}:${pass}:${twoFactor}` : `${email}:${pass}`;

          return {
            productId,
            planId: planId || acc.planId || '',
            content,
          };
        });
    } else if (rawKeys && typeof rawKeys === 'string') {
      const lines = rawKeys.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      keyObjects = lines.map((content: string) => ({
        productId,
        planId: planId || '',
        content,
      }));
    }

    if (keyObjects.length === 0) {
      return NextResponse.json({ error: 'Please provide at least one account with Email and Password' }, { status: 400 });
    }

    const added = addDigitalKeys(keyObjects);
    return NextResponse.json({ success: true, count: added.length, keys: added });
  } catch (error) {
    console.error('Failed to add keys:', error);
    return NextResponse.json({ error: 'Failed to add keys' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    deleteDigitalKey(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete key' }, { status: 500 });
  }
}
