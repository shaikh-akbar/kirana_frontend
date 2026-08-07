import { useState } from 'react'
import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileTabBar from './MobileTabBar'

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar onMenuClick={() => setCollapsed((c) => !c)} />
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
          <Outlet />
        </Box>
        <MobileTabBar />
      </Box>
    </Box>
  )
}
