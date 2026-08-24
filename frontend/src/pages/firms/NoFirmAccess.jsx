import { Box, Card, Stack, Typography, Button } from '@mui/material'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import { useAuth } from '../../auth/authStore'

/**
 * Shown to a RETAILER/WHOLESALER who has signed in but has no `firm_users`
 * row yet. Unlike an ADMIN with no firm (who is onboarding and creates one),
 * a staff account can only be added to a firm by that firm's admin — so
 * there is nothing for them to do here but wait and sign out.
 */
export default function NoFirmAccess() {
  const { user, logout } = useAuth()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <StorefrontRoundedIcon />
          </Box>
          <Typography variant="h6" fontWeight={800}>
            No firm access yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.name ? `Hi ${user.name}, your` : 'Your'} account isn't attached to a firm yet.
            Ask your admin to add you under Settings &rarr; Users &amp; roles using this phone
            number{user?.phone ? `: ${user.phone}` : ''}.
          </Typography>
          <Button variant="outlined" onClick={logout} sx={{ mt: 1 }}>
            Sign out
          </Button>
        </Stack>
      </Card>
    </Box>
  )
}
