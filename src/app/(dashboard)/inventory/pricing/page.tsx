'use client';

import { useEffect, useState } from 'react';
import { Plus, Tags, Pencil, Trash2, Scale, ArrowRightLeft, Percent } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { ItemPrice, PriceList, PricingRule, Product, Unit } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { SelectEmptyState } from '@/components/shared/SelectEmptyState';
import { CurrencySelect } from '@/components/ui/currency-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { showApiError, showApiSuccess } from '@/lib/apiError';

export default function InventoryPricingPage() {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [itemPrices, setItemPrices] = useState<ItemPrice[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [uomConversions, setUomConversions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [editingPriceList, setEditingPriceList] = useState<PriceList | null>(null);
  const [showPriceListModal, setShowPriceListModal] = useState(false);
  const [priceListForm, setPriceListForm] = useState({ name: '', currency: 'INR' });
  const [isSubmittingPL, setIsSubmittingPL] = useState(false);

  const [editingItemPrice, setEditingItemPrice] = useState<ItemPrice | null>(null);
  const [showItemPriceModal, setShowItemPriceModal] = useState(false);
  const [itemPriceForm, setItemPriceForm] = useState({ productId: '', priceListId: '', currency: 'INR', price: '' });
  const [isSubmittingIP, setIsSubmittingIP] = useState(false);

  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    name: '',
    priceListId: '',
    productId: '',
    minQty: '',
    discountPercent: '',
    marginPercent: '',
    priority: '100',
  });
  const [isSubmittingRule, setIsSubmittingRule] = useState(false);

  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [unitForm, setUnitForm] = useState({ name: '', symbol: '' });
  const [isSubmittingUnit, setIsSubmittingUnit] = useState(false);

  const [editingConversion, setEditingConversion] = useState<any | null>(null);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [conversionForm, setConversionForm] = useState({ productId: '', fromUnitId: '', toUnitId: '', factor: '1' });
  const [isSubmittingConversion, setIsSubmittingConversion] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const [pl, ip, rulesRes, prod, unitRes, uomRes] = await Promise.all([
        api.get('/inventory/price-lists'),
        api.get('/inventory/item-prices'),
        api.get('/inventory/pricing-rules'),
        api.get('/inventory/products', { params: { limit: 300 } }),
        api.get('/inventory/units'),
        api.get('/inventory/uom-conversions').catch(() => ({ data: { data: [] } })),
      ]);
      setPriceLists(pl.data?.data || []);
      setItemPrices(ip.data?.data?.items || []);
      setRules(rulesRes.data?.data || []);
      setProducts(prod.data?.data?.items || []);
      setUnits(unitRes.data?.data || []);
      setUomConversions(uomRes.data?.data || []);
    } catch (err: any) {
      showApiError(err, 'Failed to load pricing and unit configurations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Price List Handlers
  const handleOpenCreatePriceList = () => {
    setEditingPriceList(null);
    setPriceListForm({ name: '', currency: 'INR' });
    setShowPriceListModal(true);
  };

  const handleOpenEditPriceList = (pl: PriceList) => {
    setEditingPriceList(pl);
    setPriceListForm({ name: pl.name || '', currency: pl.currency || 'INR' });
    setShowPriceListModal(true);
  };

  const handleSavePriceList = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmittingPL) return;
    const trimmedName = priceListForm.name.trim();
    if (!trimmedName) {
      toast.error('Price list name is required');
      return;
    }

    setIsSubmittingPL(true);
    try {
      if (editingPriceList) {
        await api.put(`/inventory/price-lists/${editingPriceList.id}`, { ...priceListForm, name: trimmedName });
        showApiSuccess(`Price list "${trimmedName}" updated`);
      } else {
        await api.post('/inventory/price-lists', { ...priceListForm, name: trimmedName });
        showApiSuccess(`Price list "${trimmedName}" created`);
      }
      setShowPriceListModal(false);
      setEditingPriceList(null);
      setPriceListForm({ name: '', currency: 'INR' });
      load();
    } catch (err: any) {
      showApiError(err, editingPriceList ? 'Failed to update price list' : 'Failed to create price list');
    } finally {
      setIsSubmittingPL(false);
    }
  };

  const handleDeletePriceList = async (pl: PriceList) => {
    if (!window.confirm(`Are you sure you want to delete price list "${pl.name}"?`)) return;
    try {
      await api.delete(`/inventory/price-lists/${pl.id}`);
      showApiSuccess(`Price list "${pl.name}" deleted`);
      load();
    } catch (err: any) {
      showApiError(err, 'Failed to delete price list');
    }
  };

  // Item Price Handlers
  const handleOpenCreateItemPrice = () => {
    setEditingItemPrice(null);
    setItemPriceForm({ productId: '', priceListId: '', currency: 'INR', price: '' });
    setShowItemPriceModal(true);
  };

  const handleOpenEditItemPrice = (ip: ItemPrice) => {
    setEditingItemPrice(ip);
    setItemPriceForm({
      productId: ip.productId || '',
      priceListId: ip.priceListId || '',
      currency: ip.currency || 'INR',
      price: String(ip.price ?? ''),
    });
    setShowItemPriceModal(true);
  };

  const handleSaveItemPrice = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmittingIP) return;
    if (!itemPriceForm.productId) {
      toast.error('Please select a product');
      return;
    }
    if (!itemPriceForm.priceListId) {
      toast.error('Please select a price list');
      return;
    }
    if (!itemPriceForm.price || Number(itemPriceForm.price) < 0) {
      toast.error('Please enter a valid non-negative price');
      return;
    }

    setIsSubmittingIP(true);
    try {
      const payload = {
        ...itemPriceForm,
        price: Number(itemPriceForm.price),
      };
      if (editingItemPrice) {
        await api.put(`/inventory/item-prices/${editingItemPrice.id}`, payload);
        showApiSuccess('Item price updated successfully');
      } else {
        await api.post('/inventory/item-prices', payload);
        showApiSuccess('Item price configured successfully');
      }
      setShowItemPriceModal(false);
      setEditingItemPrice(null);
      setItemPriceForm({ productId: '', priceListId: '', currency: 'INR', price: '' });
      load();
    } catch (err: any) {
      showApiError(err, editingItemPrice ? 'Failed to update item price' : 'Failed to save item price');
    } finally {
      setIsSubmittingIP(false);
    }
  };

  const handleDeleteItemPrice = async (ip: ItemPrice) => {
    if (!window.confirm('Are you sure you want to delete this item price?')) return;
    try {
      await api.delete(`/inventory/item-prices/${ip.id}`);
      showApiSuccess('Item price deleted');
      load();
    } catch (err: any) {
      showApiError(err, 'Failed to delete item price');
    }
  };

  // Pricing Rule Handlers
  const handleOpenCreateRule = () => {
    setEditingRule(null);
    setRuleForm({
      name: '',
      priceListId: '',
      productId: '',
      minQty: '',
      discountPercent: '',
      marginPercent: '',
      priority: '100',
    });
    setShowRuleModal(true);
  };

  const handleOpenEditRule = (rule: PricingRule) => {
    setEditingRule(rule);
    setRuleForm({
      name: rule.name || '',
      priceListId: rule.priceListId || '',
      productId: rule.productId || '',
      minQty: rule.minQty != null ? String(rule.minQty) : '',
      discountPercent: rule.discountPercent != null ? String(rule.discountPercent) : '',
      marginPercent: rule.marginPercent != null ? String(rule.marginPercent) : '',
      priority: rule.priority != null ? String(rule.priority) : '100',
    });
    setShowRuleModal(true);
  };

  const handleSaveRule = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmittingRule) return;
    const trimmedName = ruleForm.name.trim();
    if (!trimmedName) {
      toast.error('Rule name is required');
      return;
    }

    setIsSubmittingRule(true);
    try {
      const payload = {
        ...ruleForm,
        name: trimmedName,
        productId: ruleForm.productId || undefined,
        priceListId: ruleForm.priceListId || undefined,
        minQty: ruleForm.minQty ? Number(ruleForm.minQty) : undefined,
        discountPercent: Number(ruleForm.discountPercent || 0),
        marginPercent: Number(ruleForm.marginPercent || 0),
        priority: Number(ruleForm.priority || 100),
      };

      if (editingRule) {
        await api.put(`/inventory/pricing-rules/${editingRule.id}`, payload);
        showApiSuccess(`Pricing rule "${trimmedName}" updated`);
      } else {
        await api.post('/inventory/pricing-rules', payload);
        showApiSuccess(`Pricing rule "${trimmedName}" created`);
      }
      setShowRuleModal(false);
      setEditingRule(null);
      setRuleForm({
        name: '',
        priceListId: '',
        productId: '',
        minQty: '',
        discountPercent: '',
        marginPercent: '',
        priority: '100',
      });
      load();
    } catch (err: any) {
      showApiError(err, editingRule ? 'Failed to update pricing rule' : 'Failed to create pricing rule');
    } finally {
      setIsSubmittingRule(false);
    }
  };

  const handleDeleteRule = async (rule: PricingRule) => {
    if (!window.confirm(`Are you sure you want to delete pricing rule "${rule.name}"?`)) return;
    try {
      await api.delete(`/inventory/pricing-rules/${rule.id}`);
      showApiSuccess(`Pricing rule "${rule.name}" deleted`);
      load();
    } catch (err: any) {
      showApiError(err, 'Failed to delete pricing rule');
    }
  };

  // Units Handlers
  const handleOpenCreateUnit = () => {
    setEditingUnit(null);
    setUnitForm({ name: '', symbol: '' });
    setShowUnitModal(true);
  };

  const handleOpenEditUnit = (u: Unit) => {
    setEditingUnit(u);
    setUnitForm({ name: u.name || '', symbol: u.symbol || '' });
    setShowUnitModal(true);
  };

  const handleSaveUnit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmittingUnit) return;
    const name = unitForm.name.trim();
    const symbol = unitForm.symbol.trim();
    if (!name || !symbol) {
      toast.error('Unit name and symbol are required');
      return;
    }

    setIsSubmittingUnit(true);
    try {
      if (editingUnit) {
        await api.put(`/inventory/units/${editingUnit.id}`, { name, symbol });
        showApiSuccess(`Unit "${name}" updated`);
      } else {
        await api.post('/inventory/units', { name, symbol });
        showApiSuccess(`Unit "${name}" created`);
      }
      setShowUnitModal(false);
      setEditingUnit(null);
      setUnitForm({ name: '', symbol: '' });
      load();
    } catch (err: any) {
      showApiError(err, editingUnit ? 'Failed to update unit' : 'Failed to create unit');
    } finally {
      setIsSubmittingUnit(false);
    }
  };

  const handleDeleteUnit = async (u: Unit) => {
    if (!window.confirm(`Are you sure you want to delete unit "${u.name}"?`)) return;
    try {
      await api.delete(`/inventory/units/${u.id}`);
      showApiSuccess(`Unit "${u.name}" deleted`);
      load();
    } catch (err: any) {
      showApiError(err, 'Failed to delete unit');
    }
  };

  // UOM Conversion Handlers
  const handleOpenCreateConversion = () => {
    setEditingConversion(null);
    setConversionForm({ productId: '', fromUnitId: '', toUnitId: '', factor: '1' });
    setShowConversionModal(true);
  };

  const handleOpenEditConversion = (row: any) => {
    setEditingConversion(row);
    setConversionForm({
      productId: row.productId || '',
      fromUnitId: row.fromUnitId || '',
      toUnitId: row.toUnitId || '',
      factor: String(row.factor ?? '1'),
    });
    setShowConversionModal(true);
  };

  const handleSaveConversion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmittingConversion) return;
    if (!conversionForm.productId || !conversionForm.fromUnitId || !conversionForm.toUnitId || !conversionForm.factor) {
      toast.error('Product, from/to units and factor are required');
      return;
    }

    setIsSubmittingConversion(true);
    try {
      const payload = {
        ...conversionForm,
        factor: Number(conversionForm.factor),
      };
      if (editingConversion) {
        await api.put(`/inventory/uom-conversions/${editingConversion.id}`, payload);
        showApiSuccess('UOM conversion updated');
      } else {
        await api.post('/inventory/uom-conversions', payload);
        showApiSuccess('UOM conversion created');
      }
      setShowConversionModal(false);
      setEditingConversion(null);
      setConversionForm({ productId: '', fromUnitId: '', toUnitId: '', factor: '1' });
      load();
    } catch (err: any) {
      showApiError(err, editingConversion ? 'Failed to update conversion' : 'Failed to create conversion');
    } finally {
      setIsSubmittingConversion(false);
    }
  };

  const handleDeleteConversion = async (row: any) => {
    if (!window.confirm('Are you sure you want to delete this UOM conversion?')) return;
    try {
      await api.delete(`/inventory/uom-conversions/${row.id}`);
      showApiSuccess('UOM conversion deleted');
      load();
    } catch (err: any) {
      showApiError(err, 'Failed to delete conversion');
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pricing & Units of Measure"
        description="Manage price lists, product selling rules, units of measure, and conversion factors"
      />

      <Tabs defaultValue="pricing" className="space-y-4">
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Price Lists & Item Prices
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Pricing Rules
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Units of Measure (UOM)
          </TabsTrigger>
          <TabsTrigger value="conversions" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            UOM Conversions
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PRICING & ITEM PRICES */}
        <TabsContent value="pricing" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tags className="h-4 w-4 text-blue-600" />
                  Price Lists ({priceLists.length})
                </CardTitle>
                <Button size="sm" onClick={handleOpenCreatePriceList}>
                  <Plus className="h-4 w-4 mr-1" /> New
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 max-h-72 overflow-y-auto">
                {priceLists.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">No price lists configured.</p>
                ) : (
                  priceLists.map((pl) => (
                    <div
                      key={pl.id}
                      className="flex items-center justify-between p-2 rounded-md border bg-gray-50/50 hover:bg-gray-100/70 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{pl.name}</p>
                        <p className="text-xs text-gray-500">{pl.currency} · {pl.isActive ? 'Active' : 'Inactive'}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600"
                          onClick={() => handleOpenEditPriceList(pl)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-gray-500 hover:text-red-600"
                          onClick={() => handleDeletePriceList(pl)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="xl:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Quick Add Item Price</CardTitle>
                <Button size="sm" onClick={handleOpenCreateItemPrice}>
                  <Plus className="h-4 w-4 mr-1" /> Add Custom
                </Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                <div className="md:col-span-2">
                  <ProductSelect
                    value={itemPriceForm.productId}
                    products={products}
                    onChange={(productId) => setItemPriceForm((f) => ({ ...f, productId }))}
                  />
                </div>
                <div>
                  <PriceListSelect
                    value={itemPriceForm.priceListId}
                    priceLists={priceLists}
                    onChange={(priceListId) => {
                      const selectedPl = priceLists.find((p) => p.id === priceListId);
                      setItemPriceForm((f) => ({
                        ...f,
                        priceListId,
                        currency: selectedPl?.currency || f.currency,
                      }));
                    }}
                  />
                </div>
                <div>
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={itemPriceForm.price}
                    onChange={(e) => setItemPriceForm((f) => ({ ...f, price: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-4 flex justify-end">
                  <Button
                    onClick={() => handleSaveItemPrice()}
                    disabled={isSubmittingIP || products.length === 0 || priceLists.length === 0}
                  >
                    {isSubmittingIP ? 'Saving...' : 'Set Item Price'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Configured Item Prices</h3>
            <DataTable
              data={itemPrices}
              isLoading={isLoading}
              columns={[
                {
                  key: 'product',
                  header: 'Product',
                  render: (row: ItemPrice) =>
                    row.product ? `${row.product.sku} - ${row.product.name}` : row.productId,
                },
                {
                  key: 'priceList',
                  header: 'Price List',
                  render: (row: ItemPrice) => row.priceList?.name || row.priceListId,
                },
                { key: 'currency', header: 'Currency' },
                {
                  key: 'price',
                  header: 'Price',
                  render: (row: ItemPrice) => formatCurrency(row.price, row.currency),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  className: 'text-right',
                  render: (row: ItemPrice) => (
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                        title="Edit Item Price"
                        onClick={() => handleOpenEditItemPrice(row)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                        title="Delete Item Price"
                        onClick={() => handleDeleteItemPrice(row)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </TabsContent>

        {/* TAB 2: PRICING RULES */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">Automatic Selling Rules & Discounts</h3>
            <Button size="sm" onClick={handleOpenCreateRule}>
              <Plus className="h-4 w-4 mr-1" /> New Pricing Rule
            </Button>
          </div>

          <DataTable
            data={rules}
            isLoading={isLoading}
            columns={[
              { key: 'priority', header: 'Priority', render: (rule: PricingRule) => rule.priority },
              {
                key: 'name',
                header: 'Rule Name',
                render: (rule: PricingRule) => <span className="font-medium text-gray-900">{rule.name}</span>,
              },
              {
                key: 'priceList',
                header: 'Price List',
                render: (rule: PricingRule) => rule.priceList?.name || 'All Price Lists',
              },
              {
                key: 'minQty',
                header: 'Min Qty',
                render: (rule: PricingRule) => (rule.minQty != null ? String(rule.minQty) : '—'),
              },
              { key: 'discountPercent', header: 'Discount %' },
              { key: 'marginPercent', header: 'Margin %' },
              {
                key: 'actions',
                header: 'Actions',
                className: 'text-right',
                render: (rule: PricingRule) => (
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                      title="Edit Pricing Rule"
                      onClick={() => handleOpenEditRule(rule)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                      title="Delete Pricing Rule"
                      onClick={() => handleDeleteRule(rule)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </TabsContent>

        {/* TAB 3: UNITS OF MEASURE */}
        <TabsContent value="units" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">Units of Measure (UOM)</h3>
            <Button size="sm" onClick={handleOpenCreateUnit}>
              <Plus className="h-4 w-4 mr-1" /> New Unit
            </Button>
          </div>

          <DataTable
            data={units}
            isLoading={isLoading}
            columns={[
              {
                key: 'symbol',
                header: 'Symbol',
                render: (u: Unit) => (
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded font-semibold text-gray-800">
                    {u.symbol}
                  </span>
                ),
              },
              {
                key: 'name',
                header: 'Unit Name',
                render: (u: Unit) => <span className="font-medium text-gray-900">{u.name}</span>,
              },
              {
                key: 'actions',
                header: 'Actions',
                className: 'text-right',
                render: (u: Unit) => (
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                      title="Edit Unit"
                      onClick={() => handleOpenEditUnit(u)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                      title="Delete Unit"
                      onClick={() => handleDeleteUnit(u)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </TabsContent>

        {/* TAB 4: UOM CONVERSIONS */}
        <TabsContent value="conversions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">Product UOM Conversion Factors</h3>
            <Button size="sm" onClick={handleOpenCreateConversion}>
              <Plus className="h-4 w-4 mr-1" /> New Conversion
            </Button>
          </div>

          <DataTable
            data={uomConversions}
            isLoading={isLoading}
            columns={[
              {
                key: 'product',
                header: 'Product',
                render: (row: any) =>
                  row.product ? `${row.product.sku} - ${row.product.name}` : row.productId,
              },
              {
                key: 'fromUnit',
                header: 'From Unit',
                render: (row: any) => {
                  const u = units.find((x) => x.id === row.fromUnitId);
                  return u ? `${u.name} (${u.symbol})` : row.fromUnitId;
                },
              },
              {
                key: 'toUnit',
                header: 'To Unit',
                render: (row: any) => {
                  const u = units.find((x) => x.id === row.toUnitId);
                  return u ? `${u.name} (${u.symbol})` : row.toUnitId;
                },
              },
              {
                key: 'factor',
                header: 'Conversion Factor',
                render: (row: any) => <span className="font-mono font-medium">{String(row.factor)}</span>,
              },
              {
                key: 'actions',
                header: 'Actions',
                className: 'text-right',
                render: (row: any) => (
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                      title="Edit Conversion"
                      onClick={() => handleOpenEditConversion(row)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                      title="Delete Conversion"
                      onClick={() => handleDeleteConversion(row)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </TabsContent>
      </Tabs>

      {/* PRICE LIST MODAL */}
      <Dialog open={showPriceListModal} onOpenChange={setShowPriceListModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPriceList ? 'Edit Price List' : 'New Price List'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePriceList} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={priceListForm.name}
                placeholder="e.g. Standard Selling, Wholesale"
                onChange={(e) => setPriceListForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <CurrencySelect
                value={priceListForm.currency}
                onChange={(currency) => setPriceListForm((f) => ({ ...f, currency }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowPriceListModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingPL}>
                {isSubmittingPL ? 'Saving...' : editingPriceList ? 'Save Changes' : 'Create Price List'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ITEM PRICE MODAL */}
      <Dialog open={showItemPriceModal} onOpenChange={setShowItemPriceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItemPrice ? 'Edit Item Price' : 'New Item Price'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveItemPrice} className="space-y-4 mt-2">
            <ProductSelect
              value={itemPriceForm.productId}
              products={products}
              onChange={(productId) => setItemPriceForm((f) => ({ ...f, productId }))}
            />
            <PriceListSelect
              value={itemPriceForm.priceListId}
              priceLists={priceLists}
              onChange={(priceListId) => {
                const selectedPl = priceLists.find((p) => p.id === priceListId);
                setItemPriceForm((f) => ({
                  ...f,
                  priceListId,
                  currency: selectedPl?.currency || f.currency,
                }));
              }}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <CurrencySelect
                  value={itemPriceForm.currency}
                  onChange={(currency) => setItemPriceForm((f) => ({ ...f, currency }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Price *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={itemPriceForm.price}
                  onChange={(e) => setItemPriceForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowItemPriceModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingIP}>
                {isSubmittingIP ? 'Saving...' : editingItemPrice ? 'Save Changes' : 'Create Item Price'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* PRICING RULE MODAL */}
      <Dialog open={showRuleModal} onOpenChange={setShowRuleModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Pricing Rule' : 'New Pricing Rule'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveRule} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Rule Name *</Label>
              <Input
                value={ruleForm.name}
                placeholder="e.g. Bulk 10+ Discount"
                onChange={(e) => setRuleForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ProductSelect
                value={ruleForm.productId}
                products={products}
                onChange={(productId) => setRuleForm((f) => ({ ...f, productId }))}
              />
              <PriceListSelect
                value={ruleForm.priceListId}
                priceLists={priceLists}
                onChange={(priceListId) => setRuleForm((f) => ({ ...f, priceListId }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Min Qty</Label>
                <Input
                  placeholder="0"
                  type="number"
                  value={ruleForm.minQty}
                  onChange={(e) => setRuleForm((f) => ({ ...f, minQty: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Disc %</Label>
                <Input
                  placeholder="0"
                  type="number"
                  value={ruleForm.discountPercent}
                  onChange={(e) => setRuleForm((f) => ({ ...f, discountPercent: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Margin %</Label>
                <Input
                  placeholder="0"
                  type="number"
                  value={ruleForm.marginPercent}
                  onChange={(e) => setRuleForm((f) => ({ ...f, marginPercent: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Input
                type="number"
                value={ruleForm.priority}
                onChange={(e) => setRuleForm((f) => ({ ...f, priority: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowRuleModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingRule}>
                {isSubmittingRule ? 'Saving...' : editingRule ? 'Save Changes' : 'Create Pricing Rule'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* UNIT MODAL */}
      <Dialog open={showUnitModal} onOpenChange={setShowUnitModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUnit ? 'Edit Unit of Measure' : 'New Unit of Measure'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveUnit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Unit Name *</Label>
              <Input
                value={unitForm.name}
                placeholder="e.g. Kilogram, Meter, Box, Piece"
                onChange={(e) => setUnitForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Symbol *</Label>
              <Input
                value={unitForm.symbol}
                placeholder="e.g. kg, m, bx, pcs"
                onChange={(e) => setUnitForm((f) => ({ ...f, symbol: e.target.value }))}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowUnitModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingUnit}>
                {isSubmittingUnit ? 'Saving...' : editingUnit ? 'Save Changes' : 'Create Unit'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* UOM CONVERSION MODAL */}
      <Dialog open={showConversionModal} onOpenChange={setShowConversionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingConversion ? 'Edit UOM Conversion' : 'New UOM Conversion'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveConversion} className="space-y-4 mt-2">
            <ProductSelect
              value={conversionForm.productId}
              products={products}
              onChange={(productId) => setConversionForm((f) => ({ ...f, productId }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>From Unit</Label>
                <Select
                  value={conversionForm.fromUnitId}
                  onValueChange={(v) => setConversionForm((f) => ({ ...f, fromUnitId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>To Unit</Label>
                <Select
                  value={conversionForm.toUnitId}
                  onValueChange={(v) => setConversionForm((f) => ({ ...f, toUnitId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Conversion Factor (e.g. 1 Box = 12 Pieces → 12)</Label>
              <Input
                type="number"
                step="0.000001"
                placeholder="1"
                value={conversionForm.factor}
                onChange={(e) => setConversionForm((f) => ({ ...f, factor: e.target.value }))}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowConversionModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingConversion}>
                {isSubmittingConversion ? 'Saving...' : editingConversion ? 'Save Changes' : 'Create Conversion'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductSelect({
  value,
  products,
  onChange,
}: {
  value: string;
  products: Product[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>Product</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select product" />
        </SelectTrigger>
        <SelectContent>
          {products.length === 0 ? (
            <SelectEmptyState
              message="No products found"
              linkHref="/inventory/products"
              linkText="Create Product"
            />
          ) : (
            products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.sku} - {product.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

function PriceListSelect({
  value,
  priceLists,
  onChange,
}: {
  value: string;
  priceLists: PriceList[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>Price List</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select price list" />
        </SelectTrigger>
        <SelectContent>
          {priceLists.length === 0 ? (
            <SelectEmptyState
              message="No price lists found"
              linkHref="/inventory/pricing"
              linkText="Create Price List"
            />
          ) : (
            priceLists.map((list) => (
              <SelectItem key={list.id} value={list.id}>
                {list.name} ({list.currency})
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
