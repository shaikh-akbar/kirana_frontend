import { products } from './products'

// Batch/expiry-aware inventory. "Today" for demo purposes is 2026-08-05.
export const TODAY = '2026-08-05'

const rawBatches = [
  { id: 'BT001', productId: 'P001', batchNo: 'BAS-24A', mfgDate: '2026-02-10', expiryDate: '2027-02-10', qty: 320, location: 'Rack A1' },
  { id: 'BT002', productId: 'P001', batchNo: 'BAS-24B', mfgDate: '2026-05-02', expiryDate: '2027-05-02', qty: 100, location: 'Rack A1' },
  { id: 'BT003', productId: 'P002', batchNo: 'SNM-24C', mfgDate: '2026-03-18', expiryDate: '2027-03-18', qty: 610, location: 'Rack A2' },
  { id: 'BT004', productId: 'P003', batchNo: 'TRD-24D', mfgDate: '2025-12-01', expiryDate: '2026-08-20', qty: 88, location: 'Rack B1' },
  { id: 'BT005', productId: 'P004', batchNo: 'MND-24E', mfgDate: '2026-01-15', expiryDate: '2026-11-15', qty: 205, location: 'Rack B1' },
  { id: 'BT006', productId: 'P005', batchNo: 'CND-24F', mfgDate: '2025-11-20', expiryDate: '2026-08-15', qty: 34, location: 'Rack B2' },
  { id: 'BT007', productId: 'P006', batchNo: 'SFO-24G', mfgDate: '2026-04-01', expiryDate: '2027-04-01', qty: 260, location: 'Rack C1' },
  { id: 'BT008', productId: 'P007', batchNo: 'MSO-24H', mfgDate: '2026-02-22', expiryDate: '2026-08-30', qty: 55, location: 'Rack C1' },
  { id: 'BT009', productId: 'P008', batchNo: 'GHE-24I', mfgDate: '2026-03-05', expiryDate: '2026-09-05', qty: 40, location: 'Rack C2' },
  { id: 'BT010', productId: 'P009', batchNo: 'TMR-24J', mfgDate: '2025-10-10', expiryDate: '2027-10-10', qty: 72, location: 'Rack D1' },
  { id: 'BT011', productId: 'P010', batchNo: 'RCP-24K', mfgDate: '2025-11-11', expiryDate: '2027-11-11', qty: 65, location: 'Rack D1' },
  { id: 'BT012', productId: 'P011', batchNo: 'GRM-24L', mfgDate: '2026-01-05', expiryDate: '2026-08-25', qty: 18, location: 'Rack D2' },
  { id: 'BT013', productId: 'P012', batchNo: 'SGR-24M', mfgDate: '2026-05-15', expiryDate: '2028-05-15', qty: 540, location: 'Rack E1' },
  { id: 'BT014', productId: 'P013', batchNo: 'SLT-24N', mfgDate: '2026-04-20', expiryDate: '2029-04-20', qty: 380, location: 'Rack E1' },
  { id: 'BT015', productId: 'P014', batchNo: 'ATA-24O', mfgDate: '2026-07-01', expiryDate: '2026-12-01', qty: 720, location: 'Rack E2' },
  { id: 'BT016', productId: 'P015', batchNo: 'BSN-24P', mfgDate: '2026-05-28', expiryDate: '2026-11-28', qty: 46, location: 'Rack E2' },
  { id: 'BT017', productId: 'P016', batchNo: 'CSH-24Q', mfgDate: '2026-02-14', expiryDate: '2026-08-14', qty: 22, location: 'Rack F1' },
  { id: 'BT018', productId: 'P017', batchNo: 'ALM-24R', mfgDate: '2026-03-01', expiryDate: '2027-03-01', qty: 28, location: 'Rack F1' },
  { id: 'BT019', productId: 'P018', batchNo: 'RSN-24S', mfgDate: '2025-09-10', expiryDate: '2026-09-10', qty: 15, location: 'Rack F2' },
  { id: 'BT020', productId: 'P019', batchNo: 'TEA-24T', mfgDate: '2026-01-20', expiryDate: '2027-07-20', qty: 64, location: 'Rack G1' },
  { id: 'BT021', productId: 'P020', batchNo: 'CFP-24U', mfgDate: '2026-02-01', expiryDate: '2027-02-01', qty: 38, location: 'Rack G1' },
]

function daysBetween(from, to) {
  return Math.round((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24))
}

export const inventory = rawBatches.map((batch) => {
  const product = products.find((p) => p.id === batch.productId)
  const daysToExpiry = daysBetween(TODAY, batch.expiryDate)
  const belowThreshold = batch.qty < product.threshold
  const expiringSoon = daysToExpiry <= 30
  let flag = 'OK'
  if (expiringSoon && belowThreshold) flag = 'CRITICAL'
  else if (expiringSoon) flag = 'EXPIRING'
  else if (belowThreshold) flag = 'LOW_STOCK'
  return {
    ...batch,
    productName: product.name,
    category: product.category,
    unit: product.unit,
    threshold: product.threshold,
    daysToExpiry,
    flag,
  }
})

export function getLowStockCount() {
  return inventory.filter((row) => row.flag === 'LOW_STOCK' || row.flag === 'CRITICAL').length
}

export function getExpiringSoonCount() {
  return inventory.filter((row) => row.flag === 'EXPIRING' || row.flag === 'CRITICAL').length
}
