import express, { type Request, type Response } from 'express'

const app = express()
const PORT = 3000

// Middleware to parse JSON — same as in JS
app.use(express.json())

// Basic route
app.get('/', (req: Request, res: Response) => {
    res.send('Hello from TypeScript server!')
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})