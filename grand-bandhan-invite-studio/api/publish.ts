// Vercel Serverless Function: /api/publish
// Handles publishing and unpublishing of invitations with Neon Postgres persistence

import { savePublishedInvite, unpublishInvite } from './_db';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  // POST: Publish or update a draft snapshot
  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {}
      }
      const { draft } = body || {};
      if (!draft || !draft.slug) {
        return res.status(400).json({ error: 'Missing draft or slug' });
      }

      const publishedSnapshot = {
        ...draft,
        isPublished: true,
        publishedAt: Date.now(),
        publishedData: JSON.parse(JSON.stringify(draft.publishedData || draft.data)),
      };

      await savePublishedInvite(draft.slug, publishedSnapshot);

      return res.status(200).json({
        success: true,
        slug: draft.slug,
        url: `/i/${draft.slug}`,
        publishedAt: publishedSnapshot.publishedAt,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to publish draft', message: err.message });
    }
  }

  // DELETE: Unpublish an invitation
  if (req.method === 'DELETE') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {}
      }
      const { slug } = body || req.query || {};
      if (!slug) {
        return res.status(400).json({ error: 'Missing slug' });
      }

      await unpublishInvite(slug);

      return res.status(200).json({
        success: true,
        message: `Invitation ${slug} has been unpublished`,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to unpublish draft', message: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
