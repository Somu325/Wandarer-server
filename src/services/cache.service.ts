import crypto from 'crypto'
import { AiCache } from '../models/Search.model.js'

/**
 * Builds a SHA256 cache key from chain type and inputs
 * @param chainType The type of Gemini chain (context, jobScore, gigIdeas, rates)
 * @param inputs Any serializable value — shape varies per chain
 * @returns SHA256 hex digest string
 */
export function buildCacheKey(chainType: string, inputs: unknown): string {
  const raw = chainType + JSON.stringify(inputs)
  return crypto.createHash('sha256').update(raw).digest('hex')
}

/**
 * Retrieves a cached Gemini result if it exists and is within the TTL window
 * @param cacheKey SHA256 hex key to look up in the ai_cache collection
 * @param ttlMs Time-to-live in milliseconds — code-level TTL check (MongoDB TTL handles deletion)
 * @returns The cached result if fresh, null if expired or not found
 */
export async function getCache(cacheKey: string, ttlMs: number): Promise<unknown | null> {
  try {
    const doc = await AiCache.findOne({ cacheKey })
    if (!doc) return null
    const age = Date.now() - doc.computedAt.getTime()
    if (age > ttlMs) return null
    return doc.result
  } catch (err) {
    console.error('cache.service getCache error:', err)
    return null
  }
}

/**
 * Saves or updates a cache entry in the ai_cache collection
 * @param cacheKey SHA256 hex key to store under
 * @param chainType The chain type label for the stored entry
 * @param result The parsed JSON result from Gemini to cache
 */
export async function setCache(
  cacheKey: string,
  chainType: string,
  result: unknown
): Promise<void> {
  try {
    await AiCache.findOneAndUpdate(
      { cacheKey },
      { cacheKey, chainType, result, computedAt: new Date() },
      { upsert: true, new: true }
    )
  } catch (err) {
    console.error('cache.service setCache error:', err)
  }
}
