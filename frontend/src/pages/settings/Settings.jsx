import { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  Typography,
  TextField,
  Stack,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded'
import { useThemeMode } from '../../theme/themeModeStore'
import { useToast } from '../../components/toastContext'

const USERS = [
  { name: 'Akbar Khan', email: 'it@mobilogi.com', role: 'Admin' },
  { name: 'Sunita Verma', email: 'sunita.verma@kiranaerp.in', role: 'Sales Rep' },
  { name: 'Rohit Sharma', email: 'rohit.sharma@kiranaerp.in', role: 'Cashier' },
  { name: 'Meena Joshi', email: 'meena.joshi@kiranaerp.in', role: 'Cashier' },
]

const ROLE_COLOR = { Admin: 'primary', 'Sales Rep': 'info', Cashier: 'default' }

export default function Settings() {
  const { mode, setMode } = useThemeMode()
  const { showToast } = useToast()
  const [gstRate, setGstRate] = useState(5)
  const [defaultUnit, setDefaultUnit] = useState('KG')

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>Settings</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Store profile, appearance, users and billing defaults</Typography>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={2.5}>
            <Card sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Store profile</Typography>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Firm name" defaultValue="Shree Krishna Kirana Store" fullWidth size="small" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="GSTIN" defaultValue="27ABCDE1234F1Z5" fullWidth size="small" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Phone" defaultValue="+91 98230 11234" fullWidth size="small" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Email" defaultValue="it@mobilogi.com" fullWidth size="small" />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Address" defaultValue="APMC Yard, Sector 4, Nashik, Maharashtra 422003" fullWidth size="small" />
                </Grid>
              </Grid>
              <Button variant="contained" sx={{ mt: 2.5 }} onClick={() => showToast('Store profile saved', 'success')}>
                Save changes
              </Button>
            </Card>

            <Card sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Billing defaults</Typography>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Default GST rate (%)"
                    type="number"
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select label="Default stock unit" value={defaultUnit} onChange={(e) => setDefaultUnit(e.target.value)} fullWidth size="small" slotProps={{ select: { native: true } }}>
                    <option value="KG">KG</option>
                    <option value="BAG">BAG</option>
                    <option value="QUINTAL">QUINTAL</option>
                  </TextField>
                </Grid>
              </Grid>
              <Button variant="contained" sx={{ mt: 2.5 }} onClick={() => showToast('Billing defaults updated', 'success')}>
                Save changes
              </Button>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2.5}>
            <Card sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Appearance</Typography>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(e, val) => val && setMode(val)}
                fullWidth
                sx={{ mt: 1 }}
              >
                <ToggleButton value="light">
                  <LightModeRoundedIcon fontSize="small" sx={{ mr: 1 }} /> Light
                </ToggleButton>
                <ToggleButton value="dark">
                  <DarkModeRoundedIcon fontSize="small" sx={{ mr: 1 }} /> Dark
                </ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SettingsBrightnessRoundedIcon sx={{ fontSize: 14 }} /> Follows your system theme on first visit
              </Typography>
            </Card>

            <Card sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="subtitle1" fontWeight={700}>Users &amp; roles</Typography>
                <Button size="small" onClick={() => showToast('Invite link copied', 'success')}>Invite user</Button>
              </Stack>
              <List disablePadding sx={{ mt: 1 }}>
                {USERS.map((u, idx) => (
                  <Box key={u.email}>
                    {idx > 0 && <Divider component="li" />}
                    <ListItem disableGutters sx={{ py: 1.1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 36, height: 36, fontSize: '0.8rem', fontWeight: 700 }}>
                          {u.name.split(' ').map((n) => n[0]).join('')}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={u.name}
                        secondary={u.email}
                        slotProps={{
                          primary: { fontSize: '0.85rem', fontWeight: 600 },
                          secondary: { fontSize: '0.72rem' },
                        }}
                      />
                      <Chip label={u.role} size="small" color={ROLE_COLOR[u.role]} variant="outlined" />
                    </ListItem>
                  </Box>
                ))}
              </List>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
