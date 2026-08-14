import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  api,
  unwrap,
  getToken,
  setToken,
  setActiveFirmId,
  setUnauthorizedHandler,
} from '../api/client'
import { AuthContext } from './authStore'

/**
 * Session state. `status` drives routing:
 *   'loading'       - a stored token is being validated; render nothing routable
 *                     yet, or a refresh would flash the login screen
 *   'authenticated' - user is set
 *   'anonymous'     - no valid token
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState(() => (getToken() ? 'loading' : 'anonymous'))

  const clearSession = useCallback(() => {
    setToken(null)
    setActiveFirmId(null)
    setUser(null)
    setStatus('anonymous')
  }, [])

  // Lets the axios 401 interceptor drop React state as well, so an expired
  // token doesn't leave a logged-in shell rendering over failing requests.
  useEffect(() => {
    setUnauthorizedHandler(clearSession)
    return () => setUnauthorizedHandler(null)
  }, [clearSession])

  // Validate a token left over from a previous visit.
  useEffect(() => {
    if (!getToken()) return

    let active = true
    api
      .get('/auth/me')
      .then((res) => {
        if (!active) return
        setUser(unwrap(res))
        setStatus('authenticated')
      })
      .catch(() => {
        // The 401 interceptor already cleared the token; anything else (server
        // down) also leaves us unable to prove a session.
        if (active) clearSession()
      })

    return () => {
      active = false
    }
  }, [clearSession])

  const login = useCallback(async (phone, password) => {
    const res = await api.post('/auth/login', { phone, password })
    const { token, user: loggedInUser } = unwrap(res)
    setToken(token)
    setUser(loggedInUser)
    setStatus('authenticated')
    return loggedInUser
  }, [])

  const value = useMemo(
    () => ({ user, status, login, logout: clearSession }),
    [user, status, login, clearSession]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
