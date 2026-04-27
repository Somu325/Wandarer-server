import { Profile } from '../models/Profile.model.js'
import { callGemini } from './gemini.service.js'

const CONTEXT_TTL_MS = 3_600_000 // 1 hour

/**
 * Builds or returns a cached profile context string via Chain 1.
 * Returns immediately if contextBuiltAt is less than 1 hour old.
 * Otherwise calls Gemini to summarise the full profile into a dense context string,
 * saves it back to the profile document, and returns it.
 * @returns The dense context string summarising the user's profile
 */
export async function buildProfileContext(): Promise<string> {
  const profile = await Profile.findOne({})
  if (!profile) {
    throw { code: 'PROFILE_NOT_FOUND', message: 'No profile document found. Create one via PATCH /api/profile.' }
  }

  // Return cached context if still fresh (< 1 hour old)
  if (
    profile.contextBuiltAt &&
    Date.now() - profile.contextBuiltAt.getTime() < CONTEXT_TTL_MS
  ) {
    return profile.contextString
  }

  // Build a rich summary from the full profile for Gemini
  const profileSummary = {
    name: profile.personalInfo?.name ?? '',
    title: profile.personalInfo?.title ?? '',
    location: profile.personalInfo?.location ?? {},
    summary: profile.summary,
    skills: profile.skills,
    experience: (profile.experience ?? []).map((e) => ({
      role: e.role,
      company: e.company,
      employmentType: e.employmentType,
      duration: `${e.startDate} – ${e.endDate}`,
      location: e.location,
      responsibilities: e.responsibilities.slice(0, 3),
    })),
    projects: (profile.projects ?? []).map((p) => ({
      name: p.name,
      techStack: p.techStack,
    })),
    education: profile.education ?? [],
    seniority: profile.seniority,
    yearsExp: profile.yearsExp,
    workType: profile.workType,
    remote: profile.remote,
    salaryMin: profile.salaryMin,
    salaryMax: profile.salaryMax,
    targetRoles: profile.targetRoles,
  }

  const prompt = `Summarise the following software engineer profile into a dense, information-rich context string of approximately 200 words.

Profile data:
${JSON.stringify(profileSummary, null, 2)}

The contextString must be a single paragraph, dense with facts — not bullet points.
Include: name, current title, top skills, recent experience, seniority level, years of experience, target roles, location, salary expectations (INR if set), and work preferences.
topSkills should list the engineer's most marketable skills (max 6) drawn from their skills object.

Required JSON output schema:
{ "contextString": string, "topSkills": string[], "seniorityLabel": string, "salaryRange": { "min": number, "max": number, "currency": string }, "preferredWorkType": string }

Respond ONLY with valid JSON matching the schema above.
Do NOT include markdown fences, backticks, or any text outside the JSON object. Start your response with { and end with }.`

  const profileId = (profile._id as { toString(): string }).toString()
  const result = await callGemini(prompt, 'context', { profileId }, CONTEXT_TTL_MS) as { contextString: string }

  await Profile.findOneAndUpdate(
    {},
    { contextString: result.contextString, contextBuiltAt: new Date() },
    { new: true }
  )

  return result.contextString
}
