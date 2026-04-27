/**
 * Builds the Chain 3 gig ideas prompt for Gemini
 * @param contextString The cached profile context string from Chain 1
 * @returns Complete assembled prompt string
 */
export function buildGigIdeasPrompt(contextString: string): string {
  return `[PROFILE_CONTEXT]
${contextString}

Generate exactly 8 freelance gig ideas for this engineer.

Requirements for each gig:
- Uses at least one of the engineer's top skills
- Is realistically deliverable by one person
- Has genuine market demand in 2024-2025
- Is titled exactly as it would appear on the freelance platform listing

For each gig return:
- title: gig title exactly as it would appear on the platform
- platform: e.g. "Upwork", "Fiverr", "Toptal", "Freelancer", "PeoplePerHour"
- platformCategory: the platform's category this gig belongs to
- primarySkill: the main skill from the engineer's profile this gig uses
- estimatedDemand: "high" | "medium" | "low"
- estimatedEarningsPerProject: { "min": number, "max": number } — values in USD
- whyThisUser: 1 sentence referencing specific skills from this profile — not generic
- searchUrl: a real pre-built URL pointing to the platform's search results for this gig type

Required JSON output schema:
{ "gigs": [ { "title": string, "platform": string, "platformCategory": string, "primarySkill": string, "estimatedDemand": "high"|"medium"|"low", "estimatedEarningsPerProject": { "min": number, "max": number }, "whyThisUser": string, "searchUrl": string } ] }

Respond ONLY with valid JSON matching the schema above.
Do NOT include markdown fences, backticks, or any text outside the JSON object. Start your response with { and end with }.`
}
