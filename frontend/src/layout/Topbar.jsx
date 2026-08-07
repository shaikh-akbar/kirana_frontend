import { useMemo, useState } from 'react'
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
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'
import { products } from '../data/products'
import { inventory } from '../data/inventory'
import { buyers, getBuyerStatus } from '../data/buyers'
import { useThemeMode } from '../theme/themeModeStore'

const FIRMS = ['Shree Krishna Kirana Store', 'Shree Krishna Wholesale Depot']

export default function Topbar({ onMenuClick }) {
  const theme = useTheme()
  const isNarrow = useMediaQuery(theme.breakpoints.down('sm'))
  const { mode, toggleMode } = useThemeMode()
  const [firm, setFirm] = useState(FIRMS[0])
  const [notifAnchor, setNotifAnchor] = useState(null)
  const [userAnchor, setUserAnchor] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)

  const lowStockItems = useMemo(() => inventory.filter((r) => r.flag === 'LOW_STOCK' || r.flag === 'CRITICAL'), [])
  const creditDueBuyers = useMemo(() => buyers.filter((b) => getBuyerStatus(b) !== 'CLEAR'), [])
  const notifCount = lowStockItems.length + creditDueBuyers.length

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 1.5, minHeight: 68 }}>
        <IconButton
          onClick={onMenuClick}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
          <MenuRoundedIcon />
        </IconButton>

        <Select
          value={firm}
          onChange={(e) => setFirm(e.target.value)}
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
          {FIRMS.map((f) => (
            <MenuItem key={f} value={f} sx={{ fontSize: '0.9rem' }}>
              {f}
            </MenuItem>
          ))}
        </Select>

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
              placeholder={`Search ${products.length} products, buyers, orders…`}
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
          {lowStockItems.slice(0, 3).map((item) => (
            <MenuItem key={item.id} onClick={() => setNotifAnchor(null)}>
              <ListItemIcon>
                <WarningAmberRoundedIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText
                primary={item.productName}
                secondary={`Low stock — ${item.qty} ${item.unit} left`}
                slotProps={{
                  primary: { fontSize: '0.85rem', fontWeight: 600 },
                  secondary: { fontSize: '0.75rem' },
                }}
              />
            </MenuItem>
          ))}
          {creditDueBuyers.slice(0, 3).map((b) => (
            <MenuItem key={b.id} onClick={() => setNotifAnchor(null)}>
              <ListItemIcon>
                <AccountBalanceWalletRoundedIcon fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText
                primary={b.name}
                secondary={`Khata balance near/over limit`}
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
            AK
          </Avatar>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              Akbar Khan
            </Typography>
            <Chip label="Admin" size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.8 } }} />
          </Box>
        </Stack>
        <Menu anchorEl={userAnchor} open={!!userAnchor} onClose={() => setUserAnchor(null)} slotProps={{ paper: { sx: { mt: 1, minWidth: 180 } } }}>
          <MenuItem onClick={() => setUserAnchor(null)}>Profile</MenuItem>
          <MenuItem onClick={() => setUserAnchor(null)}>Switch role</MenuItem>
          <Divider />
          <MenuItem onClick={() => setUserAnchor(null)}>Log out</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
