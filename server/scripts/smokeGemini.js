import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateWellnessGuide } from '../src/gemini.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPaths = [path.resolve(__dirname, '../.env'), path.resolve(__dirname, '../../.env')]
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    try {
      process.loadEnvFile(envPath)
    } catch {}
  }
}

try {
  const guide = await generateWellnessGuide('mild cold and sore throat', { lang: 'en' })
  console.log(
    JSON.stringify({
      ok: true,
      service: 'AyurSaathi',
      model: guide.modelVersion,
      disease: guide.diseaseName,
      remedies: guide.homeRemedies.length,
      yogaPractices: guide.yoga.length,
      analysisLength: guide.ayurvedicAnalysis.length,
    })
  )
} catch (error) {
  const safeMessage = String(error?.message || 'Gemini request failed')
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, '[redacted-key]')
    .slice(0, 500)
  console.error(JSON.stringify({ ok: false, error: error?.name || 'GeminiRequestError', detail: safeMessage }))
  process.exitCode = 1
}
