// Vercel Serverless Function: GET /api/invites/[slug]
// Returns published invitation data snapshot and Open Graph metadata for social unfurling

import fs from 'fs';
import path from 'path';

export const config = {
  runtime: 'nodejs',
};

const TMP_FILE = path.join('/tmp', 'gb_published_invites.json');

function getStore(): Record<string, any> {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading /tmp/gb_published_invites.json:', err);
  }
  return {};
}

export default async function handler(req: any, res: any) {
  const { slug } = req.query;
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Missing slug' });
  }

  const store = getStore();
  const invite = store[slug];

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
