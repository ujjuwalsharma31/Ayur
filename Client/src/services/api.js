import axios from 'axios'

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : 'https://ayur-txyn.onrender.com')

// Strip trailing slashes to prevent double slashes (e.g. //api/...)
const baseURL = rawBaseUrl.replace(/\/+$/, '')

const api = axios.create({
  baseURL,
  timeout: 90000,
  headers: { Accept: 'application/json' },
})

export async function getRemedy(condition, language = 'en') {
  const cleanCondition = (condition || '').trim()
  const cleanLang = (language || 'en').trim()

  try {
    const { data } = await api.get(`/api/remedies/${encodeURIComponent(cleanCondition)}`, {
      params: { lang: cleanLang },
    })
    return data
  } catch (getErr) {
    // Graceful fallback to search POST endpoint if GET encounters an issue
    try {
      const { data } = await api.post('/api/search', {
        query: cleanCondition,
        lang: cleanLang,
      })
      return data
    } catch {
      throw getErr
    }
  }
}

export async function getApiStatus() {
  const { data } = await api.get('/')
  return data
}
