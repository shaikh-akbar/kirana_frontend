import { Box, Stack, Typography } from '@mui/material'
import { formatCurrency } from '../utils/format'

// Severity meter: fill color escalates accent → warning → danger as the
// balance approaches/crosses the credit limit; unfilled track is a lighter
// step of the same ramp so the whole bar communicates state at a glance.
export default function CreditMeter({ balance, limit, label = 'Credit limit used' }) {
  const ratio = limit > 0 ? balance / limit : 0
  const pct = Math.min(ratio, 1) * 100
  const color = ratio > 1 ? 'error.main' : ratio >= 0.7 ? 'warning.main' : 'success.main'

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between",  mb: 0.75 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="caption" fontWeight={700} color={color}>
          {formatCurrency(balance)} / {formatCurrency(limit)}
        </Typography>
      </Stack>
      <Box sx={{ height: 8, borderRadius: 999, bgcolor: 'action.hover', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${pct}%`, bgcolor: color, borderRadius: 999 }} />
      </Box>
      {ratio > 1 && (
        <Typography variant="caption" color="error.main" fontWeight={600}>
          Over limit by {formatCurrency(balance - limit)}
        </Typography>
      )}
    </Box>
  )
}
