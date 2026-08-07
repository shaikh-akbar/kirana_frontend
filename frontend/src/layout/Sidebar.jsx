import { Box, Stack, Typography, Tooltip, IconButton } from '@mui/material'
import { NavLink } from 'react-router-dom'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import { navItems } from './navItems'

const EXPANDED_WIDTH = 248
const COLLAPSED_WIDTH = 76

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <Box
      component="nav"
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        flexShrink: 0,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        transition: 'width 0.2s ease',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      <Stack
        direction="row"
       
       
        sx={{ alignItems: "center", justifyContent: collapsed ? 'center' : 'space-between',  px: collapsed ? 0 : 2, py: 2.25, minHeight: 68 }}
      >
        {!collapsed && (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <StorefrontRoundedIcon fontSize="small" />
            </Box>
            <Typography variant="subtitle1" fontWeight={800} noWrap>
              Kirana ERP
            </Typography>
          </Stack>
        )}
        {collapsed && (
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StorefrontRoundedIcon fontSize="small" />
          </Box>
        )}
        {!collapsed && (
          <IconButton size="small" onClick={onToggle}>
            <ChevronLeftRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <Stack spacing={0.5} sx={{ px: collapsed ? 1 : 1.5, flex: 1, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const link = (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {({ isActive }) => (
                <Stack
                  direction="row"
                 
                  spacing={1.5}
                  sx={{ alignItems: "center", 
                    px: collapsed ? 0 : 1.5,
                    py: 1.1,
                    borderRadius: '10px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    color: isActive ? 'primary.main' : 'text.secondary',
                    bgcolor: isActive ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: isActive ? 'action.selected' : 'action.hover' },
                  }}
                >
                  <Icon fontSize="small" />
                  {!collapsed && (
                    <Typography variant="body2" fontWeight={isActive ? 700 : 600} noWrap>
                      {item.label}
                    </Typography>
                  )}
                </Stack>
              )}
            </NavLink>
          )
          return collapsed ? (
            <Tooltip key={item.path} title={item.label} placement="right">
              {link}
            </Tooltip>
          ) : (
            link
          )
        })}
      </Stack>

      <Stack sx={{ p: collapsed ? 1 : 1.5 }}>
        {collapsed ? (
          <Tooltip title="Expand sidebar" placement="right">
            <IconButton size="small" onClick={onToggle} sx={{ mx: 'auto' }}>
              <ChevronLeftRoundedIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
            </IconButton>
          </Tooltip>
        ) : (
          <Typography variant="caption" color="text.disabled" sx={{ px: 1.5 }}>
            v1.0 · Retail + Wholesale
          </Typography>
        )}
      </Stack>
    </Box>
  )
}
