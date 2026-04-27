import { Schema, model, Document } from 'mongoose'

export interface IJob extends Document {
  externalId: string      // unique — remotive_123 or arbeitnow_abc
  source: string          // 'remotive' | 'arbeitnow'
  title: string
  company: string
  companyLogo: string     // URL, may be empty
  description: string
  tags: string[]
  salary: string          // raw string, may be empty
  isRemote: boolean
  location: string
  url: string             // original apply link
  postedAt: Date
  matchScore: number      // 0-100, set by Chain 2, default null
  matchReason: string     // 1-line from Chain 2, default null
  missingSkills: string[] // from Chain 2, default []
  verdict: string         // strong_match | partial_match | weak_match
  fetchedAt: Date         // TTL index field — set on insert
}

const JobSchema = new Schema<IJob>(
  {
    externalId: { type: String, required: true, unique: true },
    source: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    companyLogo: { type: String, default: '' },
    description: { type: String, required: true },
    tags: { type: [String], default: [] },
    salary: { type: String, default: '' },
    isRemote: { type: Boolean, default: false },
    location: { type: String, default: '' },
    url: { type: String, required: true },
    postedAt: { type: Date, required: true },
    matchScore: { type: Number, default: null },
    matchReason: { type: String, default: null },
    missingSkills: { type: [String], default: [] },
    verdict: { type: String, default: null },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// TTL index { fetchedAt: 1 } expireAfterSeconds: 21600 is created in config/db.ts

export const Job = model<IJob>('Job', JobSchema)
