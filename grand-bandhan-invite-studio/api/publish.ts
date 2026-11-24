// Vercel Serverless Function: /api/publish
// Handles publishing and unpublishing of invitations with server-side snapshot persistence

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

function saveStore(store: Record<string, any>): void {
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(store), 'utf-8');
  } catch (err) {
    console.warn('Error writing /tmp/gb_published_invites.json:', err);
  }
}

export default async function handler(req: any, res: any) {
  const store = getStore();

  // POST: Publish a draft snapshot
  if (req.method === 'POST') {
    try {
      const { draft } = req.body || {};
      if (!draft || !draft.slug) {
        return res.status(400).json({ error: 'Missing draft or slug' });
      }

      const publishedSnapshot = {
        ...draft,
        isPublished: true,
        publishedAt: Date.now(),
        publishedData: JSON.parse(JSON.stringify(draft.publishedData || draft.data)),
      };

      store[draft.slug] = publishedSnapshot;
      saveStore(store);

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
      const { slug } = req.body || req.query || {};
      if (!slug) {
        return res.status(400).json({ error: 'Missing slug' });
      }

      if (store[slug]) {
        store[slug].isPublished = false;
        store[slug].publishedData = null;
        saveStore(store);
      }

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
