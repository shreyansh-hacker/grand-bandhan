// Vercel Serverless Function: GET /api/invites/[slug]
// Returns published invitation data snapshot and Open Graph metadata from Neon Postgres

import { getPublishedInvite } from '../_db';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  const { slug } = req.query;
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Missing slug' });
  }

  const invite = await getPublishedInvite(slug);

  if (!invite || !invite.isPublished) {
    return res.status(404).json({
      error: 'Invitation not published or offline',
      isPublished: false,
      slug,
    });
  }

  const data = invite.publishedData || invite.data;
  const ogTitle = `${data.title || slug} · Grand Bandhan Invitation`;
  const ogDescription = data.invitationText || 'You are cordially invited to open this interactive 3D digital invitation.';
  const ogImage = data.coverEmblemUrl || 'https://grandbandhan.com/assets/templates/royal-wedding-book/cover/ganesh-emblem.svg';

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
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
