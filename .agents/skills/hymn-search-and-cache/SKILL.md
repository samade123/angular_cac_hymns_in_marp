---
name: hymn-search-and-cache
description: >-
  Guide for hymn search implementation, Dexie.js (IndexedDB) dual-source storage,
  resilient property handling, and Marp markdown caching in the CAC Marp Hymns application.
  Activate when debugging, extending, or maintaining hymn search, local hymn editor, or cache synchronization.
---

# Hymn Search and IndexedDB Cache System

This skill documents the search architecture, Dexie.js (IndexedDB) storage schema, dual-source rendering, and robustness rules for the CAC Marp Hymns application.

---

## 1. IndexedDB Schema (Dexie.js)

The database `ngdexieliveQuery` (defined in `src/app/db.ts`) contains three primary stores:

| Table | Primary Key | Indexes | Purpose |
| :--- | :--- | :--- | :--- |
| `simpleHymns` | `id` | `id, hymnNumber` | Notion cloud catalog metadata (`id`, `name`, `hymnNumber`, `url`, `last_edited_time`). |
| `localHymns` | `id` | `id, hymnNumber, last_edited_time` | Custom locally edited Marp markdown hymns (`id`, `name`, `hymnNumber`, `marp`, `last_edited_time`). |
| `simpleHymnItems`| `id` | `id, hymnNumber, last_used_time` | Cached downloaded Marp files from cloud S3 storage (`id`, `name`, `hymnNumber`, `marp`, `last_used_time`). |

---

## 2. Dual-Source Rendering (Cloud vs. Local)

The app supports two modes toggled in Settings (`hymn-source-mode` stored in `localStorage`):
* **Cloud Mode (`cloud`)**: Prioritizes cloud Marp content from `simpleHymnItems` / Notion S3 URL.
* **Local Mode (`local`)**: Prioritizes local Marp modifications stored in `localHymns`.

### Critical Fallback Rules
1. **Local-only hymns**: If a hymn exists only in `localHymns` (or has no cloud `url`), `getHymn()` in `HymnDisplayMainComponent` must fall back to `localHymn.marp` regardless of active mode.
2. **Lookup methods**: `getSimpleHymnByNumber()`, `getHymnItembyId()`, and `doesHymnbyIdExist()` in `IndexDbManagerService` must inspect both `simpleHymns` and `localHymns` to prevent navigation breakage.

---

## 3. Hymn Search Architecture

Search is handled by `listSimpleHymns(searchQuery)` in `IndexDbManagerService` and consumed reactively by `friends$` via Dexie's `liveQuery` in `HymnSidebarComponent`.

### Search Matching Priorities
Search queries evaluate across both cloud metadata and local Marp files:

1. **Exact Numeric Match (Priority 1)**:
   * Handles numeric equivalence (e.g. query `1` matches hymn `001` or `1`).
   * Evaluated via `parseInt(hymnNumber, 10) === parseInt(query, 10)`.
2. **Number Prefix Match (Priority 2)**:
   * Matches `hymnNumber.startsWith(query)`.
3. **Exact Title Match (Priority 3)**:
   * Matches `name.toLowerCase() === query`.
4. **Title Prefix Match (Priority 4)**:
   * Matches `name.toLowerCase().startsWith(query)`.
5. **Title Substring Match (Priority 5)**:
   * Matches `name.toLowerCase().includes(query)`.
6. **Number Substring Match (Priority 6)**:
   * Matches `hymnNumber.toLowerCase().includes(query)`.
7. **File Content / Lyrics Match (Priority 7)**:
   * Searches the full Marp markdown content (`marp`) in `localHymns` (and cached `simpleHymnItems`).
   * Enables searching for verses, chorus lines, and custom markdown headings.
8. **Multi-Token Match (Priority 8)**:
   * Query is split into whitespace tokens (e.g., `"great faith"` matches `"Great is Thy Faithfulness"` across fields).

Results are sorted by **Priority ascending**, then by **Numerical hymnNumber**.

---

## 4. Robustness Guidelines (Preventing Search Failures)

### Rule 1: Always Null-Safe Property Normalization
**Anti-Pattern**:
```typescript
// Crashes with TypeError if name or hymnNumber is undefined, null, or a number!
hymn.name.toLowerCase().includes(search)
```

**Correct Pattern**:
```typescript
const numStr = hymn.hymnNumber != null ? String(hymn.hymnNumber).trim() : '';
const nameStr = hymn.name != null ? String(hymn.name).trim() : '';
const marpStr = hymn.marp != null ? String(hymn.marp) : '';
```

### Rule 2: Wrap Dexie Table Reads in Catch Blocks
Ensure non-existent tables or empty states do not cause unhandled promise rejections:
```typescript
const [simpleHymns, localHymns, cachedHymnItems] = await Promise.all([
  db.table('simpleHymns').toArray().catch(() => [] as PreFetchHymn[]),
  db.table('localHymns').toArray().catch(() => [] as any[]),
  db.table('simpleHymnItems').toArray().catch(() => [] as FetchedHymn[]),
]);
```

### Rule 3: Maintain LiveQuery Reactivity
Because `listSimpleHymns` directly reads `db.table('simpleHymns')` and `db.table('localHymns')`, Dexie automatically tracks mutations to both tables. Any local save (`saveLocalHymn`) or cloud refresh automatically triggers the `friends$` observable in `HymnSidebarComponent`.

---

## 5. Future Enhancements Checklist

When scaling search performance or UX:
- [ ] **Debounce Input**: Add `debounceTime(150)` and `distinctUntilChanged()` to search input subscriptions.
- [ ] **Diacritic Normalization**: Apply `.normalize('NFD').replace(/[\u0300-\u036f]/g, '')` for accent-insensitive search.
- [ ] **Inverted Lyrics Index**: Extract sanitized word tokens from Marp markdown upon save to eliminate regex scanning.
- [ ] **Web Worker Offloading**: Run full-text lyrics queries inside `db-web-worker.worker.ts` for zero main-thread blocking.
