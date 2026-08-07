import { useEffect, useState } from 'react'
import { Box, Grid, Card, Typography, Skeleton } from '@mui/material'
import SalesTrendChart from '../../components/SalesTrendChart'
import TopProductsBarChart from '../../components/TopProductsBarChart'
import StatTile from '../../components/StatTile'
import { fetchDashboard } from '../../data/mockApi'
import { formatCurrency } from '../../utils/format'

export default function Reports() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let active = true
    fetchDashboard().then((res) => active && setData(res))
    return () => {
      active = false
    }
  }, [])

  const loading = !data
  const totalRetail = data?.trend.reduce((s, d) => s + d.retail, 0) ?? 0
  const totalWholesale = data?.trend.reduce((s, d) => s + d.wholesale, 0) ?? 0

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>Reports</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Last 14 days — retail &amp; wholesale performance</Typography>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 4 }} sx={{ height: '100%' }}>
          {loading ? <Skeleton variant="rounded" height={120} /> : (
            <StatTile label="Total revenue (14d)" value={formatCurrency(totalRetail + totalWholesale)} />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} sx={{ height: '100%' }}>
          {loading ? <Skeleton variant="rounded" height={120} /> : (
            <StatTile label="Retail revenue (14d)" value={formatCurrency(totalRetail)} />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} sx={{ height: '100%' }}>
          {loading ? <Skeleton variant="rounded" height={120} /> : (
            <StatTile label="Wholesale revenue (14d)" value={formatCurrency(totalWholesale)} />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }} sx={{ height: '100%' }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Retail vs Wholesale trend</Typography>
            {loading ? <Skeleton variant="rounded" height={280} /> : <SalesTrendChart data={data.trend} />}
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }} sx={{ height: '100%' }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Top wholesale products</Typography>
            {loading ? <Skeleton variant="rounded" height={260} /> : <TopProductsBarChart data={data.topProducts} />}
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
