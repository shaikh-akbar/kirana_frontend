import { useCallback, useEffect, useState } from 'react'
import { apiErrorMessage } from './client'

/**
 * Loads one API resource and keeps it honest about which key it belongs to.
 *
 * Nearly every screen is firm-scoped, so switching firms must not leave the
 * previous firm's numbers on screen while the new ones load. The obvious fix —
 * clearing state at the top of the effect — is exactly the cascading-render
 * pattern `react-hooks/set-state-in-effect` rejects, so instead the result is
 * *tagged* with the key it was fetched for and everything below is derived:
 * a result whose tag no longer matches simply reads as "still loading". This
 * mirrors how FirmProvider tags its firm list with the user it belongs to.
 *
 * `loader` must be stable (wrap it in useCallback), or the effect will refire
 * on every render.
 *
 * @param {string|number|null} key   Refetch when this changes; null = don't fetch.
 * @param {() => Promise<any>} loader
 */
export function useResource(key, loader, fallbackMessage = 'Could not load this data') {
  const [load, setLoad] = useState(null)
  // Bumped by reload(); folded into the tag so a manual refresh also clears the
  // stale value rather than leaving it under a spinner.
  const [attempt, setAttempt] = useState(0)

  const token = key == null ? null : `${key}#${attempt}`

  useEffect(() => {
    if (token == null) return undefined
    let active = true
    loader()
      .then((data) => {
        if (active) setLoad({ token, data })
      })
      .catch((err) => {
        if (active) setLoad({ token, error: apiErrorMessage(err, fallbackMessage) })
      })
    return () => {
      active = false
    }
  }, [token, loader, fallbackMessage])

  const current = load && load.token === token ? load : null
  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  return {
    data: current?.error ? null : current?.data ?? null,
    error: current?.error ?? null,
    loading: token != null && !current,
    reload,
  }
}
