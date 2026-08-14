import { useCallback } from 'react'
import { Alert, Box, Grid, Card, Typography, Skeleton, Stack, Chip } from '@mui/material'
import SalesTrendChart from '../../components/SalesTrendChart'
import TopProductsBarChart from '../../components/TopProductsBarChart'
import StatTile from '../../components/StatTile'
import { fetchSalesReport } from '../../api/endpoints'
import { useResource } from '../../api/useResource'
import { formatCurrency, formatDate } from '../../utils/format'
import { useFirm } from '../../firm/firmStore'

export default function Reports() {
  const { activeFirmId } = useFirm()
  const { data, error, loading } = useResource(
    activeFirmId,
    useCallback(() => fetchSalesReport(), []),
    'Could not load the report'
  )

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>Reports</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        {data
          ? `${formatDate(data.fromDate)} — ${formatDate(data.toDate)} · retail & wholesale performance`
          : 'Retail & wholesale performance'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 4 }} sx={{ height: '100%' }}>
          {loading || !data ? <Skeleton variant="rounded" height={120} /> : (
            <StatTile label="Total revenue" value={formatCurrency(data.summary.total)} />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} sx={{ height: '100%' }}>
          {loading || !data ? <Skeleton variant="rounded" height={120} /> : (
            <StatTile label="Retail revenue" value={formatCurrency(data.summary.retail)} />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} sx={{ height: '100%' }}>
          {loading || !data ? <Skeleton variant="rounded" height={120} /> : (
            <StatTile label="Wholesale revenue" value={formatCurrency(data.summary.wholesale)} />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }} sx={{ height: '100%' }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Retail vs Wholesale trend</Typography>
            {loading || !data ? <Skeleton variant="rounded" height={280} /> : <SalesTrendChart data={data.trend} />}

            {data?.paymentModes?.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                {data.paymentModes.map((mode) => (
                  <Chip
                    key={mode.paymentMode}
                    size="small"
                    variant="outlined"
                    label={`${mode.paymentMode}: ${formatCurrency(mode.amount)}`}
                  />
                ))}
              </Stack>
            )}
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }} sx={{ height: '100%' }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Top products</Typography>
            {loading || !data ? (
              <Skeleton variant="rounded" height={260} />
            ) : data.topProducts.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No sales in this period.
              </Typography>
            ) : (
              <TopProductsBarChart data={data.topProducts} />
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
