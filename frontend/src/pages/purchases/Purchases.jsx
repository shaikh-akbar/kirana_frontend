import { useCallback, useState } from 'react'
import { Alert, Box, Stack, Typography, Card, Button } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import PurchaseEntryDialog from './PurchaseEntryDialog'
import { fetchPurchases } from '../../api/endpoints'
import { useResource } from '../../api/useResource'
import { formatCurrency, formatDate, formatQuantity } from '../../utils/format'
import { useFirm } from '../../firm/firmStore'

const columns = [
  { key: 'invoiceNumber', label: 'Invoice #' },
  { key: 'supplierName', label: 'Supplier' },
  { key: 'purchaseDate', label: 'Date', render: (r) => formatDate(r.purchaseDate) },
  { key: 'lineCount', label: 'Line items', numeric: true },
  { key: 'totalQty', label: 'Total Qty', numeric: true, render: (r) => formatQuantity(r.totalQty) },
  { key: 'totalAmount', label: 'Value', numeric: true, render: (r) => formatCurrency(r.totalAmount) },
  { key: 'paymentStatus', label: 'Payment', render: (r) => <StatusBadge status={r.paymentStatus} /> },
]

export default function Purchases() {
  const [entryOpen, setEntryOpen] = useState(false)
  const { activeFirmId } = useFirm()
  const { data: result, error, loading, reload } = useResource(
    activeFirmId,
    useCallback(() => fetchPurchases({ limit: 100 }), []),
    'Could not load purchases'
  )

  const rows = result?.rows ?? null

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between",  mb: 2.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Purchases</Typography>
          <Typography variant="body2" color="text.secondary">
            Supplier bills you have entered — each one books its goods into stock
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setEntryOpen(true)}>
          New Purchase Order
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      <Card sx={{ p: 1 }}>
        <DataTable
          columns={columns}
          rows={rows ?? []}
          getRowKey={(r) => r.id}
          loading={loading}
          emptyProps={{
            title: 'No purchase orders yet',
            description: 'Enter a supplier bill to bring stock into this firm.',
            actionLabel: 'New Purchase Order',
            onAction: () => setEntryOpen(true),
          }}
        />
      </Card>

      <PurchaseEntryDialog
        open={entryOpen}
        onClose={() => setEntryOpen(false)}
        onCreated={() => {
          setEntryOpen(false)
          reload()
        }}
      />
    </Box>
  )
}
