import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { useTheme } from '@mui/material/styles'

// Decorative 12-point trend line for stat tiles. Bare sparklines are the one
// chart form the dataviz method allows to skip hover — the big number beside
// it already carries the value.
export default function Sparkline({ data, dataKey = 'value', height = 40, accent }) {
  const theme = useTheme()
  const color = accent ?? theme.palette.primary.main
  const gradientId = `spark-${dataKey}-${color.replace('#', '')}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
          dot={false}
          activeDot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
