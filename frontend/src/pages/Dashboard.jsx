import { useCallback } from 'react'
import { Alert, Box, Grid, Card, Typography, Stack, List, ListItem, ListItemIcon, ListItemText, Skeleton, Chip } from '@mui/material'
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
import { fetchDashboard } from '../api/endpoints'
import { useResource } from '../api/useResource'
import { formatCurrency, formatQuantity, timeAgo } from '../utils/format'
import { tabularNums } from '../theme/theme'
import { useAuth } from '../auth/authStore'
import { useFirm } from '../firm/firmStore'

const ACTIVITY_ICON = {
  order: ReceiptLongRoundedIcon,
  payment: PaidRoundedIcon,
  sale: PointOfSaleRoundedIcon,
  stock: WarningAmberRoundedIcon,
  pricing: SellRoundedIcon,
}

/** "Good morning" / "Good afternoon" / "Good evening" by local clock. */
function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const { activeFirm, activeFirmId } = useFirm()

  // "Saheb Ali" -> "Saheb"; the greeting reads better with a first name.
  const firstName = user?.name?.trim().split(/\s+/)[0]

  // Keyed on the firm: every figure below is one firm's books, so switching
  // firms refetches rather than leaving the previous firm's totals on screen.
  const { data, error, loading } = useResource(
    activeFirmId,
    useCallback(() => fetchDashboard(), []),
    'Could not load the dashboard'
  )

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between",  mb: 2.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            {greeting()}{firstName ? `, ${firstName}` : ''} 👋
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeFirm
              ? `Here's how ${activeFirm.firmName} is doing today.`
              : "Here's how your firm is doing today."}
          </Typography>
        </Box>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ height: '100%' }}>
          {loading || !data ? (
            <Skeleton variant="rounded" height={168} />
          ) : (
            <StatTile
              label="Today's sales"
              value={formatCurrency(data.stats.todaysSales)}
              icon={<PaymentsRoundedIcon fontSize="small" />}
              // Real change against yesterday's takings, computed server-side.
              delta={{ value: data.stats.salesDeltaPct, upIsGood: true }}
              trend={data.trend.map((d) => ({ value: d.retail + d.wholesale }))}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ height: '100%' }}>
          {loading || !data ? (
            <Skeleton variant="rounded" height={168} />
          ) : (
            <StatTile
              label="Retail vs Wholesale"
              // A day with no sales yet would divide by zero and print "NaN%".
              value={
                data.stats.todaysSales > 0
                  ? `${Math.round((data.stats.retailShare / data.stats.todaysSales) * 100)}% Retail`
                  : 'No sales yet'
              }
              icon={<PieChartRoundedIcon fontSize="small" />}
              footer={<SplitBar retail={data.stats.retailShare} wholesale={data.stats.wholesaleShare} />}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ height: '100%' }}>
          {loading || !data ? (
            <Skeleton variant="rounded" height={168} />
          ) : (
            <StatTile
              label="Pending Khata"
              value={formatCurrency(data.stats.pendingKhata)}
              icon={<AccountBalanceWalletRoundedIcon fontSize="small" />}
              accent="#C1502E"
              footer={
                <Typography variant="caption" color="text.secondary">
                  {data.stats.khataAccounts} account{data.stats.khataAccounts === 1 ? '' : 's'}
                  {data.stats.overLimitCount > 0 ? ` · ${data.stats.overLimitCount} over limit` : ''}
                </Typography>
              }
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ height: '100%' }}>
          {loading || !data ? (
            <Skeleton variant="rounded" height={168} />
          ) : (
            <StatTile
              label="Low stock count"
              value={`${data.stats.lowStockCount} items`}
              icon={<Inventory2RoundedIcon fontSize="small" />}
              accent="#C1502E"
              footer={
                <Typography variant="caption" color="text.secondary">
                  at or below reorder level
                </Typography>
              }
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
            {loading || !data ? (
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
            {loading || !data ? (
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="text" height={32} />
                ))}
              </Stack>
            ) : data.activity.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                Nothing has happened at this firm yet. Bills, khata repayments and stock
                receipts will appear here.
              </Typography>
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
                        secondary={timeAgo(a.at)}
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
              Top products (by revenue, last 30 days)
            </Typography>
            {loading || !data ? (
              <Skeleton variant="rounded" height={160} />
            ) : data.topProducts.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No sales in the last 30 days.
              </Typography>
            ) : (
              <Stack spacing={1.25} sx={{ mt: 1 }}>
                {data.topProducts.map((p, idx) => (
                  <Stack key={p.productId} direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <Chip label={`#${idx + 1}`} size="small" sx={{ width: 34, fontWeight: 700 }} />
                    <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }} noWrap>
                      {p.productName}
                    </Typography>
                    {/* Packet goods weigh nothing on the bill, so the sold
                        quantity is the figure that always means something. */}
                    <Typography variant="body2" color="text.secondary" sx={tabularNums}>
                      {p.weightKg > 0 ? `${formatQuantity(p.weightKg)} kg` : formatQuantity(p.quantity)}
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
