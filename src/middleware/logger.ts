import type { Request, Response, NextFunction } from 'express'

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now()
  const timestamp = new Date().toISOString()
  const device = req.get('user-agent') ?? 'Unknown Device'
  const method = req.method
  const url = req.originalUrl

  console.log(`\n[${timestamp}] ➡️  ${method} ${url} | Device: ${device}`)
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[${timestamp}] 📦 Request Body:`, JSON.stringify(req.body).slice(0, 500))
  }

  // Intercept response methods to capture the response body
  const originalJson = res.json.bind(res)
  const originalSend = res.send.bind(res)

  let responseLogged = false

  res.json = function (body: unknown): Response {
    if (!responseLogged) {
      const duration = Date.now() - start
      const bodyStr = typeof body === 'object' ? JSON.stringify(body) : String(body)
      const truncated = bodyStr.length > 1000 ? bodyStr.slice(0, 1000) + '... [TRUNCATED]' : bodyStr
      
      console.log(`[${timestamp}] ⬅️  ${res.statusCode} ${method} ${url} (${duration}ms)`)
      console.log(`[${timestamp}] 📄 Response Body:`, truncated)
      responseLogged = true
    }
    return originalJson(body)
  }

  res.send = function (body: unknown): Response {
    if (!responseLogged) {
      const duration = Date.now() - start
      const bodyStr = String(body)
      const truncated = bodyStr.length > 1000 ? bodyStr.slice(0, 1000) + '... [TRUNCATED]' : bodyStr
      
      console.log(`[${timestamp}] ⬅️  ${res.statusCode} ${method} ${url} (${duration}ms)`)
      console.log(`[${timestamp}] 📄 Response Body:`, truncated)
      responseLogged = true
    }
    return originalSend(body)
  }

  next()
}
