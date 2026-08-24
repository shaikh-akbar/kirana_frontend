import { useCallback, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Stack,
  Typography,
  Card,
  Button,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  TablePagination,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import PurchaseEntryDialog from './PurchaseEntryDialog'
import { fetchPurchases, fetchSuppliersReport } from '../../api/endpoints'
import { useResource } from '../../api/useResource'
import { formatCurrency, formatDate, formatQuantity } from '../../utils/format'
import { useFirm } from '../../firm/firmStore'

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

const purchaseColumns = [
  { key: 'invoiceNumber', label: 'Invoice #' },
  { key: 'supplierName', label: 'Supplier' },
  { key: 'purchaseDate', label: 'Date', render: (r) => formatDate(r.purchaseDate) },
  { key: 'lineCount', label: 'Line items', numeric: true },
  { key: 'totalQty', label: 'Total Qty', numeric: true, render: (r) => formatQuantity(r.totalQty) },
  { key: 'totalAmount', label: 'Value', numeric: true, render: (r) => formatCurrency(r.totalAmount) },
  { key: 'paymentStatus', label: 'Payment', render: (r) => <StatusBadge status={r.paymentStatus} /> },
]

const supplierColumns = [
  { key: 'vendorName', label: 'Supplier' },
  { key: 'phone', label: 'Phone' },
  { key: 'purchaseCount', label: 'Bills', numeric: true },
  { key: 'totalQty', label: 'Qty bought', numeric: true, render: (r) => formatQuantity(r.totalQty) },
  { key: 'totalAmount', label: 'Total bought', numeric: true, render: (r) => formatCurrency(r.totalAmount) },
  { key: 'currentBalance', label: 'Balance', numeric: true, render: (r) => formatCurrency(r.currentBalance) },
  { key: 'lastPurchaseDate', label: 'Last bill', render: (r) => formatDate(r.lastPurchaseDate) },
]

export default function Purchases() {
  const [entryOpen, setEntryOpen] = useState(false)
  const [tab, setTab] = useState('purchases')
  const [purchasePaymentStatus, setPurchasePaymentStatus] = useState('')
  const [purchaseFromDate, setPurchaseFromDate] = useState('')
  const [purchaseToDate, setPurchaseToDate] = useState('')
  const [purchasePage, setPurchasePage] = useState(0)
  const [purchaseRowsPerPage, setPurchaseRowsPerPage] = useState(20)
  const [supplierSearch, setSupplierSearch] = useState('')
  const [supplierFromDate, setSupplierFromDate] = useState('')
  const [supplierToDate, setSupplierToDate] = useState('')
  const [supplierPage, setSupplierPage] = useState(0)
  const [supplierRowsPerPage, setSupplierRowsPerPage] = useState(20)
  const { activeFirmId } = useFirm()

  const purchaseParams = useMemo(
    () => ({
      paymentStatus: purchasePaymentStatus || undefined,
      fromDate: purchaseFromDate || undefined,
      toDate: purchaseToDate || undefined,
      limit: purchaseRowsPerPage,
      offset: purchasePage * purchaseRowsPerPage,
    }),
    [purchasePaymentStatus, purchaseFromDate, purchaseToDate, purchasePage, purchaseRowsPerPage]
  )

  const supplierParams = useMemo(
    () => ({
      search: supplierSearch.trim() || undefined,
      fromDate: supplierFromDate || undefined,
      toDate: supplierToDate || undefined,
      limit: supplierRowsPerPage,
      offset: supplierPage * supplierRowsPerPage,
    }),
    [supplierSearch, supplierFromDate, supplierToDate, supplierPage, supplierRowsPerPage]
  )

  const {
    data: purchaseResult,
    error: purchaseError,
    loading: purchaseLoading,
    reload: reloadPurchases,
  } = useResource(
    activeFirmId == null ? null : `${activeFirmId}:purchases:${JSON.stringify(purchaseParams)}`,
    useCallback(() => fetchPurchases(purchaseParams), [purchaseParams]),
    'Could not load purchases'
  )

  const {
    data: supplierResult,
    error: supplierError,
    loading: supplierLoading,
    reload: reloadSuppliers,
  } = useResource(
    activeFirmId == null ? null : `${activeFirmId}:suppliers:${JSON.stringify(supplierParams)}`,
    useCallback(() => fetchSuppliersReport(supplierParams), [supplierParams]),
    'Could not load suppliers'
  )

  const purchaseRows = purchaseResult?.rows ?? []
  const purchaseTotal = purchaseResult?.total ?? 0
  const supplierRows = supplierResult?.rows ?? []
  const supplierTotal = supplierResult?.total ?? 0
  const activeError = tab === 'purchases' ? purchaseError : supplierError

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Purchases</Typography>
          <Typography variant="body2" color="text.secondary">
            {tab === 'purchases'
              ? 'Supplier bills you have entered - each one books its goods into stock'
              : 'See which suppliers supplied the most stock in the selected period'}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setEntryOpen(true)}>
          New Purchase Order
        </Button>
      </Stack>

      <Card sx={{ mb: 2, p: 1 }}>
        <Tabs value={tab} onChange={(_, next) => setTab(next)}>
          <Tab value="purchases" label="Purchase Bills" />
          <Tab value="suppliers" label="Supplier Summary" />
        </Tabs>
      </Card>

      {tab === 'purchases' ? (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            select
            label="Payment"
            value={purchasePaymentStatus}
            onChange={(e) => {
              setPurchasePaymentStatus(e.target.value)
              setPurchasePage(0)
            }}
            sx={{ minWidth: { md: 180 } }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="PAID">Paid</MenuItem>
            <MenuItem value="PARTIAL">Partial</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
          </TextField>
          <TextField
            label="From"
            type="date"
            value={purchaseFromDate}
            onChange={(e) => {
              setPurchaseFromDate(e.target.value)
              setPurchasePage(0)
            }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To"
            type="date"
            value={purchaseToDate}
            onChange={(e) => {
              setPurchaseToDate(e.target.value)
              setPurchasePage(0)
            }}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      ) : (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            label="Search supplier"
            placeholder="Name, phone, GSTIN"
            value={supplierSearch}
            onChange={(e) => {
              setSupplierSearch(e.target.value)
              setSupplierPage(0)
            }}
            fullWidth
          />
          <TextField
            label="From"
            type="date"
            value={supplierFromDate}
            onChange={(e) => {
              setSupplierFromDate(e.target.value)
              setSupplierPage(0)
            }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To"
            type="date"
            value={supplierToDate}
            onChange={(e) => {
              setSupplierToDate(e.target.value)
              setSupplierPage(0)
            }}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      )}

      {activeError && <Alert severity="error" sx={{ mb: 2.5 }}>{activeError}</Alert>}

      <Card sx={{ p: 1 }}>
        {tab === 'purchases' ? (
          <>
            <DataTable
              columns={purchaseColumns}
              rows={purchaseRows}
              getRowKey={(r) => r.id}
              loading={purchaseLoading}
              emptyProps={{
                title: 'No purchase bills found',
                description: 'Try a different date range or enter a new supplier bill.',
                actionLabel: 'New Purchase Order',
                onAction: () => setEntryOpen(true),
              }}
            />
            <TablePagination
              component="div"
              count={purchaseTotal}
              page={purchasePage}
              onPageChange={(_, nextPage) => setPurchasePage(nextPage)}
              rowsPerPage={purchaseRowsPerPage}
              onRowsPerPageChange={(e) => {
                setPurchaseRowsPerPage(Number(e.target.value))
                setPurchasePage(0)
              }}
              rowsPerPageOptions={PAGE_SIZE_OPTIONS}
            />
          </>
        ) : (
          <>
            <DataTable
              columns={supplierColumns}
              rows={supplierRows}
              getRowKey={(r) => r.id}
              loading={supplierLoading}
              emptyProps={{
                title: 'No suppliers found',
                description: 'Try a different search or date range.',
              }}
            />
            <TablePagination
              component="div"
              count={supplierTotal}
              page={supplierPage}
              onPageChange={(_, nextPage) => setSupplierPage(nextPage)}
              rowsPerPage={supplierRowsPerPage}
              onRowsPerPageChange={(e) => {
                setSupplierRowsPerPage(Number(e.target.value))
                setSupplierPage(0)
              }}
              rowsPerPageOptions={PAGE_SIZE_OPTIONS}
            />
          </>
        )}
      </Card>

      <PurchaseEntryDialog
        open={entryOpen}
        onClose={() => setEntryOpen(false)}
        onCreated={() => {
          setEntryOpen(false)
          reloadPurchases()
          reloadSuppliers()
        }}
      />
    </Box>
  )
}
