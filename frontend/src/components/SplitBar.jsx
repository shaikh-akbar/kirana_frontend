import { Box, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { getChartColors } from '../theme/chartColors'
import { formatCurrency } from '../utils/format'

// Two-segment share bar (Retail vs Wholesale) — each segment is directly
// labeled with a color-keyed dot, so identity never rides on hue alone.
export default function SplitBar({ retail, wholesale }) {
  const theme = useTheme()
  const colors = getChartColors(theme.palette.mode)
  const total = retail + wholesale || 1
  const retailPct = Math.round((retail / total) * 100)

  return (
    <Box>
      <Box sx={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden', bgcolor: 'action.hover' }}>
        <Box sx={{ width: `${retailPct}%`, bgcolor: colors.retail }} />
        <Box sx={{ width: '2px', bgcolor: 'background.paper' }} />
        <Box sx={{ flex: 1, bgcolor: colors.wholesale }} />
      </Box>
      <Stack direction="row" sx={{ justifyContent: "space-between",  mt: 1 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.retail }} />
          <Typography variant="caption" color="text.secondary">
            Retail {formatCurrency(retail)}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.wholesale }} />
          <Typography variant="caption" color="text.secondary">
            Wholesale {formatCurrency(wholesale)}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  )
}
