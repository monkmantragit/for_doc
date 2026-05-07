import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
const ADMIN_PASSWORDS = (process.env.ADMIN_PASSWORDS || '').split(',').map(p => p.trim()).filter(Boolean);
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not configured');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  if (ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.length !== ADMIN_PASSWORDS.length) {
    console.error('ADMIN_EMAILS / ADMIN_PASSWORDS env vars are missing or mismatched');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailIndex = ADMIN_EMAILS.findIndex(e => e.toLowerCase() === normalizedEmail);

    if (emailIndex === -1) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (ADMIN_PASSWORDS[emailIndex] !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = sign(
      { email: ADMIN_EMAILS[emailIndex], role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    cookies().set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
