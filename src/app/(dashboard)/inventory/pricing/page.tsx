'use client';

import { useEffect, useState } from 'react';
import { Plus, Tags } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { ItemPrice, PriceList, PricingRule, Product } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';

export default function InventoryPricingPage() {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [itemPrices, setItemPrices] = useState<ItemPrice[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [priceListForm, setPriceListForm] = useState({ name: '', currency: 'USD' });
  const [itemPriceForm, setItemPriceForm] = useState({ productId: '', priceListId: '', currency: 'USD', price: '' });
  const [ruleForm, setRuleForm] = useState({ name: '', priceListId: '', productId: '', minQty: '', discountPercent: '', marginPercent: '', priority: '100' });

  const load = async () => {
    const [pl, ip, rulesRes, prod] = await Promise.all([
      api.get('/inventory/price-lists'),
      api.get('/inventory/item-prices'),
      api.get('/inventory/pricing-rules'),
      api.get('/inventory/products', { params: { limit: 300 } }),
    ]);
    setPriceLists(pl.data.data || []);
    setItemPrices(ip.data.data.items || []);
    setRules(rulesRes.data.data || []);
    setProducts(prod.data.data.items || []);
  };

  useEffect(() => { load().catch(() => toast.error('Failed to load pricing')); }, []);

  const createPriceList = async () => {
    try {
      await api.post('/inventory/price-lists', priceListForm);
      toast.success('Price list created');
      setPriceListForm({ name: '', currency: 'USD' });
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const createItemPrice = async () => {
    try {
      await api.post('/inventory/item-prices', { ...itemPriceForm, price: Number(itemPriceForm.price) });
      toast.success('Item price created');
      setItemPriceForm({ productId: '', priceListId: '', currency: 'USD', price: '' });
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const createRule = async () => {
    try {
      await api.post('/inventory/pricing-rules', {
        ...ruleForm,
        productId: ruleForm.productId || undefined,
        priceListId: ruleForm.priceListId || undefined,
        minQty: ruleForm.minQty ? Number(ruleForm.minQty) : undefined,
        discountPercent: Number(ruleForm.discountPercent || 0),
        marginPercent: Number(ruleForm.marginPercent || 0),
        priority: Number(ruleForm.priority || 100),
      });
      toast.success('Pricing rule created');
      setRuleForm({ name: '', priceListId: '', productId: '', minQty: '', discountPercent: '', marginPercent: '', priority: '100' });
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Pricing" description="Manage price lists, item prices, and automatic selling rules" />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Tags className="h-4 w-4" />Price List</CardTitle></CardHeader><CardContent className="space-y-3"><div className="space-y-1.5"><Label>Name</Label><Input value={priceListForm.name} onChange={(e) => setPriceListForm((f) => ({ ...f, name: e.target.value }))} /></div><div className="space-y-1.5"><Label>Currency</Label><Input value={priceListForm.currency} onChange={(e) => setPriceListForm((f) => ({ ...f, currency: e.target.value }))} /></div><Button onClick={createPriceList}><Plus className="mr-2 h-4 w-4" />Add Price List</Button></CardContent></Card>
        <Card><CardHeader><CardTitle>Item Price</CardTitle></CardHeader><CardContent className="space-y-3"><ProductSelect value={itemPriceForm.productId} products={products} onChange={(productId) => setItemPriceForm((f) => ({ ...f, productId }))} /><PriceListSelect value={itemPriceForm.priceListId} priceLists={priceLists} onChange={(priceListId) => setItemPriceForm((f) => ({ ...f, priceListId }))} /><div className="space-y-1.5"><Label>Price</Label><Input type="number" value={itemPriceForm.price} onChange={(e) => setItemPriceForm((f) => ({ ...f, price: e.target.value }))} /></div><Button onClick={createItemPrice}>Add Item Price</Button></CardContent></Card>
        <Card><CardHeader><CardTitle>Pricing Rule</CardTitle></CardHeader><CardContent className="space-y-3"><div className="space-y-1.5"><Label>Name</Label><Input value={ruleForm.name} onChange={(e) => setRuleForm((f) => ({ ...f, name: e.target.value }))} /></div><ProductSelect value={ruleForm.productId} products={products} onChange={(productId) => setRuleForm((f) => ({ ...f, productId }))} /><PriceListSelect value={ruleForm.priceListId} priceLists={priceLists} onChange={(priceListId) => setRuleForm((f) => ({ ...f, priceListId }))} /><div className="grid grid-cols-3 gap-2"><Input placeholder="Min qty" type="number" value={ruleForm.minQty} onChange={(e) => setRuleForm((f) => ({ ...f, minQty: e.target.value }))} /><Input placeholder="Disc %" type="number" value={ruleForm.discountPercent} onChange={(e) => setRuleForm((f) => ({ ...f, discountPercent: e.target.value }))} /><Input placeholder="Margin %" type="number" value={ruleForm.marginPercent} onChange={(e) => setRuleForm((f) => ({ ...f, marginPercent: e.target.value }))} /></div><Button onClick={createRule}>Add Pricing Rule</Button></CardContent></Card>
      </div>

      <DataTable data={itemPrices} columns={[
        { key: 'product', header: 'Product', render: (row: ItemPrice) => row.product ? `${row.product.sku} - ${row.product.name}` : row.productId },
        { key: 'priceList', header: 'Price List', render: (row: ItemPrice) => row.priceList?.name || row.priceListId },
        { key: 'currency', header: 'Currency' },
        { key: 'price', header: 'Price', render: (row: ItemPrice) => formatCurrency(row.price, row.currency) },
      ]} />

      <DataTable data={rules} columns={[
        { key: 'priority', header: 'Priority', render: (rule: PricingRule) => rule.priority },
        { key: 'name', header: 'Rule', render: (rule: PricingRule) => <span className="font-medium">{rule.name}</span> },
        { key: 'priceList', header: 'Price List', render: (rule: PricingRule) => rule.priceList?.name || 'Any' },
        { key: 'discountPercent', header: 'Discount %' },
        { key: 'marginPercent', header: 'Margin %' },
      ]} />
    </div>
  );
}

function ProductSelect({ value, products, onChange }: { value: string; products: Product[]; onChange: (value: string) => void }) {
  return <div className="space-y-1.5"><Label>Product</Label><Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger><SelectContent>{products.map((product) => <SelectItem key={product.id} value={product.id}>{product.sku} - {product.name}</SelectItem>)}</SelectContent></Select></div>;
}

function PriceListSelect({ value, priceLists, onChange }: { value: string; priceLists: PriceList[]; onChange: (value: string) => void }) {
  return <div className="space-y-1.5"><Label>Price List</Label><Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue placeholder="Select price list" /></SelectTrigger><SelectContent>{priceLists.map((list) => <SelectItem key={list.id} value={list.id}>{list.name} ({list.currency})</SelectItem>)}</SelectContent></Select></div>;
}
