import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

function makeDraftBill(number) {
  return { id: `draft-${number}`, name: `Bill ${number}`, cart: [] }
}

export default function POSBilling() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [bills, setBills] = useState([makeDraftBill(1)])
  const [activeBillId, setActiveBillId] = useState('draft-1')
  const [nextBillNumber, setNextBillNumber] = useState(2)
  const [receipt, setReceipt] = useState(null)
  const [posting, setPosting] = useState(false)
  const [highlightedProductIndex, setHighlightedProductIndex] = useState(0)
  const [selectedCartIndex, setSelectedCartIndex] = useState(0)
  const searchRef = useRef(null)
  const { showToast } = useToast()
  const { activeFirmId } = useFirm()
  const navigate = useNavigate()

  const { data: products, error, reload } = useResource(
    activeFirmId,
    useCallback(() => fetchProducts(), []),
    'Could not load the catalog'
  )

  // Categories come off the catalog itself rather than a second request - the
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

  const activeBill = useMemo(
    () => bills.find((bill) => bill.id === activeBillId) || bills[0] || makeDraftBill(1),
    [bills, activeBillId]
  )

  const cartItems = useMemo(
    () =>
      activeBill.cart
        .map((line) => ({ product: (products || []).find((p) => p.id === line.productId), qty: line.qty }))
        .filter((line) => line.product),
    [activeBill, products]
  )

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.retailPrice * item.qty, 0),
    [cartItems]
  )

  const billSummaries = useMemo(
    () =>
      bills.map((bill) => ({
        id: bill.id,
        name: bill.name,
        itemCount: bill.cart.length,
        qtyCount: bill.cart.reduce((sum, line) => sum + line.qty, 0),
      })),
    [bills]
  )

  useEffect(() => {
    if (receipt) return
    searchRef.current?.focus()
  }, [receipt, activeBillId])

  useEffect(() => {
    setHighlightedProductIndex((prev) => Math.min(prev, Math.max(filtered.length - 1, 0)))
  }, [filtered.length])

  useEffect(() => {
    setSelectedCartIndex((prev) => Math.min(prev, Math.max(cartItems.length - 1, 0)))
  }, [cartItems.length])

  function updateActiveBillCart(updater) {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === activeBillId
          ? { ...bill, cart: typeof updater === 'function' ? updater(bill.cart) : updater }
          : bill
      )
    )
  }

  function addToCart(product) {
    // Without a rate there is nothing to bill against: the server would reject
    // the line, so the tile is stopped here with an explanation instead.
    if (product.retailPrice == null) {
      showToast(`No rate set for ${product.name} - publish today's rate first`, 'warning')
      return
    }
    updateActiveBillCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id)
      const nextCart = existing
        ? prev.map((c) => (c.productId === product.id ? { ...c, qty: c.qty + 1 } : c))
        : [...prev, { productId: product.id, qty: 1 }]
      const nextIndex = nextCart.findIndex((item) => item.productId === product.id)
      setSelectedCartIndex(nextIndex >= 0 ? nextIndex : 0)
      return nextCart
    })
  }

  function addHighlightedProduct() {
    const product = filtered[highlightedProductIndex]
    if (!product) return
    addToCart(product)
    setQuery('')
    setHighlightedProductIndex(0)
    searchRef.current?.focus()
  }

  function incQty(id) {
    updateActiveBillCart((prev) => prev.map((c) => (c.productId === id ? { ...c, qty: c.qty + 1 } : c)))
  }

  function decQty(id) {
    updateActiveBillCart((prev) =>
      prev.flatMap((c) => {
        if (c.productId !== id) return [c]
        if (c.qty <= 1) return []
        return [{ ...c, qty: c.qty - 1 }]
      })
    )
  }

  function removeItem(id) {
    updateActiveBillCart((prev) => prev.filter((c) => c.productId !== id))
  }

  function addDraftBill() {
    const next = makeDraftBill(nextBillNumber)
    setBills((prev) => [...prev, next])
    setActiveBillId(next.id)
    setNextBillNumber((prev) => prev + 1)
    setQuery('')
    setHighlightedProductIndex(0)
    setSelectedCartIndex(0)
  }

  function removeDraftBill(id) {
    if (bills.length === 1) return

    const removedIndex = bills.findIndex((bill) => bill.id === id)
    const remaining = bills.filter((bill) => bill.id !== id)
    const fallback = remaining[Math.max(0, removedIndex - 1)] || remaining[0]

    setBills(remaining)
    if (activeBillId === id && fallback) {
      setActiveBillId(fallback.id)
    }
  }

  function resetBill(id) {
    setBills((prev) =>
      prev.map((bill) => (bill.id === id ? { ...bill, cart: [] } : bill))
    )
    setSelectedCartIndex(0)
  }

  /**
   * Posts the bill. The rate on each line is sent explicitly: a kirana types
   * the day's rate at the counter, and sending it makes the printed bill match
   * what the customer was quoted even if the daily rate moves a minute later.
   */
  async function handleCheckout(mode, total) {
    if (posting || cartItems.length === 0) return
    const checkoutBill = activeBill
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

      setReceipt({ ...order, draftBillName: checkoutBill.name, mode })
      resetBill(checkoutBill.id)
      setQuery('')
      setHighlightedProductIndex(0)
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
    searchRef.current?.focus()
  }

  function handleSearchKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!filtered.length) return
      setHighlightedProductIndex((prev) => Math.min(prev + 1, filtered.length - 1))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!filtered.length) return
      setHighlightedProductIndex((prev) => Math.max(prev - 1, 0))
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      addHighlightedProduct()
    }
  }

  useEffect(() => {
    function onKeyDown(event) {
      if (receipt && event.key === 'Escape') {
        event.preventDefault()
        closeReceipt()
        return
      }

      const target = event.target
      const tagName = target?.tagName
      const isTypingField = tagName === 'INPUT' || tagName === 'TEXTAREA'

      if (event.altKey && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        addDraftBill()
        return
      }

      if (event.key === 'F1') {
        event.preventDefault()
        handleCheckout('Cash', cartTotal)
        return
      }
      if (event.key === 'F2') {
        event.preventDefault()
        handleCheckout('UPI', cartTotal)
        return
      }
      if (event.key === 'F3') {
        event.preventDefault()
        handleCheckout('Card', cartTotal)
        return
      }

      if (event.key === 'Escape') {
        if (query) {
          event.preventDefault()
          setQuery('')
          setHighlightedProductIndex(0)
          return
        }
      }

      if (!cartItems.length) return

      if (event.key === 'ArrowRight' && !isTypingField) {
        event.preventDefault()
        setSelectedCartIndex((prev) => Math.min(prev + 1, cartItems.length - 1))
        return
      }
      if (event.key === 'ArrowLeft' && !isTypingField) {
        event.preventDefault()
        setSelectedCartIndex((prev) => Math.max(prev - 1, 0))
        return
      }

      const selectedItem = cartItems[selectedCartIndex]
      if (!selectedItem) return

      if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        incQty(selectedItem.product.id)
        return
      }
      if (event.key === '-' || event.key === '_') {
        event.preventDefault()
        decQty(selectedItem.product.id)
        return
      }
      if (event.key === 'Delete') {
        event.preventDefault()
        removeItem(selectedItem.product.id)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cartItems, cartTotal, posting, query, receipt, selectedCartIndex, highlightedProductIndex, activeBillId])

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
                inputRef={searchRef}
                placeholder="Search product name, SKU or scan barcode..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setHighlightedProductIndex(0)
                }}
                onKeyDown={handleSearchKeyDown}
                fullWidth
                sx={{ fontSize: '0.9rem' }}
              />
              <QrCodeScannerRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 1, overflowX: 'auto', pb: 0.5 }}>
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

          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
            Enter add product, Arrow Up/Down choose product, Arrow Left/Right choose cart line, +/- qty, Delete remove, F1 Cash, F2 UPI, F3 Card, Alt+N new bill
          </Typography>

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
                {filtered.map((p, index) => (
                  <Grid key={p.id} size={{ xs: 6, sm: 4, lg: 3 }}>
                    <ProductTile
                      product={p}
                      onAdd={addToCart}
                      highlighted={index === highlightedProductIndex}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%', minHeight: 0 }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <CartPanel
              bills={billSummaries}
              activeBillId={activeBill.id}
              onBillChange={setActiveBillId}
              onBillAdd={addDraftBill}
              onBillRemove={removeDraftBill}
              items={cartItems}
              selectedItemId={cartItems[selectedCartIndex]?.product.id || null}
              onSelectItem={(id) => {
                const nextIndex = cartItems.findIndex((item) => item.product.id === id)
                if (nextIndex >= 0) setSelectedCartIndex(nextIndex)
              }}
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
              {receipt.draftBillName} - {receipt.mode} - Bill {receipt.billNumber}
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Stack spacing={0.75} sx={{ textAlign: 'left', mb: 1.5 }}>
              {receipt.items.map((item, idx) => (
                <Stack key={`${item.productId}-${idx}`} direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2">{item.description} x {Number(item.quantity)}</Typography>
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
              <Button fullWidth variant="contained" onClick={closeReceipt}>Continue billing</Button>
            </Stack>
          </DialogContent>
        )}
      </Dialog>
    </Box>
  )
}
