import { buyers } from './buyers'
import { products } from './products'

function buyerName(id) {
  return buyers.find((b) => b.id === id)?.name ?? 'Unknown Buyer'
}

const rawOrders = [
  { id: 'WO-2092', buyerId: 'B005', date: '2026-08-03', status: 'PENDING', items: [{ productId: 'P014', qtyKg: 300 }] },
  { id: 'WO-2088', buyerId: 'B004', date: '2026-08-01', status: 'UNPAID', items: [{ productId: 'P016', qtyKg: 40 }, { productId: 'P017', qtyKg: 20 }] },
  { id: 'WO-2084', buyerId: 'B007', date: '2026-07-30', status: 'PARTIAL', items: [{ productId: 'P012', qtyKg: 300 }] },
  { id: 'WO-2081', buyerId: 'B006', date: '2026-07-29', status: 'UNPAID', items: [{ productId: 'P004', qtyKg: 150 }, { productId: 'P006', qtyKg: 60 }] },
  { id: 'WO-2079', buyerId: 'B001', date: '2026-07-27', status: 'UNPAID', items: [{ productId: 'P009', qtyKg: 100 }, { productId: 'P010', qtyKg: 60 }] },
  { id: 'WO-2074', buyerId: 'B005', date: '2026-07-25', status: 'UNPAID', items: [{ productId: 'P003', qtyKg: 120 }] },
  { id: 'WO-2071', buyerId: 'B002', date: '2026-07-24', status: 'UNPAID', items: [{ productId: 'P001', qtyKg: 200 }] },
  { id: 'WO-2066', buyerId: 'B004', date: '2026-07-22', status: 'UNPAID', items: [{ productId: 'P009', qtyKg: 80 }, { productId: 'P006', qtyKg: 200 }] },
  { id: 'WO-2064', buyerId: 'B008', date: '2026-07-21', status: 'PAID', items: [{ productId: 'P006', qtyKg: 180 }, { productId: 'P008', qtyKg: 20 }] },
  { id: 'WO-2062', buyerId: 'B002', date: '2026-07-20', status: 'UNPAID', items: [{ productId: 'P016', qtyKg: 25 }, { productId: 'P018', qtyKg: 15 }] },
  { id: 'WO-2059', buyerId: 'B003', date: '2026-07-19', status: 'PAID', items: [{ productId: 'P006', qtyKg: 130 }] },
  { id: 'WO-2058', buyerId: 'B001', date: '2026-07-18', status: 'PAID', items: [{ productId: 'P006', qtyKg: 200 }, { productId: 'P008', qtyKg: 10 }] },
  { id: 'WO-2055', buyerId: 'B007', date: '2026-07-16', status: 'PAID', items: [{ productId: 'P003', qtyKg: 100 }] },
  { id: 'WO-2050', buyerId: 'B005', date: '2026-07-10', status: 'PAID', items: [{ productId: 'P012', qtyKg: 400 }, { productId: 'P013', qtyKg: 100 }] },
]

function computeItems(items) {
  return items.map((it) => {
    const product = products.find((p) => p.id === it.productId)
    const lineTotal = Math.round(it.qtyKg * product.wholesalePrice)
    return { ...it, productName: product.name, unitPrice: product.wholesalePrice, lineTotal }
  })
}

export const wholesaleOrders = rawOrders.map((o) => {
  const items = computeItems(o.items)
  const total = items.reduce((sum, it) => sum + it.lineTotal, 0)
  return { ...o, buyerName: buyerName(o.buyerId), items, total }
})

export function getOrderById(id) {
  return wholesaleOrders.find((o) => o.id === id)
}
