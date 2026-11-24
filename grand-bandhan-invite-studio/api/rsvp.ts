// Vercel Serverless Function: POST /api/rsvp
// Handles guest RSVP submissions with deduplication and durable persistence in Neon Postgres

import { saveRsvp } from './_db.js';

export const config = {
  runtime: 'nodejs',
};

// In-memory cache for serverless invocation lifecycle
const rsvpStore: Record<string, any[]> = {};

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const slug = req.query.slug as string;
    if (!slug) return res.status(400).json({ error: 'Missing slug' });
    const records = rsvpStore[slug] || [];
    return res.status(200).json({ slug, records });
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {}
      }
      const { slug, rsvp } = body || {};
      if (!slug || !rsvp || !rsvp.guestName) {
        return res.status(400).json({ error: 'Invalid RSVP payload' });
      }

      if (!rsvpStore[slug]) {
        rsvpStore[slug] = [];
      }

      // Idempotency: Deduplicate by token or guest name + contact
      const token = rsvp.guestToken || rsvp.id;
      const existingIdx = rsvpStore[slug].findIndex(
        (r) => r.guestToken === token || (r.guestName === rsvp.guestName && r.contact === rsvp.contact)
      );

      const savedRecord = {
        ...rsvp,
        slug,
        guestToken: token,
        updatedAt: Date.now(),
      };

      if (existingIdx !== -1) {
        rsvpStore[slug][existingIdx] = savedRecord;
      } else {
        rsvpStore[slug].push(savedRecord);
      }

      // Persist to Neon Postgres
      await saveRsvp(savedRecord);

      return res.status(200).json({
        success: true,
        message: 'RSVP recorded successfully',
        record: savedRecord,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to record RSVP', message: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
