import { NextResponse } from 'next/server';
import { getDigitalKeysAsync, addDigitalKeysAsync, deleteDigitalKeyAsync, NewKeyInput } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') || undefined;

    const keys = await getDigitalKeysAsync(productId);
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

    let keyInputs: NewKeyInput[] = [];

    // Structured 3-box accounts submission
    if (Array.isArray(accounts) && accounts.length > 0) {
      keyInputs = accounts
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
            email,
            password: pass,
            twoFactorSecret: twoFactor || undefined,
            deliveryType: 'account_credentials' as const,
          };
        });
    } else if (rawKeys && typeof rawKeys === 'string') {
      const lines = rawKeys.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      keyInputs = lines.map((content: string) => ({
        productId,
        planId: planId || '',
        content,
      }));
    }

    if (keyInputs.length === 0) {
      return NextResponse.json({ error: 'Please provide at least one account with Email and Password' }, { status: 400 });
    }

    const added = await addDigitalKeysAsync(keyInputs);
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

    await deleteDigitalKeyAsync(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete key' }, { status: 500 });
  }
}
