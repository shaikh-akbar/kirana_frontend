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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded'
import { useThemeMode } from '../../theme/themeModeStore'
import { useToast } from '../../components/toastContext'
import { fetchActiveFirm, updateActiveFirm, fetchFirmStaff, addFirmStaff } from '../../api/endpoints'
import { apiErrorMessage } from '../../api/client'
import { useFirm } from '../../firm/firmStore'

const ROLE_COLOR = { ADMIN: 'primary', WHOLESALER: 'info', RETAILER: 'default' }
const ROLE_LABEL = { ADMIN: 'Admin', WHOLESALER: 'Wholesaler', RETAILER: 'Retailer' }

const EMPTY_STAFF_FORM = { phone: '', roleName: 'RETAILER' }

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

  const [staff, setStaff] = useState(null)
  const [staffError, setStaffError] = useState(null)
  const [staffDialogOpen, setStaffDialogOpen] = useState(false)
  const [staffForm, setStaffForm] = useState(EMPTY_STAFF_FORM)
  const [staffSubmitError, setStaffSubmitError] = useState(null)
  const [staffSubmitting, setStaffSubmitting] = useState(false)

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

  const loadStaff = () =>
    fetchFirmStaff()
      .then(setStaff)
      .catch((err) => setStaffError(apiErrorMessage(err, 'Could not load staff')))

  useEffect(() => {
    loadStaff()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openStaffDialog() {
    setStaffForm(EMPTY_STAFF_FORM)
    setStaffSubmitError(null)
    setStaffDialogOpen(true)
  }

  async function handleAddStaff(event) {
    event.preventDefault()
    setStaffSubmitError(null)
    setStaffSubmitting(true)
    try {
      await addFirmStaff(staffForm)
      await loadStaff()
      showToast('Staff member added')
      setStaffDialogOpen(false)
    } catch (err) {
      setStaffSubmitError(apiErrorMessage(err, 'Could not add staff member'))
    } finally {
      setStaffSubmitting(false)
    }
  }

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
                <Button size="small" onClick={openStaffDialog}>Add staff</Button>
              </Stack>

              {staffError && <Alert severity="error" sx={{ mt: 1.5 }}>{staffError}</Alert>}

              {!staff && !staffError && <Skeleton variant="rounded" height={140} sx={{ mt: 1.5 }} />}

              {staff && staff.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  No staff yet — add a retailer or wholesaler by their phone number.
                </Typography>
              )}

              {staff && staff.length > 0 && (
                <List disablePadding sx={{ mt: 1 }}>
                  {staff.map((u, idx) => (
                    <Box key={u.id}>
                      {idx > 0 && <Divider component="li" />}
                      <ListItem disableGutters sx={{ py: 1.1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 36, height: 36, fontSize: '0.8rem', fontWeight: 700 }}>
                            {u.name.split(' ').map((n) => n[0]).join('')}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={u.name}
                          secondary={u.phone}
                          slotProps={{
                            primary: { fontSize: '0.85rem', fontWeight: 600 },
                            secondary: { fontSize: '0.72rem' },
                          }}
                        />
                        <Chip
                          label={ROLE_LABEL[u.roleName] || u.roleName}
                          size="small"
                          color={ROLE_COLOR[u.roleName] || 'default'}
                          variant="outlined"
                        />
                      </ListItem>
                    </Box>
                  ))}
                </List>
              )}
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={staffDialogOpen} onClose={() => !staffSubmitting && setStaffDialogOpen(false)} fullWidth maxWidth="xs">
        <Stack component="form" onSubmit={handleAddStaff}>
          <DialogTitle>Add staff</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              They must already have an account (registered with this phone number) — this only
              grants them access to this firm.
            </Typography>
            {staffSubmitError && <Alert severity="error" sx={{ mb: 2 }}>{staffSubmitError}</Alert>}
            <Stack spacing={2}>
              <TextField
                label="Phone number"
                value={staffForm.phone}
                onChange={(e) => setStaffForm((f) => ({ ...f, phone: e.target.value }))}
                fullWidth
                required
                autoFocus
              />
              <TextField
                select
                label="Role"
                value={staffForm.roleName}
                onChange={(e) => setStaffForm((f) => ({ ...f, roleName: e.target.value }))}
                fullWidth
              >
                <MenuItem value="RETAILER">Retailer</MenuItem>
                <MenuItem value="WHOLESALER">Wholesaler</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setStaffDialogOpen(false)} disabled={staffSubmitting}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={staffSubmitting || !staffForm.phone.trim()}
              startIcon={staffSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {staffSubmitting ? 'Adding…' : 'Add staff'}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>
    </Box>
  )
}
