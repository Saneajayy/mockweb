import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';

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

    const { rowCount } = await sql`
      DELETE FROM entries
      WHERE id = ${id} AND author = ${author}
    `;

    if (rowCount === 0) {
      return NextResponse.json(
        { error: 'Entry not found or you do not have permission to delete it' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete entry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
