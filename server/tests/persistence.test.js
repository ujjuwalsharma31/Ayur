import assert from 'node:assert/strict'
import test from 'node:test'
import { findCachedGuide, saveGuide } from '../src/persistence.js'

test('saves and retrieves guides from in-memory fallback cache', async () => {
  const guide = {
    diseaseName: 'headache',
    ayurvedicAnalysis: 'Pitta heat and Vata tension in the head.',
    healthTip: 'Stay in a dark, quiet room and stay hydrated.',
    homeRemedies: [
      {
        remedyName: 'Coriander Seed Tea',
        ingredients: ['1 tsp coriander seeds', '1 cup water'],
        preparationSteps: ['Boil seeds in water for 5 minutes', 'Strain and sip warm'],
      },
    ],
    yoga: [
      {
        asanaName: 'Shavasana',
        howToDo: ['Lie flat on back and relax all muscles'],
        duration: '10 min',
      },
    ],
    doctorAdvice: 'See a doctor for severe thunderclap headaches.',
    source: 'ai',
  }

  const saveResult = await saveGuide('headache', 'en', guide)
  assert.ok(saveResult.status === 'saved' || saveResult.status === 'memory_only')

  const retrieved = await findCachedGuide('headache', 'en')
  assert.ok(retrieved !== null)
  assert.equal(retrieved.diseaseName, 'headache')
  assert.equal(retrieved.homeRemedies[0].remedyName, 'Coriander Seed Tea')
})
