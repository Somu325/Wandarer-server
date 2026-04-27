/**
 * Builds the Chain 4 rate estimation prompt for Gemini
 * @param contextString The cached profile context string from Chain 1
 * @returns Complete assembled prompt string
 */
export function buildRatePrompt(contextString: string): string {
  return `[PROFILE_CONTEXT]
${contextString}

Estimate freelance rates for this engineer based on their seniority, years of experience, and skill set.
Use 2024-2025 Indian market data. Consider two markets:
1. Indian freelancers working with international clients (rates in USD)
2. Indian freelancers working with domestic Indian clients (rates in INR)

For blendedRate: reflect the overall profile considering all skills and experience combined.
For bySkill: cover exactly the top 5 skills from the profile context above.
For positioningAdvice: write 2-3 sentences on exactly how this engineer can command the higher end of their rate range — be specific about what to do, not just what to say.

Required JSON output schema:
{
  "blendedRate": {
    "hourlyUSD": { "min": number, "max": number },
    "hourlyINR": { "min": number, "max": number },
    "monthlyINR": { "min": number, "max": number },
    "rationale": string
  },
  "bySkill": [
    {
      "skill": string,
      "hourlyUSD": { "min": number, "max": number },
      "demandTrend": "rising"|"stable"|"falling",
      "marketNote": string,
      "monetisationTip": string
    }
  ],
  "positioningAdvice": string
}

Respond ONLY with valid JSON matching the schema above.
Do NOT include markdown fences, backticks, or any text outside the JSON object. Start your response with { and end with }.`
}
