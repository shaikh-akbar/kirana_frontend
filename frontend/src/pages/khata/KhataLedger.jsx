import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Grid,
  Card,
  Stack,
  Typography,
  InputBase,
  List,
  ListItemButton,
  Divider,
  Skeleton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'
import BalanceAvatar from '../../components/BalanceAvatar'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import BuyerTimeline from './BuyerTimeline'
import { createBuyer, fetchBuyer, fetchBuyers, recordKhataPayment, updateBuyer } from '../../api/endpoints'
import { apiErrorMessage } from '../../api/client'
import { useResource } from '../../api/useResource'
import { formatCurrency } from '../../utils/format'
import { tabularNums } from '../../theme/theme'
import { useToast } from '../../components/toastContext'
import { useFirm } from '../../firm/firmStore'
import { useAuth } from '../../auth/authStore'

const EMPTY_BUYER_FORM = {
  name: '',
  phone: '',
  email: '',
  buyerType: 'WHOLESALE',
  contactPerson: '',
  area: '',
  address: '',
  creditLimit: '',
  isActive: true,
}

export default function KhataLedger() {
  const [query, setQuery] = useState('')
  const [dialogMode, setDialogMode] = useState(null)
  const [buyerForm, setBuyerForm] = useState(EMPTY_BUYER_FORM)
  const [submitting, setSubmitting] = useState(false)
  const { buyerId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { activeFirmId } = useFirm()
  const { user } = useAuth()

  const {
    data: buyers,
    error: buyersError,
    reload: reloadBuyers,
  } = useResource(activeFirmId, useCallback(() => fetchBuyers(), []), 'Could not load buyers')

  const selectedId = buyerId ? Number(buyerId) : buyers?.[0]?.id ?? null

  const {
    data: selected,
    error: selectedError,
    reload: reloadSelected,
  } = useResource(
    selectedId,
    useCallback(() => fetchBuyer(selectedId), [selectedId]),
    'Could not load that buyer'
  )

  const error = buyersError || selectedError

  const filtered = useMemo(() => {
    if (!buyers) return []
    const needle = query.trim().toLowerCase()
    if (!needle) return buyers
    return buyers.filter(
      (b) =>
        b.name.toLowerCase().includes(needle) ||
        (b.area || '').toLowerCase().includes(needle) ||
        (b.contactPerson || '').toLowerCase().includes(needle)
    )
  }, [buyers, query])

  const canManageBuyers = user?.roleName === 'ADMIN' || user?.roleName === 'SALES_REP'

  function setBuyerField(name, value) {
    setBuyerForm((prev) => ({ ...prev, [name]: value }))
  }

  function openCreateBuyer() {
    setBuyerForm(EMPTY_BUYER_FORM)
    setDialogMode('create')
  }

  function openEditBuyer() {
    if (!selected) return
    setBuyerForm({
      name: selected.name || '',
      phone: selected.phone || '',
      email: selected.email || '',
      buyerType: selected.buyerType || 'WHOLESALE',
      contactPerson: selected.contactPerson || '',
      area: selected.area || '',
      address: selected.address || '',
      creditLimit: selected.creditLimit ?? '',
      isActive: selected.isActive !== false,
    })
    setDialogMode('edit')
  }

  function closeBuyerDialog() {
    if (submitting) return
    setDialogMode(null)
  }

  async function handleRecordPayment(id, amount, mode) {
    try {
      await recordKhataPayment({ buyerId: id, amount, mode })
      showToast(`Payment of ${formatCurrency(amount)} recorded`, 'success')
      reloadBuyers()
      reloadSelected()
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not record the payment'), 'error')
    }
  }

  async function handleSaveBuyer() {
    try {
      setSubmitting(true)
      const payload = {
        name: buyerForm.name.trim(),
        phone: buyerForm.phone.trim(),
        email: buyerForm.email.trim() || undefined,
        buyerType: buyerForm.buyerType,
        contactPerson: buyerForm.contactPerson.trim() || undefined,
        area: buyerForm.area.trim() || undefined,
        address: buyerForm.address.trim() || undefined,
        creditLimit: buyerForm.creditLimit === '' ? 0 : Number(buyerForm.creditLimit),
        isActive: buyerForm.isActive,
      }

      if (dialogMode === 'create') {
        const created = await createBuyer(payload)
        showToast(`${created.name} added to khata`, 'success')
        setDialogMode(null)
        setBuyerForm(EMPTY_BUYER_FORM)
        reloadBuyers()
        navigate(`/khata/${created.id}`)
        reloadSelected()
        return
      }

      await updateBuyer(selected.id, payload)
      showToast(`${buyerForm.name.trim()} updated`, 'success')
      setDialogMode(null)
      reloadBuyers()
      reloadSelected()
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not save buyer'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} gutterBottom>Khata Ledger</Typography>
          <Typography variant="body2" color="text.secondary">
            {buyers ? `${buyers.length} buyer${buyers.length === 1 ? '' : 's'} on credit` : 'Loading buyers...'}
          </Typography>
        </Box>
        {canManageBuyers && (
          <Stack direction="row" spacing={1.25} sx={{ flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={openCreateBuyer}>Add buyer</Button>
            <Button variant="contained" onClick={openEditBuyer} disabled={!selected}>Edit buyer</Button>
          </Stack>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

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
              <InputBase
                placeholder="Search buyers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                fullWidth
                sx={{ fontSize: '0.875rem' }}
              />
            </Box>

            {!buyers ? (
              <Stack spacing={1} sx={{ p: 1 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={56} />
                ))}
              </Stack>
            ) : filtered.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                {buyers.length === 0 ? 'No buyers on the books yet.' : 'No buyer matches that search.'}
              </Typography>
            ) : (
              <List disablePadding sx={{ maxHeight: 620, overflowY: 'auto' }}>
                {filtered.map((b, idx) => (
                  <Box key={b.id}>
                    {idx > 0 && <Divider component="li" sx={{ mx: 0 }} />}
                    <ListItemButton
                      selected={b.id === selectedId}
                      onClick={() => navigate(`/khata/${b.id}`)}
                      sx={{ borderRadius: '10px', py: 1.25 }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: '100%' }}>
                        <BalanceAvatar name={b.name} status={b.status} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700} noWrap>{b.name}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {b.area || b.contactPerson || b.phone}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" fontWeight={700} sx={tabularNums}>
                            {formatCurrency(b.balance)}
                          </Typography>
                          <StatusBadge status={b.status} />
                        </Box>
                      </Stack>
                    </ListItemButton>
                  </Box>
                ))}
              </List>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7, lg: 8 }} sx={{ height: '100%' }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            {selected ? (
              <BuyerTimeline buyer={selected} onRecordPayment={handleRecordPayment} onEdit={canManageBuyers ? openEditBuyer : null} />
            ) : selectedId ? (
              <Stack spacing={2}>
                <Skeleton variant="rounded" height={80} />
                <Skeleton variant="rounded" height={220} />
              </Stack>
            ) : (
              <EmptyState
                icon={<AccountBalanceWalletRoundedIcon sx={{ fontSize: 28 }} />}
                title="No buyer selected"
                description="Choose a buyer from the list to see their ledger."
              />
            )}
          </Card>
        </Grid>
      </Grid>

      <Dialog open={dialogMode === 'create' || dialogMode === 'edit'} onClose={closeBuyerDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogMode === 'create' ? 'Add buyer' : 'Edit buyer'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Buyer name" value={buyerForm.name} onChange={(e) => setBuyerField('name', e.target.value)} required />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Phone" value={buyerForm.phone} onChange={(e) => setBuyerField('phone', e.target.value)} required fullWidth />
              <TextField label="Email" value={buyerForm.email} onChange={(e) => setBuyerField('email', e.target.value)} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField select label="Buyer type" value={buyerForm.buyerType} onChange={(e) => setBuyerField('buyerType', e.target.value)} fullWidth>
                <MenuItem value="WHOLESALE">Wholesale</MenuItem>
                <MenuItem value="RETAIL">Retail</MenuItem>
              </TextField>
              <TextField
                label="Credit limit"
                type="number"
                value={buyerForm.creditLimit}
                onChange={(e) => setBuyerField('creditLimit', e.target.value)}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Contact person"
                value={buyerForm.contactPerson}
                onChange={(e) => setBuyerField('contactPerson', e.target.value)}
                fullWidth
              />
              <TextField label="Area" value={buyerForm.area} onChange={(e) => setBuyerField('area', e.target.value)} fullWidth />
            </Stack>
            <TextField
              label="Address"
              value={buyerForm.address}
              onChange={(e) => setBuyerField('address', e.target.value)}
              multiline
              minRows={2}
            />
            {dialogMode === 'edit' && (
              <TextField
                select
                label="Status"
                value={buyerForm.isActive ? 'ACTIVE' : 'INACTIVE'}
                onChange={(e) => setBuyerField('isActive', e.target.value === 'ACTIVE')}
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </TextField>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeBuyerDialog} disabled={submitting}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveBuyer}
            disabled={submitting || !buyerForm.name.trim() || !buyerForm.phone.trim()}
          >
            {dialogMode === 'create' ? 'Create buyer' : 'Save changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
