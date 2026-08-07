const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const inrNumber = new Intl.NumberFormat('en-IN')

export function formatCurrency(value) {
  return inr.format(value)
}

export function formatNumber(value) {
  return inrNumber.format(value)
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
