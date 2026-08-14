import { ToggleButtonGroup, ToggleButton } from '@mui/material'

/**
 * The sellable units come from the product itself (`product_units`), so this
 * takes them as a prop: two products in the same shop legitimately sell in
 * different units, and a fixed global list would offer a BAG for something only
 * sold by the packet.
 */
export default function QtyUnitToggle({ units = [], value, onChange, size = 'small' }) {
  if (units.length === 0) return null

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
      {units.map((u) => (
        <ToggleButton key={u.id} value={u.id}>
          {u.unitName}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
