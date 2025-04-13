import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// for migrations
const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });

async function main() {
  try {
    await migrate(drizzle(migrationClient), {
      migrationsFolder: './drizzle',
    });
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
