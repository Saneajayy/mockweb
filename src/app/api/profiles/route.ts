import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { put } from '@vercel/blob';

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('journal_session');
  return session?.value === 'authenticated';
}

async function initProfilesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id VARCHAR(50) PRIMARY KEY,
      profile_image_url TEXT,
      last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initProfilesTable();
    const { rows } = await sql`SELECT * FROM profiles`;
    
    const profiles = rows.reduce((acc, row) => {
      acc[row.id] = row;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Failed to fetch profiles:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const author = searchParams.get('author');
    const filename = searchParams.get('filename');

    if (!author || !filename || !request.body) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await initProfilesTable();

    const buffer = await request.arrayBuffer();
    const blob = await put(filename, buffer, {
      access: 'public',
    });

    await sql`
      INSERT INTO profiles (id, profile_image_url)
      VALUES (${author}, ${blob.url})
      ON CONFLICT (id) 
      DO UPDATE SET profile_image_url = ${blob.url}
    `;

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
