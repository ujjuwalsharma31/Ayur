import assert from 'node:assert/strict'
import test from 'node:test'
import { generateWellnessGuide } from '../src/gemini.js'

const validModelGuide = {
  diseaseName: 'cold',
  ayurvedicAnalysis: 'Vata and Kapha imbalance causes coldness and mucus accumulation.',
  healthTip: 'Sip warm ginger water throughout the day.',
  homeRemedies: [
    {
      remedyName: 'Tulsi Ginger Infusion',
      ingredients: ['1 inch fresh ginger', '5-6 fresh tulsi leaves', '1 cup warm water'],
      preparationSteps: ['Boil ginger and tulsi in water for 5 minutes', 'Strain and sip warm'],
    },
  ],
  yoga: [
    {
      asanaName: 'Bhujangasana',
      howToDo: ['Lie flat on stomach', 'Gently lift chest with hands beside shoulders'],
      duration: '5 min',
      durationMinutes: 5,
    },
  ],
  doctorAdvice: 'Seek clinical care if high fever or shortness of breath develops.',
}

test('generates and validates an AyurSaathi wellness guide', async () => {
  let request
  const client = {
    models: {
      generateContent: async (value) => {
        request = value
        return { text: JSON.stringify(validModelGuide) }
      },
    },
  }

  const guide = await generateWellnessGuide('cold relief', {
    apiKey: 'test-key',
    model: 'gemini-3.5-flash',
    client,
  })

  assert.equal(request.model, 'gemini-3.5-flash')
  assert.equal(request.config.responseMimeType, 'application/json')
  assert.equal(guide.diseaseName, 'cold relief')
  assert.equal(guide.homeRemedies.length, 1)
  assert.equal(guide.homeRemedies[0].remedyName, 'Tulsi Ginger Infusion')
  assert.equal(guide.yoga[0].asanaName, 'Bhujangasana')
  assert.match(guide.ayurvedicAnalysis, /imbalance/i)
  assert.equal(guide.source, 'ai')
})

test('rejects malformed JSON and throws descriptive error', async () => {
  const malformedClient = {
    models: { generateContent: async () => ({ text: 'not-json-content' }) },
  }
  await assert.rejects(
    generateWellnessGuide('cold', { apiKey: 'test-key', client: malformedClient }),
    /unreadable JSON/i
  )
})
