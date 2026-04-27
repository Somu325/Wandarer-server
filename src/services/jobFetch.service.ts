import axios from 'axios'
import { Job } from '../models/Job.model.js'
import type { IJob } from '../models/Job.model.js'

interface RemotiveJob {
  id: number
  url: string
  title: string
  company_name: string
  company_logo: string
  description: string
  tags: string[]
  salary: string
  candidate_required_location: string
  publication_date: string
}

interface ArbeitNowJob {
  slug: string
  url: string
  title: string
  company_name: string
  description: string
  tags: string[]
  location: string
  remote: boolean
  created_at: number
}

/**
 * Fetches remote software jobs from the Remotive API
 * @returns Array of partial IJob objects mapped from Remotive API response
 */
export async function fetchRemotive(): Promise<Partial<IJob>[]> {
  try {
    const response = await axios.get<{ jobs: RemotiveJob[] }>(
      'https://remotive.com/api/remote-jobs?category=software-dev&limit=50'
    )
    return response.data.jobs.map((j) => ({
      externalId: `remotive_${j.id}`,
      source: 'remotive',
      title: j.title,
      company: j.company_name,
      companyLogo: j.company_logo ?? '',
      description: j.description,
      tags: j.tags ?? [],
      salary: j.salary ?? '',
      isRemote: true,
      location: j.candidate_required_location ?? 'Remote',
      url: j.url,
      postedAt: new Date(j.publication_date),
    }))
  } catch (err) {
    console.error('fetchRemotive error:', err)
    return []
  }
}

/**
 * Fetches jobs from the Arbeit Now API
 * @returns Array of partial IJob objects mapped from Arbeit Now API response
 */
export async function fetchArbeitNow(): Promise<Partial<IJob>[]> {
  try {
    const response = await axios.get<{ data: ArbeitNowJob[] }>(
      'https://www.arbeitnow.com/api/job-board-api'
    )
    return response.data.data.map((j) => ({
      externalId: `arbeitnow_${j.slug}`,
      source: 'arbeitnow',
      title: j.title,
      company: j.company_name,
      companyLogo: '',
      description: j.description,
      tags: j.tags ?? [],
      salary: '',
      isRemote: j.remote ?? false,
      location: j.location ?? '',
      url: j.url,
      postedAt: new Date(j.created_at * 1000),
    }))
  } catch (err) {
    console.error('fetchArbeitNow error:', err)
    return []
  }
}

/**
 * Fetches jobs from all sources and upserts them into MongoDB via bulkWrite.
 * Sets fetchedAt fresh on every upsert to reset the TTL clock.
 * @returns Total count of operations (upserted + modified)
 */
export async function fetchAndUpsertAll(): Promise<number> {
  try {
    const [remotiveJobs, arbeitNowJobs] = await Promise.all([
      fetchRemotive(),
      fetchArbeitNow(),
    ])

    const allJobs = [...remotiveJobs, ...arbeitNowJobs]

    if (allJobs.length === 0) {
      console.log('fetchAndUpsertAll: no jobs fetched from any source')
      return 0
    }

    const now = new Date()
    const ops = allJobs.map((job) => ({
      updateOne: {
        filter: { externalId: job.externalId },
        update: { $set: { ...job, fetchedAt: now } },
        upsert: true,
      },
    }))

    const result = await Job.bulkWrite(ops)
    const count = (result.upsertedCount ?? 0) + (result.modifiedCount ?? 0)
    console.log(`fetchAndUpsertAll: ${count} jobs upserted/updated (${remotiveJobs.length} remotive, ${arbeitNowJobs.length} arbeitnow)`)
    return count
  } catch (err) {
    console.error('fetchAndUpsertAll error:', err)
    return 0
  }
}
