import { products } from './products'

function productName(id) {
  return products.find((p) => p.id === id)?.name ?? 'Unknown Product'
}

const rawPurchases = [
  { id: 'PO-3041', supplier: 'Konkan Rice Mills', date: '2026-08-04', status: 'ORDERED', items: [{ productId: 'P001', qty: 1000 }, { productId: 'P002', qty: 500 }] },
  { id: 'PO-3038', supplier: 'Vidarbha Dal Suppliers', date: '2026-08-01', status: 'PENDING', items: [{ productId: 'P003', qty: 400 }, { productId: 'P005', qty: 200 }] },
  { id: 'PO-3033', supplier: 'Sunrise Edible Oils Pvt Ltd', date: '2026-07-28', status: 'RECEIVED', items: [{ productId: 'P006', qty: 500 }, { productId: 'P007', qty: 150 }] },
  { id: 'PO-3029', supplier: 'Malwa Masala Udyog', date: '2026-07-22', status: 'RECEIVED', items: [{ productId: 'P009', qty: 100 }, { productId: 'P010', qty: 100 }] },
  { id: 'PO-3021', supplier: 'National Sugar Traders', date: '2026-07-14', status: 'RECEIVED', items: [{ productId: 'P012', qty: 800 }, { productId: 'P013', qty: 400 }] },
]

export const purchases = rawPurchases.map((po) => {
  const items = po.items.map((it) => ({ ...it, productName: productName(it.productId) }))
  const totalQty = items.reduce((sum, it) => sum + it.qty, 0)
  return { ...po, items, totalQty }
})
