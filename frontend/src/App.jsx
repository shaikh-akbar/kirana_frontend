import { Routes, Route } from 'react-router-dom'
import AppShell from './layout/AppShell'
import { RequireAuth, RequireFirm, RedirectIfAuthenticated } from './components/RouteGuards'
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
            go out without an X-Firm-Id header. */}
        <Route path="/onboarding/firm" element={<CreateFirm />} />

        <Route element={<RequireFirm />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pos" element={<POSBilling />} />
            <Route path="/bills/:orderId" element={<BillPrint />} />
            <Route path="/wholesale" element={<WholesaleOrders />} />
            <Route path="/wholesale/new" element={<WholesaleOrderEntry />} />
            <Route path="/khata" element={<KhataLedger />} />
            <Route path="/khata/:buyerId" element={<KhataLedger />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/pricing" element={<DailyPricing />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/firms/new" element={<CreateFirm />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
