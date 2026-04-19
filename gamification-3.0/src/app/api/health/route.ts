import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/health
// Handshake: verifies Supabase connection is live. 
// Returns Supabase version and confirms the DB is reachable.
// Per B.L.A.S.T Phase 2 (Link): Do not proceed if this returns an error.
export async function GET() {
  try {
    const supabase = await createClient()

    // Attempt to query a table that exists in our schema
    // This will fail with a "table not found" error if schema isn't deployed yet,
    // but it still confirms the connection is live.
    const { error } = await supabase.from('users').select('id').limit(1)

    if (error && error.code !== '42P01') {
      // 42P01 = table doesn't exist (schema not yet deployed) - connection is still OK
      throw error
    }

    const schemaDeployed = !error

    return NextResponse.json({
      status: 'ok',
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      connection: 'live',
      schema_deployed: schemaDeployed,
      message: schemaDeployed
        ? 'Connection established. Schema is deployed.'
        : 'Connection established. Schema not yet deployed — run architecture/db_schema.sql in Supabase SQL editor.',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { status: 'error', connection: 'failed', message },
      { status: 500 }
    )
  }
}
