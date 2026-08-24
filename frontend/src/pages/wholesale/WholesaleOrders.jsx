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
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { fetchOrders } from '../../api/endpoints'
import { useResource } from '../../api/useResource'
import { formatCurrency, formatDate, formatQuantity } from '../../utils/format'
import { useFirm } from '../../firm/firmStore'

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

const wholesaleColumns = [
  { key: 'billNumber', label: 'Bill #' },
  { key: 'customerName', label: 'Buyer' },
  { key: 'customerPhone', label: 'Phone' },
  { key: 'billDate', label: 'Date', render: (r) => formatDate(r.billDate) },
  { key: 'itemCount', label: 'Items', numeric: true },
  { key: 'totalQuantity', label: 'Qty', numeric: true, render: (r) => formatQuantity(r.totalQuantity) },
  { key: 'netAmount', label: 'Total', numeric: true, render: (r) => formatCurrency(r.netAmount) },
  { key: 'paymentStatus', label: 'Payment', render: (r) => <StatusBadge status={r.paymentStatus} /> },
]

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
  const [tab, setTab] = useState('WHOLESALE')
  const [search, setSearch] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  const params = useMemo(
    () => ({
      channel: tab,
      search: search.trim() || undefined,
      paymentStatus: paymentStatus || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      limit: rowsPerPage,
      offset: page * rowsPerPage,
    }),
    [tab, search, paymentStatus, fromDate, toDate, page, rowsPerPage]
  )

  const { data: result, error, loading } = useResource(
    activeFirmId == null ? null : `${activeFirmId}:${JSON.stringify(params)}`,
    useCallback(() => fetchOrders(params), [params]),
    'Could not load orders'
  )

  const rows = useMemo(() => {
    const baseRows = result?.rows ?? []
    if (!paymentStatus) return baseRows
    return baseRows.filter((row) => String(row.paymentStatus || '').toUpperCase() === paymentStatus)
  }, [result, paymentStatus])

  const total = paymentStatus ? rows.length : result?.total ?? 0
  const isWholesale = tab === 'WHOLESALE'

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
          columns={isWholesale ? wholesaleColumns : retailColumns}
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
    </Box>
  )
}
