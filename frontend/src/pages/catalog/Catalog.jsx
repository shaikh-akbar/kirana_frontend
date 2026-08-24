import { useCallback, useMemo, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Tabs,
  Tab,
  Divider,
  Grid,
} from '@mui/material'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded'
import DataTable from '../../components/DataTable'
import EmptyState from '../../components/EmptyState'
import { apiErrorMessage } from '../../api/client'
import { createCategory, createProduct, fetchCategories, fetchProducts } from '../../api/endpoints'
import { useResource } from '../../api/useResource'
import { useFirm } from '../../firm/firmStore'
import { useToast } from '../../components/toastContext'
import { useAuth } from '../../auth/authStore'
import { formatCurrency, formatQuantity } from '../../utils/format'

const UNIT_OPTIONS = ['PACKET', 'KG', 'GRAM', 'BAG', 'QUINTAL', 'BOX']

const EMPTY_CATEGORY_FORM = {
  name: '',
  parentId: '',
}

const EMPTY_PRODUCT_FORM = {
  name: '',
  sku: '',
  barcode: '',
  categoryId: '',
  hsnCode: '',
  minStockAlert: '',
  unitName: 'PACKET',
}

const columns = [
  { key: 'name', label: 'Product' },
  { key: 'sku', label: 'SKU' },
  { key: 'category', label: 'Category', render: (row) => row.category || '-' },
  { key: 'unit', label: 'Base unit', render: (row) => row.unit || '-' },
  { key: 'stock', label: 'In stock', numeric: true, render: (row) => `${formatQuantity(row.stock)} ${row.unit || ''}`.trim() },
  { key: 'threshold', label: 'Reorder at', numeric: true },
  {
    key: 'retailPrice',
    label: 'Retail',
    numeric: true,
    render: (row) => (row.retailPrice == null ? '-' : formatCurrency(row.retailPrice)),
  },
  {
    key: 'isActive',
    label: 'Status',
    render: (row) => (
      <Chip
        size="small"
        label={row.isActive ? 'Active' : 'Inactive'}
        color={row.isActive ? 'success' : 'default'}
        variant={row.isActive ? 'filled' : 'outlined'}
      />
    ),
  },
]

function buildCategoryGroups(categories, products) {
  const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name))
  const byCategoryId = new Map()

  for (const category of categories || []) {
    byCategoryId.set(category.id, {
      id: category.id,
      name: category.name,
      parentId: category.parentId,
      products: [],
    })
  }

  const uncategorized = { id: 'uncategorized', name: 'Uncategorized', parentId: null, products: [] }

  for (const product of sortedProducts) {
    if (product.categoryId && byCategoryId.has(product.categoryId)) {
      byCategoryId.get(product.categoryId).products.push(product)
    } else {
      uncategorized.products.push(product)
    }
  }

  const groups = [...byCategoryId.values()]
    .filter((group) => group.products.length > 0)
    .map((group) => ({
      ...group,
      totalQty: group.products.reduce((sum, product) => sum + Number(product.stock || 0), 0),
      activeCount: group.products.filter((product) => product.isActive).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  if (uncategorized.products.length > 0) {
    groups.push({
      ...uncategorized,
      totalQty: uncategorized.products.reduce((sum, product) => sum + Number(product.stock || 0), 0),
      activeCount: uncategorized.products.filter((product) => product.isActive).length,
    })
  }

  return groups
}

function categoryAccent(name) {
  const accents = [
    { bg: 'linear-gradient(135deg, #fff1dc 0%, #ffd7a8 100%)', ink: '#8a3b12' },
    { bg: 'linear-gradient(135deg, #eef7d5 0%, #cde89e 100%)', ink: '#40611f' },
    { bg: 'linear-gradient(135deg, #e4f4f1 0%, #a9ddd5 100%)', ink: '#16554b' },
    { bg: 'linear-gradient(135deg, #f8e7df 0%, #f3bfaa 100%)', ink: '#7a2d22' },
    { bg: 'linear-gradient(135deg, #ede9fb 0%, #cabdfa 100%)', ink: '#44317c' },
  ]
  const sum = String(name || '')
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0)
  return accents[sum % accents.length]
}

export default function Catalog() {
  const { activeFirmId } = useFirm()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [tab, setTab] = useState('products')
  const [productOpen, setProductOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [productSubmitting, setProductSubmitting] = useState(false)
  const [categorySubmitting, setCategorySubmitting] = useState(false)
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM)
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM)

  const { data, error, loading, reload } = useResource(
    activeFirmId,
    useCallback(
      () =>
        Promise.all([fetchProducts({ includeInactive: 'true' }), fetchCategories()]).then(([products, categories]) => ({
          products,
          categories,
        })),
      []
    ),
    'Could not load catalog'
  )

  const products = data?.products || []
  const categories = data?.categories?.rows || []
  const canManageCatalog = user?.roleName === 'ADMIN'

  const categoryOptions = useMemo(
    () => categories.filter((category) => category.status === 'ACTIVE'),
    [categories]
  )

  const groupedCategories = useMemo(
    () => buildCategoryGroups(categories, products),
    [categories, products]
  )

  function setProductField(name, value) {
    setProductForm((prev) => ({ ...prev, [name]: value }))
  }

  function setCategoryField(name, value) {
    setCategoryForm((prev) => ({ ...prev, [name]: value }))
  }

  function closeProductDialog() {
    if (productSubmitting) return
    setProductOpen(false)
  }

  function closeCategoryDialog() {
    if (categorySubmitting) return
    setCategoryOpen(false)
  }

  async function handleCreateCategory() {
    try {
      setCategorySubmitting(true)
      await createCategory({
        name: categoryForm.name.trim(),
        parentId: categoryForm.parentId || undefined,
      })
      setCategoryOpen(false)
      setCategoryForm(EMPTY_CATEGORY_FORM)
      showToast('Category created', 'success')
      reload()
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not create category'), 'error')
    } finally {
      setCategorySubmitting(false)
    }
  }

  async function handleCreateProduct() {
    try {
      setProductSubmitting(true)
      await createProduct({
        name: productForm.name.trim(),
        sku: productForm.sku.trim(),
        barcode: productForm.barcode.trim() || undefined,
        categoryId: productForm.categoryId || undefined,
        hsnCode: productForm.hsnCode.trim() || undefined,
        minStockAlert: productForm.minStockAlert === '' ? 0 : Number(productForm.minStockAlert),
        units: [{ unitName: productForm.unitName, conversionFactor: 1, isBaseUnit: true }],
      })
      setProductOpen(false)
      setProductForm(EMPTY_PRODUCT_FORM)
      showToast('Product created', 'success')
      reload()
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not create product'), 'error')
    } finally {
      setProductSubmitting(false)
    }
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Catalog</Typography>
          <Typography variant="body2" color="text.secondary">
            Product masters, stock visibility, and category-wise drilldown for the current firm.
          </Typography>
        </Box>
        {canManageCatalog && (
          <Stack direction="row" spacing={1.25} sx={{ flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={() => setCategoryOpen(true)}>Add category</Button>
            <Button variant="contained" onClick={() => setProductOpen(true)}>Add product</Button>
          </Stack>
        )}
      </Stack>

      <Card sx={{ mb: 2, p: 1 }}>
        <Tabs value={tab} onChange={(_, next) => setTab(next)}>
          <Tab value="products" label="Products" />
          <Tab value="categories" label="Category View" />
        </Tabs>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      <Card sx={{ p: 1 }}>
        {tab === 'products' ? (
          products.length === 0 && !loading ? (
            <EmptyState
              icon={<Inventory2RoundedIcon sx={{ fontSize: 28 }} />}
              title="No products in the catalog yet"
              description="Create a product here first. After that, set its daily rate and add stock."
            />
          ) : (
            <DataTable
              columns={columns}
              rows={products}
              getRowKey={(row) => row.id}
              loading={loading}
              maxHeight={640}
              emptyProps={{ title: 'No products found', description: 'Add your first product to start billing and stock tracking.' }}
            />
          )
        ) : groupedCategories.length === 0 && !loading ? (
          <EmptyState
            icon={<Inventory2RoundedIcon sx={{ fontSize: 28 }} />}
            title="No category stock view yet"
            description="Add categories and products, then stock them to see grouped category quantities here."
          />
        ) : (
          <Grid container spacing={2} sx={{ p: 1 }}>
            {groupedCategories.map((group) => {
              const accent = categoryAccent(group.name)
              return (
                <Grid key={group.id} size={{ xs: 12, xl: 6 }}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 4,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 18px 40px rgba(32, 24, 16, 0.08)',
                    }}
                  >
                    <Box
                      sx={{
                        px: 2.5,
                        py: 2,
                        color: accent.ink,
                        background: accent.bg,
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                      }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.55)', color: accent.ink, width: 46, height: 46 }}>
                            <RestaurantMenuRoundedIcon />
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" fontWeight={900} noWrap>{group.name}</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.78 }}>
                              {group.products.length} items on the shelf
                            </Typography>
                          </Box>
                        </Stack>
                        <Chip
                          label={`Stock ${formatQuantity(group.totalQty)}`}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.7)',
                            color: accent.ink,
                            fontWeight: 700,
                          }}
                        />
                      </Stack>
                    </Box>

                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                        <Chip size="small" label={`${group.activeCount} active`} color="success" variant="outlined" />
                        <Chip size="small" label={`${group.products.length - group.activeCount} inactive`} variant="outlined" />
                      </Stack>

                      <Stack spacing={1.25}>
                        {group.products.map((product, index) => (
                          <Box
                            key={product.id}
                            sx={{
                              p: 1.5,
                              borderRadius: 3,
                              bgcolor: index % 2 === 0 ? 'rgba(247, 244, 238, 0.9)' : 'background.paper',
                              border: '1px solid',
                              borderColor: 'rgba(0,0,0,0.06)',
                            }}
                          >
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="subtitle1" fontWeight={800} noWrap>
                                  {product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  SKU {product.sku}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {product.unit || '-'} · Reorder at {formatQuantity(product.threshold)}
                                </Typography>
                              </Box>

                              <Stack spacing={0.75} sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
                                <Typography variant="subtitle1" fontWeight={900} color="primary.main">
                                  {product.retailPrice == null ? 'No rate' : formatCurrency(product.retailPrice)}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={`${formatQuantity(product.stock)} ${product.unit || ''}`.trim()}
                                  color={Number(product.stock) <= Number(product.threshold) ? 'warning' : 'success'}
                                  variant={Number(product.stock) <= Number(product.threshold) ? 'filled' : 'outlined'}
                                />
                              </Stack>
                            </Stack>

                            <Divider sx={{ my: 1.25 }} />

                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                              <Chip
                                size="small"
                                label={product.isActive ? 'Active' : 'Inactive'}
                                color={product.isActive ? 'success' : 'default'}
                                variant={product.isActive ? 'filled' : 'outlined'}
                              />
                              <Chip
                                size="small"
                                label={Number(product.stock) <= Number(product.threshold) ? 'Reorder soon' : 'Stock healthy'}
                                color={Number(product.stock) <= Number(product.threshold) ? 'warning' : 'default'}
                                variant="outlined"
                              />
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Card>

      <Dialog open={categoryOpen} onClose={closeCategoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add category</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Category name"
              value={categoryForm.name}
              onChange={(e) => setCategoryField('name', e.target.value)}
              required
            />
            <TextField
              select
              label="Parent category"
              value={categoryForm.parentId}
              onChange={(e) => setCategoryField('parentId', e.target.value)}
            >
              <MenuItem value="">No parent</MenuItem>
              {categoryOptions.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeCategoryDialog} disabled={categorySubmitting}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCategory} disabled={categorySubmitting || !categoryForm.name.trim()}>
            Create category
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={productOpen} onClose={closeProductDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add product</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Product name" value={productForm.name} onChange={(e) => setProductField('name', e.target.value)} required />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="SKU" value={productForm.sku} onChange={(e) => setProductField('sku', e.target.value)} required fullWidth />
              <TextField label="Barcode" value={productForm.barcode} onChange={(e) => setProductField('barcode', e.target.value)} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Category"
                value={productForm.categoryId}
                onChange={(e) => setProductField('categoryId', e.target.value)}
                fullWidth
              >
                <MenuItem value="">No category</MenuItem>
                {categoryOptions.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Base unit"
                value={productForm.unitName}
                onChange={(e) => setProductField('unitName', e.target.value)}
                fullWidth
              >
                {UNIT_OPTIONS.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="HSN code" value={productForm.hsnCode} onChange={(e) => setProductField('hsnCode', e.target.value)} fullWidth />
              <TextField
                label="Low stock alert"
                type="number"
                value={productForm.minStockAlert}
                onChange={(e) => setProductField('minStockAlert', e.target.value)}
                fullWidth
              />
            </Stack>
            <Alert severity="info">
              After creating the product, go to Daily Pricing to set the selling rate and then Inventory to add stock.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeProductDialog} disabled={productSubmitting}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateProduct}
            disabled={productSubmitting || !productForm.name.trim() || !productForm.sku.trim()}
          >
            Create product
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
