import { Schema, model, Document, Types } from 'mongoose'

export interface IBookmark extends Document {
  jobId: Types.ObjectId
  title: string      // Denormalized
  company: string    // Denormalized
  externalUrl: string // Denormalized
  status: 'saved' | 'applied' | 'interviewing' | 'rejected' | 'offered'
  bookmarkedAt: Date
  notes?: string
}

const BookmarkSchema = new Schema<IBookmark>({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  externalUrl: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['saved', 'applied', 'interviewing', 'rejected', 'offered'],
    default: 'saved' 
  },
  bookmarkedAt: { type: Date, default: Date.now },
  notes: { type: String }
})

export const Bookmark = model<IBookmark>('Bookmark', BookmarkSchema)
