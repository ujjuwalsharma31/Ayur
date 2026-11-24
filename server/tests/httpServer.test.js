import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { createServer } from '../src/httpServer.js'

async function withServer(server, run) {
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const { port } = server.address()
  try {
    await run(`http://127.0.0.1:${port}`)
  } finally {
    server.close()
    await once(server, 'close')
  }
}

test('GET / returns ok status for frontend getApiStatus', async () => {
  const server = createServer()
  await withServer(server, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.status, 'ok')
    assert.equal(body.project, 'AyurSaathi')
  })
})

test('GET /api/remedies/:disease returns remedies with CORS headers', async () => {
  const server = createServer()
  await withServer(server, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/remedies/headache`, {
      headers: { Origin: 'http://localhost:5173' },
    })
    assert.equal(res.status, 200)
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5173')
    const data = await res.json()
    assert.ok(data.homeRemedies.length > 0)
    assert.ok(data.yoga.length > 0)
    assert.ok(data.ayurvedicAnalysis.length > 0)
  })
})

test('OPTIONS preflight returns 204 with permissive CORS', async () => {
  const server = createServer()
  await withServer(server, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/remedies/headache`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://my-app.vercel.app',
        'Access-Control-Request-Method': 'GET',
      },
    })
    assert.equal(res.status, 204)
    assert.equal(res.headers.get('access-control-allow-origin'), 'https://my-app.vercel.app')
  })
})

test('intercepts emergency symptoms with urgent care guidance', async () => {
  const server = createServer()
  await withServer(server, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/remedies/severe%20crushing%20chest%20pain`)
    assert.equal(res.status, 422)
    const body = await res.json()
    assert.equal(body.code, 'urgent_care')
    assert.match(body.error, /emergency/i)
  })
})
