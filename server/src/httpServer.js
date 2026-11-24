import { createServer as createHttpServer } from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import { z } from 'zod'
import { generateWellnessGuide } from './gemini.js'
import { findCachedGuide, saveGuide } from './persistence.js'
import { emergencyResponse, isEmergencyQuery } from './safety.js'
import { getCuratedFallback } from './fallbackData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const searchRequestSchema = z.object({
  query: z.string().trim().min(1).max(200),
  lang: z.string().trim().max(10).optional(),
}).strict()

const bodyLimit = 16 * 1024
const windowMs = 15 * 60 * 1000
const requestLimit = 60

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
}

function createRateLimiter() {
  const requests = new Map()
  return function isRateLimited(ip, now = Date.now()) {
    const current = requests.get(ip)
    if (!current || current.expiresAt <= now) {
      requests.set(ip, { count: 1, expiresAt: now + windowMs })
      if (requests.size > 5000) {
        for (const [key, entry] of requests) if (entry.expiresAt <= now) requests.delete(key)
      }
      return false
    }
    current.count += 1
    return current.count > requestLimit
  }
}

function sendJson(response, statusCode, payload, headers = {}) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  })
  response.end(JSON.stringify(payload))
}

async function readJsonBody(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > bodyLimit) throw Object.assign(new Error('Request is too large.'), { statusCode: 413 })
    chunks.push(chunk)
  }
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw Object.assign(new Error('Send a valid JSON request.'), { statusCode: 400 })
  }
}

function serveStaticFile(request, response, distDir) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return sendJson(response, 405, { error: 'Method not allowed.' })
  }

  if (!distDir || !fs.existsSync(distDir)) {
    return sendJson(response, 404, { error: 'Static build assets not found.' })
  }

  const reqUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`)
  let decodedPath
  try {
    decodedPath = decodeURIComponent(reqUrl.pathname)
  } catch {
    return sendJson(response, 400, { error: 'Invalid URL encoding.' })
  }

  const safeRelativePath = path.normalize(decodedPath).replace(/^(\.\.[\/\\])+/, '')
  let filePath = path.join(distDir, safeRelativePath)

  if (!filePath.startsWith(distDir)) {
    return sendJson(response, 403, { error: 'Access denied.' })
  }

  let stat
  try {
    stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html')
      stat = fs.statSync(filePath)
    }
  } catch {
    stat = null
  }

  if (!stat || !stat.isFile()) {
    const hasExt = path.extname(safeRelativePath).length > 0
    if (hasExt) {
      return sendJson(response, 404, { error: 'File not found.' })
    }
    const indexPath = path.join(distDir, 'index.html')
    if (fs.existsSync(indexPath)) {
      filePath = indexPath
      stat = fs.statSync(filePath)
    } else {
      return sendJson(response, 404, { error: 'Index file not found.' })
    }
  }

  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'
  const isImmutableAsset = decodedPath.startsWith('/assets/')

  const headers = {
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'Cache-Control': isImmutableAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
  }

  if (request.method === 'HEAD') {
    response.writeHead(200, headers)
    return response.end()
  }

  response.writeHead(200, headers)
  const stream = fs.createReadStream(filePath)
  stream.on('error', () => {
    if (!response.headersSent) {
      sendJson(response, 500, { error: 'Error reading file.' })
    }
  })
  stream.pipe(response)
}

export function createRequestHandler(options = {}) {
  const isLimited = options.isRateLimited || createRateLimiter()
  const distDir =
    options.distDir ||
    (fs.existsSync(path.resolve(__dirname, '../../Client/dist'))
      ? path.resolve(__dirname, '../../Client/dist')
      : fs.existsSync(path.resolve(__dirname, '../../dist'))
      ? path.resolve(__dirname, '../../dist')
      : null)

  return async (request, response) => {
    const origin = request.headers.origin || '*'
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin === '*' ? '*' : origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
      Vary: 'Origin',
    }

    if (request.method === 'OPTIONS') {
      response.writeHead(204, {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      })
      return response.end()
    }

    const reqUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`)
    const pathname = reqUrl.pathname

    // 1. Root / health status (used by client getApiStatus)
    if (pathname === '/' && request.method === 'GET') {
      return sendJson(
        response,
        200,
        {
          status: 'ok',
          message: 'AyurSaathi API is running',
          project: 'AyurSaathi',
        },
        corsHeaders
      )
    }

    if ((pathname === '/health' || pathname === '/api/health') && request.method === 'GET') {
      const hasKey = Boolean(
        (process.env.GEMINI_API_KEY || process.env.GEMINI_API || process.env.GOOGLE_API_KEY || '').trim()
      )
      return sendJson(
        response,
        200,
        {
          status: 'ok',
          service: 'ayursaathi-api',
          project: 'AyurSaathi',
          mongoConnected: mongoose.connection.readyState === 1,
          geminiConfigured: hasKey,
        },
        corsHeaders
      )
    }

    // 2. Version endpoint
    if (pathname === '/api/version' && request.method === 'GET') {
      return sendJson(
        response,
        200,
        {
          latestVersion: '1.2.0',
          minVersion: '1.0.0',
          project: 'AyurSaathi',
          releaseNotes: [
            '🌿 Authentic Ayurvedic Dosha and Bio-Energy Guidance',
            '✨ Apple-inspired AyurSaathi Web UI',
            '🤖 Fast Gemini AI with MongoDB Atlas Caching',
            '🧘 Traditional movement & Pranayama practices with video links',
          ],
        },
        corsHeaders
      )
    }

    // 3. Primary Remedy Route: GET /api/remedies/:disease
    if (pathname.startsWith('/api/remedies/') && request.method === 'GET') {
      const rawCondition = pathname.replace('/api/remedies/', '')
      const condition = decodeURIComponent(rawCondition).trim()
      const lang = (reqUrl.searchParams.get('lang') || 'en').toLowerCase().trim()

      if (!condition) {
        return sendJson(response, 400, { error: 'Please enter a health topic or concern.' }, corsHeaders)
      }

      if (isEmergencyQuery(condition)) {
        return sendJson(response, 422, { error: emergencyResponse.message, code: emergencyResponse.code }, corsHeaders)
      }

      const ip = request.socket?.remoteAddress || 'unknown'
      if (isLimited(ip)) {
        return sendJson(
          response,
          429,
          { error: 'Too many searches in a short time. Please wait a moment.' },
          { ...corsHeaders, 'Retry-After': '900' }
        )
      }

      try {
        // Step A: Check MongoDB / memory cache
        const cached = await findCachedGuide(condition, lang)
        if (cached) {
          console.log(`[AyurSaathi API] Returning cached guide for "${condition}" (${lang})`)
          return sendJson(response, 200, cached, corsHeaders)
        }

        // Step B: Generate with Gemini AI
        console.log(`[AyurSaathi API] Generating fresh guide for "${condition}" (${lang})`)
        let guide
        try {
          guide = await generateWellnessGuide(condition, { lang })
        } catch (aiErr) {
          console.warn(`[AyurSaathi API] Gemini AI error:`, aiErr.message)
          guide = getCuratedFallback(condition)
        }

        // Step C: Save to MongoDB asynchronously (no auth needed)
        saveGuide(condition, lang, guide).catch((err) =>
          console.warn('[AyurSaathi API] Async cache error:', err.message)
        )

        return sendJson(response, 200, guide, corsHeaders)
      } catch (error) {
        console.error('[AyurSaathi API] Unhandled error:', error)
        const fallback = getCuratedFallback(condition)
        return sendJson(response, 200, fallback, corsHeaders)
      }
    }

    // 4. Alternate Remedy Route: POST /api/search
    if (pathname === '/api/search' && request.method === 'POST') {
      let body
      try {
        body = await readJsonBody(request)
      } catch (error) {
        return sendJson(response, error.statusCode || 400, { error: error.message }, corsHeaders)
      }

      const parsed = searchRequestSchema.safeParse(body)
      if (!parsed.success) {
        return sendJson(response, 400, { error: 'Enter a topic between 1 and 200 characters.' }, corsHeaders)
      }

      const query = parsed.data.query
      const lang = (parsed.data.lang || 'en').toLowerCase().trim()

      if (isEmergencyQuery(query)) {
        return sendJson(response, 422, { error: emergencyResponse.message, code: emergencyResponse.code }, corsHeaders)
      }

      const ip = request.socket?.remoteAddress || 'unknown'
      if (isLimited(ip)) {
        return sendJson(
          response,
          429,
          { error: 'Too many searches in a short time. Please wait a moment.' },
          { ...corsHeaders, 'Retry-After': '900' }
        )
      }

      try {
        const cached = await findCachedGuide(query, lang)
        if (cached) {
          return sendJson(response, 200, cached, corsHeaders)
        }

        let guide
        try {
          guide = await generateWellnessGuide(query, { lang })
        } catch (aiErr) {
          console.warn(`[AyurSaathi API] Gemini AI error:`, aiErr.message)
          guide = getCuratedFallback(query)
        }

        saveGuide(query, lang, guide).catch((err) =>
          console.warn('[AyurSaathi API] Async cache error:', err.message)
        )

        return sendJson(response, 200, guide, corsHeaders)
      } catch (error) {
        console.error('[AyurSaathi API] Unhandled error:', error)
        const fallback = getCuratedFallback(query)
        return sendJson(response, 200, fallback, corsHeaders)
      }
    }

    // 5. Static file serving (SPA frontend)
    if (distDir && fs.existsSync(distDir)) {
      return serveStaticFile(request, response, distDir)
    }

    return sendJson(response, 404, { error: 'Route not found.' }, corsHeaders)
  }
}

export function createServer(options = {}) {
  const handler = createRequestHandler(options)
  return createHttpServer((req, res) => handler(req, res))
}
