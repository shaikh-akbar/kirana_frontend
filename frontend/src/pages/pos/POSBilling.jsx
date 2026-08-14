import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Grid,
  Stack,
  InputBase,
  Chip,
  Card,
  Dialog,
  DialogContent,
  Typography,
  Divider,
  Button,
  Skeleton,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ProductTile from './ProductTile'
import CartPanel from './CartPanel'
import EmptyState from '../../components/EmptyState'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import { fetchProducts, createRetailBill } from '../../api/endpoints'
import { apiErrorMessage } from '../../api/client'
import { useResource } from '../../api/useResource'
import { baseUnitOf } from '../../utils/units'
import { formatCurrency } from '../../utils/format'
import { tabularNums } from '../../theme/theme'
import { useToast } from '../../components/toastContext'
import { useFirm } from '../../firm/firmStore'

/** Payment buttons on the cart map to the API's payment_mode enum. */
const PAYMENT_MODE = { Cash: 'CASH', UPI: 'UPI', Card: 'CARD' }

export default function POSBilling() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [cart, setCart] = useState([])
  const [receipt, setReceipt] = useState(null)
  const [posting, setPosting] = useState(false)
  const { showToast } = useToast()
  const { activeFirmId } = useFirm()
  const navigate = useNavigate()

  const { data: products, error, reload } = useResource(
    activeFirmId,
    useCallback(() => fetchProducts(), []),
    'Could not load the catalog'
  )

  // Categories come off the catalog itself rather than a second request — the
  // chips only ever need the categories that actually have products behind them.
  const categories = useMemo(() => {
    if (!products) return []
    return [...new Set(products.map((p) => p.category).filter(Boolean))].sort()
  }, [products])

  const filtered = useMemo(() => {
    if (!products) return []
    const needle = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category
      const matchesQuery =
        !needle ||
        p.name.toLowerCase().includes(needle) ||
        (p.barcode || '').includes(needle) ||
        (p.sku || '').toLowerCase().includes(needle)
      return matchesCategory && matchesQuery
    })
  }, [products, query, category])

  const cartItems = useMemo(
    () =>
      cart
        .map((line) => ({ product: (products || []).find((p) => p.id === line.productId), qty: line.qty }))
        .filter((line) => line.product),
    [cart, products]
  )

  function addToCart(product) {
    // Without a rate there is nothing to bill against: the server would reject
    // the line, so the tile is stopped here with an explanation instead.
    if (product.retailPrice == null) {
      showToast(`No rate set for ${product.name} — publish today's rate first`, 'warning')
      return
    }
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id)
      if (existing) {
        return prev.map((c) => (c.productId === product.id ? { ...c, qty: c.qty + 1 } : c))
      }
      return [...prev, { productId: product.id, qty: 1 }]
    })
  }

  function incQty(id) {
    setCart((prev) => prev.map((c) => (c.productId === id ? { ...c, qty: c.qty + 1 } : c)))
  }
  function decQty(id) {
    setCart((prev) =>
      prev.flatMap((c) => {
        if (c.productId !== id) return [c]
        if (c.qty <= 1) return []
        return [{ ...c, qty: c.qty - 1 }]
      })
    )
  }
  function removeItem(id) {
    setCart((prev) => prev.filter((c) => c.productId !== id))
  }

  /**
   * Posts the bill. The rate on each line is sent explicitly: a kirana types
   * the day's rate at the counter, and sending it makes the printed bill match
   * what the customer was quoted even if the daily rate moves a minute later.
   */
  async function handleCheckout(mode, total) {
    if (posting || cartItems.length === 0) return
    setPosting(true)
    try {
      const order = await createRetailBill({
        customerName: 'CASH',
        items: cartItems.map((line) => ({
          productId: line.product.id,
          unitId: baseUnitOf(line.product)?.id,
          quantity: line.qty,
          unitPrice: line.product.retailPrice,
        })),
        payment: { mode: PAYMENT_MODE[mode] || 'CASH', amount: total },
      })

      setReceipt({ ...order, mode })
      setCart([])
      // Stock moved, so the tiles' "in stock" figures are now stale.
      reload()
    } catch (err) {
      showToast(apiErrorMessage(err, 'Checkout failed'), 'error')
    } finally {
      setPosting(false)
    }
  }

  function closeReceipt() {
    setReceipt(null)
    showToast(`Bill ${receipt?.billNumber} saved`, 'success')
  }

  return (
    <Box sx={{ height: { md: '100%' } }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2.5} sx={{ height: '100%' }}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1.1,
                borderRadius: '12px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <InputBase
                placeholder="Search product name, SKU or scan barcode…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                fullWidth
                sx={{ fontSize: '0.9rem' }}
              />
              <QrCodeScannerRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 0.5 }}>
            {['All', ...categories].map((c) => (
              <Chip
                key={c}
                label={c}
                onClick={() => setCategory(c)}
                color={category === c ? 'primary' : 'default'}
                variant={category === c ? 'filled' : 'outlined'}
                sx={{ flexShrink: 0 }}
              />
            ))}
          </Stack>

          <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
            {!products ? (
              <Grid container spacing={1.5}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 6, sm: 4, lg: 3 }}>
                    <Skeleton variant="rounded" height={150} />
                  </Grid>
                ))}
              </Grid>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Inventory2RoundedIcon sx={{ fontSize: 28 }} />}
                title={products.length === 0 ? 'No products yet' : 'Nothing matches that search'}
                description={
                  products.length === 0
                    ? 'Add products to the catalog, then record a purchase to stock them.'
                    : 'Try a different name, SKU or barcode.'
                }
              />
            ) : (
              <Grid container spacing={1.5}>
                {filtered.map((p) => (
                  <Grid key={p.id} size={{ xs: 6, sm: 4, lg: 3 }}>
                    <ProductTile product={p} onAdd={addToCart} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%', minHeight: 0 }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <CartPanel
              items={cartItems}
              onInc={incQty}
              onDec={decQty}
              onRemove={removeItem}
              onCheckout={handleCheckout}
              busy={posting}
            />
          </Card>
        </Grid>
      </Grid>

      <Dialog open={!!receipt} onClose={closeReceipt} maxWidth="xs" fullWidth>
        {receipt && (
          <DialogContent sx={{ p: 3.5, textAlign: 'center' }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={800}>Payment received</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {receipt.mode} · Bill {receipt.billNumber}
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Stack spacing={0.75} sx={{ textAlign: 'left', mb: 1.5 }}>
              {receipt.items.map((item, idx) => (
                <Stack key={`${item.productId}-${idx}`} direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2">{item.description} × {Number(item.quantity)}</Typography>
                  <Typography variant="body2" sx={tabularNums}>{formatCurrency(item.totalPrice)}</Typography>
                </Stack>
              ))}
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={800}>Total paid</Typography>
              <Typography variant="subtitle1" fontWeight={800} sx={tabularNums} color="primary.main">
                {formatCurrency(receipt.netAmount)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="outlined" onClick={() => navigate(`/bills/${receipt.orderId}`)}>
                Print bill
              </Button>
              <Button fullWidth variant="contained" onClick={closeReceipt}>Start new bill</Button>
            </Stack>
          </DialogContent>
        )}
      </Dialog>
    </Box>
  )
}
