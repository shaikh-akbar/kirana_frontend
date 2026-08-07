import { useEffect, useState } from 'react'
import { Box, Stack, Typography, Button, Card } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { fetchWholesaleOrders } from '../../data/mockApi'
import { formatCurrency, formatDate } from '../../utils/format'

const columns = [
  { key: 'id', label: 'Order #' },
  { key: 'buyerName', label: 'Buyer' },
  { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
  { key: 'items', label: 'Items', numeric: true, render: (r) => r.items.length },
  { key: 'total', label: 'Total', numeric: true, render: (r) => formatCurrency(r.total) },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
]

export default function WholesaleOrders() {
  const [orders, setOrders] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    fetchWholesaleOrders().then((res) => active && setOrders(res))
    return () => {
      active = false
    }
  }, [])

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between",  mb: 2.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Wholesale Orders</Typography>
          <Typography variant="body2" color="text.secondary">
            {orders ? `${orders.length} orders on record` : 'Loading orders…'}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/wholesale/new')}>
          New Order
        </Button>
      </Stack>

      <Card sx={{ p: 1 }}>
        <DataTable
          columns={columns}
          rows={orders ?? []}
          getRowKey={(r) => r.id}
          loading={!orders}
          emptyProps={{ title: 'No wholesale orders yet', description: 'Create your first order to see it here.', actionLabel: 'New Order', onAction: () => navigate('/wholesale/new') }}
        />
      </Card>
    </Box>
  )
}
