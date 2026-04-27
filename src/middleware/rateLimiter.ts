import rateLimit from 'express-rate-limit'

/**
 * Rate limiter for all /api/* routes.
 * 15 requests per minute — matches Gemini free tier quota.
 */
const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Wait 60 seconds.',
      },
    })
  },
})

export default rateLimiter
