/**
 * Builds the Chain 5 resume bullet rewrite prompt for Gemini
 * @param contextString The cached profile context string from Chain 1
 * @param jobDescription The job description to target keywords from
 * @param originalBullet The resume bullet to rewrite
 * @returns Complete assembled prompt string
 */
export function buildBulletPrompt(
  contextString: string,
  jobDescription: string,
  originalBullet: string
): string {
  return `[PROFILE_CONTEXT]
${contextString}

Rewrite the following resume bullet point to be stronger and more targeted for this job.

Job Description:
${jobDescription}

Original Bullet:
${originalBullet}

Rules for the rewrite (violating any makes the result useless):
1. Start with a strong past-tense action verb
2. Include a measurable outcome — infer a realistic one if not in the original
3. Mirror 1-2 keywords from the job description naturally (not forced)
4. Maximum 20 words total
5. Use only technologies already present in the user's profile above

Required JSON output schema:
{ "rewritten": string, "actionVerb": string, "keywordsMatched": string[], "metricAdded": boolean, "improvementNote": string }

Rules:
- improvementNote is exactly 1 sentence explaining the single biggest change made
- keywordsMatched lists the specific JD keywords you incorporated
- metricAdded is true if you added or inferred a quantified outcome

Respond ONLY with valid JSON matching the schema above.
Do NOT include markdown fences, backticks, or any text outside the JSON object. Start your response with { and end with }.`
}
