# Technology Stack

**Analysis Date:** 2026-04-07

## Languages

**Primary:**
- JavaScript (Vanilla) - Client-side logic and interactivity
- HTML5 - Structure and semantic markup
- CSS3 - Styling and layout

**Secondary:**
- None detected

## Runtime

**Environment:**
- Browser (client-side only)
- No server-side runtime

**Package Manager:**
- Not used (no package manager, no node_modules)
- All dependencies loaded via CDN

## Frameworks

**Core:**
- Supabase JavaScript SDK v2 (via CDN) - Backend-as-a-Service for database and file storage
  - Loaded from: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js`

**Styling:**
- Google Fonts - Inter font family (weights 400, 500, 600, 700)

**Build/Dev:**
- None detected (static HTML/JS/CSS project)

## Key Dependencies

**Critical:**
- Supabase JavaScript SDK v2 - Provides client for PostgreSQL database and file storage
  - Client initialization: `supabase.createClient(SUPABASE_URL, SUPABASE_KEY)`
  - Handles: Database queries (action states, document notes, documents), file uploads/deletes

**Infrastructure:**
- Google Fonts (Inter typeface) - Typography

## Configuration

**Environment:**
- Hardcoded Supabase credentials in `db.js`
  - `SUPABASE_URL` = `https://ucudnzlgpqbwshnmmldy.supabase.co`
  - `SUPABASE_KEY` = Public anon key (exposed in browser code)
  - NOTE: This is a security concern — public keys should only have limited RLS permissions

**Build:**
- No build configuration (static files served as-is)

## Platform Requirements

**Development:**
- Any text editor or IDE
- No build tools required
- Local webserver (for CORS if testing locally)

**Production:**
- Static file hosting (GitHub Pages, Vercel, Netlify, or any web server)
- Supabase instance (`ucudnzlgpqbwshnmmldy`) for database and file storage

---

*Stack analysis: 2026-04-07*
