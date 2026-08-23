import { NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { toEmail, settings } = await req.json();

    if (!toEmail || !toEmail.includes('@')) {
      return NextResponse.json({ error: 'Please provide a valid recipient email address' }, { status: 400 });
    }

    const result = await sendTestEmail(toEmail, settings);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send test email' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
