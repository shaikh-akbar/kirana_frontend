import axios from 'axios'

// Vite proxies /api to the backend in dev (see vite.config.js), so the default
// works without any env file. Set VITE_API_BASE_URL for a deployed build.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const TOKEN_KEY = 'kirana-erp-token'
const FIRM_KEY = 'kirana-erp-firm-id'

/*
 * Auth token and active firm live in localStorage rather than only in React
 * state so the request interceptor can read them synchronously, without the
 * client module having to import React context. They survive a page reload,
 * which is the whole point of a session.
 */
export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) window.localStorage.setItem(TOKEN_KEY, token)
  else window.localStorage.removeItem(TOKEN_KEY)
}

export function getActiveFirmId() {
  const raw = window.localStorage.getItem(FIRM_KEY)
  return raw ? Number(raw) : null
}

export function setActiveFirmId(firmId) {
  if (firmId) window.localStorage.setItem(FIRM_KEY, String(firmId))
  else window.localStorage.removeItem(FIRM_KEY)
}

export const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Every firm-scoped route reads this header. Sent on all requests: the
  // handful that ignore it (login, GET /firms) are unharmed by its presence,
  // and this way no call site has to remember to attach it.
  const firmId = getActiveFirmId()
  if (firmId) config.headers['X-Firm-Id'] = firmId

  return config
})

/**
 * Subscriber the AuthProvider registers so an expired token can clear React
 * state too, not just localStorage — otherwise the UI would keep rendering a
 * logged-in shell while every request 401s.
 */
let onUnauthorized = null
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    // A 401 on the login request itself is "wrong password", not an expired
    // session — logging the user out there would be circular.
    const isLoginAttempt = error.config?.url?.includes('/auth/login')

    if (status === 401 && !isLoginAttempt) {
      setToken(null)
      if (onUnauthorized) onUnauthorized()
    }

    return Promise.reject(error)
  }
)

/**
 * The backend wraps every success in { success, statusCode, message, data }.
 * Unwrapping here keeps `data` destructuring out of every component.
 */
export function unwrap(response) {
  return response.data?.data
}

/**
 * Turns an axios failure into the message the API actually sent, falling back
 * through validation details to a generic line. Components show this directly.
 */
export function apiErrorMessage(error, fallback = 'Something went wrong') {
  const payload = error.response?.data
  if (payload?.details?.length) {
    return payload.details.map((d) => d.msg).join(', ')
  }
  if (payload?.message) return payload.message
  if (error.message === 'Network Error') return 'Cannot reach the server — is the backend running?'
  return fallback
}
