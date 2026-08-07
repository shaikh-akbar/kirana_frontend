// Mock Khata (credit ledger) buyers — wholesale customers who buy on credit.
const rawBuyers = [
  {
    id: 'B001',
    name: 'Ramesh Traders',
    contact: 'Ramesh Gupta',
    phone: '+91 98230 11234',
    area: 'APMC Yard, Sector 4',
    creditLimit: 150000,
    transactions: [
      { date: '2026-07-06', type: 'debit', amount: 42000, note: 'Order #WO-2041 — Rice & Dal' },
      { date: '2026-07-12', type: 'credit', amount: 20000, note: 'Payment received — UPI' },
      { date: '2026-07-18', type: 'debit', amount: 36500, note: 'Order #WO-2058 — Oil & Ghee' },
      { date: '2026-07-27', type: 'debit', amount: 28000, note: 'Order #WO-2079 — Spices' },
      { date: '2026-08-02', type: 'credit', amount: 15000, note: 'Payment received — Cash' },
    ],
  },
  {
    id: 'B002',
    name: 'Shree Ganesh Kirana Supply',
    contact: 'Anil Deshmukh',
    phone: '+91 98221 55621',
    area: 'Market Road',
    creditLimit: 80000,
    transactions: [
      { date: '2026-07-08', type: 'debit', amount: 31000, note: 'Order #WO-2044 — Atta & Sugar' },
      { date: '2026-07-20', type: 'debit', amount: 27500, note: 'Order #WO-2062 — Dry Fruits' },
      { date: '2026-07-24', type: 'debit', amount: 25400, note: 'Order #WO-2071 — Rice' },
    ],
  },
  {
    id: 'B003',
    name: 'Balaji Provision Store',
    contact: 'Suresh Iyer',
    phone: '+91 90080 34521',
    area: 'Gandhi Chowk',
    creditLimit: 60000,
    transactions: [
      { date: '2026-06-28', type: 'debit', amount: 22000, note: 'Order #WO-1998 — Pulses' },
      { date: '2026-07-05', type: 'credit', amount: 22000, note: 'Payment received — NEFT' },
      { date: '2026-07-19', type: 'debit', amount: 18500, note: 'Order #WO-2059 — Oil' },
      { date: '2026-08-01', type: 'credit', amount: 10000, note: 'Payment received — Cash' },
    ],
  },
  {
    id: 'B004',
    name: 'Annapurna Wholesale Mart',
    contact: 'Priya Sharma',
    phone: '+91 99870 66120',
    area: 'Station Road',
    creditLimit: 200000,
    transactions: [
      { date: '2026-07-01', type: 'debit', amount: 68000, note: 'Order #WO-2010 — Bulk Rice & Atta' },
      { date: '2026-07-15', type: 'credit', amount: 40000, note: 'Payment received — Cheque' },
      { date: '2026-07-22', type: 'debit', amount: 54000, note: 'Order #WO-2066 — Spices & Oil' },
      { date: '2026-08-01', type: 'debit', amount: 39000, note: 'Order #WO-2088 — Dry Fruits' },
    ],
  },
  {
    id: 'B005',
    name: 'Mahalaxmi General Traders',
    contact: 'Vijay Kulkarni',
    phone: '+91 98765 43210',
    area: 'APMC Yard, Sector 2',
    creditLimit: 50000,
    transactions: [
      { date: '2026-07-10', type: 'debit', amount: 21000, note: 'Order #WO-2050 — Sugar & Salt' },
      { date: '2026-07-25', type: 'debit', amount: 19800, note: 'Order #WO-2074 — Dal' },
      { date: '2026-08-03', type: 'debit', amount: 14200, note: 'Order #WO-2092 — Atta' },
    ],
  },
  {
    id: 'B006',
    name: 'Ganpati Agro Store',
    contact: 'Nitin Patil',
    phone: '+91 97890 21456',
    area: 'Ring Road',
    creditLimit: 100000,
    transactions: [
      { date: '2026-06-30', type: 'debit', amount: 30000, note: 'Order #WO-2002 — Rice' },
      { date: '2026-07-14', type: 'credit', amount: 30000, note: 'Payment received — UPI' },
      { date: '2026-07-29', type: 'debit', amount: 24500, note: 'Order #WO-2081 — Pulses & Oil' },
    ],
  },
  {
    id: 'B007',
    name: 'Krishna Kirana & Co.',
    contact: 'Deepak Rao',
    phone: '+91 90123 87654',
    area: 'Old Bus Stand',
    creditLimit: 45000,
    transactions: [
      { date: '2026-07-02', type: 'debit', amount: 17000, note: 'Order #WO-2015 — Spices' },
      { date: '2026-07-16', type: 'debit', amount: 15500, note: 'Order #WO-2055 — Dal' },
      { date: '2026-07-30', type: 'debit', amount: 13200, note: 'Order #WO-2084 — Sugar' },
    ],
  },
  {
    id: 'B008',
    name: 'Om Sai Wholesale',
    contact: 'Ravi Chandran',
    phone: '+91 98450 12378',
    area: 'Market Road',
    creditLimit: 120000,
    transactions: [
      { date: '2026-06-25', type: 'debit', amount: 45000, note: 'Order #WO-1985 — Rice & Atta' },
      { date: '2026-07-09', type: 'credit', amount: 45000, note: 'Payment received — NEFT' },
      { date: '2026-07-21', type: 'debit', amount: 32000, note: 'Order #WO-2064 — Oil & Ghee' },
      { date: '2026-08-04', type: 'credit', amount: 12000, note: 'Payment received — Cash' },
    ],
  },
]

function withRunningBalance(buyer) {
  let balance = 0
  const transactions = buyer.transactions.map((t, idx) => {
    balance += t.type === 'debit' ? t.amount : -t.amount
    return { id: `${buyer.id}-T${idx + 1}`, buyerId: buyer.id, ...t, runningBalance: balance }
  })
  return { ...buyer, transactions, balance }
}

export const buyers = rawBuyers.map(withRunningBalance)

export function getBuyerStatus(buyer) {
  const ratio = buyer.balance / buyer.creditLimit
  if (ratio > 1) return 'OVER_LIMIT'
  if (ratio >= 0.7) return 'NEAR_LIMIT'
  return 'CLEAR'
}

export function getBuyerById(id) {
  return buyers.find((b) => b.id === id)
}

export function initialsOf(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}
