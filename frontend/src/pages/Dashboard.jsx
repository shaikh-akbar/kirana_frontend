import { useEffect, useState } from 'react'
import { Box, Grid, Card, Typography, Stack, List, ListItem, ListItemIcon, ListItemText, Skeleton, Chip } from '@mui/material'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded'
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import PaidRoundedIcon from '@mui/icons-material/PaidRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import SellRoundedIcon from '@mui/icons-material/SellRounded'
import StatTile from '../components/StatTile'
import SplitBar from '../components/SplitBar'
import SalesTrendChart from '../components/SalesTrendChart'
import { fetchDashboard } from '../data/mockApi'
import { formatCurrency, formatNumber } from '../utils/format'
import { tabularNums } from '../theme/theme'

const ACTIVITY_ICON = {
  order: ReceiptLongRoundedIcon,
  payment: PaidRoundedIcon,
  sale: PointOfSaleRoundedIcon,
  stock: WarningAmberRoundedIcon,
  pricing: SellRoundedIcon,
}

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let active = true
    fetchDashboard().then((res) => active && setData(res))
    return () => {
      active = false
    }
  }, [])

  const loading = !data

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between",  mb: 2.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Good afternoon, Akbar 👋
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here's how Shree Krishna Kirana Store is doing today.
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ height: '100%' }}>
          {loading ? (
            <Skeleton variant="rounded" height={168} />
          ) : (
            <StatTile
              label="Today's sales"
              value={formatCurrency(data.stats.todaysSales)}
              icon={<PaymentsRoundedIcon fontSize="small" />}
              delta={{ value: 4.8, upIsGood: true }}
              trend={data.trend.map((d) => ({ value: d.retail + d.wholesale }))}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ height: '100%' }}>
          {loading ? (
            <Skeleton variant="rounded" height={168} />
          ) : (
            <StatTile
              label="Retail vs Wholesale"
              value={`${Math.round((data.stats.retailShare / (data.stats.retailShare + data.stats.wholesaleShare)) * 100)}% Retail`}
              icon={<PieChartRoundedIcon fontSize="small" />}
              footer={<SplitBar retail={data.stats.retailShare} wholesale={data.stats.wholesaleShare} />}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ height: '100%' }}>
          {loading ? (
            <Skeleton variant="rounded" height={168} />
          ) : (
            <StatTile
              label="Pending Khata"
              value={formatCurrency(data.stats.pendingKhata)}
              icon={<AccountBalanceWalletRoundedIcon fontSize="small" />}
              delta={{ value: 2.1, upIsGood: false }}
              accent="#C1502E"
              trend={data.trend.map((d, i) => ({ value: data.stats.pendingKhata * (0.85 + i * 0.012) }))}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ height: '100%' }}>
          {loading ? (
            <Skeleton variant="rounded" height={168} />
          ) : (
            <StatTile
              label="Low stock count"
              value={`${data.stats.lowStockCount} items`}
              icon={<Inventory2RoundedIcon fontSize="small" />}
              delta={{ value: 1, upIsGood: false }}
              accent="#C1502E"
              trend={data.trend.map((_, i) => ({ value: 3 + Math.abs(Math.sin(i)) * 4 }))}
            />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }} sx={{ height: '100%' }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Sales trend — last 14 days
            </Typography>
            {loading ? (
              <Skeleton variant="rounded" height={280} />
            ) : (
              <SalesTrendChart data={data.trend} />
            )}
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }} sx={{ height: '100%' }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Recent activity
            </Typography>
            {loading ? (
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="text" height={32} />
                ))}
              </Stack>
            ) : (
              <List dense disablePadding>
                {data.activity.map((a) => {
                  const Icon = ACTIVITY_ICON[a.type] ?? ReceiptLongRoundedIcon
                  return (
                    <ListItem key={a.id} disableGutters sx={{ alignItems: 'flex-start', py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            borderRadius: '9px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'action.hover',
                            color: 'text.secondary',
                          }}
                        >
                          <Icon sx={{ fontSize: 16 }} />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={a.text}
                        secondary={a.time}
                        slotProps={{
                          primary: { fontSize: '0.83rem', fontWeight: 500 },
                          secondary: { fontSize: '0.72rem' },
                        }}
                      />
                    </ListItem>
                  )
                })}
              </List>
            )}
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Top wholesale products (by revenue)
            </Typography>
            {loading ? (
              <Skeleton variant="rounded" height={160} />
            ) : (
              <Stack spacing={1.25} sx={{ mt: 1 }}>
                {data.topProducts.map((p, idx) => (
                  <Stack key={p.productId} direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <Chip label={`#${idx + 1}`} size="small" sx={{ width: 34, fontWeight: 700 }} />
                    <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }} noWrap>
                      {p.productName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={tabularNums}>
                      {formatNumber(p.qtyKg)} kg
                    </Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ ...tabularNums, width: 100, textAlign: 'right' }}>
                      {formatCurrency(p.revenue)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
