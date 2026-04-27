# Skill: Gemini Integration

**Trigger**: When working with `gemini.service.ts` or AI prompt generation.

## Rules

1. **Model Specs**: 
   - Model: `gemini-1.5-flash` ONLY. 
   - Temperature: `0.3` (non-negotiable, ensures stable JSON).
   - Max output tokens: `2048`.
2. **Centralized Service**: All SDK calls must happen within `gemini.service.ts`. Never call `@google/generative-ai` directly from a route.
3. **JSON Parsing**:
   - Always strip Markdown fences (e.g., \`\`\`json and \`\`\`) before calling `JSON.parse`. Gemini often returns these despite JSON instructions.
   - If `JSON.parse` fails, do **not** crash the process.
   - Catch the error, log the raw string, and throw `{ code: 'GEMINI_PARSE_ERROR', raw }`.
4. **Caching**: 
   - Check the `Search` (ai_cache) MongoDB collection before calling the Gemini API.
   - Cache keys are generated via `SHA256(chainType + JSON.stringify(inputs))`.
