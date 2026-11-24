import mongoose from 'mongoose'

// In-memory cache fallback if MongoDB is temporarily unreachable
const memoryCache = new Map()

const remedySchema = new mongoose.Schema(
  {
    query: { type: String, required: true, lowercase: true, trim: true, index: true },
    diseaseName: { type: String, lowercase: true, trim: true },
    language: { type: String, default: 'en', index: true },
    ayurvedicAnalysis: { type: String, default: '' },
    summary: { type: String, default: '' },
    healthTip: { type: String, default: '' },
    homeRemedies: [
      {
        remedyName: { type: String, default: '' },
        title: { type: String, default: '' },
        summary: { type: String, default: '' },
        ingredients: [mongoose.Schema.Types.Mixed],
        preparationSteps: [String],
        steps: [String],
        usage: { type: String, default: '' },
        precautions: [String],
      },
    ],
    remedies: [
      {
        remedyName: { type: String, default: '' },
        title: { type: String, default: '' },
        summary: { type: String, default: '' },
        ingredients: [mongoose.Schema.Types.Mixed],
        preparationSteps: [String],
        steps: [String],
        usage: { type: String, default: '' },
        precautions: [String],
      },
    ],
    yoga: [
      {
        asanaName: { type: String, default: '' },
        title: { type: String, default: '' },
        summary: { type: String, default: '' },
        duration: { type: String, default: '' },
        durationMinutes: { type: Number, default: 10 },
        howToDo: [String],
        steps: [String],
        precautions: [String],
        imageKeyword: { type: String, default: '' },
        youtubeSearchQuery: { type: String, default: '' },
      },
    ],
    doctorAdvice: { type: String, default: '' },
    safetyNote: { type: String, default: '' },
    modelVersion: { type: String, default: '' },
    source: { type: String, default: 'ai' },
  },
  { timestamps: true }
)

// Compound index for quick condition + language lookups
remedySchema.index({ query: 1, language: 1 })

export const RemedyModel = mongoose.models.Remedy || mongoose.model('Remedy', remedySchema)

/**
 * Initialize MongoDB connection
 */
export async function connectMongo(uri = process.env.MONGODB_URI) {
  if (!uri) {
    console.warn('[AyurSaathi DB] MONGODB_URI not provided. Operating in in-memory mode.')
    return false
  }
  if (mongoose.connection.readyState === 1) {
    return true
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    })
    console.log('[AyurSaathi DB] Connected to MongoDB Atlas.')
    return true
  } catch (error) {
    console.warn('[AyurSaathi DB] Connection warning:', error.message)
    return false
  }
}

/**
 * Find cached guide in MongoDB or in-memory fallback
 */
export async function findCachedGuide(query, language = 'en') {
  const normalizedQuery = (query || '').toLowerCase().trim()
  const lang = (language || 'en').toLowerCase().trim()
  const cacheKey = `${normalizedQuery}::${lang}`

  // Check in-memory cache first
  if (memoryCache.has(cacheKey)) {
    return { ...memoryCache.get(cacheKey), source: 'cache' }
  }

  // Check MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await RemedyModel.findOne({ query: normalizedQuery, language: lang }).maxTimeMS(2500).lean()
      if (doc) {
        memoryCache.set(cacheKey, doc)
        return { ...doc, source: 'database' }
      }
    } catch (err) {
      console.warn('[AyurSaathi DB] Query warning:', err.message)
    }
  }

  return null
}

/**
 * Save guide to MongoDB and memory cache (no auth required)
 */
export async function saveGuide(query, language = 'en', guide = {}) {
  const normalizedQuery = (query || '').toLowerCase().trim()
  const lang = (language || 'en').toLowerCase().trim()
  const cacheKey = `${normalizedQuery}::${lang}`

  const dataToSave = {
    query: normalizedQuery,
    diseaseName: guide.diseaseName || normalizedQuery,
    language: lang,
    ayurvedicAnalysis: guide.ayurvedicAnalysis || guide.summary || '',
    summary: guide.summary || guide.ayurvedicAnalysis || '',
    healthTip: guide.healthTip || guide.summary || '',
    homeRemedies: guide.homeRemedies || guide.remedies || [],
    remedies: guide.remedies || guide.homeRemedies || [],
    yoga: guide.yoga || [],
    doctorAdvice: guide.doctorAdvice || guide.safetyNote || '',
    safetyNote: guide.safetyNote || guide.doctorAdvice || '',
    modelVersion: guide.modelVersion || '',
    source: guide.source || 'ai',
  }

  // Always update memory cache
  memoryCache.set(cacheKey, dataToSave)

  // Save/upsert to MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await RemedyModel.findOneAndUpdate(
        { query: normalizedQuery, language: lang },
        dataToSave,
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      )
      return { status: 'saved' }
    } catch (err) {
      console.warn('[AyurSaathi DB] Save warning:', err.message)
      return { status: 'memory_only' }
    }
  }

  return { status: 'memory_only' }
}
