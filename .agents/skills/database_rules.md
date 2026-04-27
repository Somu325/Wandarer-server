# Skill: Database Rules

**Trigger**: When writing Mongoose models, queries, or database service logic.

## Core Rules

1. **Singleton Profile**:
   - The `Profile` collection acts as a singleton.
   - Always query/update using: `Profile.findOneAndUpdate({}, payload, { upsert: true, new: true })`.
   - The empty `{}` filter is intentional.
2. **Denormalized Bookmarks**:
   - Jobs are wiped out regularly via TTL indexes.
   - Therefore, `Bookmarks` MUST store `title`, `company`, and `externalUrl` directly on the document, not just via a reference ID.
3. **Job Deduping**:
   - Use `Job.bulkWrite()` with `updateOne`, filtering on `externalId` with `upsert: true` to prevent duplicate jobs during feed refresh.
4. **TTL Enforcement**:
   - TTL indexes are already initialized in `db.ts`. 
   - `jobs` expire in 6h via `fetchedAt`.
   - `searches` (ai_cache) expire in 24h via `computedAt`.
   - Enforce TTL in the application code by checking age in milliseconds before trusting a cached result.
