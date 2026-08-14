import { useCallback, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import DataTable from '../../components/DataTable'
import EmptyState from '../../components/EmptyState'
import { apiErrorMessage } from '../../api/client'
import { createCategory, createProduct, fetchCategories, fetchProducts } from '../../api/endpoints'
import { useResource } from '../../api/useResource'
import { useFirm } from '../../firm/firmStore'
import { useToast } from '../../components/toastContext'
import { useAuth } from '../../auth/authStore'

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
  { key: 'threshold', label: 'Reorder at', numeric: true },
  {
    key: 'isActive',
    label: 'Status',
    render: (row) => <Chip size="small" label={row.isActive ? 'Active' : 'Inactive'} color={row.isActive ? 'success' : 'default'} variant={row.isActive ? 'filled' : 'outlined'} />,
  },
]

export default function Catalog() {
  const { activeFirmId } = useFirm()
  const { user } = useAuth()
  const { showToast } = useToast()
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
  const categories = data?.categories?.rows
  const canManageCatalog = user?.roleName === 'ADMIN'

  const categoryOptions = useMemo(
    () => (categories || []).filter((category) => category.status === 'ACTIVE'),
    [categories]
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
            Create product masters first, then set rates in Daily Pricing and stock them in Inventory.
          </Typography>
        </Box>
        {canManageCatalog && (
          <Stack direction="row" spacing={1.25} sx={{ flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={() => setCategoryOpen(true)}>Add category</Button>
            <Button variant="contained" onClick={() => setProductOpen(true)}>Add product</Button>
          </Stack>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      <Card sx={{ p: 1 }}>
        {products.length === 0 && !loading ? (
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
