import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';
import { StoreSettings } from '@/lib/types';

export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: Partial<StoreSettings> = await req.json();
    const updated = updateSettings(body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
