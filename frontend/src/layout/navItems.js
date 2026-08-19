import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import SellRoundedIcon from '@mui/icons-material/SellRounded'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'

// Numeric IDs for nav/route gating — a frontend-only convention, mirrored to
// match the DB's roles.id values (1 Admin, 2 Retailer, 3 Wholesaler, 4 Buyer).
// The backend's string roleName is ADMIN / WHOLESALER / RETAILER / BUYER.
// ADMIN and WHOLESALER are internal staff (WHOLESALER is the broad role that
// used to be SALES_REP); RETAILER is a narrow, orders-only staff role. BUYER
// accounts can never log in (see migration 002), so they never reach the app.
export const ROLES = {
  ADMIN: 1,
  RETAILER: 2,
  WHOLESALER: 3,
  BUYER: 4,
}

const ROLE_ID_BY_NAME = {
  ADMIN: ROLES.ADMIN,
  RETAILER: ROLES.RETAILER,
  WHOLESALER: ROLES.WHOLESALER,
  BUYER: ROLES.BUYER,
}

// Translates the backend's string roleName into our numeric convention, so
// every gate below compares IDs instead of re-checking the string everywhere.
export function getRoleId(roleName) {
  return ROLE_ID_BY_NAME[roleName]
}

export const STAFF_ROLES = [ROLES.ADMIN, ROLES.WHOLESALER]
export const ALL_ROLES = [ROLES.ADMIN, ROLES.WHOLESALER, ROLES.RETAILER]

// Each item's `roles` list is the single source of truth for who sees it in
// the sidebar/tab bar AND who can reach its route — App.jsx reads the same
// arrays to build the RequireRole guards, so the two can't drift apart. Kept
// in sync with the backend's authorize() calls per route module.
export const navItems = [
  // RETAILER has no dashboard — POS Billing is their landing page instead
  // (see the Home redirect in App.jsx).
  { label: 'Dashboard', path: '/', icon: DashboardRoundedIcon, roles: STAFF_ROLES },
  { label: 'POS Billing', path: '/pos', icon: PointOfSaleRoundedIcon, roles: ALL_ROLES },
  { label: 'Wholesale Orders', path: '/wholesale', icon: LocalShippingRoundedIcon, roles: STAFF_ROLES },
  { label: 'Khata Ledger', path: '/khata', icon: AccountBalanceWalletRoundedIcon, roles: STAFF_ROLES },
  { label: 'Catalog', path: '/catalog', icon: CategoryRoundedIcon, roles: STAFF_ROLES },
  { label: 'Inventory', path: '/inventory', icon: Inventory2RoundedIcon, roles: ALL_ROLES },
  { label: 'Daily Pricing', path: '/pricing', icon: SellRoundedIcon, roles: ALL_ROLES },
  { label: 'Purchases', path: '/purchases', icon: ShoppingCartRoundedIcon, roles: STAFF_ROLES },
  { label: 'Reports', path: '/reports', icon: BarChartRoundedIcon, roles: STAFF_ROLES },
  { label: 'Settings', path: '/settings', icon: SettingsRoundedIcon, roles: [ROLES.ADMIN] },
]

// Priority items shown in the bottom tab bar below 768px; the rest live behind "More".
export const mobilePrimaryPaths = ['/', '/pos', '/wholesale', '/khata']
