import { Schema, model, Document } from 'mongoose'

export interface IAiCache extends Document {
  key: string // SHA256(chainType + JSON.stringify(inputs))
  chainType: 'context' | 'jobScore' | 'gigIdeas' | 'rates' | 'rewrite' | 'coverLetter'
  inputs: Record<string, any>
  result: Record<string, any>
  computedAt: Date
}

const AiCacheSchema = new Schema<IAiCache>({
  key: { type: String, required: true, unique: true },
  chainType: { 
    type: String, 
    enum: ['context', 'jobScore', 'gigIdeas', 'rates', 'rewrite', 'coverLetter'],
    required: true 
  },
  inputs: { type: Schema.Types.Mixed, required: true },
  result: { type: Schema.Types.Mixed, required: true },
  computedAt: { type: Date, default: Date.now }
}, {
  collection: 'ai_cache'
})

// Note: TTL index { computedAt: 1 }, { expireAfterSeconds: 86400 } is created in db.ts

export const AiCache = model<IAiCache>('AiCache', AiCacheSchema)
