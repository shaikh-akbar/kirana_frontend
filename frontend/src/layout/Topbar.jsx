import { useCallback, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Stack,
  Box,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  Chip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Select,
  Divider,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'
import AddBusinessRoundedIcon from '@mui/icons-material/AddBusinessRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { fetchLowStock, fetchKhataAccounts } from '../api/endpoints'
import { useResource } from '../api/useResource'
import { useThemeMode } from '../theme/themeModeStore'
import { useAuth } from '../auth/authStore'
import { useFirm } from '../firm/firmStore'
import { initialsOf } from '../utils/format'
import { navItems } from './navItems'

// Stable empty array so the notification lists keep the same identity while
// nothing is loaded.
const EMPTY = []

// Sentinel Select value for the "add a firm" row. A Select needs every item to
// carry a value, and no real firm id can collide with a string.
const ADD_FIRM = '__add_firm__'

/**
 * `navGroups` (see layout/navItems.js's wholesaleNavGroups) switches this
 * from the normal search-bar layout to WHOLESALER's single consolidated bar:
 * category dropdowns replace the sidebar, search is dropped, and the firm
 * picker sits right after the dropdowns instead of after the (hidden)
 * mobile menu button. `flatItems` is the same idea for RETAILER, whose few
 * pages don't need categories — just plain links in a row so Tab lands on
 * each one directly instead of routing through a sidebar.
 */
export default function Topbar({ onMenuClick, navGroups, flatItems }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const isNarrow = useMediaQuery(theme.breakpoints.down('sm'))
  const { mode, toggleMode } = useThemeMode()
  const { user, logout } = useAuth()
  const { firms, activeFirmId, switchFirm } = useFirm()
  const [notifAnchor, setNotifAnchor] = useState(null)
  const [userAnchor, setUserAnchor] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState(null)
  // Roving tabindex: only one of the Graphs/Wholesale/Retailer buttons is a
  // Tab stop at a time, so Tab passes over the whole group in one step and
  // Left/Right arrows move between them instead — the usual pattern for a
  // row of menu buttons (kept in sync with whichever page is active).
  const [focusedGroupIndex, setFocusedGroupIndex] = useState(0)
  const groupButtonRefs = useRef([])

  // Adjusted during render (React's recommended alternative to an effect
  // here) rather than in a useEffect, which would cost an extra render pass
  // for what is really just "reset derived state when the route changes".
  const [syncedPathname, setSyncedPathname] = useState(location.pathname)
  if (navGroups && location.pathname !== syncedPathname) {
    setSyncedPathname(location.pathname)
    const activeIndex = navGroups.findIndex((g) => g.paths.includes(location.pathname))
    if (activeIndex !== -1) setFocusedGroupIndex(activeIndex)
  }

  function itemsForGroup(group) {
    return group.paths.map((p) => navItems.find((n) => n.path === p)).filter(Boolean)
  }

  function handleGroupKeyDown(event, index) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const delta = event.key === 'ArrowRight' ? 1 : -1
    const nextIndex = (index + delta + navGroups.length) % navGroups.length
    setFocusedGroupIndex(nextIndex)
    groupButtonRefs.current[nextIndex]?.focus()
  }

  /*
   * The bell reports on the firm currently being viewed, so it reloads on every
   * firm switch. A failure needs no banner here — both lists simply read empty
   * and the badge shows nothing.
   */
  const { data: alerts } = useResource(
    activeFirmId,
    useCallback(
      () =>
        Promise.all([fetchLowStock(), fetchKhataAccounts()]).then(([lowStock, ledgers]) => ({
          lowStock,
          // "Needs attention" means at or past 70% of the limit — the same
          // threshold the khata screen paints amber at.
          creditDue: ledgers.filter(
            (l) => Number(l.creditLimit) > 0 && Number(l.balance) >= Number(l.creditLimit) * 0.7
          ),
        })),
      []
    )
  )

  const lowStockItems = alerts?.lowStock ?? EMPTY
  const creditDueBuyers = alerts?.creditDue ?? EMPTY
  const notifCount = lowStockItems.length + creditDueBuyers.length

  function handleFirmChange(event) {
    const value = event.target.value
    if (value === ADD_FIRM) {
      navigate('/firms/new')
      return
    }
    switchFirm(value)
  }

  function handleLogout() {
    setUserAnchor(null)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 1.5, minHeight: 68 }}>
        {navGroups || flatItems ? (
          <>
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
                flexShrink: 0,
              }}
            >
              <StorefrontRoundedIcon fontSize="small" />
            </Box>

            {flatItems && (
              <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
                {flatItems.map((item) => {
                  const Icon = item.icon
                  const active = location.pathname === item.path
                  return (
                    <Button
                      key={item.path}
                      component={NavLink}
                      to={item.path}
                      end={item.path === '/'}
                      startIcon={<Icon fontSize="small" />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        color: active ? 'primary.main' : 'text.secondary',
                        bgcolor: active ? 'action.selected' : 'transparent',
                        borderRadius: '8px',
                        px: 1.5,
                        '&:hover': { bgcolor: active ? 'action.selected' : 'action.hover' },
                      }}
                    >
                      {item.label}
                    </Button>
                  )
                })}
              </Stack>
            )}

            {navGroups && (
            <Stack direction="row" spacing={0.5} role="menubar" aria-orientation="horizontal" sx={{ display: { xs: 'none', md: 'flex' } }}>
              {navGroups.map((group, index) => {
                const GroupIcon = group.icon
                const active = group.paths.includes(location.pathname)
                const isOpen = openGroup?.label === group.label
                return (
                  <Box key={group.label}>
                    <Button
                      ref={(el) => { groupButtonRefs.current[index] = el }}
                      role="menuitem"
                      tabIndex={index === focusedGroupIndex ? 0 : -1}
                      onKeyDown={(e) => handleGroupKeyDown(e, index)}
                      onClick={(e) => {
                        setOpenGroup({ label: group.label, anchorEl: e.currentTarget })
                        setFocusedGroupIndex(index)
                      }}
                      startIcon={<GroupIcon fontSize="small" />}
                      endIcon={<ExpandMoreRoundedIcon fontSize="small" />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        color: active ? 'primary.main' : 'text.secondary',
                        bgcolor: active ? 'action.selected' : 'transparent',
                        borderRadius: '8px',
                        px: 1.5,
                        '&:hover': { bgcolor: active ? 'action.selected' : 'action.hover' },
                      }}
                    >
                      {group.label}
                    </Button>
                    <Menu
                      anchorEl={isOpen ? openGroup.anchorEl : null}
                      open={isOpen}
                      onClose={() => setOpenGroup(null)}
                      slotProps={{ paper: { sx: { mt: 0.5, minWidth: 200 } } }}
                    >
                      {itemsForGroup(group).map((item) => {
                        const Icon = item.icon
                        return (
                          <MenuItem
                            key={item.path}
                            component={NavLink}
                            to={item.path}
                            end={item.path === '/'}
                            onClick={() => setOpenGroup(null)}
                            selected={location.pathname === item.path}
                          >
                            <ListItemIcon>
                              <Icon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={item.label} />
                          </MenuItem>
                        )
                      })}
                    </Menu>
                  </Box>
                )
              })}
            </Stack>
            )}
          </>
        ) : (
          <IconButton
            onClick={onMenuClick}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuRoundedIcon />
          </IconButton>
        )}

        {/* Rendered only once firms are loaded: a Select whose value is not yet
            among its items logs an out-of-range warning and flashes blank. */}
        {activeFirmId && (
          <Select
            value={activeFirmId}
            onChange={handleFirmChange}
            variant="standard"
            disableUnderline
            sx={{
              display: { xs: 'none', sm: 'flex' },
              fontWeight: 700,
              fontSize: '0.9rem',
              minWidth: 200,
              '& .MuiSelect-select': { py: 0.5 },
            }}
          >
            {firms.map((f) => (
              <MenuItem key={f.id} value={f.id} sx={{ fontSize: '0.9rem' }}>
                {f.firmName}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem value={ADD_FIRM} sx={{ fontSize: '0.9rem', color: 'primary.main', fontWeight: 600 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <AddBusinessRoundedIcon fontSize="small" color="primary" />
              </ListItemIcon>
              Add new firm
            </MenuItem>
          </Select>
        )}

        {!navGroups && !flatItems && (
          <>
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, my: 1.5 }} />

            {(!isNarrow || searchOpen) ? (
              <Box
                sx={{
                  flex: 1,
                  maxWidth: 420,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: '10px',
                  bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(31,42,36,0.04)'),
                }}
              >
                <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <InputBase
                  placeholder="Search products, buyers, orders…"
                  fullWidth
                  autoFocus={isNarrow}
                  onBlur={() => isNarrow && setSearchOpen(false)}
                  sx={{ fontSize: '0.875rem' }}
                />
              </Box>
            ) : (
              <IconButton onClick={() => setSearchOpen(true)} sx={{ ml: 'auto' }}>
                <SearchRoundedIcon />
              </IconButton>
            )}
          </>
        )}

        <Box sx={{ flex: 1 }} />

        <IconButton onClick={toggleMode} title="Toggle theme">
          {mode === 'dark' ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
        </IconButton>

        <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)}>
          <Badge badgeContent={notifCount} color="error">
            <NotificationsRoundedIcon fontSize="small" />
          </Badge>
        </IconButton>
        <Menu anchorEl={notifAnchor} open={!!notifAnchor} onClose={() => setNotifAnchor(null)} slotProps={{ paper: { sx: { width: 320, mt: 1 } } }}>
          <Typography variant="overline" color="text.secondary" sx={{ px: 2, pt: 1 }}>
            Needs attention
          </Typography>
          {notifCount === 0 && (
            <MenuItem disabled sx={{ fontSize: '0.85rem' }}>Nothing needs attention</MenuItem>
          )}
          {lowStockItems.slice(0, 3).map((item) => (
            <MenuItem key={item.product_id} onClick={() => { setNotifAnchor(null); navigate('/inventory') }}>
              <ListItemIcon>
                <WarningAmberRoundedIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                secondary={`Low stock — ${Number(item.total_available)} left, reorder at ${Number(item.min_stock_alert)}`}
                slotProps={{
                  primary: { fontSize: '0.85rem', fontWeight: 600 },
                  secondary: { fontSize: '0.75rem' },
                }}
              />
            </MenuItem>
          ))}
          {creditDueBuyers.slice(0, 3).map((b) => (
            <MenuItem key={b.buyerId} onClick={() => { setNotifAnchor(null); navigate(`/khata/${b.buyerId}`) }}>
              <ListItemIcon>
                <AccountBalanceWalletRoundedIcon fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText
                primary={b.buyerName}
                secondary="Khata balance near or over limit"
                slotProps={{
                  primary: { fontSize: '0.85rem', fontWeight: 600 },
                  secondary: { fontSize: '0.75rem' },
                }}
              />
            </MenuItem>
          ))}
        </Menu>

        <Stack
          direction="row"
          spacing={1}
          onClick={(e) => setUserAnchor(e.currentTarget)}
          sx={{ alignItems: 'center', cursor: 'pointer', pl: 0.5 }}
        >
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700, fontSize: '0.85rem' }}>
            {initialsOf(user?.name)}
          </Avatar>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {user?.name || '—'}
            </Typography>
            {user?.roleName && (
              <Chip label={user.roleName} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.8 } }} />
            )}
          </Box>
        </Stack>
        <Menu anchorEl={userAnchor} open={!!userAnchor} onClose={() => setUserAnchor(null)} slotProps={{ paper: { sx: { mt: 1, minWidth: 200 } } }}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="body2" fontWeight={700}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.phone}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setUserAnchor(null); navigate('/settings') }}>Firm settings</MenuItem>
          <MenuItem onClick={() => { setUserAnchor(null); navigate('/firms/new') }}>Add new firm</MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <LogoutRoundedIcon fontSize="small" />
            </ListItemIcon>
            Log out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
