import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Stack, Button, Typography, Alert, Skeleton, Divider } from '@mui/material'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { fetchInvoice } from '../../api/endpoints'
import { apiErrorMessage } from '../../api/client'
import { formatDateTime } from '../../utils/format'

/**
 * Bill print view, laid out to match the shop's existing paper bill: centred
 * firm block, TO / date+bill-no line, a Description/Qty/Rate/Amount table, then
 * the Items / Total Qty / Total Wtt. footers and the statutory declaration.
 *
 * Sized for an 80mm thermal roll (~302px of printable width) and rendered in a
 * monospace face, because column alignment is the only thing holding the layout
 * together on a receipt printer.
 */

// Amounts on a bill must column-align, so they are fixed-decimal rather than
// locale-grouped: "1234.00", not "₹1,234".
function money(value) {
  return Number(value).toFixed(2)
}

function qty(value) {
  return Number(value).toFixed(3)
}

const PRINT_CSS = `
@media print {
  /* Everything except the bill is chrome — the app shell, sidebar and toolbar
     must not reach the paper. */
  body * { visibility: hidden !important; }
  #bill-paper, #bill-paper * { visibility: visible !important; }
  #bill-paper {
    position: absolute;
    left: 0;
    top: 0;
    width: 80mm;
    margin: 0;
    padding: 4mm;
    box-shadow: none !important;
    border: none !important;
    color: #000 !important;
    background: #fff !important;
  }
  @page { size: 80mm auto; margin: 0; }
}
`

export default function BillPrint() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  // The result carries the id it belongs to. React Router reuses this component
  // across param changes, so tagging the result is what makes "still loading
  // the new bill" distinguishable from "showing the old one" — without
  // resetting state inside the effect.
  const [result, setResult] = useState(null)

  useEffect(() => {
    let active = true
    fetchInvoice(orderId)
      .then((data) => active && setResult({ orderId, invoice: data }))
      .catch((err) =>
        active && setResult({ orderId, error: apiErrorMessage(err, 'Could not load this bill') })
      )
    return () => {
      active = false
    }
  }, [orderId])

  const current = result?.orderId === orderId ? result : null
  const invoice = current?.invoice ?? null
  const error = current?.error ?? null

  if (error) {
    return (
      <Box>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!invoice) {
    return (
      <Box sx={{ maxWidth: 360, mx: 'auto' }}>
        <Skeleton variant="rounded" height={480} />
      </Box>
    )
  }

  const { firm, order, items, payments } = invoice
  const addressLine = [firm.address, firm.city, firm.pincode].filter(Boolean).join(', ')

  return (
    <Box>
      <style>{PRINT_CSS}</style>

      <Stack direction="row" spacing={1} sx={{ mb: 2, justifyContent: 'space-between' }} className="no-print">
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button variant="contained" startIcon={<PrintRoundedIcon />} onClick={() => window.print()}>
          Print bill
        </Button>
      </Stack>

      <Box
        id="bill-paper"
        sx={{
          width: 302,
          mx: 'auto',
          p: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: 12,
          lineHeight: 1.5,
        }}
      >
        {/* Firm block */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 13 }}>
            {firm.firmName}
          </Typography>
          {addressLine && (
            <Typography sx={{ fontFamily: 'inherit', fontSize: 11 }}>{addressLine}</Typography>
          )}
          {firm.phone && (
            <Typography sx={{ fontFamily: 'inherit', fontSize: 11 }}>Phone : {firm.phone}</Typography>
          )}
          {firm.gstin && (
            <Typography sx={{ fontFamily: 'inherit', fontSize: 11 }}>GSTIN : {firm.gstin}</Typography>
          )}
          {firm.vatTin && !firm.gstin && (
            <Typography sx={{ fontFamily: 'inherit', fontSize: 11 }}>TIN : {firm.vatTin}</Typography>
          )}
          <Typography sx={{ fontFamily: 'inherit', fontWeight: 700, letterSpacing: 3, mt: 1 }}>
            INVOICE
          </Typography>
        </Box>

        <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

        <Box sx={{ fontSize: 11 }}>
          <Box>TO, {order.customerName}</Box>
          {order.customerPhone && <Box>Ph, {order.customerPhone}</Box>}
          <Box>
            Date &amp; Time: {formatDateTime(order.billDate)}
          </Box>
          <Box sx={{ fontWeight: 700 }}>Bill No: {order.billNumber}</Box>
        </Box>

        <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

        {/* Line items. A CSS grid keeps the four columns aligned without a
            <table>, which a thermal printer renders unpredictably. */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 46px 52px 58px',
            columnGap: 0.5,
            fontSize: 11,
          }}
        >
          <Box sx={{ fontWeight: 700 }}>Description</Box>
          <Box sx={{ fontWeight: 700, textAlign: 'right' }}>Qty.</Box>
          <Box sx={{ fontWeight: 700, textAlign: 'right' }}>Rate</Box>
          <Box sx={{ fontWeight: 700, textAlign: 'right' }}>Amount</Box>

          {items.map((item) => (
            <Box key={item.lineNo} sx={{ display: 'contents' }}>
              <Box sx={{ gridColumn: '1 / -1', mt: 0.75, wordBreak: 'break-word' }}>
                {item.description}
              </Box>
              <Box />
              <Box sx={{ textAlign: 'right' }}>{qty(item.quantity)}</Box>
              <Box sx={{ textAlign: 'right' }}>{money(item.unitPrice)}</Box>
              <Box sx={{ textAlign: 'right' }}>{money(item.totalPrice)}</Box>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <Box>
            <Box>Items {order.itemCount}</Box>
            <Box>Total Qty {qty(order.totalQuantity)}</Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            {Number(order.discountAmount) > 0 && <Box>Discount {money(order.discountAmount)}</Box>}
            {Number(order.taxAmount) > 0 && <Box>Tax {money(order.taxAmount)}</Box>}
            <Box sx={{ fontWeight: 700, fontSize: 13 }}>Total {money(order.netAmount)}</Box>
          </Box>
        </Box>

        <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

        <Box sx={{ fontSize: 11 }}>Total Wtt.: {qty(order.totalWeightKg)}Kg</Box>

        {payments.length > 0 && (
          <Box sx={{ fontSize: 11, mt: 0.5 }}>
            {payments.map((p, index) => (
              <Box key={index}>
                Paid ({p.mode}) {money(p.amount)}
              </Box>
            ))}
          </Box>
        )}

        {order.paymentStatus !== 'PAID' && (
          <Box sx={{ fontSize: 11, fontWeight: 700, mt: 0.5 }}>
            Balance {money(Number(order.netAmount) - payments.reduce((sum, p) => sum + Number(p.amount), 0))}
          </Box>
        )}

        {firm.thanksText && (
          <Typography sx={{ fontFamily: 'inherit', fontSize: 11, fontWeight: 700, mt: 1.5 }}>
            {firm.thanksText}
          </Typography>
        )}

        {firm.footerText && (
          <Typography sx={{ fontFamily: 'inherit', fontSize: 8, mt: 1, lineHeight: 1.35, color: 'text.secondary' }}>
            {firm.footerText}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
