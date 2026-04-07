# External Integrations

**Analysis Date:** 2026-04-07

## APIs & External Services

**Supabase (PostgreSQL + File Storage):**
- Service: Supabase (Backend-as-a-Service platform)
  - What it's used for: Persistent state storage, document management (upload/delete), document notes
  - SDK/Client: `@supabase/supabase-js@2` (UMD build via CDN)
  - Auth: Anon public key (`SUPABASE_KEY`)
  - Region: `ucudnzlgpqbwshnmmldy` project

**Google Fonts:**
- Service: Google Fonts API
  - What it's used for: Load Inter typeface (weights 400, 500, 600, 700)
  - Endpoint: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap`

## Data Storage

**Databases:**
- PostgreSQL (via Supabase)
  - Connection: HTTP/REST via Supabase JavaScript client
  - Client: Supabase JS SDK (manages connection pooling)
  - Tables:
    - `action_states` - Tracks completion status of actions/tasks
      - Schema: `id (primary key), completed (boolean), updated_at (timestamp)`
    - `doc_notes` - User-added notes for documents
      - Schema: `id (primary key), note (text), updated_at (timestamp)`
    - `documents` - Document metadata and storage references
      - Schema: `id (primary key), name (text), category (text), file_type (text), file_size (integer), storage_path (text), uploaded_at (timestamp)`

**File Storage:**
- Supabase Storage (S3-compatible)
  - Bucket: `documents` (public read access)
  - URL pattern: `https://ucudnzlgpqbwshnmmldy.supabase.co/storage/v1/object/public/documents/{storage_path}`
  - Supported formats: Images and PDFs (client-side input filter: `accept="image/*,.pdf"`)
  - Access: Public read via URL, authenticated write/delete via Supabase client

**Caching:**
- None implemented

## Authentication & Identity

**Auth Provider:**
- Supabase Anon Key (public, unauthenticated access)
  - Implementation: Database operations use Row Level Security (RLS) policies (assumed, not enforced by client code)
  - No user login system — all operations use the same anon key
  - Risk: Public key is visible in browser code; relies entirely on Supabase RLS to prevent unauthorized access

## Monitoring & Observability

**Error Tracking:**
- None detected (only console.warn/console.error in catch blocks)

**Logs:**
- Console logging only
  - `console.error()` for Supabase initialization failures (`db.js:12`)
  - `console.warn()` for failed database operations (non-blocking errors logged to browser console)

## CI/CD & Deployment

**Hosting:**
- Not detected (static files — can be deployed to any static host)
- No automated build or deployment pipeline configured

**CI Pipeline:**
- None detected

## Environment Configuration

**Required env vars:**
- None (all configuration hardcoded in `db.js`)
- SECURITY CONCERN: Supabase public key is hardcoded in source code

**Secrets location:**
- SECURITY ISSUE: Credentials currently exposed in `db.js` lines 5-6
  - `SUPABASE_URL` (not sensitive)
  - `SUPABASE_KEY` (JWT anon key — should not be in source if shared publicly)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

---

*Integration audit: 2026-04-07*
