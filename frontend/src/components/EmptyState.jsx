import { Box, Typography, Button } from '@mui/material'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'

// Friendly line-illustration style empty state, reused across every table/list.
export default function EmptyState({ icon, title = 'Nothing here yet', description, actionLabel, onAction }) {
  return (
    <Box sx={{ textAlign: 'center', py: 7, px: 2 }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          mx: 'auto',
          mb: 2,
          borderRadius: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(217,168,87,0.10)' : 'rgba(232,163,61,0.10)'),
          color: 'primary.main',
        }}
      >
        {icon ?? <InventoryOutlinedIcon sx={{ fontSize: 30 }} />}
      </Box>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {actionLabel && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 2.5 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}
