import { useEffect, useState } from 'react'
import {
  Box,
  Stack,
  Typography,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TextField,
  Button,
  Chip,
  Skeleton,
} from '@mui/material'
import PublishRoundedIcon from '@mui/icons-material/PublishRounded'
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import { fetchDailyPricing } from '../../data/mockApi'
import { tabularNums } from '../../theme/theme'
import { useToast } from '../../components/toastContext'

function DeltaTag({ current, previous }) {
  if (current === previous) return <RemoveRoundedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
  const up = current > previous
  const Icon = up ? ArrowUpwardRoundedIcon : ArrowDownwardRoundedIcon
  return <Icon sx={{ fontSize: 14, color: up ? 'success.main' : 'error.main' }} />
}

export default function DailyPricing() {
  const [rows, setRows] = useState(null)
  const { showToast } = useToast()

  useEffect(() => {
    let active = true
    fetchDailyPricing().then((res) => active && setRows(res))
    return () => {
      active = false
    }
  }, [])

  function updatePrice(productId, field, value) {
    setRows((prev) => prev.map((r) => (r.productId === productId ? { ...r, [field]: value, published: false } : r)))
  }

  const errors = rows
    ? rows.reduce((acc, r) => {
        if (r.retailPrice <= 0 || r.wholesalePrice <= 0) acc[r.productId] = 'Price must be greater than 0'
        else if (r.retailPrice < r.wholesalePrice) acc[r.productId] = 'Retail is below wholesale'
        return acc
      }, {})
    : {}

  const hasErrors = Object.keys(errors).length > 0
  const unpublishedCount = rows ? rows.filter((r) => !r.published).length : 0

  function publishAll() {
    setRows((prev) => prev.map((r) => ({ ...r, published: true })))
    showToast(`Today's rates published for ${rows.length} products`, 'success')
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between",  mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Daily Pricing</Typography>
          <Typography variant="body2" color="text.secondary">Edit today's wholesale &amp; retail rates, then publish</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PublishRoundedIcon />}
          disabled={!rows || hasErrors || unpublishedCount === 0}
          onClick={publishAll}
        >
          Publish today's rates{unpublishedCount > 0 ? ` (${unpublishedCount})` : ''}
        </Button>
      </Stack>

      <Card sx={{ p: 1 }}>
        <TableContainer sx={{ maxHeight: 660 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Wholesale (₹/kg)</TableCell>
                <TableCell align="right">Retail (₹/kg)</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!rows
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((__, c) => (
                        <TableCell key={c}><Skeleton variant="text" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : rows.map((r) => (
                    <TableRow key={r.productId} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{r.productName}</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{r.category}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", justifyContent: "flex-end" }}>
                          <DeltaTag current={r.wholesalePrice} previous={r.yesterdayWholesale} />
                          <TextField
                            type="number"
                            size="small"
                            value={r.wholesalePrice}
                            onChange={(e) => updatePrice(r.productId, 'wholesalePrice', Number(e.target.value))}
                            error={!!errors[r.productId]}
                            sx={{ width: 100, '& input': { textAlign: 'right', ...tabularNums } }}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", justifyContent: "flex-end" }}>
                          <DeltaTag current={r.retailPrice} previous={r.yesterdayRetail} />
                          <TextField
                            type="number"
                            size="small"
                            value={r.retailPrice}
                            onChange={(e) => updatePrice(r.productId, 'retailPrice', Number(e.target.value))}
                            error={!!errors[r.productId]}
                            helperText={errors[r.productId]}
                            sx={{ width: 100, '& input': { textAlign: 'right', ...tabularNums } }}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={r.published ? 'Published' : 'Draft'}
                          color={r.published ? 'success' : 'default'}
                          size="small"
                          variant={r.published ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}
