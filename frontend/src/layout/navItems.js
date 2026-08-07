import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import SellRoundedIcon from '@mui/icons-material/SellRounded'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'

export const navItems = [
  { label: 'Dashboard', path: '/', icon: DashboardRoundedIcon },
  { label: 'POS Billing', path: '/pos', icon: PointOfSaleRoundedIcon },
  { label: 'Wholesale Orders', path: '/wholesale', icon: LocalShippingRoundedIcon },
  { label: 'Khata Ledger', path: '/khata', icon: AccountBalanceWalletRoundedIcon },
  { label: 'Inventory', path: '/inventory', icon: Inventory2RoundedIcon },
  { label: 'Daily Pricing', path: '/pricing', icon: SellRoundedIcon },
  { label: 'Purchases', path: '/purchases', icon: ShoppingCartRoundedIcon },
  { label: 'Reports', path: '/reports', icon: BarChartRoundedIcon },
  { label: 'Settings', path: '/settings', icon: SettingsRoundedIcon },
]

// Priority items shown in the bottom tab bar below 768px; the rest live behind "More".
export const mobilePrimaryPaths = ['/', '/pos', '/wholesale', '/khata']
