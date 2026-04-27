import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Connects to MongoDB with retry logic and initializes TTL indexes
 * @returns {Promise<void>}
 */
export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI
  
  if (!mongoUri) {
    console.error('MONGO_URI is not defined in environment variables')
    process.exit(1)
  }

  let attempts = 5
  while (attempts > 0) {
    try {
      await mongoose.connect(mongoUri)
      console.log('MongoDB connected successfully')
      
      // Initialize TTL indexes as required by AGENTS.md
      const db = mongoose.connection.db
      if (db) {
        await db.collection('jobs').createIndex(
          { fetchedAt: 1 },
          { expireAfterSeconds: Number(process.env.CACHE_TTL_JOBS) || 21600 }
        )
        
        await db.collection('searches').createIndex(
          { computedAt: 1 },
          { expireAfterSeconds: Number(process.env.CACHE_TTL_GIGS) || 86400 }
        )
        
        console.log('TTL indexes initialized')
      }
      
      break
    } catch (error) {
      attempts -= 1
      console.error(`MongoDB connection failed. Attempts remaining: ${attempts}`)
      if (attempts === 0) {
        console.error('Max retry attempts reached. Exiting...')
        process.exit(1)
      }
      // Wait 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}
