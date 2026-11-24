import { z } from 'zod'

const text = z.string().trim().min(1).max(1200)
const stringList = z.array(text).max(10)

export const ayurvedicRemedySchema = z.object({
  diseaseName: text.optional(),
  ayurvedicAnalysis: text.optional(),
  summary: text.optional(),
  healthTip: text.optional(),
  homeRemedies: z.array(
    z.object({
      remedyName: text.optional(),
      title: text.optional(),
      summary: text.optional(),
      ingredients: z.union([
        z.array(text),
        z.array(z.object({ name: text, amount: text.optional() })),
      ]),
      preparationSteps: stringList.optional(),
      steps: stringList.optional(),
      usage: text.optional(),
      precautions: stringList.optional(),
    })
  ).optional(),
  yoga: z.array(
    z.object({
      asanaName: text.optional(),
      title: text.optional(),
      summary: text.optional(),
      duration: text.optional(),
      durationMinutes: z.number().int().min(1).max(60).optional(),
      howToDo: stringList.optional(),
      steps: stringList.optional(),
      precautions: stringList.optional(),
      imageKeyword: text.optional(),
      youtubeSearchQuery: text.optional(),
    })
  ).optional(),
  doctorAdvice: text.optional(),
  safetyNote: text.optional(),
})

export const wellnessGuideJsonSchema = {
  type: 'object',
  properties: {
    ayurvedicAnalysis: {
      type: 'string',
      description: 'Authentic Ayurvedic analysis explaining dosha imbalance (Vata, Pitta, Kapha) in 2 clear sentences.',
    },
    healthTip: {
      type: 'string',
      description: 'A practical daily Ayurvedic lifestyle or dietary tip.',
    },
    homeRemedies: {
      type: 'array',
      description: '2 to 3 gentle Ayurvedic kitchen remedies.',
      items: {
        type: 'object',
        properties: {
          remedyName: { type: 'string', description: 'Name of the Ayurvedic remedy' },
          ingredients: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of ingredients with everyday home kitchen measures',
          },
          preparationSteps: {
            type: 'array',
            items: { type: 'string' },
            description: 'Clear step-by-step instructions for preparation',
          },
          usage: { type: 'string', description: 'How and when to consume or apply' },
          precautions: { type: 'array', items: { type: 'string' } },
        },
        required: ['remedyName', 'ingredients', 'preparationSteps'],
      },
    },
    yoga: {
      type: 'array',
      description: '1 to 2 gentle yoga asanas or pranayama practices.',
      items: {
        type: 'object',
        properties: {
          asanaName: { type: 'string', description: 'Name of the yoga pose or pranayama' },
          duration: { type: 'string', description: 'Duration, e.g. 5-10 min' },
          durationMinutes: { type: 'integer', description: 'Duration in minutes' },
          howToDo: {
            type: 'array',
            items: { type: 'string' },
            description: 'Safe step-by-step guidance to practice the pose',
          },
          imageKeyword: { type: 'string', description: '2-3 word English visual keyword for yoga pose' },
          youtubeSearchQuery: { type: 'string', description: 'Search query for video tutorial' },
          precautions: { type: 'array', items: { type: 'string' } },
        },
        required: ['asanaName', 'howToDo', 'duration'],
      },
    },
    doctorAdvice: {
      type: 'string',
      description: 'Clear advice on when to consult a qualified healthcare professional.',
    },
  },
  required: ['ayurvedicAnalysis', 'healthTip', 'homeRemedies', 'yoga', 'doctorAdvice'],
}

export const safetyNote =
  'AyurSaathi shares general wellness education rooted in Ayurvedic tradition and is not a substitute for professional medical advice, diagnosis, or treatment.'
