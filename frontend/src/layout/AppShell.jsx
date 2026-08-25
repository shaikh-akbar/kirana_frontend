import { useState } from 'react'
import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileTabBar from './MobileTabBar'
import { useFirm } from '../firm/firmStore'
import { useAuth } from '../auth/authStore'
import { ROLES, getRoleId, navItems, wholesaleNavGroups } from './navItems'

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const { activeFirmId } = useFirm()
  const { user } = useAuth()
  const roleId = getRoleId(user?.roleName)
  const isWholesaler = roleId === ROLES.WHOLESALER
  const isRetailer = roleId === ROLES.RETAILER

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {!isWholesaler && !isRetailer && <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />}
      <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar
          onMenuClick={() => setCollapsed((c) => !c)}
          navGroups={isWholesaler ? wholesaleNavGroups : undefined}
          flatItems={isRetailer ? navItems.filter((item) => item.roles.includes(ROLES.RETAILER)) : undefined}
        />
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            p: { xs: 2, sm: 3 },
            pb: { xs: 10, md: 3 },
          }}
        >
          {/* Keying on the active firm remounts the page when firms are
              switched, so every screen re-fetches for the new firm. Without it
              each page would have to add activeFirmId to its own effect
              dependencies and one omission would silently show another firm's
              numbers. */}
          <Outlet key={activeFirmId} />
        </Box>
        <MobileTabBar />
      </Box>
    </Box>
  )
}
