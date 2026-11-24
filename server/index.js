import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from './src/httpServer.js'
import { connectMongo } from './src/persistence.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load local .env files if present (from server dir or parent dir)
const envPaths = [
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env'),
]

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    try {
      process.loadEnvFile(envPath)
    } catch {}
  }
}

const port = Number(process.env.PORT || 5000)
const host = process.env.HOST || '0.0.0.0'

// Initialize MongoDB Atlas connection
connectMongo().catch((err) =>
  console.warn('[AyurSaathi] MongoDB connection error:', err.message)
)

const server = createServer()

server.listen(port, host, () => {
  console.log(`🌿 AyurSaathi API server running on http://${host}:${port}`)
})
