import path from 'path';
import fs from 'fs';
import { default as EmbeddedPostgres } from 'embedded-postgres';

async function main() {
  const dbDir = path.resolve(process.cwd(), '.pgdata');
  const isInitialized = fs.existsSync(path.join(dbDir, 'PG_VERSION'));

  console.log(`[Embedded Postgres] Data directory: ${dbDir}`);
  console.log(`[Embedded Postgres] Initialized state: ${isInitialized}`);

  const pg = new EmbeddedPostgres({
    databaseDir: dbDir,
    user: 'postgres',
    password: 'password',
    port: 5432,
    persistent: true,
  });

  if (!isInitialized) {
    console.log('[Embedded Postgres] Initializing database cluster...');
    await pg.initialise();
    console.log('[Embedded Postgres] Initialized cluster successfully.');
  }

  console.log('[Embedded Postgres] Starting PostgreSQL on port 5432...');
  await pg.start();
  console.log('[Embedded Postgres] PostgreSQL server is running on port 5432.');

  try {
    console.log('[Embedded Postgres] Ensuring database "grand_bandhan" exists...');
    await pg.createDatabase('grand_bandhan');
    console.log('[Embedded Postgres] Created database "grand_bandhan".');
  } catch (err: any) {
    if (err.message && err.message.includes('already exists')) {
      console.log('[Embedded Postgres] Database "grand_bandhan" already exists.');
    } else {
      console.warn('[Embedded Postgres] Database creation notice:', err.message);
    }
  }

  console.log('[Embedded Postgres] Ready for connections at: postgresql://postgres:password@localhost:5432/grand_bandhan');

  // Keep process alive
  process.on('SIGINT', async () => {
    console.log('[Embedded Postgres] Stopping...');
    await pg.stop();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    console.log('[Embedded Postgres] Stopping...');
    await pg.stop();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('[Embedded Postgres] Fatal error:', err);
  process.exit(1);
});

