'use client';

import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  CircleDollarSign, Percent, Tags, FileText,
  Plus, Eye, CheckCircle, AlertCircle, Settings,
  Globe, Building2, Download
} from 'lucide-react';

const INITIAL_CURRENCIES = [
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 1.0, isBase: true, status: 'ACTIVE' },
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 0.2723, isBase: false, status: 'ACTIVE' },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.2501, isBase: false, status: 'ACTIVE' },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.2141, isBase: false, status: 'ACTIVE' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', rate: 1.0214, isBase: false, status: 'ACTIVE' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', rate: 0.0836, isBase: false, status: 'ACTIVE' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 22.74, isBase: false, status: 'ACTIVE' },
];

const VAT_CONFIGS = [
  { id: 'VAT-001', name: 'Standard VAT 5%', rate: 5.0, applicableTo: 'All taxable goods and services', txnType: 'Sales & Purchase', status: 'ACTIVE' },
  { id: 'VAT-002', name: 'Zero-Rated VAT', rate: 0.0, applicableTo: 'Exports, Free Zone, International shipments', txnType: 'Sales', status: 'ACTIVE' },
  { id: 'VAT-003', name: 'Exempt VAT', rate: 0.0, applicableTo: 'Medical supplies, residential property', txnType: 'Sales & Purchase', status: 'ACTIVE' },
  { id: 'VAT-004', name: 'Reverse Charge (Import)', rate: 5.0, applicableTo: 'Imported goods where supplier not registered in UAE', txnType: 'Purchase', status: 'ACTIVE' },
];

const INITIAL_TAX_DETAILS = [
  { id: 'TAX-C-001', entityType: 'Customer', name: 'Majid Al Futtaim Retail LLC', trn: '100234156700003', country: 'UAE', vatCategory: 'Standard 5%', vatGroup: 'Standard', status: 'VERIFIED' },
  { id: 'TAX-C-002', entityType: 'Customer', name: 'Noon Fulfillment Center LLC', trn: '100398271400005', country: 'UAE', vatCategory: 'Standard 5%', vatGroup: 'Standard', status: 'VERIFIED' },
  { id: 'TAX-C-003', entityType: 'Customer', name: 'Chalhoub Group Holdings', trn: '100087634100002', country: 'UAE', vatCategory: 'Standard 5%', vatGroup: 'Standard', status: 'VERIFIED' },
  { id: 'TAX-S-001', entityType: 'Supplier', name: 'Global Packaging Supplies LLC', trn: '100441287300004', country: 'UAE', vatCategory: 'Standard 5%', vatGroup: 'Standard', status: 'VERIFIED' },
  { id: 'TAX-S-002', entityType: 'Supplier', name: 'Aramex International', trn: '100012345600001', country: 'UAE', vatCategory: 'Standard 5%', vatGroup: 'Standard', status: 'VERIFIED' },
  { id: 'TAX-C-004', entityType: 'Customer', name: 'Carrefour UAE LLC', trn: 'PENDING-VERIFICATION', country: 'UAE', vatCategory: 'Standard 5%', vatGroup: 'Standard', status: 'PENDING' },
];

const INITIAL_HS_CODES = [
  { id: 'HC-001', sku: 'NOON-EL-4421', product: 'Smart Home Hub v2', hsCode: '8543.70.90', description: 'Electrical machines and apparatus, having individual functions', coo: 'China', dutyRate: '5%', vatApplicable: true },
  { id: 'HC-002', sku: 'MAF-FASH-2210', product: "Men's Polo Shirt (L)", hsCode: '6105.10.00', description: "Men's shirts of cotton, knitted or crocheted", coo: 'Bangladesh', dutyRate: '5%', vatApplicable: true },
  { id: 'HC-003', sku: 'CRF-GROC-0091', product: 'Long Grain Rice 5kg', hsCode: '1006.30.00', description: 'Semi-milled or wholly milled rice', coo: 'India', dutyRate: '0%', vatApplicable: false },
  { id: 'HC-004', sku: 'AFL-SKU-0012', product: 'Industrial Cable Reel 50m', hsCode: '8544.49.90', description: 'Insulated electric conductors of other kind', coo: 'UAE', dutyRate: '5%', vatApplicable: true },
  { id: 'HC-005', sku: 'NOON-AP-0033', product: 'Wireless Earbuds Pro', hsCode: '8518.30.00', description: 'Headphones, earphones and combined microphone/speaker sets', coo: 'China', dutyRate: '5%', vatApplicable: true },
  { id: 'HC-006', sku: 'CHG-LUX-0017', product: 'Premium Perfume 100ml', hsCode: '3303.00.10', description: "Perfumes and toilet waters", coo: 'France', dutyRate: '5%', vatApplicable: true },
];

const INITIAL_COMMERCIAL_DOCS = [
  { id: 'DOC-001', name: 'Certificate of Origin', category: 'Customs', format: 'PDF', language: 'English / Arabic', lastUpdated: '15 Sep 2026', status: 'ACTIVE' },
  { id: 'DOC-002', name: 'Packing List', category: 'Shipment', format: 'PDF / Excel', language: 'English', lastUpdated: '10 Sep 2026', status: 'ACTIVE' },
  { id: 'DOC-003', name: 'Commercial Invoice (UAE VAT)', category: 'Finance', format: 'PDF', language: 'English / Arabic', lastUpdated: '20 Sep 2026', status: 'ACTIVE' },
  { id: 'DOC-004', name: 'Delivery Note', category: 'Warehouse', format: 'PDF', language: 'English', lastUpdated: '18 Sep 2026', status: 'ACTIVE' },
  { id: 'DOC-005', name: 'Goods Receipt Note (GRN)', category: 'Inbound', format: 'PDF', language: 'English', lastUpdated: '12 Sep 2026', status: 'ACTIVE' },
  { id: 'DOC-006', name: 'Export Declaration Form', category: 'Customs', format: 'PDF', language: 'English / Arabic', lastUpdated: '05 Aug 2026', status: 'ACTIVE' },
  { id: 'DOC-007', name: 'Re-Export Permit Template', category: 'Customs', format: 'PDF', language: 'Arabic', lastUpdated: '01 Jul 2026', status: 'DRAFT' },
  { id: 'DOC-008', name: 'Bilingual Shipping Label (AR/EN)', category: 'Label', format: 'PDF / ZPL', language: 'Arabic + English', lastUpdated: '22 Sep 2026', status: 'ACTIVE' },
];

export function CurrencyVATPage() {
  const [search, setSearch] = useState('');
  const [currencies, setCurrencies] = useState(INITIAL_CURRENCIES);
  const [showUpdate, setShowUpdate] = useState(false);
  const [ratesForm, setRatesForm] = useState(INITIAL_CURRENCIES.filter(c => !c.isBase).map(c => ({ code: c.code, rate: c.rate.toString() })));

  const filteredCurrencies = useMemo(() => currencies.filter(c => c.code.includes(search.toUpperCase()) || c.name.toLowerCase().includes(search.toLowerCase())), [search, currencies]);

  function handleUpdateRates(e: React.FormEvent) {
    e.preventDefault();
    setCurrencies(prev => prev.map(c => {
      if (c.isBase) return c;
      const rf = ratesForm.find(r => r.code === c.code);
      if (rf && !isNaN(parseFloat(rf.rate))) {
        return { ...c, rate: parseFloat(rf.rate) };
      }
      return c;
    }));
    setShowUpdate(false);
    toast.success('Exchange rates updated successfully');
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Currency & VAT Configuration" description="Configure AED as the base currency, manage exchange rates, and set UAE VAT rules for all warehouse transactions." action={{ label: 'Update Rates', onClick: () => {
        setRatesForm(currencies.filter(c => !c.isBase).map(c => ({ code: c.code, rate: c.rate.toString() })));
        setShowUpdate(true);
      }, icon: Settings }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Base Currency" value="AED (د.إ)" icon={CircleDollarSign} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Active Currencies" value={currencies.filter(c => c.status === 'ACTIVE').length} icon={Globe} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="VAT Rules" value={VAT_CONFIGS.length} icon={Percent} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Standard VAT Rate" value="5%" icon={Percent} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1f2937]">Multi-Currency Rates</h2>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search currency." className="h-7 w-40 text-xs" />
          </div>
          <DataTable data={filteredCurrencies} keyField="code" columns={[
            { key: 'code', header: 'Code', render: r => <span className="font-mono font-bold text-[#1674c4]">{r.code}</span> },
            { key: 'name', header: 'Currency Name' },
            { key: 'symbol', header: 'Symbol', render: r => <span className="font-mono font-semibold">{r.symbol}</span> },
            { key: 'rate', header: 'Rate vs AED', render: r => r.isBase ? <span className="font-semibold text-green-600">1.0000 (Base)</span> : <span className="font-mono">{r.rate.toFixed(4)}</span> },
            { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
          ]} />
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#1f2937]">VAT Configuration</h2>
          <DataTable data={VAT_CONFIGS} keyField="id" columns={[
            { key: 'id', header: 'Rule ID', render: r => <span className="font-mono text-xs text-[#1674c4]">{r.id}</span> },
            { key: 'name', header: 'Rule Name', render: r => <span className="font-medium">{r.name}</span> },
            { key: 'rate', header: 'Rate', render: r => <span className="font-semibold">{r.rate}%</span> },
            { key: 'txnType', header: 'Applied On', render: r => <Badge variant="outline" className="text-xs">{r.txnType}</Badge> },
            { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
          ]} />
        </div>
      </div>

      <Dialog open={showUpdate} onOpenChange={setShowUpdate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Update Exchange Rates</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateRates} className="space-y-3 max-h-[60vh] overflow-y-auto">
            <p className="text-xs text-gray-500 mb-2">Base Currency is fixed at AED = 1.0000</p>
            {ratesForm.map((rf, i) => (
              <div key={rf.code} className="grid grid-cols-3 items-center gap-2">
                <Label className="text-xs font-mono">{rf.code}</Label>
                <Input type="number" step="0.0001" className="col-span-2 h-8" value={rf.rate} onChange={e => {
                  const newForm = [...ratesForm];
                  newForm[i].rate = e.target.value;
                  setRatesForm(newForm);
                }} />
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Save Rates</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowUpdate(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function TaxDetailsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [taxDetails, setTaxDetails] = useState(INITIAL_TAX_DETAILS);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ entityType: 'Customer', name: '', trn: '', country: 'UAE', vatCategory: 'Standard 5%' });

  const filtered = useMemo(() => taxDetails.filter(t =>
    (typeFilter === 'ALL' || t.entityType === typeFilter) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.trn.toLowerCase().includes(search.toLowerCase()))
  ), [search, typeFilter, taxDetails]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.trn) return;
    const nextNum = taxDetails.length + 1;
    const id = `TAX-${form.entityType === 'Customer' ? 'C' : 'S'}-${String(nextNum).padStart(3, '0')}`;
    const newTax = {
      id, entityType: form.entityType, name: form.name, trn: form.trn,
      country: form.country, vatCategory: form.vatCategory, vatGroup: 'Standard', status: 'VERIFIED'
    };
    setTaxDetails(prev => [newTax, ...prev]);
    setShowAdd(false);
    setForm({ entityType: 'Customer', name: '', trn: '', country: 'UAE', vatCategory: 'Standard 5%' });
    toast.success(`Tax entity ${id} added successfully`);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Tax Details" description="Manage TRN (Tax Registration Number) and VAT details for customers and suppliers." action={{ label: 'Add Entity', onClick: () => setShowAdd(true), icon: Plus }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Entities" value={taxDetails.length} icon={Building2} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Customers" value={taxDetails.filter(t => t.entityType === 'Customer').length} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Suppliers" value={taxDetails.filter(t => t.entityType === 'Supplier').length} icon={CheckCircle} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Pending Verification" value={taxDetails.filter(t => t.status === 'PENDING').length} icon={AlertCircle} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or TRN." className="h-8 w-64 text-sm" />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-8 rounded-md border border-[#e5e2dc] px-2 text-sm">
          <option value="ALL">All Types</option>
          <option value="Customer">Customers</option>
          <option value="Supplier">Suppliers</option>
        </select>
      </div>
      <DataTable data={filtered} keyField="id" columns={[
        { key: 'id', header: 'ID', render: r => <span className="font-mono text-xs text-[#1674c4]">{r.id}</span> },
        { key: 'entityType', header: 'Type', render: r => <Badge variant="outline" className={`text-xs ${r.entityType === 'Customer' ? 'border-blue-300 text-blue-700' : 'border-purple-300 text-purple-700'}`}>{r.entityType}</Badge> },
        { key: 'name', header: 'Entity Name', render: r => <span className="font-medium">{r.name}</span> },
        { key: 'trn', header: 'TRN', render: r => <span className="font-mono text-xs">{r.trn}</span> },
        { key: 'vatCategory', header: 'VAT Category' },
        { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
      ]} />

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Tax Entity</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div><Label className="text-xs">Entity Type</Label>
              <select value={form.entityType} onChange={e => setForm(p => ({...p, entityType: e.target.value}))} className="mt-1 h-9 w-full rounded-md border border-[#e5e2dc] px-2 text-sm">
                <option value="Customer">Customer</option>
                <option value="Supplier">Supplier</option>
              </select>
            </div>
            <div><Label className="text-xs">Company Name *</Label><Input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Al Maya Supermarket LLC" className="mt-1" /></div>
            <div><Label className="text-xs">TRN *</Label><Input value={form.trn} onChange={e => setForm(p => ({...p, trn: e.target.value}))} placeholder="e.g. 100XXXXXXX0000X" className="mt-1 font-mono text-sm" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Country</Label><Input value={form.country} onChange={e => setForm(p => ({...p, country: e.target.value}))} className="mt-1" /></div>
              <div><Label className="text-xs">VAT Category</Label>
                <select value={form.vatCategory} onChange={e => setForm(p => ({...p, vatCategory: e.target.value}))} className="mt-1 h-9 w-full rounded-md border border-[#e5e2dc] px-2 text-sm">
                  <option value="Standard 5%">Standard 5%</option>
                  <option value="Zero-Rated">Zero-Rated</option>
                  <option value="Exempt">Exempt</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">Add Entity</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function HSCodePage() {
  const [search, setSearch] = useState('');
  const [hsCodes, setHsCodes] = useState(INITIAL_HS_CODES);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ sku: '', product: '', hsCode: '', description: '', coo: 'UAE', dutyRate: '5%', vatApplicable: true });

  const filtered = useMemo(() => hsCodes.filter(h =>
    h.sku.toLowerCase().includes(search.toLowerCase()) ||
    h.product.toLowerCase().includes(search.toLowerCase()) ||
    h.hsCode.includes(search) ||
    h.coo.toLowerCase().includes(search.toLowerCase())
  ), [search, hsCodes]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.sku || !form.hsCode || !form.product) return;
    const nextNum = hsCodes.length + 1;
    const id = `HC-${String(nextNum).padStart(3, '0')}`;
    const newCode = {
      id, sku: form.sku, product: form.product, hsCode: form.hsCode,
      description: form.description, coo: form.coo, dutyRate: form.dutyRate, vatApplicable: form.vatApplicable
    };
    setHsCodes(prev => [newCode, ...prev]);
    setShowAdd(false);
    setForm({ sku: '', product: '', hsCode: '', description: '', coo: 'UAE', dutyRate: '5%', vatApplicable: true });
    toast.success(`HS code ${form.hsCode} added successfully`);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="HS Code Management" description="Maintain Harmonized System (HS) codes and Country of Origin for all SKUs for customs classification." action={{ label: 'Add HS Code', onClick: () => setShowAdd(true), icon: Plus }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total SKUs Classified" value={hsCodes.length} icon={Tags} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Countries of Origin" value={Array.from(new Set(hsCodes.map(h => h.coo))).length} icon={Globe} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Duty-Free Items" value={hsCodes.filter(h => h.dutyRate === '0%').length} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="VAT Applicable" value={hsCodes.filter(h => h.vatApplicable).length} icon={Percent} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>
      <div className="mb-4"><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SKU, product, HS code or country." className="h-8 w-72 text-sm" /></div>
      <DataTable data={filtered} keyField="id" columns={[
        { key: 'sku', header: 'SKU', render: r => <span className="font-mono text-xs font-semibold text-[#1674c4]">{r.sku}</span> },
        { key: 'product', header: 'Product', render: r => <span className="font-medium">{r.product}</span> },
        { key: 'hsCode', header: 'HS Code', render: r => <span className="font-mono text-sm font-semibold">{r.hsCode}</span> },
        { key: 'description', header: 'HS Description', render: r => <span className="text-xs text-gray-600">{r.description}</span> },
        { key: 'coo', header: 'Country of Origin', render: r => <Badge variant="outline" className="text-xs">{r.coo}</Badge> },
        { key: 'dutyRate', header: 'Duty Rate', render: r => <span className={`font-semibold ${r.dutyRate === '0%' ? 'text-green-600' : 'text-amber-700'}`}>{r.dutyRate}</span> },
        { key: 'vatApplicable', header: 'VAT', render: r => r.vatApplicable ? <span className="text-xs font-medium text-blue-600">5%</span> : <span className="text-xs text-gray-400">Exempt</span> },
      ]} />

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add HS Code</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">SKU *</Label><Input value={form.sku} onChange={e => setForm(p => ({...p, sku: e.target.value}))} placeholder="e.g. NEW-SKU-001" className="mt-1" /></div>
              <div><Label className="text-xs">HS Code *</Label><Input value={form.hsCode} onChange={e => setForm(p => ({...p, hsCode: e.target.value}))} placeholder="e.g. 8543.70.90" className="mt-1 font-mono text-sm" /></div>
            </div>
            <div><Label className="text-xs">Product Name *</Label><Input value={form.product} onChange={e => setForm(p => ({...p, product: e.target.value}))} placeholder="e.g. Wireless Router" className="mt-1" /></div>
            <div><Label className="text-xs">Description</Label><Input value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Official customs description" className="mt-1" /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label className="text-xs">Country (COO)</Label><Input value={form.coo} onChange={e => setForm(p => ({...p, coo: e.target.value}))} placeholder="e.g. UAE" className="mt-1" /></div>
              <div><Label className="text-xs">Duty Rate</Label>
                <select value={form.dutyRate} onChange={e => setForm(p => ({...p, dutyRate: e.target.value}))} className="mt-1 h-9 w-full rounded-md border border-[#e5e2dc] px-2 text-sm">
                  <option value="0%">0%</option>
                  <option value="5%">5%</option>
                  <option value="10%">10%</option>
                </select>
              </div>
              <div><Label className="text-xs">VAT Appl.</Label>
                <select value={form.vatApplicable.toString()} onChange={e => setForm(p => ({...p, vatApplicable: e.target.value === 'true'}))} className="mt-1 h-9 w-full rounded-md border border-[#e5e2dc] px-2 text-sm">
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">Add HS Code</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CommercialDocumentsPage() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [documents, setDocuments] = useState(INITIAL_COMMERCIAL_DOCS);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Customs', format: 'PDF', language: 'English' });
  const [selectedDoc, setSelectedDoc] = useState<typeof INITIAL_COMMERCIAL_DOCS[0] | null>(null);

  const categories = useMemo(() => ['ALL', ...Array.from(new Set(documents.map(d => d.category)))], [documents]);
  const filtered = useMemo(() => documents.filter(d =>
    (catFilter === 'ALL' || d.category === catFilter) &&
    d.name.toLowerCase().includes(search.toLowerCase())
  ), [search, catFilter, documents]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    const nextNum = documents.length + 1;
    const id = `DOC-${String(nextNum).padStart(3, '0')}`;
    const newDoc = {
      id, name: form.name, category: form.category, format: form.format,
      language: form.language, lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), status: 'ACTIVE'
    };
    setDocuments(prev => [newDoc, ...prev]);
    setShowAdd(false);
    setForm({ name: '', category: 'Customs', format: 'PDF', language: 'English' });
    toast.success(`Document template created successfully`);
  }

  function handleDownload() {
    toast.success('Commercial document downloaded successfully');
    setSelectedDoc(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Commercial Documents" description="Configurable commercial and warehouse document templates supporting bilingual (Arabic / English) operations." action={{ label: 'New Template', onClick: () => setShowAdd(true), icon: Plus }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Templates" value={documents.length} icon={FileText} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Active" value={documents.filter(d => d.status === 'ACTIVE').length} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Bilingual Docs" value={documents.filter(d => d.language.includes('Arabic')).length} icon={Globe} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Categories" value={categories.length - 1} icon={Tags} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search document name." className="h-8 w-64 text-sm" />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="h-8 rounded-md border border-[#e5e2dc] px-2 text-sm">
          {categories.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>)}
        </select>
      </div>
      <DataTable data={filtered} keyField="id" columns={[
        { key: 'id', header: 'Doc ID', render: r => <span className="font-mono text-xs text-[#1674c4]">{r.id}</span> },
        { key: 'name', header: 'Document Name', render: r => <span className="font-medium">{r.name}</span> },
        { key: 'category', header: 'Category', render: r => <Badge variant="outline" className="text-xs">{r.category}</Badge> },
        { key: 'format', header: 'Format', render: r => <span className="font-mono text-xs">{r.format}</span> },
        { key: 'language', header: 'Language', render: r => <span className="text-xs">{r.language}</span> },
        { key: 'lastUpdated', header: 'Last Updated' },
        { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
        { key: 'actions', header: '', render: r => (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setSelectedDoc(r)}><Eye className="h-3.5 w-3.5" /></Button>
          </div>
        )},
      ]} />

      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Document Details</DialogTitle></DialogHeader>
          {selectedDoc && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><p className="text-gray-500">Document ID</p><p className="font-mono font-semibold">{selectedDoc.id}</p></div>
                <div><p className="text-gray-500">Status</p><StatusBadge status={selectedDoc.status} /></div>
                <div className="col-span-2"><p className="text-gray-500">Name</p><p className="font-medium text-base">{selectedDoc.name}</p></div>
                <div><p className="text-gray-500">Category</p><Badge variant="outline">{selectedDoc.category}</Badge></div>
                <div><p className="text-gray-500">Language</p><p>{selectedDoc.language}</p></div>
                <div><p className="text-gray-500">Format</p><p className="font-mono">{selectedDoc.format}</p></div>
                <div><p className="text-gray-500">Last Updated</p><p>{selectedDoc.lastUpdated}</p></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleDownload} className="flex-1"><Download className="mr-2 h-4 w-4" /> Download</Button>
                <Button variant="outline" onClick={() => setSelectedDoc(null)} className="flex-1">Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Document Template</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div><Label className="text-xs">Document Name *</Label><Input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Gate Pass" className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Category</Label>
                <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="mt-1 h-9 w-full rounded-md border border-[#e5e2dc] px-2 text-sm">
                  <option value="Customs">Customs</option>
                  <option value="Shipment">Shipment</option>
                  <option value="Finance">Finance</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Inbound">Inbound</option>
                  <option value="Label">Label</option>
                </select>
              </div>
              <div><Label className="text-xs">Language</Label>
                <select value={form.language} onChange={e => setForm(p => ({...p, language: e.target.value}))} className="mt-1 h-9 w-full rounded-md border border-[#e5e2dc] px-2 text-sm">
                  <option value="English">English</option>
                  <option value="Arabic">Arabic</option>
                  <option value="English / Arabic">English / Arabic</option>
                </select>
              </div>
            </div>
            <div><Label className="text-xs">Format</Label>
              <select value={form.format} onChange={e => setForm(p => ({...p, format: e.target.value}))} className="mt-1 h-9 w-full rounded-md border border-[#e5e2dc] px-2 text-sm">
                <option value="PDF">PDF</option>
                <option value="Excel">Excel</option>
                <option value="PDF / Excel">PDF / Excel</option>
                <option value="Word">Word</option>
                <option value="ZPL">ZPL</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">Create Template</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
