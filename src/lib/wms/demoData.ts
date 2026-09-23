import type { Product, Warehouse, Customer } from '@/types';

// Frontend-only demo data for presentations run without a live backend.
// useWmsLookups() always tries the real API first; these arrays are only
// used as a fallback when that fails or returns nothing, so nothing here
// ever masks a real backend once one exists.

export const DEMO_WAREHOUSES: Warehouse[] = [
  { id: 'demo-wh-1', code: 'CHI-DC', name: 'Chicago Distribution Center', type: 'WAREHOUSE', isDefault: true, address: '4500 Kedzie Ave', city: 'Chicago, IL', country: 'USA', isActive: true },
  { id: 'demo-wh-2', code: 'DAL-FH', name: 'Dallas Fulfillment Hub', type: 'WAREHOUSE', isDefault: false, address: '1200 Regal Row', city: 'Dallas, TX', country: 'USA', isActive: true },
];

interface DemoStock {
  warehouseId: string;
  quantity: number;
}

function withStock(product: Omit<Product, 'stockLevels'>, stock: DemoStock[]): Product {
  return {
    ...product,
    stockLevels: stock.map((s, idx) => ({
      id: `${product.id}-sl-${idx}`,
      productId: product.id,
      warehouseId: s.warehouseId,
      quantity: s.quantity,
      reservedQty: 0,
    })),
  };
}

const baseProduct = (overrides: Partial<Product> & Pick<Product, 'id' | 'sku' | 'name' | 'costPrice' | 'salePrice'>): Omit<Product, 'stockLevels'> => ({
  description: '',
  type: 'PRODUCT',
  taxRate: 0,
  minStockLevel: 10,
  isActive: true,
  createdAt: '2026-01-15T09:00:00.000Z',
  ...overrides,
});

export const DEMO_PRODUCTS: Product[] = [
  withStock(baseProduct({ id: 'demo-p-1', sku: 'IPH15PRO', name: 'Apple iPhone 15 Pro', brand: 'Apple', costPrice: 850, salePrice: 1199, barcode: '194253715302' }), [{ warehouseId: 'demo-wh-1', quantity: 120 }, { warehouseId: 'demo-wh-2', quantity: 40 }]),
  withStock(baseProduct({ id: 'demo-p-2', sku: 'SGS24', name: 'Samsung Galaxy S24', brand: 'Samsung', costPrice: 700, salePrice: 999, barcode: '887276745123' }), [{ warehouseId: 'demo-wh-1', quantity: 85 }]),
  withStock(baseProduct({ id: 'demo-p-3', sku: 'DXPS15', name: 'Dell XPS 15 Laptop', brand: 'Dell', costPrice: 1400, salePrice: 1899, barcode: '884116345213' }), [{ warehouseId: 'demo-wh-1', quantity: 35 }, { warehouseId: 'demo-wh-2', quantity: 20 }]),
  withStock(baseProduct({ id: 'demo-p-4', sku: 'SNYWH5', name: 'Sony WH-1000XM5 Headphones', brand: 'Sony', costPrice: 250, salePrice: 399, barcode: '027242920716' }), [{ warehouseId: 'demo-wh-1', quantity: 60 }]),
  withStock(baseProduct({ id: 'demo-p-5', sku: 'ANKPC20', name: 'Anker PowerCore 20000 Power Bank', brand: 'Anker', costPrice: 25, salePrice: 49, barcode: '848061057913' }), [{ warehouseId: 'demo-wh-1', quantity: 200 }, { warehouseId: 'demo-wh-2', quantity: 150 }]),
  withStock(baseProduct({ id: 'demo-p-6', sku: 'IPDUO6', name: 'Instant Pot Duo 6-Quart', brand: 'Instant Pot', costPrice: 60, salePrice: 99, barcode: '839897000636' }), [{ warehouseId: 'demo-wh-2', quantity: 75 }]),
  withStock(baseProduct({ id: 'demo-p-7', sku: 'DYSV15', name: 'Dyson V15 Detect Vacuum', brand: 'Dyson', costPrice: 450, salePrice: 749, barcode: '885609015678' }), [{ warehouseId: 'demo-wh-1', quantity: 18 }]),
  withStock(baseProduct({ id: 'demo-p-8', sku: 'NAM270', name: 'Nike Air Max 270', brand: 'Nike', costPrice: 70, salePrice: 150, barcode: '194501234567' }), [{ warehouseId: 'demo-wh-1', quantity: 3 }, { warehouseId: 'demo-wh-2', quantity: 0 }]),
];

export const DEMO_B2B_CUSTOMERS: Customer[] = [
  { id: 'demo-cust-1', customerNo: 'CUST-1001', name: 'Summit Retail Group LLC', email: 'purchasing@summitretailgroup.com', phone: '+1 312 555 0142', address: '900 W Fulton Market', city: 'Chicago', state: 'IL', country: 'USA', currency: 'USD', creditLimit: 250000, paymentTerms: 30, isActive: true, type: 'b2b', createdAt: '2025-11-02T10:00:00.000Z' },
  { id: 'demo-cust-2', customerNo: 'CUST-1002', name: 'Pinnacle Wholesale Partners', email: 'orders@pinnaclewholesale.com', phone: '+1 214 555 0198', address: '2200 Irving Blvd', city: 'Dallas', state: 'TX', country: 'USA', currency: 'USD', creditLimit: 180000, paymentTerms: 45, isActive: true, type: 'b2b', createdAt: '2025-11-10T10:00:00.000Z' },
  { id: 'demo-cust-3', customerNo: 'CUST-1003', name: 'Horizon Electronics Distributors', email: 'ap@horizonelectronics.com', phone: '+1 404 555 0176', address: '3400 Peachtree Rd NE', city: 'Atlanta', state: 'GA', country: 'USA', currency: 'USD', creditLimit: 300000, paymentTerms: 30, isActive: true, type: 'b2b', createdAt: '2025-12-01T10:00:00.000Z' },
  { id: 'demo-cust-4', customerNo: 'CUST-1004', name: 'Meridian Trading Co.', email: 'accounts@meridiantrading.com', phone: '+1 212 555 0134', address: '55 Water St', city: 'New York', state: 'NY', country: 'USA', currency: 'USD', creditLimit: 220000, paymentTerms: 15, isActive: true, type: 'b2b', createdAt: '2025-12-08T10:00:00.000Z' },
];

export const DEMO_B2C_CUSTOMERS: Customer[] = [
  { id: 'demo-cust-5', customerNo: 'CUST-2001', name: 'Michael Johnson', email: 'michael.johnson82@gmail.com', phone: '+1 773 555 0111', address: '118 N Racine Ave, Apt 3B', city: 'Chicago', state: 'IL', country: 'USA', currency: 'USD', creditLimit: 0, paymentTerms: 0, isActive: true, createdAt: '2026-01-05T10:00:00.000Z' },
  { id: 'demo-cust-6', customerNo: 'CUST-2002', name: 'Emily Davis', email: 'emily.davis@yahoo.com', phone: '+1 469 555 0122', address: '4521 Live Oak St', city: 'Dallas', state: 'TX', country: 'USA', currency: 'USD', creditLimit: 0, paymentTerms: 0, isActive: true, createdAt: '2026-01-08T10:00:00.000Z' },
  { id: 'demo-cust-7', customerNo: 'CUST-2003', name: 'Christopher Martinez', email: 'chris.martinez90@outlook.com', phone: '+1 470 555 0133', address: '2810 Piedmont Rd NE', city: 'Atlanta', state: 'GA', country: 'USA', currency: 'USD', creditLimit: 0, paymentTerms: 0, isActive: true, createdAt: '2026-01-11T10:00:00.000Z' },
  { id: 'demo-cust-8', customerNo: 'CUST-2004', name: 'Ashley Thompson', email: 'ashley.thompson@icloud.com', phone: '+1 646 555 0144', address: '210 E 23rd St, Apt 9', city: 'New York', state: 'NY', country: 'USA', currency: 'USD', creditLimit: 0, paymentTerms: 0, isActive: true, createdAt: '2026-01-14T10:00:00.000Z' },
];

export const DEMO_CUSTOMERS: Customer[] = [...DEMO_B2B_CUSTOMERS, ...DEMO_B2C_CUSTOMERS];
