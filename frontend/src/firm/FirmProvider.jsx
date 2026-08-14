import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, unwrap, getActiveFirmId, setActiveFirmId } from '../api/client'
import { useAuth } from '../auth/authStore'
import { FirmContext } from './firmStore'

// Stable identity so the context value's useMemo doesn't see a new array on
// every render while no firms are loaded.
const NO_FIRMS = []

/**
 * Which firm's books the app is showing.
 *
 * `status`:
 *   'idle'    - not signed in, nothing fetched
 *   'loading' - fetching this user's firms
 *   'ready'   - fetched (may be an empty list — a brand-new owner has no firm
 *               yet, which routing turns into the create-firm screen)
 *   'error'   - the fetch failed
 *
 * The load result is tagged with the user it belongs to, and everything the
 * context exposes is derived from that tag rather than reset in an effect. That
 * way signing out or switching accounts cannot expose the previous user's firms
 * for even one render.
 *
 * The selected firm id is mirrored into localStorage because the axios
 * interceptor reads it there on every request; React state alone would not
 * survive a reload and the first request after refresh would go out unscoped.
 */
export function FirmProvider({ children }) {
  const { status: authStatus, user } = useAuth()
  // { userId, firms } on success, { userId, error } on failure.
  const [load, setLoad] = useState(null)
  const [selectedFirmId, setSelectedFirmId] = useState(() => getActiveFirmId())

  const isSignedIn = authStatus === 'authenticated'
  const userId = user?.id ?? null
  const current = isSignedIn && load?.userId === userId ? load : null

  const status = !isSignedIn ? 'idle' : current ? (current.error ? 'error' : 'ready') : 'loading'
  const firms = current?.firms ?? NO_FIRMS
  const activeFirmId = isSignedIn ? selectedFirmId : null
  const error = current?.error ?? null

  // Written as a promise chain rather than async/await so every setState sits
  // inside a .then callback — the shape react-hooks/set-state-in-effect
  // recognises as asynchronous when this is called from the effect below.
  const loadFirms = useCallback(() => {
    if (!userId) return Promise.resolve(NO_FIRMS)

    return api
      .get('/firms')
      .then((res) => {
        const list = unwrap(res) || []

        // Reconcile the stored selection against what this user can actually
        // reach: a firm may have been removed or access revoked, and a stale id
        // would make every subsequent request 404.
        const stored = getActiveFirmId()
        const storedIsValid = stored && list.some((f) => f.id === stored)
        const fallback = list.find((f) => f.isDefault) || list[0]
        const chosen = storedIsValid ? stored : fallback?.id ?? null

        setActiveFirmId(chosen)
        setSelectedFirmId(chosen)
        setLoad({ userId, firms: list })
        return list
      })
      .catch((err) => {
        setLoad({ userId, error: err })
        return NO_FIRMS
      })
  }, [userId])

  useEffect(() => {
    if (!isSignedIn) return
    loadFirms()
  }, [isSignedIn, loadFirms])

  const switchFirm = useCallback((firmId) => {
    setActiveFirmId(firmId)
    setSelectedFirmId(firmId)
  }, [])

  /** Creates a firm and makes it active, so the UI lands inside the new firm. */
  const createFirm = useCallback(
    async (payload) => {
      const firm = unwrap(await api.post('/firms', payload))
      await loadFirms()
      switchFirm(firm.id)
      return firm
    },
    [loadFirms, switchFirm]
  )

  const activeFirm = useMemo(
    () => firms.find((f) => f.id === activeFirmId) || null,
    [firms, activeFirmId]
  )

  const value = useMemo(
    () => ({
      firms,
      activeFirm,
      activeFirmId,
      status,
      error,
      switchFirm,
      createFirm,
      refreshFirms: loadFirms,
      hasNoFirms: status === 'ready' && firms.length === 0,
    }),
    [firms, activeFirm, activeFirmId, status, error, switchFirm, createFirm, loadFirms]
  )

  return <FirmContext.Provider value={value}>{children}</FirmContext.Provider>
}
