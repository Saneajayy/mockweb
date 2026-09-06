import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('journal_session');
  return session?.value === 'authenticated';
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { author } = body;

    if (!author) {
      return NextResponse.json({ error: 'Author required to react' }, { status: 400 });
    }

    // Fetch current reactions
    const { rows: entries } = await sql`
      SELECT reactions FROM entries WHERE id = ${id}
    `;

    if (entries.length === 0) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const currentReactions = entries[0].reactions || {};
    
    // Toggle reaction (if they already reacted, remove it, otherwise add it)
    if (currentReactions[author]) {
      delete currentReactions[author];
    } else {
      currentReactions[author] = 'heart';
    }

    const { rows } = await sql`
      UPDATE entries 
      SET reactions = ${JSON.stringify(currentReactions)}::jsonb
      WHERE id = ${id}
      RETURNING id, reactions
    `;

    return NextResponse.json({ success: true, reactions: rows[0].reactions });
  } catch (error) {
    console.error('Failed to toggle reaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
