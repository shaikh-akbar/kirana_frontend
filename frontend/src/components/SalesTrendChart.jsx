import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTheme } from '@mui/material/styles'
import { Box, Stack, Typography } from '@mui/material'
import { getChartColors } from '../theme/chartColors'
import { formatCurrency } from '../utils/format'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: 4,
        p: 1.25,
        minWidth: 160,
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
        {payload.map((entry) => (
          <Stack key={entry.dataKey} direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              <Box sx={{ width: 12, height: 2, bgcolor: entry.color, borderRadius: 1 }} />
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                {entry.name}
              </Typography>
            </Stack>
            <Typography variant="caption" fontWeight={700}>
              {formatCurrency(entry.value)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}

export default function SalesTrendChart({ data, height = 280 }) {
  const theme = useTheme()
  const colors = getChartColors(theme.palette.mode)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fillRetail" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.retail} stopOpacity={0.16} />
            <stop offset="100%" stopColor={colors.retail} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fillWholesale" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.wholesale} stopOpacity={0.16} />
            <stop offset="100%" stopColor={colors.wholesale} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={colors.grid} strokeDasharray="0" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={{ stroke: colors.grid }}
          tick={{ fill: colors.axis, fontSize: 11 }}
          interval={1}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: colors.axis, fontSize: 11 }}
          tickFormatter={(v) => `${Math.round(v / 1000)}K`}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.axis, strokeWidth: 1 }} />
        <Legend
          iconType="plainline"
          formatter={(value) => <span style={{ color: theme.palette.text.secondary, fontSize: 12, textTransform: 'capitalize' }}>{value}</span>}
        />
        <Area type="monotone" dataKey="retail" name="Retail" stroke={colors.retail} strokeWidth={2} fill="url(#fillRetail)" legendType="plainline" dot={false} activeDot={{ r: 4 }} />
        <Area type="monotone" dataKey="wholesale" name="Wholesale" stroke={colors.wholesale} strokeWidth={2} fill="url(#fillWholesale)" legendType="plainline" dot={false} activeDot={{ r: 4 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
