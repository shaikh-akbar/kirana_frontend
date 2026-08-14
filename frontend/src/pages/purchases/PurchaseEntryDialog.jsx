import { useCallback, useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { createPurchase, createSupplier, fetchProducts, fetchSuppliers } from '../../api/endpoints'
import { apiErrorMessage } from '../../api/client'
import { useResource } from '../../api/useResource'
import { baseUnitOf } from '../../utils/units'
import { formatCurrency } from '../../utils/format'
import { tabularNums } from '../../theme/theme'
import { useToast } from '../../components/toastContext'
import { useAuth } from '../../auth/authStore'

const EMPTY = []
const EMPTY_SUPPLIER_FORM = {
  vendorName: '',
  phone: '',
  gstin: '',
  address: '',
}

let lineSeq = 0
function newLine() {
  lineSeq += 1
  return { id: `po-line-${lineSeq}`, productId: '', unitId: null, quantity: '', unitCostPrice: '', expiryDate: '' }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function PurchaseEntryDialog({ open, onClose, onCreated }) {
  const { user } = useAuth()
  const [supplier, setSupplier] = useState(null)
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(today)
  const [paidAmount, setPaidAmount] = useState('')
  const [lines, setLines] = useState([newLine()])
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [supplierOpen, setSupplierOpen] = useState(false)
  const [supplierSaving, setSupplierSaving] = useState(false)
  const [supplierForm, setSupplierForm] = useState(EMPTY_SUPPLIER_FORM)
  const { showToast } = useToast()

  const { data, error: loadError } = useResource(
    open ? 'open' : null,
    useCallback(
      () => Promise.all([fetchSuppliers(), fetchProducts()]).then(([suppliers, products]) => ({ suppliers, products })),
      []
    ),
    'Could not load suppliers and products'
  )

  const suppliers = data?.suppliers ?? EMPTY
  const products = data?.products ?? EMPTY
  const error = saveError || loadError
  const canManageSuppliers = user?.roleName === 'ADMIN' || user?.roleName === 'SALES_REP'

  const pricedLines = useMemo(
    () =>
      lines.map((line) => {
        const product = products.find((p) => p.id === line.productId) || null
        const unit = product?.units?.find((u) => u.id === line.unitId) || baseUnitOf(product)
        const total = Number(line.quantity || 0) * Number(line.unitCostPrice || 0)
        return { ...line, product, unit, total }
      }),
    [lines, products]
  )

  const billable = pricedLines.filter((line) => line.product && Number(line.quantity) > 0 && Number(line.unitCostPrice) > 0)
  const totalAmount = billable.reduce((sum, line) => sum + line.total, 0)
  const canSave = Boolean(supplier) && invoiceNumber.trim() && billable.length > 0 && !saving

  function updateLine(id, patch) {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)))
  }

  function setSupplierField(name, value) {
    setSupplierForm((prev) => ({ ...prev, [name]: value }))
  }

  function reset() {
    setSupplier(null)
    setInvoiceNumber('')
    setPurchaseDate(today())
    setPaidAmount('')
    setLines([newLine()])
    setSaveError(null)
  }

  function closeSupplierDialog() {
    if (supplierSaving) return
    setSupplierOpen(false)
  }

  async function saveSupplier() {
    try {
      setSupplierSaving(true)
      const created = await createSupplier({
        vendorName: supplierForm.vendorName.trim(),
        phone: supplierForm.phone.trim() || undefined,
        gstin: supplierForm.gstin.trim() || undefined,
        address: supplierForm.address.trim() || undefined,
      })
      setSupplier(created)
      setSupplierOpen(false)
      setSupplierForm(EMPTY_SUPPLIER_FORM)
      showToast(`${created.vendorName} added`, 'success')
      onCreated()
    } catch (err) {
      setSaveError(apiErrorMessage(err, 'Could not create supplier'))
    } finally {
      setSupplierSaving(false)
    }
  }

  async function save() {
    if (!canSave) return
    setSaving(true)
    setSaveError(null)
    try {
      const purchase = await createPurchase({
        supplierId: supplier.id,
        invoiceNumber: invoiceNumber.trim(),
        purchaseDate,
        paidAmount: Number(paidAmount || 0),
        items: billable.map((line) => ({
          productId: line.product.id,
          unitId: line.unit?.id,
          quantity: Number(line.quantity),
          unitCostPrice: Number(line.unitCostPrice),
          expiryDate: line.expiryDate || undefined,
        })),
      })
      showToast(`Invoice ${purchase.invoiceNumber} recorded - stock booked in`, 'success')
      reset()
      onCreated()
    } catch (err) {
      setSaveError(apiErrorMessage(err, 'Could not save the purchase'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
        <DialogTitle>New purchase - supplier bill</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {suppliers.length === 0 ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="info">
                No suppliers on record yet. Add a supplier before entering their bill.
              </Alert>
              {canManageSuppliers && (
                <Button variant="contained" onClick={() => setSupplierOpen(true)} sx={{ alignSelf: 'flex-start' }}>
                  Add supplier
                </Button>
              )}
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                <Autocomplete
                  options={suppliers}
                  getOptionLabel={(option) => option.vendorName}
                  value={supplier}
                  onChange={(e, value) => setSupplier(value)}
                  renderInput={(params) => <TextField {...params} label="Supplier" size="small" />}
                  sx={{ flex: 1, minWidth: 220 }}
                />
                {canManageSuppliers && (
                  <Button variant="outlined" onClick={() => setSupplierOpen(true)}>
                    Add supplier
                  </Button>
                )}
                <TextField
                  label="Invoice number"
                  size="small"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  sx={{ width: 180 }}
                />
                <TextField
                  label="Purchase date"
                  type="date"
                  size="small"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  sx={{ width: 170 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Stack>

              <Divider />

              <Typography variant="subtitle2" fontWeight={700}>Line items</Typography>

              <Stack spacing={1.5}>
                {pricedLines.map((line) => (
                  <Stack key={line.id} direction="row" spacing={1.25} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <Autocomplete
                      options={products}
                      getOptionLabel={(option) => option.name}
                      value={line.product}
                      onChange={(e, value) =>
                        updateLine(line.id, {
                          productId: value ? value.id : '',
                          unitId: value ? baseUnitOf(value)?.id ?? null : null,
                        })
                      }
                      renderInput={(params) => <TextField {...params} label="Product" size="small" />}
                      sx={{ flex: 1, minWidth: 200 }}
                    />
                    <TextField
                      label="Qty"
                      type="number"
                      size="small"
                      value={line.quantity}
                      onChange={(e) => updateLine(line.id, { quantity: e.target.value })}
                      sx={{ width: 90 }}
                      slotProps={{ htmlInput: { min: 0, style: { textAlign: 'right' } } }}
                    />
                    <TextField
                      label={`Cost / ${line.unit?.unitName || 'unit'}`}
                      type="number"
                      size="small"
                      value={line.unitCostPrice}
                      onChange={(e) => updateLine(line.id, { unitCostPrice: e.target.value })}
                      sx={{ width: 130 }}
                      slotProps={{ htmlInput: { min: 0, style: { textAlign: 'right' } } }}
                    />
                    <TextField
                      label="Expiry"
                      type="date"
                      size="small"
                      value={line.expiryDate}
                      onChange={(e) => updateLine(line.id, { expiryDate: e.target.value })}
                      sx={{ width: 160 }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <Typography variant="body2" fontWeight={700} sx={{ ...tabularNums, width: 100, textAlign: 'right' }}>
                      {formatCurrency(line.total)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setLines((prev) => prev.filter((item) => item.id !== line.id))}
                      disabled={lines.length === 1}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>

              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Button startIcon={<AddRoundedIcon />} onClick={() => setLines((prev) => [...prev, newLine()])}>
                  Add line
                </Button>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <TextField
                    label="Paid now"
                    type="number"
                    size="small"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    helperText="Unpaid balance goes to the supplier's account"
                    sx={{ width: 190 }}
                    slotProps={{ htmlInput: { min: 0, style: { textAlign: 'right' } } }}
                  />
                  <Typography variant="h6" fontWeight={800} sx={tabularNums}>
                    {formatCurrency(totalAmount)}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={!canSave}>
            {saving ? 'Saving...' : 'Save & book stock'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={supplierOpen} onClose={closeSupplierDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add supplier</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Supplier name"
              value={supplierForm.vendorName}
              onChange={(e) => setSupplierField('vendorName', e.target.value)}
              required
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Phone"
                value={supplierForm.phone}
                onChange={(e) => setSupplierField('phone', e.target.value)}
                fullWidth
              />
              <TextField
                label="GSTIN"
                value={supplierForm.gstin}
                onChange={(e) => setSupplierField('gstin', e.target.value)}
                fullWidth
              />
            </Stack>
            <TextField
              label="Address"
              value={supplierForm.address}
              onChange={(e) => setSupplierField('address', e.target.value)}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeSupplierDialog} disabled={supplierSaving}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveSupplier}
            disabled={supplierSaving || !supplierForm.vendorName.trim()}
          >
            Create supplier
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
