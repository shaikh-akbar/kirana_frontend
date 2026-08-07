// Mock product catalog for a kirana (general store) — used by POS, Wholesale,
// Inventory and Daily Pricing screens so numbers stay consistent across pages.
export const CATEGORIES = [
  'Grains & Rice',
  'Pulses & Dals',
  'Oil & Ghee',
  'Spices & Masala',
  'Sugar & Salt',
  'Flour & Atta',
  'Dry Fruits',
  'Beverages',
]

export const UNITS = ['KG', 'BAG', 'QUINTAL']

// 1 BAG = 25 KG, 1 QUINTAL = 100 KG — used for live unit conversion in Wholesale Order Entry.
export const UNIT_TO_KG = { KG: 1, BAG: 25, QUINTAL: 100 }

// Wholesale price slabs by cumulative order quantity (in KG).
export const PRICING_TIERS = [
  { id: 'T1', label: 'Standard', minKg: 0, discountPct: 0 },
  { id: 'T2', label: 'Bulk 50kg+', minKg: 50, discountPct: 4 },
  { id: 'T3', label: 'Bulk 100kg+', minKg: 100, discountPct: 8 },
  { id: 'T4', label: 'Bulk 250kg+', minKg: 250, discountPct: 12 },
]

export const products = [
  { id: 'P001', name: 'Basmati Rice (Premium)', category: 'Grains & Rice', unit: 'KG', sku: 'GR-001', barcode: '8901030001', retailPrice: 118, wholesalePrice: 96, stock: 420, threshold: 100, emoji: '🍚' },
  { id: 'P002', name: 'Sona Masoori Rice', category: 'Grains & Rice', unit: 'KG', sku: 'GR-002', barcode: '8901030002', retailPrice: 62, wholesalePrice: 48, stock: 610, threshold: 150, emoji: '🍚' },
  { id: 'P003', name: 'Toor Dal (Arhar)', category: 'Pulses & Dals', unit: 'KG', sku: 'PD-001', barcode: '8901030003', retailPrice: 142, wholesalePrice: 118, stock: 88, threshold: 100, emoji: '🫘' },
  { id: 'P004', name: 'Moong Dal (Yellow)', category: 'Pulses & Dals', unit: 'KG', sku: 'PD-002', barcode: '8901030004', retailPrice: 132, wholesalePrice: 108, stock: 205, threshold: 80, emoji: '🫘' },
  { id: 'P005', name: 'Chana Dal', category: 'Pulses & Dals', unit: 'KG', sku: 'PD-003', barcode: '8901030005', retailPrice: 96, wholesalePrice: 78, stock: 34, threshold: 60, emoji: '🫘' },
  { id: 'P006', name: 'Sunflower Oil', category: 'Oil & Ghee', unit: 'KG', sku: 'OG-001', barcode: '8901030006', retailPrice: 148, wholesalePrice: 128, stock: 260, threshold: 100, emoji: '🛢️' },
  { id: 'P007', name: 'Mustard Oil (Kachi Ghani)', category: 'Oil & Ghee', unit: 'KG', sku: 'OG-002', barcode: '8901030007', retailPrice: 168, wholesalePrice: 142, stock: 55, threshold: 60, emoji: '🛢️' },
  { id: 'P008', name: 'Pure Ghee', category: 'Oil & Ghee', unit: 'KG', sku: 'OG-003', barcode: '8901030008', retailPrice: 620, wholesalePrice: 560, stock: 40, threshold: 30, emoji: '🧈' },
  { id: 'P009', name: 'Turmeric Powder', category: 'Spices & Masala', unit: 'KG', sku: 'SM-001', barcode: '8901030009', retailPrice: 210, wholesalePrice: 175, stock: 72, threshold: 40, emoji: '🌶️' },
  { id: 'P010', name: 'Red Chilli Powder', category: 'Spices & Masala', unit: 'KG', sku: 'SM-002', barcode: '8901030010', retailPrice: 280, wholesalePrice: 235, stock: 65, threshold: 40, emoji: '🌶️' },
  { id: 'P011', name: 'Garam Masala', category: 'Spices & Masala', unit: 'KG', sku: 'SM-003', barcode: '8901030011', retailPrice: 420, wholesalePrice: 360, stock: 18, threshold: 25, emoji: '🌶️' },
  { id: 'P012', name: 'Sugar (Crystal)', category: 'Sugar & Salt', unit: 'KG', sku: 'SS-001', barcode: '8901030012', retailPrice: 46, wholesalePrice: 39, stock: 540, threshold: 200, emoji: '🧂' },
  { id: 'P013', name: 'Iodised Salt', category: 'Sugar & Salt', unit: 'KG', sku: 'SS-002', barcode: '8901030013', retailPrice: 24, wholesalePrice: 18, stock: 380, threshold: 150, emoji: '🧂' },
  { id: 'P014', name: 'Wheat Atta (Chakki Fresh)', category: 'Flour & Atta', unit: 'KG', sku: 'FA-001', barcode: '8901030014', retailPrice: 44, wholesalePrice: 36, stock: 720, threshold: 250, emoji: '🌾' },
  { id: 'P015', name: 'Besan (Gram Flour)', category: 'Flour & Atta', unit: 'KG', sku: 'FA-002', barcode: '8901030015', retailPrice: 98, wholesalePrice: 82, stock: 46, threshold: 50, emoji: '🌾' },
  { id: 'P016', name: 'Cashew Nuts (W320)', category: 'Dry Fruits', unit: 'KG', sku: 'DF-001', barcode: '8901030016', retailPrice: 980, wholesalePrice: 860, stock: 22, threshold: 20, emoji: '🥜' },
  { id: 'P017', name: 'Almonds (California)', category: 'Dry Fruits', unit: 'KG', sku: 'DF-002', barcode: '8901030017', retailPrice: 820, wholesalePrice: 720, stock: 28, threshold: 20, emoji: '🥜' },
  { id: 'P018', name: 'Raisins (Kishmish)', category: 'Dry Fruits', unit: 'KG', sku: 'DF-003', barcode: '8901030018', retailPrice: 340, wholesalePrice: 290, stock: 15, threshold: 20, emoji: '🍇' },
  { id: 'P019', name: 'Assam Tea (Loose)', category: 'Beverages', unit: 'KG', sku: 'BV-001', barcode: '8901030019', retailPrice: 420, wholesalePrice: 360, stock: 64, threshold: 30, emoji: '🍵' },
  { id: 'P020', name: 'Filter Coffee Powder', category: 'Beverages', unit: 'KG', sku: 'BV-002', barcode: '8901030020', retailPrice: 560, wholesalePrice: 480, stock: 38, threshold: 25, emoji: '☕' },
]

export function getProductById(id) {
  return products.find((p) => p.id === id)
}

export function getPricingTier(qtyKg) {
  let tier = PRICING_TIERS[0]
  for (const t of PRICING_TIERS) {
    if (qtyKg >= t.minKg) tier = t
  }
  return tier
}
