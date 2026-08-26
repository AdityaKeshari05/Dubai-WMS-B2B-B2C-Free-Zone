'use client';

import { useEffect, useState } from 'react';
import { Plus, Package, Pencil, Trash2, Power, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { SelectEmptyState } from '@/components/shared/SelectEmptyState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { Product, Category, Unit } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { showApiError, showApiSuccess } from '@/lib/apiError';
import toast from 'react-hot-toast';

const defaultFormState = {
  sku: '',
  name: '',
  description: '',
  categoryId: '',
  unitId: '',
  type: 'PRODUCT',
  costPrice: 0,
  salePrice: 0,
  taxRate: 0,
  minStockLevel: 0,
  valuationMethod: 'MOVING_AVERAGE',
  maintainStock: true,
  allowNegativeStock: false,
  hasBatchNo: false,
  hasSerialNo: false,
  reorderLevel: 0,
  reorderQty: 0,
  brand: '',
  manufacturer: '',
  isActive: true,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(defaultFormState);
  const limit = 20;

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes, unitRes] = await Promise.allSettled([
        api.get('/inventory/products', { params: { page, limit, search: search || undefined } }),
        api.get('/inventory/categories'),
        api.get('/inventory/units'),
      ]);
      if (prodRes.status === 'fulfilled') {
        setProducts(prodRes.value.data?.data?.items || []);
        setTotal(prodRes.value.data?.data?.total || 0);
      } else {
        showApiError(prodRes.reason, 'Failed to load products');
      }
      if (catRes.status === 'fulfilled') {
        setCategories(catRes.value.data?.data || []);
      }
      if (unitRes.status === 'fulfilled') {
        setUnits(unitRes.value.data?.data || []);
      }
    } catch (err: any) {
      showApiError(err, 'Failed to load inventory data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [page, search]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setForm(defaultFormState);
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      sku: p.sku || '',
      name: p.name || '',
      description: p.description || '',
      categoryId: p.categoryId || '',
      unitId: p.unitId || '',
      type: p.type || 'PRODUCT',
      costPrice: Number(p.costPrice || 0),
      salePrice: Number(p.salePrice || 0),
      taxRate: Number(p.taxRate || 0),
      minStockLevel: Number(p.minStockLevel || 0),
      valuationMethod: p.valuationMethod || 'MOVING_AVERAGE',
      maintainStock: p.maintainStock ?? true,
      allowNegativeStock: p.allowNegativeStock ?? false,
      hasBatchNo: p.hasBatchNo ?? false,
      hasSerialNo: p.hasSerialNo ?? false,
      reorderLevel: Number(p.reorderLevel || 0),
      reorderQty: Number(p.reorderQty || 0),
      brand: p.brand || '',
      manufacturer: p.manufacturer || '',
      isActive: p.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedSku = form.sku.trim();
    const trimmedName = form.name.trim();

    if (!trimmedSku) {
      toast.error('SKU is required');
      return;
    }
    if (!trimmedName) {
      toast.error('Product name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        sku: trimmedSku,
        name: trimmedName,
        categoryId: form.categoryId || undefined,
        unitId: form.unitId || undefined,
        costPrice: Number(form.costPrice || 0),
        salePrice: Number(form.salePrice || 0),
        taxRate: Number(form.taxRate || 0),
        minStockLevel: Number(form.minStockLevel || 0),
        reorderLevel: Number(form.reorderLevel || 0),
        reorderQty: Number(form.reorderQty || 0),
      };

      if (editingProduct) {
        await api.put(`/inventory/products/${editingProduct.id}`, payload);
        showApiSuccess(`Product "${trimmedName}" updated successfully`);
      } else {
        await api.post('/inventory/products', payload);
        showApiSuccess(`Product "${trimmedName}" created successfully`);
      }

      setShowModal(false);
      setEditingProduct(null);
      setForm(defaultFormState);
      fetchAll();
    } catch (err: any) {
      showApiError(err, editingProduct ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (p: Product) => {
    const action = p.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} product "${p.name}"?`)) return;

    try {
      if (p.isActive) {
        await api.delete(`/inventory/products/${p.id}`);
        showApiSuccess(`Product "${p.name}" deactivated`);
      } else {
        await api.put(`/inventory/products/${p.id}`, { isActive: true });
        showApiSuccess(`Product "${p.name}" activated`);
      }
      fetchAll();
    } catch (err: any) {
      showApiError(err, `Failed to ${action} product`);
    }
  };

  const getTotalStock = (product: Product) =>
    product.stockLevels?.reduce((sum, sl) => sum + sl.quantity, 0) || 0;

  const columns = [
    {
      key: 'sku',
      header: 'SKU',
      render: (p: Product) => (
        <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-800">{p.sku}</span>
      ),
    },
    {
      key: 'name',
      header: 'Product',
      render: (p: Product) => (
        <div>
          <p className="font-medium text-gray-900">{p.name}</p>
          <p className="text-xs text-gray-400">{p.category?.name || 'Uncategorized'}</p>
        </div>
      ),
    },
    { key: 'type', header: 'Type' },
    {
      key: 'valuationMethod',
      header: 'Valuation',
      render: (p: Product) => p.valuationMethod?.replace('_', ' ') || '—',
    },
    { key: 'costPrice', header: 'Cost', render: (p: Product) => formatCurrency(p.costPrice) },
    { key: 'salePrice', header: 'Sale Price', render: (p: Product) => formatCurrency(p.salePrice) },
    {
      key: 'stock',
      header: 'Stock',
      render: (p: Product) => {
        const stock = getTotalStock(p);
        const isLow = stock <= p.minStockLevel;
        return (
          <span className={`font-semibold ${isLow ? 'text-red-600' : 'text-green-600'}`}>
            {stock.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (p: Product) => (
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {p.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (p: Product) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
            title="Edit Product"
            onClick={() => handleOpenEdit(p)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={`h-8 w-8 p-0 ${
              p.isActive
                ? 'text-gray-500 hover:text-red-600'
                : 'text-gray-500 hover:text-green-600'
            }`}
            title={p.isActive ? 'Deactivate Product' : 'Activate Product'}
            onClick={() => handleToggleActive(p)}
          >
            {p.isActive ? <Power className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your products and services"
        action={{ label: 'New Product', onClick: handleOpenCreate, icon: Plus }}
      />
      <div className="mb-4">
        <Input
          placeholder="Search products by SKU or name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>
      {products.length === 0 && !isLoading ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Add your first product or service"
          action={{ label: 'Add Product', onClick: handleOpenCreate }}
        />
      ) : (
        <>
          <DataTable columns={columns} data={products} isLoading={isLoading} />
          {total > limit && (
            <Pagination
              page={page}
              totalPages={Math.ceil(total / limit)}
              total={total}
              limit={limit}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-2">
            <div className="space-y-1.5">
              <Label>SKU *</Label>
              <Input
                value={form.sku}
                placeholder="e.g. PROD-001"
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={form.name}
                placeholder="e.g. Industrial Steel Bolt"
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="Item specification, grade, or material notes"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.categoryId || '__none__'}
                onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v === '__none__' ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Uncategorized</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Select
                value={form.unitId || '__none__'}
                onValueChange={(v) => setForm((f) => ({ ...f, unitId: v === '__none__' ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRODUCT">Product</SelectItem>
                  <SelectItem value="SERVICE">Service</SelectItem>
                  <SelectItem value="DIGITAL">Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cost Price</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.costPrice}
                onChange={(e) => setForm((f) => ({ ...f, costPrice: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sale Price</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.salePrice}
                onChange={(e) => setForm((f) => ({ ...f, salePrice: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="18"
                value={form.taxRate}
                onChange={(e) => setForm((f) => ({ ...f, taxRate: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min Stock Level</Label>
              <Input
                type="number"
                placeholder="0"
                value={form.minStockLevel}
                onChange={(e) => setForm((f) => ({ ...f, minStockLevel: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Valuation Method</Label>
              <Select
                value={form.valuationMethod}
                onValueChange={(v) => setForm((f) => ({ ...f, valuationMethod: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOVING_AVERAGE">Moving Average</SelectItem>
                  <SelectItem value="FIFO">FIFO</SelectItem>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Reorder Level</Label>
              <Input
                type="number"
                placeholder="0"
                value={form.reorderLevel}
                onChange={(e) => setForm((f) => ({ ...f, reorderLevel: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Reorder Qty</Label>
              <Input
                type="number"
                placeholder="0"
                value={form.reorderQty}
                onChange={(e) => setForm((f) => ({ ...f, reorderQty: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Input
                value={form.brand}
                placeholder="Brand name"
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Manufacturer</Label>
              <Input
                value={form.manufacturer}
                placeholder="Manufacturer name"
                onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))}
              />
            </div>
            {editingProduct && (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.isActive ? 'true' : 'false'}
                  onValueChange={(v) => setForm((f) => ({ ...f, isActive: v === 'true' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
              <input
                type="checkbox"
                checked={form.maintainStock}
                onChange={(e) => setForm((f) => ({ ...f, maintainStock: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <span>Maintain Stock</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
              <input
                type="checkbox"
                checked={form.allowNegativeStock}
                onChange={(e) => setForm((f) => ({ ...f, allowNegativeStock: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <span>Allow Negative Stock</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasBatchNo}
                onChange={(e) => setForm((f) => ({ ...f, hasBatchNo: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <span>Track Batches</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasSerialNo}
                onChange={(e) => setForm((f) => ({ ...f, hasSerialNo: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <span>Track Serial Nos</span>
            </label>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? editingProduct
                    ? 'Saving...'
                    : 'Creating...'
                  : editingProduct
                  ? 'Save Changes'
                  : 'Create Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

