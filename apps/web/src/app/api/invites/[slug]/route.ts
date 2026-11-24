// Next.js Route Handler: GET /api/invites/[slug]
import { NextRequest, NextResponse } from 'next/server';
import { getPublishedInvite } from '@/lib/invite-db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const invite = await getPublishedInvite(slug);

  if (!invite || !invite.isPublished) {
    return NextResponse.json(
      {
        error: 'Invitation not published or offline',
        isPublished: false,
        slug,
      },
      { status: 404 }
    );
  }

  const data = invite.publishedData || invite.data;
  const ogTitle = `${data.title || slug} · Grand Bandhan Invitation`;
  const ogDescription = data.invitationText || 'You are cordially invited to open this interactive 3D digital invitation.';
  const ogImage = data.coverEmblemUrl || '/assets/templates/royal-wedding-book/cover/ganesh-emblem.svg';

  return NextResponse.json({
    ...invite,
    data,
    publishedData: data,
    isPublished: true,
    meta: {
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
      type: 'article',
    },
  });
}
