// Next.js Route Handler: /api/rsvp
import { NextRequest, NextResponse } from 'next/server';
import { saveRsvp, getDb } from '@/lib/invite-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, rsvp } = body || {};
    if (!slug || !rsvp || !rsvp.guestName) {
      return NextResponse.json({ error: 'Invalid RSVP payload' }, { status: 400 });
    }

    const savedRecord = {
      ...rsvp,
      slug,
      updatedAt: Date.now(),
    };

    await saveRsvp(savedRecord);

    return NextResponse.json({
      success: true,
      message: 'RSVP recorded successfully',
      record: savedRecord,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to record RSVP', message: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const sql = getDb();
  if (sql) {
    try {
      const rows = await sql`
        SELECT * FROM guest_rsvps WHERE slug = ${slug} ORDER BY submitted_at DESC;
      `;
      return NextResponse.json({ slug, records: rows || [] });
    } catch {}
  }

  return NextResponse.json({ slug, records: [] });
}
