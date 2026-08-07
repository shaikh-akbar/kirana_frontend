import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Grid,
  Card,
  Stack,
  Typography,
  InputBase,
  List,
  ListItemButton,
  Divider,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { buyers as initialBuyers, getBuyerStatus } from '../../data/buyers'
import BalanceAvatar from '../../components/BalanceAvatar'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import BuyerTimeline from './BuyerTimeline'
import { formatCurrency } from '../../utils/format'
import { tabularNums } from '../../theme/theme'
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'

function recomputeBalance(buyer) {
  let balance = 0
  const transactions = buyer.transactions.map((t) => {
    balance += t.type === 'debit' ? t.amount : -t.amount
    return { ...t, runningBalance: balance }
  })
  return { ...buyer, transactions, balance }
}

export default function KhataLedger() {
  const [buyers, setBuyers] = useState(initialBuyers)
  const [query, setQuery] = useState('')
  const { buyerId } = useParams()
  const navigate = useNavigate()

  const selectedId = buyerId ?? buyers[0]?.id
  const selected = buyers.find((b) => b.id === selectedId)

  const filtered = useMemo(
    () => buyers.filter((b) => b.name.toLowerCase().includes(query.toLowerCase())),
    [buyers, query],
  )

  function handleRecordPayment(id, amount, method) {
    setBuyers((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const updated = {
          ...b,
          transactions: [
            ...b.transactions,
            { id: `${id}-T${b.transactions.length + 1}`, buyerId: id, date: '2026-08-05', type: 'credit', amount, note: `Payment received — ${method}` },
          ],
        }
        return recomputeBalance(updated)
      }),
    )
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>Khata Ledger</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        {buyers.length} wholesale buyers on credit
      </Typography>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5, lg: 4 }} sx={{ height: '100%' }}>
          <Card sx={{ p: 1.5, height: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 1,
                mb: 1,
                borderRadius: '10px',
                bgcolor: 'action.hover',
              }}
            >
              <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <InputBase placeholder="Search buyers…" value={query} onChange={(e) => setQuery(e.target.value)} fullWidth sx={{ fontSize: '0.875rem' }} />
            </Box>
            <List disablePadding sx={{ maxHeight: 620, overflowY: 'auto' }}>
              {filtered.map((b, idx) => {
                const status = getBuyerStatus(b)
                return (
                  <Box key={b.id}>
                    {idx > 0 && <Divider component="li" sx={{ mx: 0 }} />}
                    <ListItemButton
                      selected={b.id === selectedId}
                      onClick={() => navigate(`/khata/${b.id}`)}
                      sx={{ borderRadius: '10px', py: 1.25 }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center",  width: '100%' }}>
                        <BalanceAvatar name={b.name} status={status} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700} noWrap>{b.name}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>{b.area}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" fontWeight={700} sx={tabularNums}>{formatCurrency(b.balance)}</Typography>
                          <StatusBadge status={status} />
                        </Box>
                      </Stack>
                    </ListItemButton>
                  </Box>
                )
              })}
            </List>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7, lg: 8 }} sx={{ height: '100%' }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            {selected ? (
              <BuyerTimeline buyer={selected} onRecordPayment={handleRecordPayment} />
            ) : (
              <EmptyState icon={<AccountBalanceWalletRoundedIcon sx={{ fontSize: 28 }} />} title="Select a buyer" description="Choose a buyer from the list to see their ledger." />
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
