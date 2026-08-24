import { Box, Stack, Typography, IconButton, Divider, Button, ButtonGroup, Chip } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import QrCodeRoundedIcon from '@mui/icons-material/QrCodeRounded'
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { formatCurrency } from '../../utils/format'
import { tabularNums } from '../../theme/theme'
import EmptyState from '../../components/EmptyState'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'

/**
 * No tax line: this cart used to add a flat 5% GST of its own, which the
 * server never charged - so the receipt showed one total and the printed bill
 * another. The firm's bills are raised under the Maharashtra VAT declaration
 * with tax included in the rate, so the counter total is simply the sum of the
 * lines. When per-item GST is introduced it belongs on the product, priced
 * server-side, not invented here.
 */
export default function CartPanel({
  bills,
  activeBillId,
  onBillChange,
  onBillAdd,
  onBillRemove,
  items,
  selectedItemId,
  onSelectItem,
  onInc,
  onDec,
  onRemove,
  onCheckout,
  busy = false,
}) {
  const total = items.reduce((sum, i) => sum + i.product.retailPrice * i.qty, 0)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Current bill
        </Typography>
        <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={onBillAdd}>
          New bill
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 0.5 }}>
        {bills.map((bill) => {
          const active = bill.id === activeBillId
          return (
            <Chip
              key={bill.id}
              label={`${bill.name} (${bill.qtyCount})`}
              onClick={() => onBillChange(bill.id)}
              onDelete={bills.length > 1 ? () => onBillRemove(bill.id) : undefined}
              deleteIcon={<CloseRoundedIcon />}
              color={active ? 'primary' : 'default'}
              variant={active ? 'filled' : 'outlined'}
              sx={{ flexShrink: 0 }}
            />
          )
        })}
      </Stack>

      <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 120 }}>
        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingCartOutlinedIcon sx={{ fontSize: 28 }} />}
            title="Cart is empty"
            description="Tap a product tile or scan a barcode to start billing."
          />
        ) : (
          <Stack spacing={1.25}>
            {items.map((item) => (
              <Stack
                key={item.product.id}
                direction="row"
                spacing={1}
                onClick={() => onSelectItem(item.product.id)}
                sx={{
                  alignItems: 'center',
                  px: 0.75,
                  py: 0.5,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedItemId === item.product.id ? 'primary.main' : 'transparent',
                  bgcolor: selectedItemId === item.product.id ? 'action.hover' : 'transparent',
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {item.product.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={tabularNums}>
                    {formatCurrency(item.product.retailPrice)} x {item.qty}
                  </Typography>
                </Box>
                <ButtonGroup size="small" variant="outlined">
                  <IconButton size="small" onClick={() => onDec(item.product.id)}>
                    <RemoveRoundedIcon fontSize="inherit" />
                  </IconButton>
                  <Box sx={{ px: 1.25, display: 'flex', alignItems: 'center', ...tabularNums, fontSize: '0.8rem', fontWeight: 700 }}>
                    {item.qty}
                  </Box>
                  <IconButton size="small" onClick={() => onInc(item.product.id)}>
                    <AddRoundedIcon fontSize="inherit" />
                  </IconButton>
                </ButtonGroup>
                <Typography variant="body2" fontWeight={700} sx={{ ...tabularNums, width: 76, textAlign: 'right' }}>
                  {formatCurrency(item.product.retailPrice * item.qty)}
                </Typography>
                <IconButton size="small" onClick={() => onRemove(item.product.id)}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={0.75} sx={{ mb: 1.5 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            {items.length} item{items.length === 1 ? '' : 's'}
          </Typography>
          <Typography variant="body2" sx={tabularNums}>
            {items.reduce((sum, i) => sum + i.qty, 0)} qty
          </Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between', pt: 0.5 }}>
          <Typography variant="h6" fontWeight={800}>Total</Typography>
          <Typography variant="h6" fontWeight={800} sx={tabularNums} color="primary.main">
            {formatCurrency(total)}
          </Typography>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1}>
        <Button
          fullWidth
          variant="contained"
          color="success"
          size="large"
          disabled={items.length === 0 || busy}
          startIcon={<PaymentsRoundedIcon />}
          onClick={() => onCheckout('Cash', total)}
          sx={{ py: 1.4 }}
        >
          Cash
        </Button>
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={items.length === 0 || busy}
          startIcon={<QrCodeRoundedIcon />}
          onClick={() => onCheckout('UPI', total)}
          sx={{ py: 1.4 }}
        >
          UPI
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="info"
          size="large"
          disabled={items.length === 0 || busy}
          startIcon={<CreditCardRoundedIcon />}
          onClick={() => onCheckout('Card', total)}
          sx={{ py: 1.4 }}
        >
          Card
        </Button>
      </Stack>
    </Box>
  )
}
