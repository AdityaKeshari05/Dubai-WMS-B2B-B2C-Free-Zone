'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { customerCommercialService } from '@/lib/wms/services/customerCommercialService';
import type { Customer, Product } from '@/types';

export function AddCustomerSkuModal({
  open,
  onOpenChange,
  customers,
  products,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  products: Product[];
}) {
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [customerSku, setCustomerSku] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!customerId || !productId || !customerSku.trim()) {
      toast.error('Select a customer, product and enter their SKU code.');
      return;
    }
    setSubmitting(true);
    try {
      customerCommercialService.upsertSkuMapping({ customerId, productId, customerSku: customerSku.trim() });
      if (price.trim()) {
        customerCommercialService.upsertPricing({ customerId, productId, price: Number(price) });
      }
      toast.success('Customer SKU mapping saved');
      onOpenChange(false);
      setCustomerId('');
      setProductId('');
      setCustomerSku('');
      setPrice('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Customer SKU &amp; Pricing</DialogTitle>
          <DialogDescription>Map a product to this customer&apos;s own SKU code, with an optional negotiated price</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.sku} — {p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Customer SKU</Label>
            <Input value={customerSku} onChange={(e) => setCustomerSku(e.target.value)} placeholder="e.g. ACME-SKU-001" />
          </div>
          <div className="grid gap-2">
            <Label>Negotiated Price (optional)</Label>
            <Input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Leave blank to use standard price" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
