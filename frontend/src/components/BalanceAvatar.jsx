import { Avatar } from '@mui/material'
import { initialsOf } from '../data/buyers'

const RING_COLOR = {
  CLEAR: 'success.main',
  NEAR_LIMIT: 'warning.main',
  OVER_LIMIT: 'error.main',
}

export default function BalanceAvatar({ name, status, size = 44 }) {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: 'background.paper',
        color: 'text.primary',
        fontWeight: 700,
        fontSize: size * 0.36,
        border: '2.5px solid',
        borderColor: RING_COLOR[status] ?? 'divider',
      }}
    >
      {initialsOf(name)}
    </Avatar>
  )
}
