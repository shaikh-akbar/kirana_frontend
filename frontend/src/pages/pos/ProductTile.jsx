import { ButtonBase, Box, Typography } from '@mui/material'
import { formatCurrency } from '../../utils/format'

export default function ProductTile({ product, onAdd }) {
  return (
    <ButtonBase
      onClick={() => onAdd(product)}
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        p: 1.75,
        borderRadius: '14px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        textAlign: 'left',
        gap: 0.75,
        transition: 'transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease',
        '&:hover': { borderColor: 'primary.main', boxShadow: 3, transform: 'translateY(-2px)' },
        '&:active': { transform: 'translateY(0)' },
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: '10px',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
        }}
      >
        {product.emoji}
      </Box>
      <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.25, minHeight: 34 }}>
        {product.name}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {product.stock} {product.unit} in stock
      </Typography>
      <Typography variant="subtitle2" fontWeight={800} color="primary.main">
        {formatCurrency(product.retailPrice)}
        <Typography component="span" variant="caption" color="text.secondary">
          /{product.unit}
        </Typography>
      </Typography>
    </ButtonBase>
  )
}
