import { Card, Box, Typography, Stack } from '@mui/material'
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import Sparkline from './Sparkline'

// delta.value: signed number (e.g. +6.2); delta.upIsGood: whether a rise is
// a good thing for this metric (false for "pending khata", "low stock count").
export default function StatTile({ label, value, icon, delta, trend, accent, footer }) {
  const isUp = delta ? delta.value >= 0 : null
  const isGood = delta ? (delta.upIsGood ? isUp : !isUp) : null

  return (
    <Card sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
        {icon && (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(217,168,87,0.14)' : 'rgba(232,163,61,0.12)'),
              color: 'primary.main',
            }}
          >
            {icon}
          </Box>
        )}
      </Stack>

      <Typography variant="h4" component="div" fontWeight={700} sx={{ lineHeight: 1.1 }}>
        {value}
      </Typography>

      {delta && (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          {isUp ? (
            <ArrowUpwardRoundedIcon sx={{ fontSize: 16, color: isGood ? 'success.main' : 'error.main' }} />
          ) : (
            <ArrowDownwardRoundedIcon sx={{ fontSize: 16, color: isGood ? 'success.main' : 'error.main' }} />
          )}
          <Typography variant="caption" fontWeight={700} color={isGood ? 'success.main' : 'error.main'}>
            {Math.abs(delta.value)}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {delta.label ?? 'vs yesterday'}
          </Typography>
        </Stack>
      )}

      {footer && (
        <Box sx={{ mt: 'auto', pt: 0.5 }}>{footer}</Box>
      )}

      {!footer && trend && (
        <Box sx={{ mt: 'auto', pt: 0.5 }}>
          <Sparkline data={trend} accent={accent} />
        </Box>
      )}
    </Card>
  )
}
