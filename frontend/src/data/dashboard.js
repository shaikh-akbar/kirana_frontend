import { wholesaleOrders } from './wholesaleOrders'
import { buyers, getBuyerStatus } from './buyers'
import { getLowStockCount } from './inventory'

// 14-day sales trend (retail vs wholesale, in ₹) feeding the dashboard sparklines.
export const salesTrend = [
  { date: '07-23', retail: 18200, wholesale: 42000 },
  { date: '07-24', retail: 19500, wholesale: 38500 },
  { date: '07-25', retail: 21000, wholesale: 51200 },
  { date: '07-26', retail: 17800, wholesale: 29800 },
  { date: '07-27', retail: 22400, wholesale: 46600 },
  { date: '07-28', retail: 20100, wholesale: 33200 },
  { date: '07-29', retail: 23600, wholesale: 55400 },
  { date: '07-30', retail: 24800, wholesale: 41300 },
  { date: '07-31', retail: 21900, wholesale: 37600 },
  { date: '08-01', retail: 26200, wholesale: 62000 },
  { date: '08-02', retail: 25100, wholesale: 40500 },
  { date: '08-03', retail: 27800, wholesale: 58300 },
  { date: '08-04', retail: 23400, wholesale: 44700 },
  { date: '08-05', retail: 15600, wholesale: 21800 },
]

export function getDashboardStats() {
  const today = salesTrend[salesTrend.length - 1]
  const todaysSales = today.retail + today.wholesale
  const pendingKhata = buyers
    .filter((b) => getBuyerStatus(b) !== 'CLEAR' || b.balance > 0)
    .reduce((sum, b) => sum + b.balance, 0)
  const lowStockCount = getLowStockCount()

  return {
    todaysSales,
    retailShare: today.retail,
    wholesaleShare: today.wholesale,
    pendingKhata,
    lowStockCount,
  }
}

export const recentActivity = [
  { id: 'A1', type: 'order', text: 'Wholesale order WO-2092 placed by Mahalaxmi General Traders', time: '10 min ago' },
  { id: 'A2', type: 'payment', text: 'Payment of ₹12,000 received from Om Sai Wholesale', time: '1 hr ago' },
  { id: 'A3', type: 'sale', text: 'POS sale of ₹1,840 completed — UPI', time: '2 hr ago' },
  { id: 'A4', type: 'stock', text: 'Cashew Nuts (W320) batch CSH-24Q flagged low stock', time: '3 hr ago' },
  { id: 'A5', type: 'pricing', text: "Today's rates published for 20 products", time: '8 hr ago' },
]

export function getTopProducts() {
  const totals = {}
  for (const order of wholesaleOrders) {
    for (const item of order.items) {
      totals[item.productId] = totals[item.productId] || { productId: item.productId, productName: item.productName, qtyKg: 0, revenue: 0 }
      totals[item.productId].qtyKg += item.qtyKg
      totals[item.productId].revenue += item.lineTotal
    }
  }
  return Object.values(totals)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
}
