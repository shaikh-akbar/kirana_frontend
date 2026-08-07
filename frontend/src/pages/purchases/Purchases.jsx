import { useEffect, useState } from 'react'
import { Box, Stack, Typography, Card, Button } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { fetchPurchases } from '../../data/mockApi'
import { formatDate, formatNumber } from '../../utils/format'
import { useToast } from '../../components/toastContext'

const columns = [
  { key: 'id', label: 'PO #' },
  { key: 'supplier', label: 'Supplier' },
  { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
  { key: 'items', label: 'Line items', numeric: true, render: (r) => r.items.length },
  { key: 'totalQty', label: 'Total Qty', numeric: true, render: (r) => `${formatNumber(r.totalQty)} kg` },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
]

export default function Purchases() {
  const [rows, setRows] = useState(null)
  const { showToast } = useToast()

  useEffect(() => {
    let active = true
    fetchPurchases().then((res) => active && setRows(res))
    return () => {
      active = false
    }
  }, [])

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between",  mb: 2.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Purchases</Typography>
          <Typography variant="body2" color="text.secondary">Purchase orders raised with your suppliers</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => showToast('Purchase order draft created', 'success')}>
          New Purchase Order
        </Button>
      </Stack>

      <Card sx={{ p: 1 }}>
        <DataTable
          columns={columns}
          rows={rows ?? []}
          getRowKey={(r) => r.id}
          loading={!rows}
          emptyProps={{ title: 'No purchase orders yet' }}
        />
      </Card>
    </Box>
  )
}
