import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './layout/AppShell'
import { RequireAuth, RequireFirm, RequireRole, RedirectIfAuthenticated } from './components/RouteGuards'
import { ROLES, STAFF_ROLES, ALL_ROLES, getRoleId } from './layout/navItems'
import { useAuth } from './auth/authStore'
import Login from './pages/auth/Login'
import CreateFirm from './pages/firms/CreateFirm'
import Dashboard from './pages/Dashboard'
import POSBilling from './pages/pos/POSBilling'
import BillPrint from './pages/pos/BillPrint'
import WholesaleOrders from './pages/wholesale/WholesaleOrders'
import WholesaleOrderEntry from './pages/wholesale/WholesaleOrderEntry'
import KhataLedger from './pages/khata/KhataLedger'
import Catalog from './pages/catalog/Catalog'
import Inventory from './pages/inventory/Inventory'
import DailyPricing from './pages/pricing/DailyPricing'
import Purchases from './pages/purchases/Purchases'
import Reports from './pages/reports/Reports'
import Settings from './pages/settings/Settings'

/** RETAILER has no dashboard — POS Billing is their landing page instead. */
function Home() {
  const { user } = useAuth()
  if (getRoleId(user?.roleName) === ROLES.RETAILER) return <Navigate to="/pos" replace />
  return <Dashboard />
}

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuthenticated>
            <Login />
          </RedirectIfAuthenticated>
        }
      />

      <Route element={<RequireAuth />}>
        {/* Outside the app shell on purpose: an owner with no firm yet has no
            firm for the topbar to switch between, and every shell request would
            go out without an X-Firm-Id header. ADMIN-only: a RETAILER/WHOLESALER
            with no firm gets NoFirmAccess instead (see RequireFirm) — they must
            be added by an existing firm's admin, not create their own. */}
        <Route element={<RequireRole allow={[ROLES.ADMIN]} />}>
          <Route path="/onboarding/firm" element={<CreateFirm />} />
        </Route>

        <Route element={<RequireFirm />}>
          <Route element={<AppShell />}>
            {/* No RequireRole gate: Home itself redirects RETAILER to /pos. */}
            <Route path="/" element={<Home />} />

            <Route element={<RequireRole allow={ALL_ROLES} />}>
              <Route path="/pos" element={<POSBilling />} />
              <Route path="/bills/:orderId" element={<BillPrint />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/pricing" element={<DailyPricing />} />
            </Route>

            <Route element={<RequireRole allow={STAFF_ROLES} />}>
              <Route path="/khata" element={<KhataLedger />} />
              <Route path="/khata/:buyerId" element={<KhataLedger />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/wholesale" element={<WholesaleOrders />} />
              <Route path="/wholesale/new" element={<WholesaleOrderEntry />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/purchases" element={<Purchases />} />
            </Route>

            <Route element={<RequireRole allow={[ROLES.ADMIN]} />}>
              <Route path="/settings" element={<Settings />} />
              <Route path="/firms/new" element={<CreateFirm />} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
