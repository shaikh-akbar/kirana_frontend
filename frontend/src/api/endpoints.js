// Every screen's data access, in one place.
//
// This replaces the old src/data/mockApi.js: nothing here reads a static array
// any more, so the "mock" name (and the src/data folder behind it) is gone.
// Firm scoping and auth are handled by the axios interceptor in ./client, so
// no call site passes a firm id.
import { api, unwrap } from './client'

/* ------------------------------------------------------------------ *
 * Adapters: API shape -> the shape the screens already render.
 * ------------------------------------------------------------------ */

/**
 * The API's own flag is a priority chain (EXPIRED > EXPIRING_SOON > LOW_STOCK),
 * so it cannot express "expiring AND below threshold" — which is exactly the
 * CRITICAL case the Inventory table colours differently. Recomputing from the
 * raw numbers here keeps both meanings intact instead of widening the API's
 * enum to serve one screen.
 */
function toUiFlag(batch) {
  const belowThreshold = Number(batch.quantityAvailable) < Number(batch.minStockAlert)
  // A null expiry means "does not expire", so it is never expiring-soon.
  const expiringSoon = batch.daysToExpiry != null && batch.daysToExpiry <= 30

  if (expiringSoon && belowThreshold) return 'CRITICAL'
  if (expiringSoon) return 'EXPIRING'
  if (belowThreshold) return 'LOW_STOCK'
  return 'OK'
}

function adaptBatch(batch) {
  return {
    id: batch.id,
    productId: batch.productId,
    productName: batch.productName,
    category: batch.category,
    batchNo: batch.batchNumber,
    mfgDate: batch.mfgDate,
    expiryDate: batch.expiryDate,
    daysToExpiry: batch.daysToExpiry,
    qty: Number(batch.quantityAvailable),
    unit: batch.unit,
    threshold: Number(batch.minStockAlert),
    location: batch.storageLocation,
    supplierName: batch.supplierName,
    flag: toUiFlag(batch),
  }
}

/**
 * Prices arrive as DECIMAL strings and are null for a product whose rate has
 * never been keyed in. Both need handling once, here, rather than at every
 * `formatCurrency` call.
 */
function adaptProduct(product) {
  return {
    ...product,
    stock: Number(product.stock),
    threshold: Number(product.threshold),
    retailPrice: product.retailPrice != null ? Number(product.retailPrice) : null,
    wholesalePrice: product.wholesalePrice != null ? Number(product.wholesalePrice) : null,
  }
}

/* ------------------------------------------------------------------ *
 * Catalog
 * ------------------------------------------------------------------ */

/** Products with stock at the active firm and the rate in force today. */
export const fetchProducts = async (params = {}) => {
  const products = unwrap(await api.get('/products', { params })) || []
  return products.map(adaptProduct)
}

export const fetchProduct = async (id) => adaptProduct(unwrap(await api.get(`/products/${id}`)))

export const createProduct = async (payload) => unwrap(await api.post('/products', payload))

export const updateProduct = async (id, payload) => unwrap(await api.patch(`/products/${id}`, payload))

/** `{ rows, tree }` — rows for filter chips, tree for category pickers. */
export const fetchCategories = async () =>
  unwrap(await api.get('/categories')) || { rows: [], tree: [] }

export const createCategory = async (payload) => unwrap(await api.post('/categories', payload))

export const fetchSuppliers = async (params = {}) => unwrap(await api.get('/suppliers', { params })) || []

export const createSupplier = async (payload) => unwrap(await api.post('/suppliers', payload))

/* ------------------------------------------------------------------ *
 * Inventory
 * ------------------------------------------------------------------ */

/** Batch-level stock for the active firm. */
export const fetchInventory = async () => {
  const batches = unwrap(await api.get('/inventory/batches')) || []
  return batches.map(adaptBatch)
}

/** Products at or below their reorder threshold, for the active firm. */
export const fetchLowStock = async () => unwrap(await api.get('/inventory/low-stock')) || []

export const fetchStockMovements = async (params = {}) =>
  unwrap(await api.get('/inventory/movements', { params })) || []

/** Opening stock, recount or write-off. Negative quantity takes stock out. */
export const adjustStock = async (payload) => unwrap(await api.post('/inventory/adjust', payload))

/* ------------------------------------------------------------------ *
 * Orders & billing
 * ------------------------------------------------------------------ */

/** Bill register. `{ channel, fromDate, toDate, limit, offset }`, all optional. */
export const fetchOrders = async (params = {}) =>
  unwrap(await api.get('/orders', { params })) || { rows: [], total: 0 }

/** Everything needed to print or reprint one bill. */
export const fetchInvoice = async (orderId) => unwrap(await api.get(`/orders/${orderId}/invoice`))

/** POS checkout. Returns the created order including its printed bill number. */
export const createRetailBill = async (payload) => unwrap(await api.post('/orders/retail', payload))

/** Wholesale/dealer bill, which may book credit against the buyer's khata. */
export const createWholesaleBill = async (payload) =>
  unwrap(await api.post('/orders/wholesale', payload))

/* ------------------------------------------------------------------ *
 * Buyers & khata
 * ------------------------------------------------------------------ */

/** Dealers, each with their balance and credit status at the active firm. */
export const fetchBuyers = async (params = {}) => unwrap(await api.get('/buyers', { params })) || []

/** One buyer: profile, khata history and bill history at this firm. */
export const fetchBuyer = async (id) => unwrap(await api.get(`/buyers/${id}`))

export const createBuyer = async (payload) => unwrap(await api.post('/buyers', payload))

export const updateBuyer = async (id, payload) => unwrap(await api.patch(`/buyers/${id}`, payload))

/** Khata accounts at the active firm, biggest outstanding first. */
export const fetchKhataAccounts = async () => unwrap(await api.get('/khata')) || []

/** One buyer's khata: current balance plus its transaction history. */
export const fetchKhataLedger = async (buyerId, params = {}) =>
  unwrap(await api.get(`/khata/${buyerId}`, { params }))

/** Records a credit repayment against a buyer's khata. */
export const recordKhataPayment = async (payload) => unwrap(await api.post('/khata/payment', payload))

/* ------------------------------------------------------------------ *
 * Purchasing
 * ------------------------------------------------------------------ */

/** Supplier bills already keyed in. Posting one is what creates stock. */
export const fetchPurchases = async (params = {}) =>
  unwrap(await api.get('/purchases', { params })) || { rows: [], total: 0 }

export const fetchPurchase = async (id) => unwrap(await api.get(`/purchases/${id}`))

export const createPurchase = async (payload) => unwrap(await api.post('/purchases', payload))

/* ------------------------------------------------------------------ *
 * Pricing
 * ------------------------------------------------------------------ */

/** Editable rate sheet for a date (defaults to today). */
export const fetchDailyPricing = async (date) =>
  unwrap(await api.get('/prices/daily', { params: date ? { date } : {} })) || { rows: [] }

/** Bulk daily rate entry. Rates are shared across the owner's firms. */
export const updateDailyPrices = async (payload) =>
  unwrap(await api.put('/prices/daily-update', payload))

/* ------------------------------------------------------------------ *
 * Reporting
 * ------------------------------------------------------------------ */

export const fetchDashboard = async () => unwrap(await api.get('/reports/dashboard'))

export const fetchSalesReport = async (params = {}) =>
  unwrap(await api.get('/reports/sales', { params }))

/* ------------------------------------------------------------------ *
 * Firm
 * ------------------------------------------------------------------ */

/** The active firm's full record, including invoice header/footer settings. */
export const fetchActiveFirm = async () => unwrap(await api.get('/firms/active'))

/** Partial update of the active firm (Settings screen). */
export const updateActiveFirm = async (payload) => unwrap(await api.patch('/firms/active', payload))

/** Everyone with access to the active firm — ADMIN only. */
export const fetchFirmStaff = async () => unwrap(await api.get('/firms/active/staff')) || []

/** Grants an existing user (found by phone) RETAILER/WHOLESALER access to the active firm. */
export const addFirmStaff = async (payload) => unwrap(await api.post('/firms/active/staff', payload))
