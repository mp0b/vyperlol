/**
 * Local development database without Docker or a system Postgres install.
 *
 * Boots an isolated, persistent PostgreSQL cluster (data in ./.pgdata) on port
 * 5433 using prebuilt binaries, matching the default DATABASE_URL in .env:
 *   postgresql://vyper:vyper@localhost:5433/vyper
 *
 * Usage:
 *   pnpm db:local        # start and keep running (Ctrl+C to stop)
 *
 * Then, in another terminal: pnpm db:push && pnpm db:seed && pnpm dev
 */
import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), ".pgdata");
const PORT = 5433;
const USER = "vyper";
const PASSWORD = "vyper";
const DATABASE = "vyper";

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user: USER,
    password: PASSWORD,
    port: PORT,
    persistent: true,
  });

  // initdb only runs on a fresh cluster; PG_VERSION marks an initialised one.
  const fresh = !existsSync(join(DATA_DIR, "PG_VERSION"));
  if (fresh) {
    console.log("• Initialising a new Postgres cluster…");
    await pg.initialise();
  }

  await pg.start();
  console.log(`• Postgres started on port ${PORT}`);

  // Create the app database with UTF-8 encoding explicitly (from template0 with
  // C locale) so emoji / non-Latin content stores correctly regardless of the
  // cluster's Windows-inherited default encoding.
  const client = pg.getPgClient("postgres");
  await client.connect();
  try {
    const existing = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [DATABASE]);
    if (existing.rowCount === 0) {
      await client.query(
        `CREATE DATABASE ${DATABASE} ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C' TEMPLATE template0`,
      );
      console.log(`• Created UTF-8 database "${DATABASE}"`);
    } else {
      console.log(`• Database "${DATABASE}" already exists`);
    }
  } finally {
    await client.end();
  }

  console.log(
    `\n✔ Ready → postgresql://${USER}:${PASSWORD}@localhost:${PORT}/${DATABASE}\n` +
      "  Leave this running. In another terminal: pnpm db:push && pnpm db:seed\n",
  );

  const shutdown = async () => {
    console.log("\n• Stopping Postgres…");
    try {
      await pg.stop();
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Keep the process (and the child Postgres) alive.
  await new Promise<void>(() => {});
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
