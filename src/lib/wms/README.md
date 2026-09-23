# WMS mock data bridge

The B2B / B2C / Fulfillment features under `src/app/(dashboard)/wms/**` are new
to this app and have no backend endpoints yet. Until those exist, `db.ts` holds
them in memory (persisted to `localStorage` so a refresh doesn't lose demo
data) and `services/*.ts` expose the same async function signatures a real API
client would.

**Product, Warehouse and Customer data is never mocked here** — it already
exists for real in this app (`api.get('/products')`, `/warehouses`,
`/customers')`). Every WMS entity below only stores the *id* of the product /
warehouse / customer it refers to; components resolve the full record via the
existing `api` client.

When the backend adds real endpoints for orders/picking/packing/shipments,
swap each function body in `services/*.ts` for the matching `api.get/post(...)`
call — call sites in components do not change. Every function that still
talks to the mock store is marked with a `// TODO(api):` comment naming the
endpoint it should become.
