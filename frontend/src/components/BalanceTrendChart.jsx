import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { useTheme } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'
import { getChartColors } from '../theme/chartColors'
import { formatCurrency, formatDate } from '../utils/format'

function BalanceTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, boxShadow: 4, p: 1.25 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
        {formatDate(point.date)}
      </Typography>
      <Typography variant="caption" color="text.secondary">{point.note}</Typography>
      <Typography variant="body2" fontWeight={700} sx={{ mt: 0.25 }}>
        {formatCurrency(point.runningBalance)}
      </Typography>
    </Box>
  )
}

export default function BalanceTrendChart({ transactions, creditLimit, height = 220 }) {
  const theme = useTheme()
  const colors = getChartColors(theme.palette.mode)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={transactions} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={colors.grid} />
        <XAxis dataKey="date" tickFormatter={(d) => formatDate(d).slice(0, 6)} tickLine={false} axisLine={{ stroke: colors.grid }} tick={{ fill: colors.axis, fontSize: 11 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: colors.axis, fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}K`} width={40} />
        <Tooltip content={<BalanceTooltip />} cursor={{ stroke: colors.axis, strokeWidth: 1 }} />
        <ReferenceLine y={creditLimit} stroke={theme.palette.error.main} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Credit limit', position: 'insideTopRight', fill: theme.palette.error.main, fontSize: 11 }} />
        <Line type="monotone" dataKey="runningBalance" stroke={theme.palette.text.primary} strokeWidth={2} dot={{ r: 4, fill: theme.palette.text.primary, strokeWidth: 0 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
