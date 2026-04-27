import mongoose from 'mongoose'

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
      console.log('MongoDB connected: jobsearch')

      // Initialize TTL indexes — created once on connect, not in model files
      const db = mongoose.connection.db
      if (db) {
        await db.collection('jobs').createIndex(
          { fetchedAt: 1 },
          { expireAfterSeconds: Number(process.env.CACHE_TTL_JOBS) || 21600 }
        )

        // Search.model.ts uses collection 'ai_cache' — TTL must match
        await db.collection('ai_cache').createIndex(
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
