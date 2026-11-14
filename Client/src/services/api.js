import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://ayursathi.onrender.com',
  timeout: 90000,
  headers: { Accept: 'application/json' },
})

export async function getRemedy(condition, language = 'en') {
  const { data } = await api.get(`/api/remedies/${encodeURIComponent(condition)}`, { params: { lang: language } })
  return data
}

export async function getApiStatus() {
  const { data } = await api.get('/')
  return data
}
