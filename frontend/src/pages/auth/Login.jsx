import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Card,
  Stack,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import { useAuth } from '../../auth/authStore'
import { apiErrorMessage } from '../../api/client'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Where the user was headed before the guard bounced them here.
  const redirectTo = location.state?.from?.pathname || '/'

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(phone.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not sign in'))
    } finally {
      setSubmitting(false)
    }
  }

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
      <Card sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 400 }}>
        <Stack spacing={1} sx={{ alignItems: 'center', mb: 3 }}>
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
            Kirana ERP
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your account
          </Typography>
        </Stack>

        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            required
            autoFocus
            autoComplete="username"
            inputMode="tel"
            placeholder="7666915178"
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            autoComplete="current-password"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      size="small"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <VisibilityOffRoundedIcon fontSize="small" />
                      ) : (
                        <VisibilityRoundedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting || !phone || !password}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </Stack>
      </Card>
    </Box>
  )
}
