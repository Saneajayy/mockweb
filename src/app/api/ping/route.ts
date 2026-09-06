import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('journal_session');
  return session?.value === 'authenticated';
}

export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { author } = await request.json();

    if (!author) {
      return NextResponse.json({ error: 'Missing author' }, { status: 400 });
    }

    await sql`
      INSERT INTO profiles (id, last_seen)
      VALUES (${author}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) 
      DO UPDATE SET last_seen = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to ping:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
