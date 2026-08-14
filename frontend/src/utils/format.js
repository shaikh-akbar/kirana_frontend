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

// Batches legitimately have no mfg/expiry date (non-perishables), and the API
// sends null for those. Without this guard `new Date(null)` silently renders
// "01 Jan 1970" as if it were real data.
export function formatDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** "Ramesh Traders" -> "RT"; avatar fallback when there is no photo. */
export function initialsOf(name) {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

const RELATIVE_UNITS = [
  { limit: 60, div: 1, unit: 'second' },
  { limit: 3600, div: 60, unit: 'minute' },
  { limit: 86400, div: 3600, unit: 'hour' },
  { limit: 604800, div: 86400, unit: 'day' },
]

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/**
 * "10 minutes ago" for the activity feed. The API sends absolute timestamps —
 * a server-rendered "10 min ago" would freeze at whatever it said when the
 * response was built and drift for as long as the tab stays open.
 */
export function timeAgo(iso) {
  if (!iso) return ''
  const date = new Date(typeof iso === 'string' ? iso.replace(' ', 'T') : iso)
  if (Number.isNaN(date.getTime())) return ''

  const seconds = (date.getTime() - Date.now()) / 1000
  const magnitude = Math.abs(seconds)

  for (const { limit, div, unit } of RELATIVE_UNITS) {
    if (magnitude < limit) return relative.format(Math.round(seconds / div), unit)
  }
  return formatDate(iso)
}

/** Quantities print to 3 decimals on the bill, but "3" reads better than "3.000". */
export function formatQuantity(value) {
  const number = Number(value)
  if (Number.isNaN(number)) return '—'
  return Number.isInteger(number) ? inrNumber.format(number) : number.toFixed(3)
}

/** Date + time, for bill headers ("01 Aug 2026, 3:22 pm"). */
export function formatDateTime(iso) {
  if (!iso) return '—'
  // MySQL DATETIME comes back as "2026-08-01 15:22:02"; Safari refuses that
  // form, so normalise the separator before parsing.
  const date = new Date(typeof iso === 'string' ? iso.replace(' ', 'T') : iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
