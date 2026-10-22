import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';

import { del } from '@vercel/blob';

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

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('journal_session');
  return session?.value === 'authenticated';
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    // We need to verify that the author deleting it is the one who created it.
    // The author will be passed in the request body.
    const body = await request.json();
    const { author } = body;

    if (!author) {
      return NextResponse.json({ error: 'Author required to delete entry' }, { status: 400 });
    }

    // 1. Fetch entry to check for associated media files
    const { rows } = await sql`
      SELECT image_url, audio_url 
      FROM entries
      WHERE id = ${id} AND author = ${author}
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Entry not found or you do not have permission to delete it' },
        { status: 403 }
      );
    }

    // 2. Delete media from Vercel Blob if applicable
    const { image_url, audio_url } = rows[0];
    const urlsToDelete: string[] = [];
    if (isVercelBlobUrl(image_url)) urlsToDelete.push(image_url);
    if (isVercelBlobUrl(audio_url)) urlsToDelete.push(audio_url);

    if (urlsToDelete.length > 0 && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await del(urlsToDelete);
      } catch (blobErr) {
        console.error('Failed to delete media blob on manual entry delete:', blobErr);
      }
    }

    // 3. Delete the entry from Postgres
    await sql`
      DELETE FROM entries
      WHERE id = ${id} AND author = ${author}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete entry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
