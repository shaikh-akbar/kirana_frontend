import { useCallback, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Stack,
  Typography,
  Card,
  Chip,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import DataTable from '../../components/DataTable'
import { adjustStock, fetchInventory, fetchProducts } from '../../api/endpoints'
import { apiErrorMessage } from '../../api/client'
import { useResource } from '../../api/useResource'
import { formatDate } from '../../utils/format'
import { useFirm } from '../../firm/firmStore'
import { useToast } from '../../components/toastContext'
import { useAuth } from '../../auth/authStore'

const FLAG_STRIPE = {
  CRITICAL: 'error.main',
  EXPIRING: 'warning.main',
  LOW_STOCK: 'warning.main',
  OK: 'transparent',
}

const FLAG_LABEL = {
  CRITICAL: 'Expiring & low stock',
  EXPIRING: 'Expiring soon',
  LOW_STOCK: 'Below threshold',
  OK: 'Healthy',
}

const FLAG_COLOR = {
  CRITICAL: 'error',
  EXPIRING: 'warning',
  LOW_STOCK: 'warning',
  OK: 'success',
}

const columns = [
  { key: 'productName', label: 'Product' },
  { key: 'category', label: 'Category' },
  { key: 'batchNo', label: 'Batch' },
  { key: 'mfgDate', label: 'Mfg Date', render: (r) => formatDate(r.mfgDate) },
  {
    key: 'expiryDate',
    label: 'Expiry',
    // Non-perishable batches have no expiry date, so there is no day count to
    // append — "— (nulld)" would otherwise be printed.
    render: (r) => (r.expiryDate ? `${formatDate(r.expiryDate)} (${r.daysToExpiry}d)` : '—'),
  },
  { key: 'qty', label: 'Qty', numeric: true, render: (r) => `${r.qty} ${r.unit}` },
  { key: 'threshold', label: 'Threshold', numeric: true, render: (r) => `${r.threshold} ${r.unit}` },
  { key: 'location', label: 'Location' },
  {
    key: 'flag',
    label: 'Status',
    render: (r) => <Chip label={FLAG_LABEL[r.flag]} color={FLAG_COLOR[r.flag]} size="small" variant={r.flag === 'OK' ? 'outlined' : 'filled'} />,
  },
]

const MOVEMENT_OPTIONS = [
  { value: 'ADJUSTMENT', label: 'Opening / recount' },
  { value: 'RETURN', label: 'Customer return' },
  { value: 'DAMAGE', label: 'Damage / wastage' },
]

const EMPTY_FORM = {
  productId: '',
  quantity: '',
  movementType: 'ADJUSTMENT',
  batchNumber: '',
  mfgDate: '',
  expiryDate: '',
  costPrice: '',
  storageLocation: '',
}

export default function Inventory() {
  const { activeFirmId } = useFirm()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [category, setCategory] = useState('All')
  const [flagFilter, setFlagFilter] = useState('All')
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const { data: rows, error, loading, reload } = useResource(
    activeFirmId,
    useCallback(() => fetchInventory(), []),
    'Could not load stock'
  )
  const { data: products } = useResource(
    activeFirmId,
    useCallback(() => fetchProducts(), []),
    'Could not load products'
  )

  // Only the categories this firm actually holds stock in - a fixed list would
  // offer filters that can never match anything.
  const categories = useMemo(() => {
    if (!rows) return []
    return [...new Set(rows.map((r) => r.category).filter(Boolean))].sort()
  }, [rows])

  const filtered = useMemo(() => {
    if (!rows) return []
    return rows.filter((r) => {
      const matchesCategory = category === 'All' || r.category === category
      const matchesFlag = flagFilter === 'All' || r.flag === flagFilter
      return matchesCategory && matchesFlag
    })
  }, [rows, category, flagFilter])

  const canAdjustStock = user?.roleName === 'ADMIN' || user?.roleName === 'WHOLESALER'
  const productOptions = useMemo(
    () => (products || []).filter((product) => product.isActive !== false),
    [products]
  )

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function openAdjustDialog() {
    setForm(EMPTY_FORM)
    setAdjustOpen(true)
  }

  function closeAdjustDialog() {
    if (submitting) return
    setAdjustOpen(false)
  }

  async function handleAdjustStock() {
    try {
      setSubmitting(true)
      await adjustStock({
        productId: Number(form.productId),
        quantity: Number(form.quantity),
        movementType: form.movementType,
        batchNumber: form.batchNumber.trim() || undefined,
        mfgDate: form.mfgDate || undefined,
        expiryDate: form.expiryDate || undefined,
        costPrice: form.costPrice === '' ? undefined : Number(form.costPrice),
        storageLocation: form.storageLocation.trim() || undefined,
      })
      setAdjustOpen(false)
      setForm(EMPTY_FORM)
      showToast('Stock adjusted', 'success')
      reload()
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not adjust stock'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Inventory</Typography>
          <Typography variant="body2" color="text.secondary">Batch and expiry-aware stock across all locations</Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
          {canAdjustStock && (
            <Button variant="contained" onClick={openAdjustDialog}>
              Adjust stock
            </Button>
          )}
          <TextField select size="small" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 170 }}>
            <MenuItem value="All">All categories</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Status" value={flagFilter} onChange={(e) => setFlagFilter(e.target.value)} sx={{ minWidth: 170 }}>
            <MenuItem value="All">All statuses</MenuItem>
            <MenuItem value="CRITICAL">Expiring & low stock</MenuItem>
            <MenuItem value="EXPIRING">Expiring soon</MenuItem>
            <MenuItem value="LOW_STOCK">Below threshold</MenuItem>
            <MenuItem value="OK">Healthy</MenuItem>
          </TextField>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      <Card sx={{ p: 1 }}>
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(r) => r.id}
          loading={loading}
          maxHeight={640}
          rowSx={(r) => ({
            '& td:first-of-type': {
              borderLeft: '3px solid',
              borderLeftColor: FLAG_STRIPE[r.flag],
              pl: r.flag === 'OK' ? 2 : 1.75,
            },
          })}
          emptyProps={{ title: 'No matching stock', description: 'Try a different category or status filter.' }}
        />
      </Card>

      <Dialog open={adjustOpen} onClose={closeAdjustDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Adjust stock</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Product"
              value={form.productId}
              onChange={(e) => setField('productId', e.target.value)}
              required
            >
              {productOptions.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Quantity"
              type="number"
              value={form.quantity}
              onChange={(e) => setField('quantity', e.target.value)}
              helperText="Use positive quantity to add stock and negative to remove it."
              required
            />
            <TextField
              select
              label="Movement type"
              value={form.movementType}
              onChange={(e) => setField('movementType', e.target.value)}
            >
              {MOVEMENT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Batch number"
                value={form.batchNumber}
                onChange={(e) => setField('batchNumber', e.target.value)}
                fullWidth
              />
              <TextField
                label="Cost price"
                type="number"
                value={form.costPrice}
                onChange={(e) => setField('costPrice', e.target.value)}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Mfg date"
                type="date"
                value={form.mfgDate}
                onChange={(e) => setField('mfgDate', e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
              <TextField
                label="Expiry date"
                type="date"
                value={form.expiryDate}
                onChange={(e) => setField('expiryDate', e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
            </Stack>
            <TextField
              label="Storage location"
              value={form.storageLocation}
              onChange={(e) => setField('storageLocation', e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeAdjustDialog} disabled={submitting}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAdjustStock}
            disabled={submitting || !form.productId || !form.quantity || Number(form.quantity) === 0}
          >
            Save adjustment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
