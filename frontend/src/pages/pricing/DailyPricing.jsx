import { useCallback, useMemo, useState } from 'react'
import {
  Alert,
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
import { fetchDailyPricing, updateDailyPrices } from '../../api/endpoints'
import { apiErrorMessage } from '../../api/client'
import { useResource } from '../../api/useResource'
import { tabularNums } from '../../theme/theme'
import { useToast } from '../../components/toastContext'
import { useFirm } from '../../firm/firmStore'
import { useAuth } from '../../auth/authStore'

function DeltaTag({ current, previous }) {
  if (previous == null || current === previous) {
    return <RemoveRoundedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
  }
  const up = current > previous
  const Icon = up ? ArrowUpwardRoundedIcon : ArrowDownwardRoundedIcon
  return <Icon sx={{ fontSize: 14, color: up ? 'success.main' : 'error.main' }} />
}

export default function DailyPricing() {
  /*
   * Typed rates are held as an overlay keyed by product id rather than by
   * copying the fetched sheet into state. The sheet stays the server's, the
   * overlay stays the user's, and the rows below are the two merged — so a
   * refetch cannot silently discard rates that were typed but not yet
   * published, and nothing has to be seeded from an effect.
   */
  const [edits, setEdits] = useState({})
  const [publishing, setPublishing] = useState(false)
  const { showToast } = useToast()
  const { activeFirmId } = useFirm()
  const { user } = useAuth()

  // RETAILER can view today's rate sheet (POS needs it) but only ADMIN/
  // WHOLESALER may call PUT /prices/daily-update on the backend.
  const canEditPricing = user?.roleName === 'ADMIN' || user?.roleName === 'WHOLESALER'

  const { data: sheet, error, loading, reload } = useResource(
    activeFirmId,
    useCallback(() => fetchDailyPricing(), []),
    'Could not load the rate sheet'
  )

  const rows = useMemo(() => {
    if (!sheet) return null
    return sheet.rows.map((row) => {
      const edit = edits[row.productId]
      if (!edit) return row
      return { ...row, ...edit, published: false }
    })
  }, [sheet, edits])

  function updatePrice(productId, field, value) {
    setEdits((prev) => ({ ...prev, [productId]: { ...prev[productId], [field]: value } }))
  }

  const errors = rows
    ? rows.reduce((acc, r) => {
        // A blank rate is a product not being priced today, not an error — only
        // a rate that has been typed and is nonsense counts.
        if (r.wholesalePrice == null || r.retailPrice == null || r.wholesalePrice === '' || r.retailPrice === '') {
          return acc
        }
        if (Number(r.retailPrice) <= 0 || Number(r.wholesalePrice) <= 0) {
          acc[r.productId] = 'Price must be greater than 0'
        } else if (Number(r.retailPrice) < Number(r.wholesalePrice)) {
          acc[r.productId] = 'Retail is below wholesale'
        }
        return acc
      }, {})
    : {}

  const hasErrors = Object.keys(errors).length > 0
  const pending = rows
    ? rows.filter(
        (r) =>
          !r.published &&
          r.wholesalePrice != null && r.wholesalePrice !== '' &&
          r.retailPrice != null && r.retailPrice !== ''
      )
    : []

  async function publishAll() {
    if (pending.length === 0 || hasErrors || publishing) return
    setPublishing(true)
    try {
      await updateDailyPrices({
        effectiveDate: sheet.effectiveDate,
        updates: pending.map((r) => ({
          productId: r.productId,
          wholesalePrice: Number(r.wholesalePrice),
          retailPrice: Number(r.retailPrice),
        })),
      })
      showToast(`Rates published for ${pending.length} product${pending.length === 1 ? '' : 's'}`, 'success')
      // The overlay has been accepted by the server, so it is cleared and the
      // sheet refetched — the fetched rows are now the truth.
      setEdits({})
      reload()
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not publish rates'), 'error')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between",  mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Daily Pricing</Typography>
          <Typography variant="body2" color="text.secondary">
            Edit today's wholesale &amp; retail rates, then publish
          </Typography>
        </Box>
        {canEditPricing && (
          <Button
            variant="contained"
            startIcon={<PublishRoundedIcon />}
            disabled={!rows || hasErrors || pending.length === 0 || publishing}
            onClick={publishAll}
          >
            {publishing ? 'Publishing…' : `Publish today's rates${pending.length > 0 ? ` (${pending.length})` : ''}`}
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      <Card sx={{ p: 1 }}>
        <TableContainer sx={{ maxHeight: 660 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Wholesale (₹/unit)</TableCell>
                <TableCell align="right">Retail (₹/unit)</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading || !rows
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((__, c) => (
                        <TableCell key={c}><Skeleton variant="text" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : rows.map((r) => (
                    <TableRow key={r.productId} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {r.productName}
                        {r.unit && (
                          <Typography component="span" variant="caption" color="text.secondary"> /{r.unit}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{r.category || '—'}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", justifyContent: "flex-end" }}>
                          <DeltaTag current={Number(r.wholesalePrice)} previous={r.previousWholesale} />
                          <TextField
                            type="number"
                            size="small"
                            value={r.wholesalePrice ?? ''}
                            onChange={(e) => updatePrice(r.productId, 'wholesalePrice', e.target.value)}
                            error={!!errors[r.productId]}
                            disabled={!canEditPricing}
                            sx={{ width: 100, '& input': { textAlign: 'right', ...tabularNums } }}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", justifyContent: "flex-end" }}>
                          <DeltaTag current={Number(r.retailPrice)} previous={r.previousRetail} />
                          <TextField
                            type="number"
                            size="small"
                            value={r.retailPrice ?? ''}
                            onChange={(e) => updatePrice(r.productId, 'retailPrice', e.target.value)}
                            error={!!errors[r.productId]}
                            helperText={errors[r.productId]}
                            disabled={!canEditPricing}
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

        {rows?.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
            No products in the catalog yet — add products before setting rates.
          </Typography>
        )}
      </Card>
    </Box>
  )
}
