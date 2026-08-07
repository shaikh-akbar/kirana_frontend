import { ToggleButtonGroup, ToggleButton } from '@mui/material'
import { UNITS } from '../data/products'

export default function QtyUnitToggle({ value, onChange, size = 'small' }) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      size={size}
      onChange={(e, next) => next && onChange(next)}
      sx={{
        '& .MuiToggleButton-root': {
          px: 1.1,
          py: 0.25,
          fontSize: '0.7rem',
          fontWeight: 700,
          lineHeight: 1.6,
        },
      }}
    >
      {UNITS.map((u) => (
        <ToggleButton key={u} value={u}>
          {u}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
