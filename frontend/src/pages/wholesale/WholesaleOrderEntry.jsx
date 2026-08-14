import { useCallback, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Stack,
  Typography,
  Card,
  Grid,
  Autocomplete,
  TextField,
  Button,
  IconButton,
  Divider,
  Skeleton,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { useNavigate } from 'react-router-dom'
import { fetchProducts, fetchBuyers, createWholesaleBill } from '../../api/endpoints'
import { apiErrorMessage } from '../../api/client'
import { useResource } from '../../api/useResource'
import QtyUnitToggle from '../../components/QtyUnitToggle'
import CreditMeter from '../../components/CreditMeter'
import { baseUnitOf, toKg, isWeighed } from '../../utils/units'
import { formatCurrency, formatQuantity } from '../../utils/format'
import { tabularNums } from '../../theme/theme'
import { useToast } from '../../components/toastContext'
import { useFirm } from '../../firm/firmStore'

const EMPTY = []

let lineSeq = 0
function newLine() {
  lineSeq += 1
  return { id: `line-${lineSeq}`, productId: '', qty: 1, unitId: null, unitPrice: '' }
}

export default function WholesaleOrderEntry() {
  // Chosen buyer, or null meaning "whoever the list defaults to" — derived
  // rather than seeded in an effect, so the screen never renders a selection
  // that belongs to a firm the user has since switched away from.
  const [chosenBuyerId, setChosenBuyerId] = useState(null)
  const [lines, setLines] = useState([newLine()])
  const [posting, setPosting] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { activeFirmId } = useFirm()

  const { data, error } = useResource(
    activeFirmId,
    useCallback(() => Promise.all([fetchBuyers(), fetchProducts()]).then(([b, p]) => ({ buyers: b, products: p })), []),
    'Could not load buyers and products'
  )

  const buyers = data?.buyers ?? EMPTY
  const products = data?.products ?? EMPTY

  const buyer = useMemo(() => {
    if (!buyers?.length) return null
    return buyers.find((b) => b.id === chosenBuyerId) || buyers[0]
  }, [buyers, chosenBuyerId])

  /**
   * Lines are priced from what the counter typed, falling back to the product's
   * current wholesale rate. The same value is sent as `unitPrice`, so the total
   * shown here is the total that gets billed — the server only reaches for its
   * own tier/daily rate when no price is sent at all.
   */
  const pricedLines = useMemo(
    () =>
      lines.map((line) => {
        const product = (products || []).find((p) => p.id === line.productId) || null
        const unit = product?.units?.find((u) => u.id === line.unitId) || baseUnitOf(product)
        const rate = line.unitPrice === '' ? product?.wholesalePrice ?? 0 : Number(line.unitPrice)
        const qty = Number(line.qty) || 0
        return {
          ...line,
          product,
          unit,
          // The raw field value is kept separate from the resolved rate, so an
          // empty box stays empty (showing the published rate as a placeholder)
          // instead of being overwritten with the number it fell back to.
          rateInput: line.unitPrice,
          unitPrice: rate,
          kg: product ? toKg(qty, unit, product) : 0,
          lineTotal: Number((qty * rate).toFixed(2)),
        }
      }),
    [lines, products]
  )

  const subtotal = pricedLines.reduce((sum, l) => sum + l.lineTotal, 0)
  const totalKg = pricedLines.reduce((sum, l) => sum + l.kg, 0)
  const anyWeighed = pricedLines.some((l) => l.product && isWeighed(l.product))
  const projectedBalance = (buyer?.balance ?? 0) + subtotal

  function updateLine(id, patch) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  function selectProduct(id, product) {
    // Switching product invalidates the old unit and the old typed rate: a rate
    // per BAG of rice means nothing on a line that is now packets of tea.
    updateLine(id, {
      productId: product ? product.id : '',
      unitId: product ? baseUnitOf(product)?.id ?? null : null,
      unitPrice: '',
    })
  }

  function removeLine(id) {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }

  const billableLines = pricedLines.filter((l) => l.product && Number(l.qty) > 0)
  const canPlaceOrder = Boolean(buyer) && billableLines.length > 0 && !posting

  async function placeOrder() {
    if (!canPlaceOrder) return
    setPosting(true)
    try {
      const order = await createWholesaleBill({
        buyerId: buyer.id,
        customerName: buyer.name,
        customerPhone: buyer.phone || undefined,
        items: billableLines.map((line) => ({
          productId: line.product.id,
          unitId: line.unit?.id,
          quantity: Number(line.qty),
          unitPrice: line.unitPrice,
        })),
      })
      showToast(`Bill ${order.billNumber} raised for ${buyer.name}`, 'success')
      navigate('/wholesale')
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not place the order'), 'error')
    } finally {
      setPosting(false)
    }
  }

  const loading = !data && !error

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center",  mb: 2.5 }}>
        <IconButton onClick={() => navigate('/wholesale')} size="small">
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h5" fontWeight={800}>New Wholesale Order</Typography>
          <Typography variant="body2" color="text.secondary">
            Line-item entry with live unit conversion and counter-typed rates
          </Typography>
        </Box>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      {loading ? (
        <Skeleton variant="rounded" height={360} />
      ) : buyers.length === 0 ? (
        <Alert severity="info">
          No buyers on the books yet. Add a dealer from the Khata screen before raising a
          wholesale bill — a credit sale has to be booked against someone.
        </Alert>
      ) : (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ p: 2.5 }}>
              <Autocomplete
                options={buyers}
                getOptionLabel={(b) => b.name}
                value={buyer}
                onChange={(e, v) => setChosenBuyerId(v ? v.id : null)}
                renderInput={(params) => <TextField {...params} label="Buyer" size="small" />}
                sx={{ maxWidth: 360, mb: 2.5 }}
                disableClearable
              />

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Line items</Typography>

              <Stack spacing={1.5}>
                {pricedLines.map((line) => (
                  <Stack key={line.id} direction="row" spacing={1.25} sx={{ alignItems: "center", flexWrap: 'wrap' }}>
                    <Autocomplete
                      options={products}
                      getOptionLabel={(p) => p.name}
                      value={line.product}
                      onChange={(e, v) => selectProduct(line.id, v)}
                      renderInput={(params) => <TextField {...params} label="Product" size="small" />}
                      sx={{ flex: 1, minWidth: 200 }}
                    />
                    <TextField
                      type="number"
                      label="Qty"
                      size="small"
                      value={line.qty}
                      onChange={(e) => updateLine(line.id, { qty: e.target.value })}
                      sx={{ width: 90 }}
                      slotProps={{ htmlInput: { min: 0, style: { textAlign: 'right' } } }}
                    />
                    <QtyUnitToggle
                      units={line.product?.units || []}
                      value={line.unit?.id ?? null}
                      onChange={(unitId) => updateLine(line.id, { unitId })}
                    />
                    <TextField
                      type="number"
                      label="Rate"
                      size="small"
                      value={line.rateInput}
                      placeholder={line.product?.wholesalePrice != null ? String(line.product.wholesalePrice) : '0'}
                      onChange={(e) => updateLine(line.id, { unitPrice: e.target.value })}
                      sx={{ width: 110 }}
                      slotProps={{ htmlInput: { min: 0, style: { textAlign: 'right' } } }}
                    />
                    {anyWeighed && (
                      <Typography variant="body2" color="text.secondary" sx={{ ...tabularNums, width: 76, textAlign: 'right' }}>
                        {line.kg > 0 ? `${formatQuantity(line.kg)} kg` : '—'}
                      </Typography>
                    )}
                    <Typography variant="body2" fontWeight={700} sx={{ ...tabularNums, width: 100, textAlign: 'right' }}>
                      {formatCurrency(line.lineTotal)}
                    </Typography>
                    <IconButton size="small" onClick={() => removeLine(line.id)} disabled={lines.length === 1}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>

              <Button
                startIcon={<AddRoundedIcon />}
                onClick={() => setLines((prev) => [...prev, newLine()])}
                sx={{ mt: 2 }}
              >
                Add line
              </Button>

              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                Leave a rate blank to bill at the product's published wholesale rate.
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={2.5}>
              <Card sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Buyer credit standing</Typography>
                <CreditMeter balance={buyer?.balance ?? 0} limit={buyer?.creditLimit ?? 0} label="Current khata balance" />
                <Divider sx={{ my: 2 }} />
                <CreditMeter balance={projectedBalance} limit={buyer?.creditLimit ?? 0} label="Projected after this order" />
                {buyer?.creditLimit > 0 && projectedBalance > buyer.creditLimit && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    This order takes {buyer.name} past their credit limit. The server enforces the
                    limit, so it will be rejected unless the limit is raised or the bill is paid.
                  </Alert>
                )}
              </Card>

              <Card sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Order summary</Typography>
                <Stack direction="row" sx={{ justifyContent: "space-between",  mb: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">Line items</Typography>
                  <Typography variant="body2" sx={tabularNums}>{billableLines.length}</Typography>
                </Stack>
                {anyWeighed && (
                  <Stack direction="row" sx={{ justifyContent: "space-between",  mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">Total weight</Typography>
                    <Typography variant="body2" sx={tabularNums}>{formatQuantity(totalKg)} kg</Typography>
                  </Stack>
                )}
                <Divider sx={{ mb: 1.5 }} />
                <Stack direction="row" sx={{ justifyContent: "space-between",  mb: 2.5 }}>
                  <Typography variant="h6" fontWeight={800}>Order total</Typography>
                  <Typography variant="h6" fontWeight={800} sx={tabularNums} color="primary.main">
                    {formatCurrency(subtotal)}
                  </Typography>
                </Stack>
                <Button fullWidth variant="contained" size="large" disabled={!canPlaceOrder} onClick={placeOrder}>
                  {posting ? 'Placing…' : 'Place Order'}
                </Button>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}
