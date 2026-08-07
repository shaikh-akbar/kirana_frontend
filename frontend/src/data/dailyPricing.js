import { products } from './products'

// Today's editable rate sheet — seeded from the catalog with a small
// yesterday-price reference so the grid can show inline deltas.
export const dailyPricingRows = products.map((p) => ({
  productId: p.id,
  productName: p.name,
  category: p.category,
  unit: p.unit,
  yesterdayWholesale: p.wholesalePrice,
  yesterdayRetail: p.retailPrice,
  wholesalePrice: p.wholesalePrice,
  retailPrice: p.retailPrice,
  published: true,
  lastUpdated: '2026-08-05 08:15 AM',
}))
