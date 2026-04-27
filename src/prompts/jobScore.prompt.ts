import type { IJob } from '../models/Job.model.js'

/**
 * Builds the Chain 2 job scoring prompt for Gemini
 * @param contextString The cached profile context string from Chain 1
 * @param jobs Array of IJob objects to score (max 20 per call)
 * @returns Complete assembled prompt string
 */
export function buildJobScorePrompt(contextString: string, jobs: IJob[]): string {
  const jobList = jobs.map((j) => ({
    jobId: (j._id as { toString(): string }).toString(),
    title: j.title,
    company: j.company,
    description: j.description.slice(0, 800),
    tags: j.tags,
    salary: j.salary,
    location: j.location,
    isRemote: j.isRemote,
  }))

  return `[PROFILE_CONTEXT]
${contextString}

Score each of the following ${jobs.length} job listing(s) against the engineer profile above.

Scoring guide:
- 80-100: strong_match — strong skill overlap, seniority fits, remote preference and salary aligned
- 50-79:  partial_match — some skill overlap but meaningful gaps exist
- 0-49:   weak_match — significant skill mismatch or seniority gap

For each job return:
- jobId: the exact jobId string provided below (do not change it)
- matchScore: integer 0-100
- matchReason: exactly 1 sentence naming specific matching skills or concrete gaps — never generic
- missingSkills: array of skill name strings the user lacks for this role (empty array if none)
- verdict: "strong_match" | "partial_match" | "weak_match"

Jobs to score:
${JSON.stringify(jobList, null, 2)}

Required JSON output schema:
{ "scores": [ { "jobId": string, "matchScore": number, "matchReason": string, "missingSkills": string[], "verdict": string } ] }

Respond ONLY with valid JSON matching the schema above.
Do NOT include markdown fences, backticks, or any text outside the JSON object. Start your response with { and end with }.`
}
