# Skill: Writing API Routes

**Trigger**: When building an Express controller, route handler, or middleware.

## Implementation Rules

1. **Async/Await**: Use `async/await` everywhere. No `.then().catch()` chains.
2. **Try/Catch Wrapper**: Every single async route handler MUST be wrapped in a `try/catch` block.
3. **Response Shape**: You must adhere strictly to this shape. No exceptions.
   - **Success**: `{ success: true, data: T }`
   - **Error**: `{ success: false, error: { code: string, message: string } }`
4. **Error Handling**:
   - Never expose raw Mongoose or Gemini SDK errors to the client.
   - Use standard HTTP codes: `200` (success), `201` (created), `400` (bad input), `404` (not found), `500` (server error).
5. **Logging**: Use `console.log` for info and `console.error` for errors. Do not install any logging framework.
6. **No Auth**: Remember that there is absolutely no authentication, JWT, or user validation required or allowed.
