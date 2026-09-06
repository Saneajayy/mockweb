import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    const sitePassword = process.env.SITE_PASSWORD;

    if (!sitePassword) {
      return NextResponse.json(
        { error: 'Site password not configured' },
        { status: 500 }
      );
    }

    if (password === sitePassword) {
      // Set the session cookie
      const cookieStore = await cookies();
      cookieStore.set({
        name: 'journal_session',
        value: 'authenticated',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    // Basic throttling: 1-second delay for wrong password
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
