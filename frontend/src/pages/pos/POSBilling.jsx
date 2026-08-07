import { useMemo, useState } from 'react'
import {
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
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ProductTile from './ProductTile'
import CartPanel from './CartPanel'
import { products, CATEGORIES } from '../../data/products'
import { formatCurrency } from '../../utils/format'
import { tabularNums } from '../../theme/theme'
import { useToast } from '../../components/toastContext'

export default function POSBilling() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [cart, setCart] = useState([])
  const [receipt, setReceipt] = useState(null)
  const { showToast } = useToast()

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.barcode.includes(query) ||
        p.sku.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [query, category])

  const cartItems = cart.map((c) => ({ product: products.find((p) => p.id === c.productId), qty: c.qty }))

  function addToCart(product) {
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
      }),
    )
  }
  function removeItem(id) {
    setCart((prev) => prev.filter((c) => c.productId !== id))
  }

  function handleCheckout(mode, total) {
    setReceipt({
      mode,
      total,
      items: cartItems,
      receiptNo: `RCP-${Math.floor(1000 + total) % 9000 + 1000}`,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    })
  }

  function closeReceipt() {
    setReceipt(null)
    setCart([])
    showToast('Order placed and payment recorded', 'success')
  }

  return (
    <Box sx={{ height: { md: '100%' } }}>
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
            {['All', ...CATEGORIES].map((c) => (
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
            <Grid container spacing={1.5}>
              {filtered.map((p) => (
                <Grid key={p.id} size={{ xs: 6, sm: 4, lg: 3 }}>
                  <ProductTile product={p} onAdd={addToCart} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%', minHeight: 0 }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <CartPanel items={cartItems} onInc={incQty} onDec={decQty} onRemove={removeItem} onCheckout={handleCheckout} />
          </Card>
        </Grid>
      </Grid>

      <Dialog open={!!receipt} onClose={closeReceipt} maxWidth="xs" fullWidth>
        {receipt && (
          <DialogContent sx={{ p: 3.5, textAlign: 'center' }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={800}>Payment received</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {receipt.mode} · {receipt.time} · {receipt.receiptNo}
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Stack spacing={0.75} sx={{ textAlign: 'left', mb: 1.5 }}>
              {receipt.items.map((i) => (
                <Stack key={i.product.id} direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography variant="body2">{i.product.name} × {i.qty}</Typography>
                  <Typography variant="body2" sx={tabularNums}>{formatCurrency(i.product.retailPrice * i.qty)}</Typography>
                </Stack>
              ))}
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <Stack direction="row" sx={{ justifyContent: "space-between",  mb: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={800}>Total paid</Typography>
              <Typography variant="subtitle1" fontWeight={800} sx={tabularNums} color="primary.main">
                {formatCurrency(receipt.total)}
              </Typography>
            </Stack>
            <Button fullWidth variant="contained" onClick={closeReceipt}>Start new bill</Button>
          </DialogContent>
        )}
      </Dialog>
    </Box>
  )
}
