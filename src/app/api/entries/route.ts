import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('journal_session');
  return session?.value === 'authenticated';
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rows } = await sql`
      SELECT id, author, content, image_url, reactions, created_at 
      FROM entries 
      ORDER BY created_at ASC
    `;
    return NextResponse.json({ entries: rows });
  } catch (error) {
    console.error('Failed to fetch entries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { author, content, image_url } = await request.json();

    if (!author || (!content && !image_url)) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO entries (author, content, image_url)
      VALUES (${author}, ${content || ''}, ${image_url || null})
      RETURNING id, author, content, image_url, reactions, created_at
    `;

    return NextResponse.json({ entry: rows[0] });
  } catch (error) {
    console.error('Failed to create entry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
