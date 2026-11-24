// Vercel Serverless Function: GET /api/invites/[slug]
// Returns published invitation data and Open Graph metadata for social link unfurling

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'Missing slug' });

  // Standard metadata for social crawler unfurling
  const ogTitle = `${slug.replace(/-/g, ' ').toUpperCase()} · Grand Bandhan Invitation`;
  const ogDescription = 'You are cordially invited. Tap to open this interactive 3D digital invitation.';
  const ogImage = 'https://grandbandhan.com/assets/templates/royal-wedding-book/cover/ganesh-emblem.svg';

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    slug,
    isPublished: true,
    meta: {
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
      type: 'article',
    },
  });
}
