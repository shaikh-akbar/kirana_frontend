import { useState } from 'react'
import { Paper, BottomNavigation, BottomNavigationAction, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Typography } from '@mui/material'
import { useLocation, useNavigate, NavLink } from 'react-router-dom'
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded'
import { navItems, mobilePrimaryPaths } from './navItems'

export default function MobileTabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)

  const primaryItems = mobilePrimaryPaths.map((p) => navItems.find((n) => n.path === p))
  const restItems = navItems.filter((n) => !mobilePrimaryPaths.includes(n.path))
  const currentPath = location?.pathname ?? '/'
  const activeValue = primaryItems.some((i) => i.path === currentPath) ? currentPath : 'more'

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'sticky',
          bottom: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          borderRadius: 0,
        }}
      >
        <BottomNavigation
          showLabels
          value={activeValue}
          onChange={(e, value) => {
            if (value === 'more') setMoreOpen(true)
            else navigate(value)
          }}
          sx={{ height: 64 }}
        >
          {primaryItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label.replace(' Billing', '').replace(' Orders', '').replace(' Ledger', '')}
              value={item.path}
              icon={<item.icon fontSize="small" />}
              sx={{ minWidth: 0, fontSize: '0.65rem' }}
            />
          ))}
          <BottomNavigationAction label="More" value="more" icon={<MoreHorizRoundedIcon fontSize="small" />} sx={{ minWidth: 0 }} />
        </BottomNavigation>
      </Paper>

      <Drawer anchor="bottom" open={moreOpen} onClose={() => setMoreOpen(false)} slotProps={{ paper: { sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20 } } }}>
        <Box sx={{ p: 2, pb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ px: 1, pb: 1 }}>
            More
          </Typography>
          <List>
            {restItems.map((item) => (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
                onClick={() => setMoreOpen(false)}
                sx={{ borderRadius: '10px' }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <item.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={item.label} slotProps={{ primary: { fontWeight: 600, fontSize: '0.9rem' } }} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  )
}
