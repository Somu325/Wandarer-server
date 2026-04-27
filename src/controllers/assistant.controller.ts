import type { Request, Response } from 'express'
import { buildProfileContext } from '../services/context.service.js'
import { callGemini } from '../services/gemini.service.js'
import { MASTER_SYSTEM_PROMPT } from '../prompts/master.prompt.js'

/**
 * POST /api/assistant/chat
 * Freeform career chat with full profile context injected.
 * Not cached — conversation is always unique.
 * Body: { messages: Array<{ role: string, content: string }> }
 */
export async function chat(req: Request, res: Response): Promise<void> {
  try {
    const { messages } = req.body as { messages?: { role: string; content: string }[] }

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'messages must be a non-empty array' } })
      return
    }

    const contextString = await buildProfileContext()

    const conversationHistory = messages
      .map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
      .join('\n')

    const prompt = `${MASTER_SYSTEM_PROMPT}

[PROFILE_CONTEXT]
${contextString}

[CONVERSATION HISTORY]
${conversationHistory}

Based on the conversation above and the engineer's profile, provide a helpful, specific response.

Required JSON output schema:
{ "reply": string, "suggestedFollowUps": string[] }

Rules:
- reply must be a complete, actionable response — never generic
- suggestedFollowUps must be 2-4 specific follow-up questions the user might want to ask next
- Always reference specifics from the profile — never give generic career advice

Respond ONLY with valid JSON matching the schema above.
Do NOT include markdown fences, backticks, or any text outside the JSON object. Start your response with { and end with }.`

    const result = await callGemini(prompt, 'assistant', {}, 0)
    res.json({ success: true, data: result })
  } catch (err) {
    const e = err as { code?: string; message?: string }
    if (e.code === 'PROFILE_NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'PROFILE_NOT_FOUND', message: e.message ?? 'Profile not found' } })
      return
    }
    console.error('chat error:', err)
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Assistant chat failed' } })
  }
}
