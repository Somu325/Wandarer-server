import { model as geminiModel } from '../config/gemini.js'
import { buildCacheKey, getCache, setCache } from './cache.service.js'
import { MASTER_SYSTEM_PROMPT } from '../prompts/master.prompt.js'

/**
 * Central Gemini AI orchestrator — single entry point for all Gemini calls.
 * Checks cache before calling the API, strips markdown fences, parses JSON.
 * @param userPrompt The chain-specific assembled prompt string
 * @param chainType Used for cache keying and log labelling
 * @param cacheInputs The inputs used to build the cache key hash
 * @param ttlMs Cache TTL in milliseconds — pass 0 to bypass cache entirely
 * @returns Parsed JSON result from Gemini (or from cache)
 */
export async function callGemini(
  userPrompt: string,
  chainType: string,
  cacheInputs: unknown,
  ttlMs: number
): Promise<unknown> {
  const cacheKey = buildCacheKey(chainType, cacheInputs)

  if (ttlMs > 0) {
    const cached = await getCache(cacheKey, ttlMs)
    if (cached !== null) {
      console.log(`cache hit: ${chainType}`)
      return cached
    }
  }

  try {
    const fullPrompt = MASTER_SYSTEM_PROMPT + '\n' + userPrompt
    const response = await geminiModel.generateContent(fullPrompt)
    const text = response.response.text()

    // Strip markdown fences defensively — master prompt forbids them but Gemini adds them anyway
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      const finishReason = response.response.candidates?.[0]?.finishReason || 'UNKNOWN'
      import('fs').then(fs => fs.writeFileSync(`failed-gemini-response-${chainType}.txt`, text))
      console.error(`Gemini parse failure [${chainType}]. FinishReason: ${finishReason}. Snippet:`, text.slice(0, 200))
      throw { code: 'GEMINI_PARSE_ERROR', raw: text, finishReason }
    }

    if (ttlMs > 0) {
      await setCache(cacheKey, chainType, parsed)
    }

    return parsed
  } catch (err) {
    // Re-throw structured parse errors unchanged
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'GEMINI_PARSE_ERROR'
    ) {
      throw err
    }
    console.error(`Gemini SDK error [${chainType}]:`, err)
    throw { code: 'GEMINI_SDK_ERROR', message: String(err) }
  }
}
