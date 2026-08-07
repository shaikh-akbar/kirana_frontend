import { Chip } from '@mui/material'
import { statusColors } from '../theme/theme'

const LABELS = {
  PAID: 'Paid',
  CLEAR: 'Clear',
  PARTIAL: 'Partial',
  NEAR_LIMIT: 'Near limit',
  UNPAID: 'Unpaid',
  OVER_LIMIT: 'Over limit',
  PENDING: 'Pending',
  RECEIVED: 'Received',
  ORDERED: 'Ordered',
  OK: 'Healthy',
  LOW_STOCK: 'Low stock',
  EXPIRING: 'Expiring soon',
  CRITICAL: 'Critical',
}

export default function StatusBadge({ status, size = 'small' }) {
  const color = statusColors[status] ?? (status === 'RECEIVED' ? 'success' : status === 'ORDERED' ? 'info' : 'default')
  return (
    <Chip
      label={LABELS[status] ?? status}
      color={color}
      size={size}
      variant={color === 'default' ? 'outlined' : 'filled'}
      sx={{
        fontSize: '0.72rem',
        height: size === 'small' ? 24 : 28,
        '& .MuiChip-label': { px: 1.25 },
      }}
    />
  )
}
