import { useEffect, useMemo, useState } from 'react'
import { Box, Stack, Typography, Card, Chip, TextField, MenuItem } from '@mui/material'
import DataTable from '../../components/DataTable'
import { fetchInventory } from '../../data/mockApi'
import { formatDate } from '../../utils/format'
import { CATEGORIES } from '../../data/products'

const FLAG_STRIPE = {
  CRITICAL: 'error.main',
  EXPIRING: 'warning.main',
  LOW_STOCK: 'warning.main',
  OK: 'transparent',
}

const FLAG_LABEL = {
  CRITICAL: 'Expiring & low stock',
  EXPIRING: 'Expiring soon',
  LOW_STOCK: 'Below threshold',
  OK: 'Healthy',
}

const FLAG_COLOR = {
  CRITICAL: 'error',
  EXPIRING: 'warning',
  LOW_STOCK: 'warning',
  OK: 'success',
}

const columns = [
  { key: 'productName', label: 'Product' },
  { key: 'category', label: 'Category' },
  { key: 'batchNo', label: 'Batch' },
  { key: 'mfgDate', label: 'Mfg Date', render: (r) => formatDate(r.mfgDate) },
  { key: 'expiryDate', label: 'Expiry', render: (r) => `${formatDate(r.expiryDate)} (${r.daysToExpiry}d)` },
  { key: 'qty', label: 'Qty', numeric: true, render: (r) => `${r.qty} ${r.unit}` },
  { key: 'threshold', label: 'Threshold', numeric: true, render: (r) => `${r.threshold} ${r.unit}` },
  { key: 'location', label: 'Location' },
  {
    key: 'flag',
    label: 'Status',
    render: (r) => <Chip label={FLAG_LABEL[r.flag]} color={FLAG_COLOR[r.flag]} size="small" variant={r.flag === 'OK' ? 'outlined' : 'filled'} />,
  },
]

export default function Inventory() {
  const [rows, setRows] = useState(null)
  const [category, setCategory] = useState('All')
  const [flagFilter, setFlagFilter] = useState('All')

  useEffect(() => {
    let active = true
    fetchInventory().then((res) => active && setRows(res))
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    if (!rows) return []
    return rows.filter((r) => {
      const matchesCategory = category === 'All' || r.category === category
      const matchesFlag = flagFilter === 'All' || r.flag === flagFilter
      return matchesCategory && matchesFlag
    })
  }, [rows, category, flagFilter])

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between",  mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Inventory</Typography>
          <Typography variant="body2" color="text.secondary">Batch and expiry-aware stock across all locations</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <TextField select size="small" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 170 }}>
            <MenuItem value="All">All categories</MenuItem>
            {CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Status" value={flagFilter} onChange={(e) => setFlagFilter(e.target.value)} sx={{ minWidth: 170 }}>
            <MenuItem value="All">All statuses</MenuItem>
            <MenuItem value="CRITICAL">Expiring & low stock</MenuItem>
            <MenuItem value="EXPIRING">Expiring soon</MenuItem>
            <MenuItem value="LOW_STOCK">Below threshold</MenuItem>
            <MenuItem value="OK">Healthy</MenuItem>
          </TextField>
        </Stack>
      </Stack>

      <Card sx={{ p: 1 }}>
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(r) => r.id}
          loading={!rows}
          maxHeight={640}
          rowSx={(r) => ({
            '& td:first-of-type': {
              borderLeft: '3px solid',
              borderLeftColor: FLAG_STRIPE[r.flag],
              pl: r.flag === 'OK' ? 2 : 1.75,
            },
          })}
          emptyProps={{ title: 'No matching stock', description: 'Try a different category or status filter.' }}
        />
      </Card>
    </Box>
  )
}
