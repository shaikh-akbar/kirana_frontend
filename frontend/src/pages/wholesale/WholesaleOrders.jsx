import { useCallback } from 'react'
import { Alert, Box, Stack, Typography, Button, Card } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { fetchOrders } from '../../api/endpoints'
import { useResource } from '../../api/useResource'
import { formatCurrency, formatDate, formatQuantity } from '../../utils/format'
import { useFirm } from '../../firm/firmStore'

const columns = [
  { key: 'billNumber', label: 'Bill #' },
  { key: 'customerName', label: 'Buyer' },
  { key: 'billDate', label: 'Date', render: (r) => formatDate(r.billDate) },
  { key: 'itemCount', label: 'Items', numeric: true },
  { key: 'totalQuantity', label: 'Qty', numeric: true, render: (r) => formatQuantity(r.totalQuantity) },
  { key: 'netAmount', label: 'Total', numeric: true, render: (r) => formatCurrency(r.netAmount) },
  { key: 'paymentStatus', label: 'Status', render: (r) => <StatusBadge status={r.paymentStatus} /> },
]

export default function WholesaleOrders() {
  const navigate = useNavigate()
  const { activeFirmId } = useFirm()
  const { data: result, error, loading } = useResource(
    activeFirmId,
    useCallback(() => fetchOrders({ channel: 'WHOLESALE', limit: 100 }), []),
    'Could not load orders'
  )

  const orders = result?.rows ?? null

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between",  mb: 2.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Wholesale Orders</Typography>
          <Typography variant="body2" color="text.secondary">
            {result ? `${result.total} bill${result.total === 1 ? '' : 's'} on record` : 'Loading orders…'}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/wholesale/new')}>
          New Order
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      <Card sx={{ p: 1 }}>
        <DataTable
          columns={columns}
          rows={orders ?? []}
          getRowKey={(r) => r.id}
          loading={loading}
          emptyProps={{
            title: 'No wholesale orders yet',
            description: 'Create your first order to see it here.',
            actionLabel: 'New Order',
            onAction: () => navigate('/wholesale/new'),
          }}
        />
      </Card>
    </Box>
  )
}
