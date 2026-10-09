import { Pool } from 'pg';

let pool: Pool | null = null;

export const getDbPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString || connectionString.includes('[YOUR-PASSWORD]')) {
      console.warn(
        'DATABASE_URL is not fully configured or contains placeholder password in .env.local.'
      );
    }

    pool = new Pool({
      connectionString: connectionString || undefined,
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });
  }

  return pool;
};

export const queryDb = async (text: string, params?: unknown[]) => {
  const p = getDbPool();
  return p.query(text, params);
};
