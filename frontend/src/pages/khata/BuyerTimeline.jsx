import { useState } from 'react'
import {
  Box,
  Stack,
  Typography,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import BalanceAvatar from '../../components/BalanceAvatar'
import StatusBadge from '../../components/StatusBadge'
import CreditMeter from '../../components/CreditMeter'
import BalanceTrendChart from '../../components/BalanceTrendChart'
import { getBuyerStatus } from '../../data/buyers'
import { formatCurrency, formatDate } from '../../utils/format'
import { tabularNums } from '../../theme/theme'
import { useToast } from '../../components/toastContext'

const PAY_METHODS = ['Cash', 'UPI', 'NEFT', 'Cheque']

export default function BuyerTimeline({ buyer, onRecordPayment, onClose }) {
  const [payOpen, setPayOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('Cash')
  const { showToast } = useToast()

  if (!buyer) return null
  const status = getBuyerStatus(buyer)

  function submitPayment() {
    const value = Number(amount)
    if (!value || value <= 0) return
    onRecordPayment(buyer.id, value, method)
    showToast(`Payment of ${formatCurrency(value)} recorded for ${buyer.name}`, 'success')
    setPayOpen(false)
    setAmount('')
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between",  mb: 2 }}>
        <Stack direction="row" spacing={1.5}>
          <BalanceAvatar name={buyer.name} status={status} size={52} />
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>{buyer.name}</Typography>
            <Typography variant="caption" color="text.secondary" display="block">{buyer.contact} · {buyer.phone}</Typography>
            <Typography variant="caption" color="text.secondary">{buyer.area}</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <StatusBadge status={status} />
          {onClose && (
            <IconButton size="small" onClick={onClose} sx={{ display: { md: 'none' } }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Stack>

      <CreditMeter balance={buyer.balance} limit={buyer.creditLimit} />

      <Button fullWidth variant="contained" sx={{ mt: 2, mb: 2.5 }} onClick={() => setPayOpen(true)}>
        Record Payment
      </Button>

      <Typography variant="subtitle2" fontWeight={700} gutterBottom>Balance over time</Typography>
      <BalanceTrendChart transactions={buyer.transactions} creditLimit={buyer.creditLimit} />

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" fontWeight={700} gutterBottom>Transaction history</Typography>
      <List dense disablePadding>
        {[...buyer.transactions].reverse().map((t) => (
          <ListItem key={t.id} disableGutters sx={{ py: 1 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: t.type === 'debit' ? 'rgba(193,80,46,0.12)' : 'rgba(47,109,79,0.12)',
                color: t.type === 'debit' ? 'error.main' : 'success.main',
                mr: 1.5,
              }}
            >
              {t.type === 'debit' ? <ArrowUpwardRoundedIcon sx={{ fontSize: 16 }} /> : <ArrowDownwardRoundedIcon sx={{ fontSize: 16 }} />}
            </Box>
            <ListItemText
              primary={t.note}
              secondary={formatDate(t.date)}
              slotProps={{
                primary: { fontSize: '0.83rem', fontWeight: 600 },
                secondary: { fontSize: '0.72rem' },
              }}
            />
            <Typography variant="body2" fontWeight={700} sx={{ ...tabularNums, color: t.type === 'debit' ? 'error.main' : 'success.main' }}>
              {t.type === 'debit' ? '+' : '-'}{formatCurrency(t.amount)}
            </Typography>
          </ListItem>
        ))}
      </List>

      <Dialog open={payOpen} onClose={() => setPayOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Record payment — {buyer.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Amount received"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              slotProps={{ input: { startAdornment: '₹' } }}
            />
            <TextField select label="Payment mode" value={method} onChange={(e) => setMethod(e.target.value)}>
              {PAY_METHODS.map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setPayOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitPayment}>Record Payment</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
