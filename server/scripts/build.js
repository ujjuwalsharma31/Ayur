import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDistCandidates = [
  path.resolve(__dirname, '../../Client/dist'),
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../dist'),
]

const targetDist = path.resolve(__dirname, '../../dist')

for (const clientDist of clientDistCandidates) {
  if (fs.existsSync(clientDist)) {
    fs.rmSync(targetDist, { recursive: true, force: true })
    fs.cpSync(clientDist, targetDist, { recursive: true })
    console.log(`✓ Synced ${clientDist} to ${targetDist} for deployment.`)
    break
  }
}

console.log('✓ Server build step completed.')
