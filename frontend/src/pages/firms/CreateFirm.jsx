import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  Stack,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import { useFirm } from '../../firm/firmStore'
import { useToast } from '../../components/toastContext'
import { apiErrorMessage } from '../../api/client'

const FIRM_TYPES = [
  { value: 'RETAIL', label: 'Retail — counter sales to customers' },
  { value: 'WHOLESALE', label: 'Wholesale — bulk sales to other shops' },
  { value: 'BOTH', label: 'Both retail and wholesale' },
]

const INITIAL = {
  firmName: '',
  firmType: 'BOTH',
  phone: '',
  address: '',
  city: '',
  state: 'Maharashtra',
  stateCode: '27',
  pincode: '',
  gstin: '',
  pan: '',
  vatTin: '',
  fssaiNumber: '',
  invoicePrefix: 'INV',
  invoicePadding: 6,
  nextBillNumber: 1,
}

export default function CreateFirm() {
  const { createFirm, hasNoFirms } = useFirm()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Shows exactly what will be printed on the next bill. Without this, the
  // prefix/padding/start-number fields are three abstract numbers and it is
  // easy to resume a bill book at the wrong point.
  const billPreview = useMemo(() => {
    const padding = Number(form.invoicePadding) || 1
    const start = Number(form.nextBillNumber) || 1
    return `${form.invoicePrefix || ''}${String(start).padStart(padding, '0')}`
  }, [form.invoicePrefix, form.invoicePadding, form.nextBillNumber])

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      // Blank optional fields are stripped: the API format-checks anything
      // non-empty, and an empty GSTIN string is not a validation failure the
      // owner should have to see.
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, value]) => value !== '' && value !== null)
      )
      const firm = await createFirm(payload)
      showToast(`${firm.firmName} created`)
      navigate('/', { replace: true })
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create the firm'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: hasNoFirms ? 4 : 0, px: hasNoFirms ? 2 : 0 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <StorefrontRoundedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={800}>
            {hasNoFirms ? 'Set up your firm' : 'Add a firm'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hasNoFirms
              ? 'Each firm keeps its own stock, bills and khata. You can add more later.'
              : 'A separate firm gets its own stock, bill series and khata — the catalog stays shared.'}
          </Typography>
        </Box>
      </Stack>

      <Stack component="form" spacing={2.5} onSubmit={handleSubmit} sx={{ mt: 3 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Card sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Firm details
          </Typography>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 7 }}>
              <TextField
                label="Firm name"
                value={form.firmName}
                onChange={(e) => setField('firmName', e.target.value)}
                fullWidth
                size="small"
                required
                placeholder="SAHEB ALI WHOLESALE KIRANA"
                helperText="Printed as the heading on every bill"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                label="Firm type"
                value={form.firmType}
                onChange={(e) => setField('firmType', e.target.value)}
                fullWidth
                size="small"
                select
              >
                {FIRM_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                label="Address"
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Phone"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="City"
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="State"
                value={form.state}
                onChange={(e) => setField('state', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <TextField
                label="State code"
                value={form.stateCode}
                onChange={(e) => setField('stateCode', e.target.value)}
                fullWidth
                size="small"
                helperText="GST code"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <TextField
                label="Pincode"
                value={form.pincode}
                onChange={(e) => setField('pincode', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Statutory IDs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All optional — leave blank if the firm is unregistered.
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="GSTIN"
                value={form.gstin}
                onChange={(e) => setField('gstin', e.target.value.toUpperCase())}
                fullWidth
                size="small"
                placeholder="27ABCDE1234F1Z5"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="PAN"
                value={form.pan}
                onChange={(e) => setField('pan', e.target.value.toUpperCase())}
                fullWidth
                size="small"
                placeholder="ABCDE1234F"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="VAT TIN"
                value={form.vatTin}
                onChange={(e) => setField('vatTin', e.target.value)}
                fullWidth
                size="small"
                helperText="Legacy TIN, if still printed on your bills"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="FSSAI number"
                value={form.fssaiNumber}
                onChange={(e) => setField('fssaiNumber', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Bill numbering
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Already using a bill book? Set the start number to carry on from your
            last bill instead of restarting at 1.
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1.5, alignItems: 'flex-start' }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Prefix"
                value={form.invoicePrefix}
                onChange={(e) => setField('invoicePrefix', e.target.value.toUpperCase())}
                fullWidth
                size="small"
                placeholder="A"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Digits"
                type="number"
                value={form.invoicePadding}
                onChange={(e) => setField('invoicePadding', e.target.value)}
                fullWidth
                size="small"
                slotProps={{ htmlInput: { min: 1, max: 12 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Start from"
                type="number"
                value={form.nextBillNumber}
                onChange={(e) => setField('nextBillNumber', e.target.value)}
                fullWidth
                size="small"
                slotProps={{ htmlInput: { min: 1 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Next bill will read
                </Typography>
                <Chip
                  label={billPreview || '—'}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 700, fontFamily: 'monospace', width: 'fit-content' }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Card>

        <Divider />

        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
          {!hasNoFirms && (
            <Button variant="text" onClick={() => navigate(-1)} disabled={submitting}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting || !form.firmName.trim()}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {submitting ? 'Creating…' : 'Create firm'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
