// Shared Neon Postgres client for Vercel Serverless Functions
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const TMP_FILE = path.join('/tmp', 'gb_published_invites.json');

// File fallback helper for offline/local development
function getFileStore(): Record<string, any> {
  try {
    if (fs.existsSync(TMP_FILE)) {
      return JSON.parse(fs.readFileSync(TMP_FILE, 'utf-8'));
    }
  } catch {}
  return {};
}

function saveFileStore(store: Record<string, any>): void {
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(store), 'utf-8');
  } catch {}
}

let isInitialized = false;

export function getDb() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    return null;
  }
  return neon(connectionString);
}

export async function initDb() {
  const sql = getDb();
  if (!sql || isInitialized) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS published_invitations (
        slug TEXT PRIMARY KEY,
        draft JSONB NOT NULL,
        is_published BOOLEAN NOT NULL DEFAULT true,
        published_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS guest_rsvps (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL,
        guest_name TEXT NOT NULL,
        status TEXT NOT NULL,
        guest_count INT NOT NULL DEFAULT 1,
        contact TEXT,
        dietary_or_note TEXT,
        submitted_at BIGINT NOT NULL
      );
    `;
    isInitialized = true;
  } catch (err) {
    console.warn('Database initialization warning (falling back if needed):', err);
  }
}

export async function getPublishedInvite(slug: string): Promise<any | null> {
  const sql = getDb();
  if (sql) {
    try {
      await initDb();
      const rows = await sql`
        SELECT draft, is_published, published_at, updated_at
        FROM published_invitations
        WHERE slug = ${slug}
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        const row = rows[0];
        if (row.is_published) {
          return {
            ...row.draft,
            isPublished: true,
            publishedAt: row.published_at,
            updatedAt: row.updated_at,
          };
        }
      }
      return null;
    } catch (err) {
      console.warn('Neon query error, trying local fallback:', err);
    }
  }

  // Fallback to local /tmp store
  const store = getFileStore();
  const invite = store[slug];
  if (invite && invite.isPublished) {
    return invite;
  }
  return null;
}

export async function savePublishedInvite(slug: string, draft: any): Promise<boolean> {
  const now = Date.now();
  const sql = getDb();

  if (sql) {
    try {
      await initDb();
      await sql`
        INSERT INTO published_invitations (slug, draft, is_published, published_at, updated_at)
        VALUES (${slug}, ${draft}, true, ${now}, ${now})
        ON CONFLICT (slug) DO UPDATE
        SET draft = ${draft}, is_published = true, updated_at = ${now};
      `;
    } catch (err) {
      console.warn('Neon insert error:', err);
    }
  }

  // Also update file store
  const store = getFileStore();
  store[slug] = {
    ...draft,
    isPublished: true,
    publishedAt: now,
    updatedAt: now,
  };
  saveFileStore(store);
  return true;
}

export async function unpublishInvite(slug: string): Promise<boolean> {
  const now = Date.now();
  const sql = getDb();

  if (sql) {
    try {
      await initDb();
      await sql`
        UPDATE published_invitations
        SET is_published = false, updated_at = ${now}
        WHERE slug = ${slug};
      `;
    } catch (err) {
      console.warn('Neon unpublish error:', err);
    }
  }

  // Also update file store
  const store = getFileStore();
  if (store[slug]) {
    store[slug].isPublished = false;
    store[slug].publishedData = null;
    saveFileStore(store);
  }
  return true;
}

export async function saveRsvp(record: any): Promise<boolean> {
  const sql = getDb();
  if (sql) {
    try {
      await initDb();
      await sql`
        INSERT INTO guest_rsvps (id, slug, guest_name, status, guest_count, contact, dietary_or_note, submitted_at)
        VALUES (
          ${record.id || `rsvp_${Date.now()}`},
          ${record.slug},
          ${record.guestName},
          ${record.status},
          ${record.guestCount || 1},
          ${record.contact || ''},
          ${record.dietaryOrNote || ''},
          ${record.submittedAt || Date.now()}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
      return true;
    } catch (err) {
      console.warn('Neon saveRsvp error:', err);
    }
  }
  return false;
}
