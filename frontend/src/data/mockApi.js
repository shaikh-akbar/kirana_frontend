// Thin async wrapper around the mock data so pages can show skeleton loaders
// the same way they would against a real backend. Swap the bodies for real
// `fetch`/`axios` calls later — call sites don't need to change.
import { products } from './products'
import { buyers, getBuyerById } from './buyers'
import { wholesaleOrders } from './wholesaleOrders'
import { inventory } from './inventory'
import { dailyPricingRows } from './dailyPricing'
import { purchases } from './purchases'
import { getDashboardStats, salesTrend, recentActivity, getTopProducts } from './dashboard'

function delay(data, ms = 450) {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

export const fetchProducts = () => delay(products)
export const fetchBuyers = () => delay(buyers)
export const fetchBuyer = (id) => delay(getBuyerById(id))
export const fetchWholesaleOrders = () => delay(wholesaleOrders)
export const fetchInventory = () => delay(inventory, 550)
export const fetchDailyPricing = () => delay(dailyPricingRows, 400)
export const fetchPurchases = () => delay(purchases, 400)
export const fetchDashboard = () =>
  delay({ stats: getDashboardStats(), trend: salesTrend, activity: recentActivity, topProducts: getTopProducts() }, 500)
