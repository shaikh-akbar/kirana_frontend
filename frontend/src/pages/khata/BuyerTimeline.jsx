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
  Chip,
} from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import BalanceAvatar from '../../components/BalanceAvatar'
import StatusBadge from '../../components/StatusBadge'
import CreditMeter from '../../components/CreditMeter'
import BalanceTrendChart from '../../components/BalanceTrendChart'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format'
import { tabularNums } from '../../theme/theme'

const PAY_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'NET_BANKING', label: 'NEFT / Bank transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'CARD', label: 'Card' },
]

export default function BuyerTimeline({ buyer, onRecordPayment, onClose, onEdit }) {
  const [payOpen, setPayOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('CASH')

  if (!buyer) return null
  const status = buyer.status

  function submitPayment() {
    const value = Number(amount)
    if (!value || value <= 0) return
    onRecordPayment(buyer.id, value, method)
    setPayOpen(false)
    setAmount('')
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Stack direction="row" spacing={1.5}>
          <BalanceAvatar name={buyer.name} status={status} size={52} />
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>{buyer.name}</Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {[buyer.contactPerson, buyer.phone].filter(Boolean).join(' | ')}
            </Typography>
            <Typography variant="caption" color="text.secondary">{buyer.area}</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <StatusBadge status={status} />
          {onEdit && <Button size="small" variant="outlined" onClick={onEdit}>Edit</Button>}
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

      <Typography variant="subtitle2" fontWeight={700} gutterBottom>Recent bills</Typography>
      {buyer.orders?.length ? (
        <Stack spacing={1.25} sx={{ mb: 2.5 }}>
          {buyer.orders.map((order) => (
            <Stack
              key={order.id}
              direction="row"
              sx={{ justifyContent: 'space-between', gap: 1.5, p: 1.25, borderRadius: '12px', bgcolor: 'action.hover' }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} noWrap>
                  Bill {order.billNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {formatDate(order.billDate)} | {order.channel}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {order.itemCount} item{Number(order.itemCount) === 1 ? '' : 's'}
                </Typography>
              </Box>
              <Stack sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
                <Typography variant="body2" fontWeight={700} sx={tabularNums}>
                  {formatCurrency(order.netAmount)}
                </Typography>
                <Chip size="small" label={order.paymentStatus} variant="outlined" />
              </Stack>
            </Stack>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          No bills recorded for this buyer at this firm yet.
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" fontWeight={700} gutterBottom>Transaction history</Typography>
      {buyer.transactions.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          No khata entries yet - this buyer has taken no credit at this firm.
        </Typography>
      )}
      <List dense disablePadding>
        {[...buyer.transactions].reverse().map((t) => {
          const isDebit = t.transactionType === 'DEBIT'
          return (
            <ListItem key={t.id} disableGutters sx={{ py: 1 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isDebit ? 'rgba(193,80,46,0.12)' : 'rgba(47,109,79,0.12)',
                  color: isDebit ? 'error.main' : 'success.main',
                  mr: 1.5,
                }}
              >
                {isDebit ? <ArrowUpwardRoundedIcon sx={{ fontSize: 16 }} /> : <ArrowDownwardRoundedIcon sx={{ fontSize: 16 }} />}
              </Box>
              <ListItemText
                primary={t.description || (t.billNumber ? `Bill ${t.billNumber}` : isDebit ? 'Credit sale' : 'Repayment')}
                secondary={formatDateTime(t.createdAt)}
                slotProps={{
                  primary: { fontSize: '0.83rem', fontWeight: 600 },
                  secondary: { fontSize: '0.72rem' },
                }}
              />
              <Typography variant="body2" fontWeight={700} sx={{ ...tabularNums, color: isDebit ? 'error.main' : 'success.main' }}>
                {isDebit ? '+' : '-'}{formatCurrency(t.amount)}
              </Typography>
            </ListItem>
          )
        })}
      </List>

      <Dialog open={payOpen} onClose={() => setPayOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Record payment - {buyer.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Amount received"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              slotProps={{ input: { startAdornment: 'Rs ' } }}
            />
            <TextField select label="Payment mode" value={method} onChange={(e) => setMethod(e.target.value)}>
              {PAY_METHODS.map((m) => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
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
