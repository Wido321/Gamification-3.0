import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/health
// Phase 2: Link handshake. Verifies the Supabase connection is live.
export async function GET() {
  try {
    const supabase = await createClient()

    // Ping the DB — check table exists (42P01 = table not found = schema not yet deployed)
    const { error } = await supabase.from('users').select('id').limit(1)

    const schemaDeployed = !error || error.code !== '42P01'

    return NextResponse.json({
      status:           'ok',
      connection:       'live',
      schema_deployed:  schemaDeployed,
      message: schemaDeployed
        ? 'Connection live. Schema is deployed. ✅'
        : '⚠️ Connection live but schema not yet deployed — run architecture/db_schema.sql in Supabase SQL Editor.',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { status: 'error', connection: 'failed', message },
      { status: 500 }
    )
  }
}
