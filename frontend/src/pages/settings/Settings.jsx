import { useEffect, useState } from 'react'
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
  Skeleton,
  Alert,
  CircularProgress,
} from '@mui/material'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded'
import { useThemeMode } from '../../theme/themeModeStore'
import { useToast } from '../../components/toastContext'
import { fetchActiveFirm, updateActiveFirm } from '../../api/endpoints'
import { apiErrorMessage } from '../../api/client'
import { useFirm } from '../../firm/firmStore'

const USERS = [
  { name: 'Akbar Khan', email: 'it@mobilogi.com', role: 'Admin' },
  { name: 'Sunita Verma', email: 'sunita.verma@kiranaerp.in', role: 'Sales Rep' },
  { name: 'Rohit Sharma', email: 'rohit.sharma@kiranaerp.in', role: 'Cashier' },
  { name: 'Meena Joshi', email: 'meena.joshi@kiranaerp.in', role: 'Cashier' },
]

const ROLE_COLOR = { Admin: 'primary', 'Sales Rep': 'info', Cashier: 'default' }

// Firm fields this screen edits, mapped to their labels. Kept as data so the
// form, the payload and the load-time seeding cannot drift apart.
const PROFILE_FIELDS = [
  { name: 'firmName', label: 'Firm name', width: 6 },
  { name: 'gstin', label: 'GSTIN', width: 6 },
  { name: 'phone', label: 'Phone', width: 6 },
  { name: 'vatTin', label: 'VAT TIN', width: 6 },
  { name: 'address', label: 'Address', width: 12 },
  { name: 'city', label: 'City', width: 4 },
  { name: 'state', label: 'State', width: 4 },
  { name: 'pincode', label: 'Pincode', width: 4 },
]

export default function Settings() {
  const { mode, setMode } = useThemeMode()
  const { showToast } = useToast()
  const { refreshFirms } = useFirm()
  const [gstRate, setGstRate] = useState(5)
  const [defaultUnit, setDefaultUnit] = useState('KG')
  const [firm, setFirm] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    fetchActiveFirm()
      .then((data) => {
        if (!active) return
        setFirm(data)
        // null -> '' so the inputs stay controlled.
        setProfile(
          Object.fromEntries(PROFILE_FIELDS.map((f) => [f.name, data[f.name] ?? '']))
        )
      })
      .catch((err) => active && setLoadError(apiErrorMessage(err, 'Could not load the firm')))
    return () => {
      active = false
    }
  }, [])

  async function handleSaveProfile() {
    setSaveError(null)
    setSaving(true)
    try {
      // Cleared fields are sent as null so a value can actually be removed;
      // omitting them would leave the old value in place.
      const payload = Object.fromEntries(
        Object.entries(profile).map(([key, value]) => [key, value === '' ? null : value])
      )
      const updated = await updateActiveFirm(payload)
      setFirm(updated)
      // The firm name shows in the topbar switcher, so that list must reload.
      await refreshFirms()
      showToast('Firm profile saved')
    } catch (err) {
      setSaveError(apiErrorMessage(err, 'Could not save the firm profile'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>Settings</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Store profile, appearance, users and billing defaults</Typography>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={2.5}>
            <Card sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Store profile</Typography>

              {loadError && <Alert severity="error" sx={{ mt: 1 }}>{loadError}</Alert>}

              {!profile && !loadError && <Skeleton variant="rounded" height={220} sx={{ mt: 1 }} />}

              {profile && (
                <>
                  {saveError && <Alert severity="error" sx={{ mt: 1 }}>{saveError}</Alert>}
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    {PROFILE_FIELDS.map((field) => (
                      <Grid key={field.name} size={{ xs: 12, sm: field.width }}>
                        <TextField
                          label={field.label}
                          value={profile[field.name]}
                          onChange={(e) => setProfile((p) => ({ ...p, [field.name]: e.target.value }))}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                    ))}
                  </Grid>
                  <Stack direction="row" spacing={2} sx={{ mt: 2.5, alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                      {saving ? 'Saving…' : 'Save changes'}
                    </Button>
                    {firm && (
                      <Typography variant="caption" color="text.secondary">
                        Next bill: <strong>{firm.invoicePrefix}{String(firm.nextBillNumber).padStart(firm.invoicePadding, '0')}</strong>
                        {' · '}bill series is set when the firm is created and advances automatically
                      </Typography>
                    )}
                  </Stack>
                </>
              )}
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
