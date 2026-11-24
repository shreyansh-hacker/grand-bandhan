// Vercel Serverless Function: POST /api/publish
// Stores published invitation snapshots for durable edge delivery

export const config = {
  runtime: 'nodejs',
};

const publishedStore: Record<string, any> = {};

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      const { draft } = req.body || {};
      if (!draft || !draft.slug) {
        return res.status(400).json({ error: 'Missing draft or slug' });
      }

      publishedStore[draft.slug] = {
        ...draft,
        isPublished: true,
        publishedAt: Date.now(),
      };

      return res.status(200).json({
        success: true,
        slug: draft.slug,
        url: `/i/${draft.slug}`,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to publish draft', message: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
