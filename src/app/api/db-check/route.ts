import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getDbPool } from '@/lib/supabase/db';

export async function GET() {
  const result: {
    status: 'ok' | 'configuration_needed' | 'error';
    supabaseClient: {
      urlConfigured: boolean;
      anonKeyConfigured: boolean;
      status: string;
      message?: string;
    };
    directPostgres: {
      configured: boolean;
      status: string;
      message?: string;
      version?: string;
    };
    timestamp: string;
  } = {
    status: 'ok',
    supabaseClient: {
      urlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      anonKeyConfigured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY'
      ),
      status: 'untested',
    },
    directPostgres: {
      configured: Boolean(
        process.env.DATABASE_URL &&
        !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')
      ),
      status: 'untested',
    },
    timestamp: new Date().toISOString(),
  };

  // 1. Test Supabase Client SDK
  if (result.supabaseClient.anonKeyConfigured) {
    try {
      // Light health query to Supabase Auth or a system check
      const { error } = await supabase.from('_non_existent_check').select('*').limit(1);
      // If table doesn't exist (PGRST204 or 42P01), connection was still successful to Supabase
      if (!error || error.code === '42P01' || error.code === 'PGRST204' || error.message?.includes('relation') || error.message?.includes('schema cache')) {
        result.supabaseClient.status = 'connected';
        result.supabaseClient.message = 'Successfully reached Supabase API';
      } else {
        result.supabaseClient.status = 'connected';
        result.supabaseClient.message = `Supabase API response: ${error.message}`;
      }
    } catch (err: unknown) {
      result.supabaseClient.status = 'failed';
      result.supabaseClient.message = err instanceof Error ? err.message : String(err);
    }
  } else {
    result.supabaseClient.status = 'pending_key';
    result.supabaseClient.message = 'NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or set to placeholder in .env.local';
  }

  // 2. Test Direct Postgres pool connection if password configured
  if (result.directPostgres.configured) {
    try {
      const pool = getDbPool();
      const dbRes = await pool.query('SELECT version();');
      result.directPostgres.status = 'connected';
      result.directPostgres.version = dbRes.rows[0]?.version;
      result.directPostgres.message = 'Direct PostgreSQL connection successful';
    } catch (err: unknown) {
      result.directPostgres.status = 'failed';
      result.directPostgres.message = err instanceof Error ? err.message : String(err);
    }
  } else {
    result.directPostgres.status = 'pending_password';
    result.directPostgres.message = 'DATABASE_URL still contains [YOUR-PASSWORD] placeholder in .env.local';
  }

  if (
    result.supabaseClient.status === 'connected' ||
    result.directPostgres.status === 'connected'
  ) {
    result.status = 'ok';
  } else {
    result.status = 'configuration_needed';
  }

  return NextResponse.json(result);
}
