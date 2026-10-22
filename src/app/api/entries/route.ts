import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { del } from '@vercel/blob';

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('journal_session');
  return session?.value === 'authenticated';
}

function isVercelBlobUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.endsWith('blob.vercel-storage.com') ||
      parsed.hostname.endsWith('vercel-storage.com')
    );
  } catch {
    return false;
  }
}

/**
 * Strict auto-delete routine:
 * 1. Finds all entries older than 5 days.
 * 2. Deletes associated files from Vercel Blob (safely filtering out Giphy / external URLs).
 * 3. Permanently deletes the expired rows from Postgres (even if blob deletion errors or credentials are unset).
 */
async function cleanupOldEntries() {
  try {
    // 1. Find all image and audio URLs for entries older than 5 days
    const { rows: oldEntries } = await sql`
      SELECT image_url, audio_url 
      FROM entries 
      WHERE created_at < NOW() - INTERVAL '5 days' 
        AND (image_url IS NOT NULL OR audio_url IS NOT NULL);
    `;

    // 2. Delete those files from Vercel Blob to free up storage
    if (oldEntries.length > 0) {
      const urlsToDelete: string[] = [];
      oldEntries.forEach((row) => {
        if (isVercelBlobUrl(row.image_url)) urlsToDelete.push(row.image_url!);
        if (isVercelBlobUrl(row.audio_url)) urlsToDelete.push(row.audio_url!);
      });

      if (urlsToDelete.length > 0 && process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          await del(urlsToDelete);
        } catch (blobError) {
          console.error('Failed to delete blob files during auto-delete:', blobError);
        }
      }
    }

    // 3. Delete the rows from Postgres
    await sql`
      DELETE FROM entries 
      WHERE created_at < NOW() - INTERVAL '5 days';
    `;
  } catch (cleanupError) {
    console.error('Failed to run auto-delete routine:', cleanupError);
  }
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Run cleanup routine before fetching
    await cleanupOldEntries();

    // Strict 5-day filter directly in SELECT to ensure no expired messages are served
    const { rows } = await sql`
      SELECT id, author, content, image_url, audio_url, reactions, created_at 
      FROM entries 
      WHERE created_at >= NOW() - INTERVAL '5 days'
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
    const { author, content, image_url, audio_url } = await request.json();
    const authorB = process.env.AUTHOR_B_NAME || 'You';

    if (author !== authorB) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!author || (!content && !image_url && !audio_url)) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Trigger cleanup on post as well to maintain strictly lean storage
    cleanupOldEntries().catch((err) =>
      console.error('Background cleanup error on POST:', err)
    );

    const { rows } = await sql`
      INSERT INTO entries (author, content, image_url, audio_url)
      VALUES (${author}, ${content || ''}, ${image_url || null}, ${audio_url || null})
      RETURNING id, author, content, image_url, audio_url, reactions, created_at
    `;

    return NextResponse.json({ entry: rows[0] });
  } catch (error) {
    console.error('Failed to create entry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
