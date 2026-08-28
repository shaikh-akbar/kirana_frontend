import { useCallback, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Stack,
  Typography,
  Button,
  Card,
  TextField,
  MenuItem,
  TablePagination,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { useNavigate } from 'react-router-dom'
import DataTable, { RowActions } from '../../components/DataTable'
import { fetchOrders, fetchBuyers, recordKhataPayment } from '../../api/endpoints'
import { apiErrorMessage } from '../../api/client'
import { useResource } from '../../api/useResource'
import StatusBadge from '../../components/StatusBadge'
import { formatCurrency, formatDate, formatQuantity } from '../../utils/format'
import { useFirm } from '../../firm/firmStore'
import { useToast } from '../../components/toastContext'

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
const PAY_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'NET_BANKING', label: 'NEFT / Bank transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'CARD', label: 'Card' },
]

function buyerIdForOrder(order, buyers) {
  if (order.buyerId != null) return order.buyerId
  const phone = String(order.customerPhone || '').trim()
  const name = String(order.customerName || '').trim().toLowerCase()
  return buyers.find((buyer) => {
    const buyerPhone = String(buyer.phone || '').trim()
    const buyerName = String(buyer.name || '').trim().toLowerCase()
    return (phone && buyerPhone === phone) || (name && buyerName === name)
  })?.id ?? null
}

function wholesaleColumns(onRecordPayment, buyers, getPaymentStatus) {
  return [
  { key: 'billNumber', label: 'Bill #' },
  { key: 'customerName', label: 'Buyer' },
  { key: 'customerPhone', label: 'Phone' },
  { key: 'billDate', label: 'Date', render: (r) => formatDate(r.billDate) },
  { key: 'itemCount', label: 'Items', numeric: true },
  { key: 'totalQuantity', label: 'Qty', numeric: true, render: (r) => formatQuantity(r.totalQuantity) },
  { key: 'netAmount', label: 'Total', numeric: true, render: (r) => formatCurrency(r.netAmount) },
  {
    key: 'actions',
    label: 'Action',
    align: 'right',
    render: (row) => {
      const buyerId = buyerIdForOrder(row, buyers)
      const status = String(getPaymentStatus(row) || '').toUpperCase()
      if (status === 'PAID') {
        return <StatusBadge status="PAID" />
      }
      if (status === 'PARTIAL') {
        return (
          <RowActions>
            <StatusBadge status="PARTIAL" />
            <Button
              size="small"
              variant="outlined"
              onClick={() => onRecordPayment(row, buyerId)}
              disabled={!buyerId}
            >
              Record Payment
            </Button>
          </RowActions>
        )
      }
      return (
        <RowActions>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onRecordPayment(row, buyerId)}
            disabled={!buyerId}
          >
            Record Payment
          </Button>
        </RowActions>
      )
    },
  },
]
}

const retailColumns = [
  { key: 'billNumber', label: 'Bill #' },
  { key: 'customerName', label: 'Customer' },
  { key: 'customerPhone', label: 'Phone' },
  { key: 'billDate', label: 'Date', render: (r) => formatDate(r.billDate) },
  { key: 'itemCount', label: 'Items', numeric: true },
  { key: 'totalQuantity', label: 'Qty', numeric: true, render: (r) => formatQuantity(r.totalQuantity) },
  { key: 'netAmount', label: 'Total', numeric: true, render: (r) => formatCurrency(r.netAmount) },
  { key: 'paymentStatus', label: 'Payment', render: (r) => <StatusBadge status={r.paymentStatus} /> },
]

export default function WholesaleOrders() {
  const navigate = useNavigate()
  const { activeFirmId } = useFirm()
  const { showToast } = useToast()
  const [tab, setTab] = useState('WHOLESALE')
  const [search, setSearch] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [paymentDraft, setPaymentDraft] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMode, setPaymentMode] = useState('CASH')
  const [recordingPayment, setRecordingPayment] = useState(false)
  const [statusOverrides, setStatusOverrides] = useState({})

  const params = useMemo(
    () => ({
      channel: tab,
      search: search.trim() || undefined,
      paymentStatus: tab === 'RETAIL' ? paymentStatus || undefined : undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      limit: rowsPerPage,
      offset: page * rowsPerPage,
    }),
    [tab, search, paymentStatus, fromDate, toDate, page, rowsPerPage]
  )

  const { data: result, error, loading, reload: reloadOrders } = useResource(
    activeFirmId == null ? null : `${activeFirmId}:${JSON.stringify(params)}`,
    useCallback(() => fetchOrders(params), [params]),
    'Could not load orders'
  )
  const { data: buyers, reload: reloadBuyers } = useResource(
    activeFirmId,
    useCallback(() => fetchBuyers(), []),
    'Could not load buyers'
  )

  function effectivePaymentStatus(row) {
    return statusOverrides[row.id] || row.paymentStatus
  }

  const rows = useMemo(() => {
    const baseRows = result?.rows ?? []
    if (!paymentStatus) return baseRows
    return baseRows.filter((row) => String(effectivePaymentStatus(row) || '').toUpperCase() === paymentStatus)
  }, [result, paymentStatus, statusOverrides])

  const total = paymentStatus ? rows.length : result?.total ?? 0
  const isWholesale = tab === 'WHOLESALE'
  const buyerRows = buyers ?? []

  function openPaymentDialog(order, buyerId) {
    if (!buyerId) {
      showToast(`Could not match ${order.customerName} to a khata buyer`, 'warning')
      return
    }
    setPaymentDraft({ order, buyerId })
    setPaymentAmount(String(Number(order.netAmount || 0)))
    setPaymentMode('CASH')
  }

  function closePaymentDialog() {
    if (recordingPayment) return
    setPaymentDraft(null)
    setPaymentAmount('')
    setPaymentMode('CASH')
  }

  const tableColumns = useMemo(
    () => (isWholesale ? wholesaleColumns(openPaymentDialog, buyerRows, effectivePaymentStatus) : retailColumns),
    [isWholesale, buyerRows, openPaymentDialog, statusOverrides]
  )

  async function submitPayment() {
    const amount = Number(paymentAmount)
    if (!paymentDraft || !amount || amount <= 0) return
    try {
      setRecordingPayment(true)
      await recordKhataPayment({ buyerId: paymentDraft.buyerId, amount, mode: paymentMode })
      setStatusOverrides((prev) => ({
        ...prev,
        [paymentDraft.order.id]: amount >= Number(paymentDraft.order.netAmount || 0) ? 'PAID' : 'PARTIAL',
      }))
      showToast(`Payment recorded for bill ${paymentDraft.order.billNumber}`, 'success')
      closePaymentDialog()
      reloadBuyers()
      reloadOrders()
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not record the payment'), 'error')
    } finally {
      setRecordingPayment(false)
    }
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Orders</Typography>
          <Typography variant="body2" color="text.secondary">
            {loading && !result ? 'Loading orders...' : `${total} bill${total === 1 ? '' : 's'} on record`}
          </Typography>
        </Box>
        {isWholesale && (
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/wholesale/new')}>
            New Order
          </Button>
        )}
      </Stack>

      <Card sx={{ mb: 2, p: 1 }}>
        <Tabs
          value={tab}
          onChange={(_, next) => {
            setTab(next)
            setPage(0)
          }}
        >
          <Tab value="WHOLESALE" label="Wholesale Bills" />
          <Tab value="RETAIL" label="POS Bills" />
        </Tabs>
      </Card>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          label="Search"
          placeholder={isWholesale ? 'Bill no, buyer, phone' : 'Bill no, customer, phone'}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          fullWidth
        />
        <TextField
          select
          label="Payment"
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value)
            setPage(0)
          }}
          sx={{ minWidth: { md: 180 } }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="PAID">Paid</MenuItem>
          <MenuItem value="PARTIAL">Partial</MenuItem>
          <MenuItem value="UNPAID">Unpaid</MenuItem>
        </TextField>
        <TextField
          label="From"
          type="date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value)
            setPage(0)
          }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="To"
          type="date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value)
            setPage(0)
          }}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      <Card sx={{ p: 1 }}>
        <DataTable
          columns={tableColumns}
          rows={rows}
          getRowKey={(r) => r.id}
          loading={loading}
          emptyProps={{
            title: isWholesale ? 'No wholesale orders found' : 'No POS bills found',
            description: isWholesale
              ? 'Try a different search or date range, or create a new order.'
              : 'Try a different search or date range, or create a new POS bill.',
            actionLabel: isWholesale ? 'New Order' : undefined,
            onAction: isWholesale ? () => navigate('/wholesale/new') : undefined,
          }}
        />
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value))
            setPage(0)
          }}
          rowsPerPageOptions={PAGE_SIZE_OPTIONS}
        />
      </Card>

      <Dialog open={!!paymentDraft} onClose={closePaymentDialog} maxWidth="xs" fullWidth>
        {paymentDraft && (
          <>
            <DialogTitle>Record payment for {paymentDraft.order.customerName}</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Bill {paymentDraft.order.billNumber} • Total {formatCurrency(paymentDraft.order.netAmount)}
                </Typography>
                <TextField
                  label="Amount received"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  autoFocus
                />
                <TextField
                  select
                  label="Payment mode"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  {PAY_METHODS.map((method) => (
                    <MenuItem key={method.value} value={method.value}>{method.label}</MenuItem>
                  ))}
                </TextField>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button onClick={closePaymentDialog} disabled={recordingPayment}>Cancel</Button>
              <Button variant="contained" onClick={submitPayment} disabled={recordingPayment || Number(paymentAmount) <= 0}>
                {recordingPayment ? 'Saving...' : 'Record Payment'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}
