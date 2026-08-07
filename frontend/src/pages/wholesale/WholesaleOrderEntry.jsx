import { useState } from 'react'
import {
  Box,
  Stack,
  Typography,
  Card,
  Grid,
  Autocomplete,
  TextField,
  Button,
  IconButton,
  Chip,
  Divider,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { useNavigate } from 'react-router-dom'
import { products, UNIT_TO_KG, getPricingTier, PRICING_TIERS } from '../../data/products'
import { buyers } from '../../data/buyers'
import QtyUnitToggle from '../../components/QtyUnitToggle'
import CreditMeter from '../../components/CreditMeter'
import { formatCurrency } from '../../utils/format'
import { tabularNums } from '../../theme/theme'
import { useToast } from '../../components/toastContext'

let lineSeq = 1
function newLine() {
  lineSeq += 1
  return { id: `line-${lineSeq}`, productId: '', qty: 1, unit: 'KG' }
}

export default function WholesaleOrderEntry() {
  const [buyerId, setBuyerId] = useState(buyers[0].id)
  const [lines, setLines] = useState([newLine()])
  const navigate = useNavigate()
  const { showToast } = useToast()

  const buyer = buyers.find((b) => b.id === buyerId)

  const computedLines = lines.map((line) => {
    const product = products.find((p) => p.id === line.productId)
    const qtyKg = (line.qty || 0) * UNIT_TO_KG[line.unit]
    return { ...line, product, qtyKg }
  })

  const totalQtyKg = computedLines.reduce((sum, l) => sum + l.qtyKg, 0)
  const tier = getPricingTier(totalQtyKg)

  const pricedLines = computedLines.map((line) => {
    if (!line.product) return { ...line, unitPrice: 0, lineTotal: 0 }
    const unitPrice = Math.round(line.product.wholesalePrice * (1 - tier.discountPct / 100))
    return { ...line, unitPrice, lineTotal: unitPrice * line.qtyKg }
  })

  const subtotal = pricedLines.reduce((sum, l) => sum + l.lineTotal, 0)
  const projectedBalance = buyer.balance + subtotal

  function updateLine(id, patch) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }
  function removeLine(id) {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }

  function placeOrder() {
    showToast(`Order placed for ${buyer.name} — ${formatCurrency(subtotal)}`, 'success')
    navigate('/wholesale')
  }

  const canPlaceOrder = pricedLines.some((l) => l.product && l.qtyKg > 0)

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center",  mb: 2.5 }}>
        <IconButton onClick={() => navigate('/wholesale')} size="small">
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h5" fontWeight={800}>New Wholesale Order</Typography>
          <Typography variant="body2" color="text.secondary">Line-item entry with live unit conversion and bulk pricing tiers</Typography>
        </Box>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ p: 2.5 }}>
            <Autocomplete
              options={buyers}
              getOptionLabel={(b) => b.name}
              value={buyer}
              onChange={(e, v) => v && setBuyerId(v.id)}
              renderInput={(params) => <TextField {...params} label="Buyer" size="small" />}
              sx={{ maxWidth: 360, mb: 2.5 }}
              disableClearable
            />

            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between",  mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700}>Line items</Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography variant="caption" color="text.secondary">Pricing tier:</Typography>
                <Chip
                  label={`${tier.label}${tier.discountPct ? ` — ${tier.discountPct}% off` : ''}`}
                  color={tier.discountPct ? 'success' : 'default'}
                  size="small"
                  variant={tier.discountPct ? 'filled' : 'outlined'}
                />
              </Stack>
            </Stack>

            <Stack spacing={1.5}>
              {pricedLines.map((line) => (
                <Stack key={line.id} direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                  <Autocomplete
                    options={products}
                    getOptionLabel={(p) => p.name}
                    value={line.product ?? null}
                    onChange={(e, v) => updateLine(line.id, { productId: v ? v.id : '' })}
                    renderInput={(params) => <TextField {...params} label="Product" size="small" />}
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                  <TextField
                    type="number"
                    label="Qty"
                    size="small"
                    value={line.qty}
                    onChange={(e) => updateLine(line.id, { qty: Number(e.target.value) })}
                    sx={{ width: 90 }}
                    slotProps={{ htmlInput: { min: 0, style: { textAlign: 'right' } } }}
                  />
                  <QtyUnitToggle value={line.unit} onChange={(u) => updateLine(line.id, { unit: u })} />
                  <Typography variant="body2" color="text.secondary" sx={{ ...tabularNums, width: 76, textAlign: 'right' }}>
                    {line.qtyKg} kg
                  </Typography>
                  <Typography variant="body2" sx={{ ...tabularNums, width: 90, textAlign: 'right' }}>
                    {formatCurrency(line.unitPrice)}
                  </Typography>
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

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {PRICING_TIERS.map((t) => (
                <Chip
                  key={t.id}
                  size="small"
                  label={`${t.minKg}kg+ → ${t.discountPct}% off`}
                  variant={tier.id === t.id ? 'filled' : 'outlined'}
                  color={tier.id === t.id ? 'primary' : 'default'}
                />
              ))}
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.5}>
            <Card sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Buyer credit standing</Typography>
              <CreditMeter balance={buyer.balance} limit={buyer.creditLimit} label="Current khata balance" />
              <Divider sx={{ my: 2 }} />
              <CreditMeter balance={projectedBalance} limit={buyer.creditLimit} label="Projected after this order" />
            </Card>

            <Card sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Order summary</Typography>
              <Stack direction="row" sx={{ justifyContent: "space-between",  mb: 0.75 }}>
                <Typography variant="body2" color="text.secondary">Total quantity</Typography>
                <Typography variant="body2" sx={tabularNums}>{totalQtyKg} kg</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between",  mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">Applied discount</Typography>
                <Typography variant="body2" sx={tabularNums} color={tier.discountPct ? 'success.main' : 'text.primary'}>
                  {tier.discountPct}%
                </Typography>
              </Stack>
              <Divider sx={{ mb: 1.5 }} />
              <Stack direction="row" sx={{ justifyContent: "space-between",  mb: 2.5 }}>
                <Typography variant="h6" fontWeight={800}>Order total</Typography>
                <Typography variant="h6" fontWeight={800} sx={tabularNums} color="primary.main">
                  {formatCurrency(subtotal)}
                </Typography>
              </Stack>
              <Button fullWidth variant="contained" size="large" disabled={!canPlaceOrder} onClick={placeOrder}>
                Place Order
              </Button>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
