import { Schema, model, Document, Types } from 'mongoose'

export interface IBookmark extends Document {
  jobRef: Types.ObjectId | null  // ref: Job — nullable for manually added bookmarks
  externalUrl: string            // ALWAYS store — jobs expire after 6h
  title: string                  // ALWAYS denormalize — jobs expire after 6h
  company: string                // ALWAYS denormalize — jobs expire after 6h
  matchScore: number             // score at time of saving — denormalized
  status: string                 // saved | applied | interview | offer | rejected
  notes: string                  // personal notes
  appliedAt: Date | null         // set when status → applied
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    jobRef: { type: Schema.Types.ObjectId, ref: 'Job', default: null },
    externalUrl: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    matchScore: { type: Number, default: 0 },
    status: { type: String, default: 'saved' },
    notes: { type: String, default: '' },
    appliedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const Bookmark = model<IBookmark>('Bookmark', BookmarkSchema)
