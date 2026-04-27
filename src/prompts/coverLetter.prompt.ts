import type { IJob } from '../models/Job.model.js'

/**
 * Builds the Chain 6 cover letter prompt for Gemini
 * @param contextString The cached profile context string from Chain 1
 * @param job The IJob object to write the cover letter for
 * @returns Complete assembled prompt string
 */
export function buildCoverLetterPrompt(contextString: string, job: IJob): string {
  return `[PROFILE_CONTEXT]
${contextString}

Write a cover letter for the following job application.

Job Details:
Title: ${job.title}
Company: ${job.company}
Description:
${job.description.slice(0, 1200)}

Cover letter structure — three paragraphs:
Para 1: Why this specific company and role — reference something real and specific from the job description above
Para 2: 2-3 specific skills from the profile that directly match the job requirements — be concrete
Para 3: Brief close — mention availability and genuine enthusiasm, zero clichés

Tone rules (violating these makes the letter useless):
- NEVER open with "I am writing to express my interest"
- Confident, not arrogant. Direct, not desperate.
- Sounds like a human wrote it — no corporate filler or hollow phrases

Required JSON output schema:
{ "subject": string, "body": string, "wordCount": number, "keySellingPoints": string[], "redFlags": string[] }

Rules:
- subject is the email subject line for this specific application
- body is the full cover letter text (all three paragraphs)
- wordCount is the word count of body
- keySellingPoints lists 3-5 specific strengths from the profile that match this role
- redFlags lists skills mentioned in the JD the user may be underqualified for — be honest, this is useful

Respond ONLY with valid JSON matching the schema above.
Do NOT include markdown fences, backticks, or any text outside the JSON object. Start your response with { and end with }.`
}
