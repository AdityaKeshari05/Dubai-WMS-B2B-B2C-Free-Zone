# WMS Integration — How It Works

This documents how the B2B / B2C / Fulfillment (WMS) features under
`src/app/(dashboard)/wms/**` work, and how they connect to the rest of this
ERP.

## Two kinds of data, and where each lives

**Real, shared with the rest of the app** — `Product`, `Warehouse`,
`Customer`, and physical stock quantities (`StockLevel`). These already
exist in this ERP (Inventory, CRM/Customers modules) and are fetched live via
the real `api` client (`useWmsLookups()` in `src/lib/wms/useLookups.ts`) from
`/inventory/products`, `/inventory/warehouses`, `/customers`. **WMS never
creates or duplicates these** — it only lets you pick from what already
exists.

So: **creating a B2B order does not create a customer.** The "Customer"
dropdown in the Create B2B Order modal is populated from the real
`/customers` list — the customer must already exist there (created the
normal way, through the CRM/Customers screens). If nothing exists there yet,
that dropdown is empty and you can't create an order.

**WMS-only, local for now** — orders (B2B/B2C), allocations, picking tasks,
packages, shipments, returns, waves, pallets, ASN, batches, bin locations,
and the activity log. There's no backend for these yet, so they live in
`src/lib/wms/db.ts` (in-memory + persisted to `localStorage`), behind service
functions in `src/lib/wms/services/*.ts` that are each marked
`// TODO(api): ...` for when a real endpoint gets built. That's why clearing
browser storage wipes test orders but never touches real customers/products.

## The connective tissue: reservations

The one place these two worlds meet is **inventory reservation**.
`inventoryService.reserve()` doesn't touch the real physical quantity (it
can't — there's no write endpoint) — it keeps a local `reservations` map
keyed by `productId:warehouseId` and computes
`available = realPhysicalQty - reserved`. This map is **shared** across B2B
and B2C allocation calls, so if a B2B order reserves 5 units of a product, a
B2C allocation checked right after sees 5 fewer available.

## Full B2B flow, step by step

1. **Create Order** (`CreateB2BOrderModal`) — pick a real Customer, real
   Warehouse, real Products. If a `CustomerSkuMapping`/`CustomerPricing`
   record exists locally for that customer+product, the customer's own SKU
   and negotiated price auto-fill. Order is created with `status: 'draft'`.
2. **Confirm** → status `confirmed`.
3. **Allocate** (`AllocateOrderModal`) — for each line, calls
   `inventoryService.reserve()` with the real physical qty as input.
   Reserves what's available, backorders the rest. Order status becomes
   `allocated` / `partially_fulfilled` / `backordered`.
4. **Create Picking Task** — reads the `Allocation` records just created,
   builds a `PickingTask` with one line per allocated product, puts it in a
   default bin (`locationService.ensureDefaultBin`). Order → `picking`.
5. **Pick execution** (`/wms/fulfillment/picking/[id]`) — confirming a pick
   releases the reservation and logs a movement; the picked quantity rolls
   up onto the order item.
6. **Create Package** → verify SKU/qty/box/label → **Mark Packed**. Order →
   `packed` once every picked unit is packed.
7. **Create Shipment** — consolidates one or more packages, generates a
   tracking number, packages flip to `ready_to_ship`.
8. **Dispatch** (`/wms/fulfillment/dispatch/[id]`) — final checklist, then
   **Dispatch**. Order → `dispatched`.
9. **Generate POD** — marks the order and its shipment `delivered`.

Alongside this: **ASN** can be issued any time after confirm (for the
customer's advance notice), and **Pallets & Cartons** lets you group
packages onto pallets for bulk shipping — both independent side-branches,
not blocking the main flow.

## B2C flow — same engine, different entry points

B2C reuses the *exact same* `allocationService`, `pickingService`,
`packingService`, `shipmentService` — no duplicated logic. Differences are
just at the edges:

- Order creation takes a free-text customer name/phone/address (a real
  `Customer` record is optional — marketplace orders usually don't have
  one), plus channel (Amazon/Noon/website/etc.) and payment method.
- **Import Orders** simulates a marketplace pull, but still only ever
  references real products/customers already loaded — never fabricates
  them.
- **Waves** group multiple allocated B2C orders; **Start Batch Picking**
  creates one `PickingTask` per order (so each order's inventory/status
  stays individually correct) but presents them as one combined "pick N of
  product X, distribute across orders" screen.
- **RTO** and **Returns** are B2C-specific branches after shipping: RTO
  flips the shipment/order to `rto`; a Return goes through
  requested → approved → received → inspected → restocked/damaged, and
  restocking calls `inventoryService.recordMovement()` (logged, but again —
  no real endpoint to add the stock back yet).

## What this means practically right now

Until a real backend exists for these WMS entities, everything above works
end-to-end *in your browser*, and correctly checks against **real** stock
levels — but a pick/dispatch here won't show up in the ERP's own Inventory
reports elsewhere, and orders aren't visible to other users or devices.
That's the gap the `// TODO(api)` comments mark.

## File map

```
src/types/index.ts                 WMS types appended to the existing file
src/lib/wms/db.ts                  Local mock store (orders, tasks, etc.)
src/lib/wms/useWmsDb.ts            React bindings for the store
src/lib/wms/useLookups.ts          Real product/warehouse/customer fetches
src/lib/wms/status.ts              Status labels/badge variants/transitions
src/lib/wms/services/*.ts          One file per domain concern (12 total)
src/components/wms/b2b/*           B2B-only modals
src/components/wms/b2c/*           B2C-only modals
src/components/wms/fulfillment/*   Shared allocate/pick/pack/ship modals
src/components/ui/drawer.tsx       New side-panel primitive (Dialog only had centered)
src/app/(dashboard)/wms/**         Routes (list + detail pages)
```
