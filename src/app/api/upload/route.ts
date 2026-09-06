import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('journal_session');
  return session?.value === 'authenticated';
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }
  
  if (!request.body) {
    return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: 'BLOB_READ_WRITE_TOKEN is completely missing from Vercel environment variables. You must connect the Blob store properly in Vercel settings.' 
    }, { status: 500 });
  }

  try {
    // Vercel Serverless sometimes fails passing the raw stream, so we buffer it first
    const buffer = await request.arrayBuffer();
    const blob = await put(filename, buffer, {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error('Failed to upload image:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message || String(error) }, { status: 500 });
  }
}
