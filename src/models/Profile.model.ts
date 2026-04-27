import { Schema, model, Document } from 'mongoose'

// ─── Nested interfaces ─────────────────────────────────────────────────────────

export interface IPersonalInfo {
  name: string
  title: string
  email: string
  phone: string
  location: { city: string; state: string; country: string }
  linkedin: string
  github: string
}

export interface ISkills {
  frontend: string[]
  backend: string[]
  databases: string[]
  realTime: string[]
  toolsAndDevops: string[]
  other: string[]
}

export interface IExperience {
  role: string
  company: string
  employmentType: string
  startDate: string
  endDate: string
  location: string
  responsibilities: string[]
}

export interface IProject {
  name: string
  techStack: string[]
  highlights: string[]
}

export interface IEducation {
  degree: string
  fieldOfStudy: string
  institution: string
  startYear: number
  endYear: number
}

export interface ICertification {
  title: string
  issuer: string
  description: string
}

// ─── Root interface ────────────────────────────────────────────────────────────

export interface IProfile extends Document {
  // Resume data
  personalInfo: IPersonalInfo
  summary: string
  skills: ISkills
  experience: IExperience[]
  projects: IProject[]
  education: IEducation[]
  certifications: ICertification[]

  // AI tuning fields — used by Gemini chains for scoring and rate calibration
  seniority: string    // junior | mid | senior | lead
  yearsExp: number
  workType: string     // fulltime | freelance | both
  remote: string       // remote | hybrid | onsite
  salaryMin: number    // INR per annum
  salaryMax: number    // INR per annum
  targetRoles: string[]

  // Gemini cache — never written by user directly
  contextString: string
  contextBuiltAt: Date
}

// ─── Schema ────────────────────────────────────────────────────────────────────

const PersonalInfoSchema = new Schema<IPersonalInfo>(
  {
    name: { type: String, default: '' },
    title: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
  },
  { _id: false }
)

const SkillsSchema = new Schema<ISkills>(
  {
    frontend: { type: [String], default: [] },
    backend: { type: [String], default: [] },
    databases: { type: [String], default: [] },
    realTime: { type: [String], default: [] },
    toolsAndDevops: { type: [String], default: [] },
    other: { type: [String], default: [] },
  },
  { _id: false }
)

const ExperienceSchema = new Schema<IExperience>(
  {
    role: { type: String, required: true },
    company: { type: String, required: true },
    employmentType: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    location: { type: String, default: '' },
    responsibilities: { type: [String], default: [] },
  },
  { _id: false }
)

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    techStack: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
  },
  { _id: false }
)

const EducationSchema = new Schema<IEducation>(
  {
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, default: '' },
    institution: { type: String, required: true },
    startYear: { type: Number, default: 0 },
    endYear: { type: Number, default: 0 },
  },
  { _id: false }
)

const CertificationSchema = new Schema<ICertification>(
  {
    title: { type: String, required: true },
    issuer: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
)

const ProfileSchema = new Schema<IProfile>(
  {
    personalInfo: { type: PersonalInfoSchema, default: () => ({}) },
    summary: { type: String, default: '' },
    skills: { type: SkillsSchema, default: () => ({}) },
    experience: { type: [ExperienceSchema], default: [] },
    projects: { type: [ProjectSchema], default: [] },
    education: { type: [EducationSchema], default: [] },
    certifications: { type: [CertificationSchema], default: [] },

    seniority: { type: String, default: '' },
    yearsExp: { type: Number, default: 0 },
    workType: { type: String, default: '' },
    remote: { type: String, default: '' },
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    targetRoles: { type: [String], default: [] },

    contextString: { type: String, default: '' },
    contextBuiltAt: { type: Date },
  },
  { timestamps: true }
)

export const Profile = model<IProfile>('Profile', ProfileSchema)
