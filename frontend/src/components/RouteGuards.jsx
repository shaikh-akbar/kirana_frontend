import { Box, CircularProgress } from '@mui/material'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/authStore'
import { useFirm } from '../firm/firmStore'
import { getRoleId, ROLES } from '../layout/navItems'
import NoFirmAccess from '../pages/firms/NoFirmAccess'

function FullPageSpinner() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress />
    </Box>
  )
}

/**
 * Blocks everything until a session is proven. While a stored token is being
 * validated we must render a spinner, not the login screen — otherwise every
 * page reload flashes "sign in" before landing back where the user was.
 */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullPageSpinner />
  if (status === 'anonymous') {
    // Remember the attempted path so login can return the user to it.
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

/**
 * Guards the firm-scoped app. A signed-in ADMIN with no firm yet is not an
 * error state — it is onboarding, so send them to create their first firm
 * instead of rendering a dashboard whose every request would 400 for want of
 * an X-Firm-Id header.
 *
 * A RETAILER/WHOLESALER with no firm is a different situation: they can't
 * create one for themselves (that would make them an owner) — only an
 * existing firm's ADMIN can grant them access, via Settings > Add staff. So
 * they get a "wait for your admin" screen instead of the create-firm form.
 */
export function RequireFirm() {
  const { status, hasNoFirms, activeFirmId } = useFirm()
  const { user } = useAuth()

  if (status === 'idle' || status === 'loading') return <FullPageSpinner />

  if (hasNoFirms) {
    if (getRoleId(user?.roleName) === ROLES.ADMIN) return <Navigate to="/onboarding/firm" replace />
    return <NoFirmAccess />
  }

  // 'error' falls through: the shell renders and each page surfaces its own
  // failure, which beats a dead-end screen with no way back.
  if (status === 'ready' && !activeFirmId) return <Navigate to="/onboarding/firm" replace />

  return <Outlet />
}

/** Keeps a signed-in user off the login screen. */
export function RedirectIfAuthenticated({ children }) {
  const { status } = useAuth()

  if (status === 'loading') return <FullPageSpinner />
  if (status === 'authenticated') return <Navigate to="/" replace />
  return children
}

/**
 * Gates a route by role. Reads roleName off the in-memory `user` (populated
 * from /auth/login and re-validated via /auth/me), not localStorage — so a
 * role change on the backend takes effect on next load instead of trusting a
 * stale copy on the client. `allow` is a list of numeric ROLES ids (see
 * layout/navItems.js), matched against the roleName translated via getRoleId.
 */
export function RequireRole({ allow }) {
  const { user } = useAuth()

  if (!allow.includes(getRoleId(user?.roleName))) return <Navigate to="/" replace />
  return <Outlet />
}
