'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Shipment Consolidation",
  "description": "Consolidate packed orders into outbound shipments",
  "featureCode": "8.10",
  "columns": [
    {
      "key": "carrier",
      "label": "Carrier"
    },
    {
      "key": "orders",
      "label": "Orders"
    },
    {
      "key": "packages",
      "label": "Packages"
    },
    {
      "key": "route",
      "label": "Route / Batch"
    },
    {
      "key": "cutoff",
      "label": "Cutoff"
    }
  ],
  "rows": [
    {
      "id": "CONS-001",
      "carrier": "DHL",
      "orders": 42,
      "packages": 46,
      "route": "BATCH-DHL-182",
      "cutoff": "11:30",
      "status": "Ready"
    },
    {
      "id": "CONS-002",
      "carrier": "Aramex",
      "orders": 31,
      "packages": 33,
      "status": "Pending"
    },
    {
      "id": "CONS-003",
      "carrier": "FedEx",
      "orders": 150,
      "packages": 150,
      "route": "BATCH-FDX-001",
      "cutoff": "15:00",
      "status": "Completed"
    },
    {
      "id": "CONS-004",
      "carrier": "Own Fleet",
      "orders": 10,
      "packages": 50,
      "route": "BATCH-LOCAL-001",
      "cutoff": "18:00",
      "status": "Ready"
    }
  ],
  "statuses": [
    "Pending",
    "Ready",
    "Completed"
  ],
  "primaryAction": "Create Consolidation",
  "modalTitle": "Create Consolidation",
  "fields": [
    {
      "key": "carrier",
      "label": "Carrier",
      "placeholder": "Enter carrier",
      "type": "select",
      "options": [
        "DHL",
        "Aramex",
        "FedEx",
        "UPS",
        "Own Fleet"
      ]
    },
    {
      "key": "orders",
      "label": "Orders",
      "placeholder": "Enter orders",
      "type": "number"
    },
    {
      "key": "packages",
      "label": "Packages",
      "placeholder": "Enter packages",
      "type": "number"
    },
    {
      "key": "route",
      "label": "Route / Batch",
      "placeholder": "e.g. BATCH-DHL-182",
      "type": "text"
    },
    {
      "key": "cutoff",
      "label": "Cutoff",
      "placeholder": "e.g. 11:30",
      "type": "text"
    }
  ],
  "progressStatuses": [
    "Pending",
    "Ready",
    "Completed"
  ],
  "searchPlaceholder": "Search shipment consolidation..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
