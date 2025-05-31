import { NextResponse } from 'next/server';
import { simpleParser } from 'mailparser';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rawEmail, id } = body;

    if (!rawEmail) {
      return NextResponse.json({ error: 'rawEmail is required' }, { status: 400 });
    }

    const parsed = await simpleParser(rawEmail);

    const fullEmail = {
      id: id || `email-${Date.now()}`,
      from: parsed.from?.text || '',
      to: parsed.to?.text || '',
      subject: parsed.subject || '',
      body: parsed.text || '',
      rawData: rawEmail,
      sentAt: parsed.date || new Date(),
      valid: true,
    };

    return NextResponse.json(fullEmail);
  } catch (err: any) {
    console.error('Failed to parse email:', err);
    return NextResponse.json(
      { error: 'Failed to parse email', details: err.message },
      { status: 500 }
    );
  }
}