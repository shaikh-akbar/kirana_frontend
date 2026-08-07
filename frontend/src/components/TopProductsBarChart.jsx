import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList, ResponsiveContainer } from 'recharts'
import { useTheme } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'
import { getChartColors } from '../theme/chartColors'
import { formatCurrency } from '../utils/format'

function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, boxShadow: 4, p: 1.25 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">{point.productName}</Typography>
      <Typography variant="body2" fontWeight={700}>{formatCurrency(point.revenue)}</Typography>
    </Box>
  )
}

export default function TopProductsBarChart({ data, height = 260 }) {
  const theme = useTheme()
  const colors = getChartColors(theme.palette.mode)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, left: 4, bottom: 4 }} barSize={18}>
        <CartesianGrid horizontal={false} stroke={colors.grid} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="productName"
          width={160}
          tickLine={false}
          axisLine={false}
          tick={{ fill: colors.axis, fontSize: 12 }}
        />
        <Tooltip content={<BarTooltip />} cursor={{ fill: colors.grid }} />
        <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell key={entry.productId} fill={colors.retail} />
          ))}
          <LabelList
            dataKey="revenue"
            position="right"
            formatter={(v) => formatCurrency(v)}
            style={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
