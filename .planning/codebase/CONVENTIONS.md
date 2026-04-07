# Coding Conventions

**Analysis Date:** 2026-04-07

## Naming Patterns

**Files:**
- Lowercase with `.js`, `.html`, `.css` extensions
- Examples: `app.js`, `data.js`, `db.js`, `index.html`, `style.css`
- Semantic naming: `app.js` for main logic, `data.js` for static data, `db.js` for database layer

**Functions:**
- camelCase for function declarations
- Examples: `daysBetween()`, `formatDate()`, `renderCommandCenter()`, `isDocPresent()`
- Prefix-based naming for render functions: `render*` pattern used consistently (`renderTimeline()`, `renderCountries()`, `renderDocuments()`)
- Event handlers as inline arrow functions: `addEventListener('click', async () => { ... })`
- Helper functions grouped at top of file before usage

**Variables:**
- camelCase for all variable declarations
- Examples: `actionList`, `countdownBar`, `pendingFiles`, `docNotes`
- CONSTANT values in UPPERCASE with UNDERSCORE_SEPARATION
- Examples: `TODAY`, `SUPABASE_URL`, `SUPABASE_KEY`, `DOC_CATEGORIES`, `REQUIRED_DOCS`
- Descriptive names preferred: `daysToDeregister` rather than `days`
- Object property keys use camelCase: `storagePath`, `uploaded_at`, `file_type`

**Types/Objects:**
- Objects treated as data containers
- Keys match database column names where applicable: `file_type`, `file_size`, `storage_path`, `uploaded_at`
- Configuration objects structured hierarchically: `DATA.phases[]`, `DATA.milestones[]`, `DATA.actions[]`

## Code Style

**Formatting:**
- No external formatter detected (no `.prettierrc` or similar)
- Consistent manual formatting observed:
  - 2-space indentation throughout
  - Space after control keywords: `if (`, `for (`, `catch (`
  - Template literals used for HTML string building
  - No semicolons omitted (consistent use of semicolons)
  - Brace style: opening brace on same line `{ ... }`

**Linting:**
- No ESLint config detected (no `.eslintrc*` files)
- Code follows implicit conventions only:
  - Unused variables not detected or cleaned up
  - No visible linting issues in sampled files

**Comment Style:**
- Block headers with marker lines: `// =============================================`
- Section comments with `--- Section Name ---` pattern
- Inline comments use `//` on same line or above code
- No JSDoc/TSDoc patterns used
- Comments explain context and intent, not what code does

## Import Organization

**Module Loading:**
- Supabase library loaded via CDN (not visible in JS files, assumed in HTML)
- Global objects referenced without imports: `DATA`, `DB`, `supabase`
- No module system or bundler (vanilla JS, direct file references)

**Dependency Order:**
1. External libraries (e.g., Supabase via HTML script tag)
2. Data constants (`DATA` from `data.js`)
3. Database layer (`DB` from `db.js`)
4. Application logic (`app.js`)

**Path Aliases:**
- Not applicable (no bundler or TypeScript)

## Error Handling

**Patterns:**
- Try-catch blocks in all async database operations (`db.js`)
- Exception caught and logged with context: `catch (e) { console.warn('functionName:', e); }`
- Graceful degradation: errors log warning but don't throw (no propagation)
- Fallback returns on error:
  - `loadCompleted()` returns `{}` on failure
  - `loadDocs()` returns `[]` on failure
  - `uploadDoc()` returns `null` on failure
- Promise chains use `.catch()` for error handling: `.catch(e => console.warn(...))`

**Console Logging:**
- `console.error()` only for critical startup failures (Supabase init)
- `console.warn()` for operation-level errors with descriptive context
- No logging for successful operations
- Error context preserved: `console.warn('functionName:', e)` pattern

## Logging

**Framework:** `console` object (browser DevTools)

**Patterns:**
- Errors logged with function name context: `console.warn('loadCompleted:', e)`
- Initialization failures logged at error level: `console.error('Supabase init failed:', e)`
- Warnings issued for non-blocking failures (loading persisted state, rendering documents)
- No structured logging or log levels beyond `console.warn()` and `console.error()`

## Comments

**When to Comment:**
- File headers explain module purpose and main concerns
- Section headers mark major functional areas
- Complex logic explained inline (e.g., auto-category detection in document upload)
- User-facing dependencies noted: "Non-blocking", "Cache from Supabase"
- No comments on obvious code: `const x = 5;` has no comment

**JSDoc/TSDoc:**
- Not used in codebase
- No type annotations expected (vanilla JavaScript)

## Function Design

**Size:** 
- Range: 5–100 lines per function
- Large functions permitted if they perform discrete renders: `renderDocuments()` is ~130 lines as single responsibility
- Nested functions used for encapsulation: `save()` function defined inside click handler

**Parameters:**
- Functions accept 1–3 parameters typical
- Objects passed as parameters for related data: `renderDocuments(docs, docNotes)`
- Optional parameters handled with default values: `renderDocuments(docs, docNotes)` can be called with no args
- Function signature clarity prioritized over compression

**Return Values:**
- Async functions return Promises (implicit via `async` keyword)
- Utility functions return computed values: `daysBetween()` returns number, `formatDate()` returns string
- Database operations return normalized data on success: `loadDocs()` returns array of doc objects with `id`, `name`, `url`, etc.
- Void functions return nothing (render functions don't return)

## Module Design

**Exports:**
- No explicit export system (vanilla JS)
- Global scope functions used: `DB`, `DATA` accessed as global objects
- Entire application wrapped in IIFE (Immediately Invoked Function Expression) in `app.js` for namespace isolation

**Barrel Files:**
- Not applicable (no module bundler)
- `data.js` serves as data repository (single source of truth for configuration)
- `db.js` serves as database layer (single source of truth for Supabase operations)

**File Separation Strategy:**
- Separation by concern: `app.js` (UI logic), `data.js` (static data), `db.js` (persistence)
- `db.js` wraps Supabase client, provides `DB` object with methods
- `data.js` exports `DATA` constant (read-only configuration)
- `app.js` depends on both `data.js` and `db.js`, orchestrates UI rendering

---

*Convention analysis: 2026-04-07*
