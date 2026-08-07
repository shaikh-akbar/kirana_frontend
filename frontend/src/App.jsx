import { Routes, Route } from 'react-router-dom'
import AppShell from './layout/AppShell'
import Dashboard from './pages/Dashboard'
import POSBilling from './pages/pos/POSBilling'
import WholesaleOrders from './pages/wholesale/WholesaleOrders'
import WholesaleOrderEntry from './pages/wholesale/WholesaleOrderEntry'
import KhataLedger from './pages/khata/KhataLedger'
import Inventory from './pages/inventory/Inventory'
import DailyPricing from './pages/pricing/DailyPricing'
import Purchases from './pages/purchases/Purchases'
import Reports from './pages/reports/Reports'
import Settings from './pages/settings/Settings'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pos" element={<POSBilling />} />
        <Route path="/wholesale" element={<WholesaleOrders />} />
        <Route path="/wholesale/new" element={<WholesaleOrderEntry />} />
        <Route path="/khata" element={<KhataLedger />} />
        <Route path="/khata/:buyerId" element={<KhataLedger />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/pricing" element={<DailyPricing />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
