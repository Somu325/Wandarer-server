import { Schema, model, Document } from 'mongoose'

export interface IAiCache extends Document {
  cacheKey: string    // SHA256 hash — unique index
  chainType: string   // context | jobScore | gigIdeas | rates
  result: unknown     // parsed JSON from Gemini response
  computedAt: Date    // TTL index field — set on insert
}

const AiCacheSchema = new Schema<IAiCache>(
  {
    cacheKey: { type: String, required: true, unique: true },
    chainType: { type: String, required: true },
    result: { type: Schema.Types.Mixed, required: true },
    computedAt: { type: Date, default: Date.now },
  },
  { collection: 'ai_cache' }
)

// TTL index { computedAt: 1 } expireAfterSeconds: 86400 is created in config/db.ts

export const AiCache = model<IAiCache>('AiCache', AiCacheSchema)
