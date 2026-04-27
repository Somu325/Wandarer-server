import { Schema, model, Document } from 'mongoose'

export interface IJob extends Document {
  externalId: string // remotive_id or arbeitnow_slug
  url: string
  title: string
  company: string
  companyLogo?: string
  description: string
  tags: string[]
  salary?: string
  location: string
  postedAt: Date
  source: 'remotive' | 'arbeitnow'
  isRemote: boolean
  fetchedAt: Date
}

const JobSchema = new Schema<IJob>({
  externalId: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  companyLogo: { type: String },
  description: { type: String, required: true },
  tags: { type: [String], default: [] },
  salary: { type: String },
  location: { type: String, required: true },
  postedAt: { type: Date, required: true },
  source: { type: String, enum: ['remotive', 'arbeitnow'], required: true },
  isRemote: { type: Boolean, default: false },
  fetchedAt: { type: Date, default: Date.now }
})

// Note: TTL index { fetchedAt: 1 }, { expireAfterSeconds: 21600 } is created in db.ts

export const Job = model<IJob>('Job', JobSchema)
