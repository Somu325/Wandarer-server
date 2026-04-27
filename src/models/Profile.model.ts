import { Schema, model, Document } from 'mongoose'

export interface IProfile extends Document {
  name: string
  bio: string
  skills: string[]
  goals: string[]
  location: string
  resumeText?: string
  updatedAt: Date
}

const ProfileSchema = new Schema<IProfile>({
  name: { type: String, required: true },
  bio: { type: String, required: true },
  skills: { type: [String], default: [] },
  goals: { type: [String], default: [] },
  location: { type: String, default: 'Hyderabad, India' },
  resumeText: { type: String },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

export const Profile = model<IProfile>('Profile', ProfileSchema)
