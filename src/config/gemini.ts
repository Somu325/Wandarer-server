import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env['GEMINI_API_KEY']
const modelName = process.env['GEMINI_MODEL'] ?? 'gemini-2.0-flash'

if (!apiKey) {
  console.error('GEMINI_API_KEY is not defined in environment variables')
  process.exit(1)
}

export const genAI = new GoogleGenerativeAI(apiKey)

/**
 * Pre-configured Gemini model instance
 * model: gemini-1.5-flash
 * temperature: 0.3
 * maxOutputTokens: 2048
 */
export const model = genAI.getGenerativeModel({
  model: modelName,
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 8192,
  },
})

console.log(`Gemini SDK initialized with model: ${modelName}`)
