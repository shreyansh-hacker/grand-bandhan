// Next.js Route Handler: /api/publish
import { NextRequest, NextResponse } from 'next/server';
import { savePublishedInvite, unpublishInvite } from '@/lib/invite-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { draft } = body || {};
    if (!draft || !draft.slug) {
      return NextResponse.json({ error: 'Missing draft or slug' }, { status: 400 });
    }

    const publishedSnapshot = {
      ...draft,
      isPublished: true,
      publishedAt: Date.now(),
      publishedData: JSON.parse(JSON.stringify(draft.publishedData || draft.data)),
    };

    await savePublishedInvite(draft.slug, publishedSnapshot);

    return NextResponse.json({
      success: true,
      slug: draft.slug,
      url: `/i/${draft.slug}`,
      publishedAt: publishedSnapshot.publishedAt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to publish draft', message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    let slug: string | null = null;
    try {
      const body = await req.json();
      slug = body?.slug;
    } catch {}
    if (!slug) {
      slug = req.nextUrl.searchParams.get('slug');
    }

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    await unpublishInvite(slug);

    return NextResponse.json({
      success: true,
      message: `Invitation ${slug} has been unpublished`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to unpublish draft', message: err.message }, { status: 500 });
  }
}
