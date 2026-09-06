import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { del } from '@vercel/blob';

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
    // Background Cleanup Routine (Runs before fetching)
    try {
      // 1. Find all image URLs for entries older than 3 days
      const { rows: oldEntries } = await sql`
        SELECT image_url 
        FROM entries 
        WHERE created_at < NOW() - INTERVAL '3 days' 
          AND image_url IS NOT NULL;
      `;

      // 2. Delete those images from Vercel Blob to free up space
      if (oldEntries.length > 0) {
        const urlsToDelete = oldEntries.map(row => row.image_url);
        await del(urlsToDelete);
      }

      // 3. Delete the rows from Postgres
      await sql`
        DELETE FROM entries 
        WHERE created_at < NOW() - INTERVAL '3 days';
      `;
    } catch (cleanupError) {
      console.error('Failed to run cleanup routine:', cleanupError);
      // We don't throw here so that fetching entries still works even if cleanup fails
    }

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
