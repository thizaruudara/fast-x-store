import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { passcode } = await req.json();
    const settings = getSettings();

    if (!passcode || passcode !== settings.adminPasscode) {
      return NextResponse.json({ success: false, error: 'Invalid admin passcode' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      token: 'admin_authenticated_session_token' 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}
