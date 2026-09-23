'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Dispatch Verification",
  "description": "Perform final scan verification before dispatch",
  "featureCode": "8.11",
  "columns": [
    {
      "key": "shipment",
      "label": "Shipment"
    },
    {
      "key": "packages",
      "label": "Packages"
    },
    {
      "key": "verified",
      "label": "Verified"
    },
    {
      "key": "carrier",
      "label": "Carrier"
    },
    {
      "key": "trackingBatch",
      "label": "Tracking Batch"
    }
  ],
  "rows": [
    {
      "id": "DVER-001",
      "shipment": "SHP-00881",
      "packages": 46,
      "verified": 46,
      "carrier": "DHL",
      "trackingBatch": "BATCH-DHL-182",
      "status": "Verified"
    },
    {
      "id": "DVER-002",
      "shipment": "SHP-00882",
      "packages": 33,
      "verified": 21,
      "status": "Verifying"
    },
    {
      "id": "DVER-003",
      "shipment": "SHP-00999",
      "packages": 1,
      "verified": 1,
      "carrier": "FedEx",
      "trackingBatch": "BATCH-FDX-001",
      "status": "Verified"
    },
    {
      "id": "DVER-004",
      "shipment": "SHP-01000",
      "packages": 100,
      "verified": 0,
      "carrier": "UPS",
      "trackingBatch": "BATCH-UPS-999",
      "status": "Waiting"
    }
  ],
  "statuses": [
    "Waiting",
    "Verifying",
    "Verified"
  ],
  "primaryAction": "Start Verification",
  "modalTitle": "Start Verification",
  "fields": [
    {
      "key": "shipment",
      "label": "Shipment",
      "placeholder": "e.g. SHP-00881",
      "type": "text"
    },
    {
      "key": "packages",
      "label": "Packages",
      "placeholder": "Enter packages",
      "type": "number"
    },
    {
      "key": "verified",
      "label": "Verified",
      "placeholder": "Enter verified",
      "type": "number"
    },
    {
      "key": "carrier",
      "label": "Carrier",
      "placeholder": "Enter carrier",
      "type": "select",
      "options": [
        "DHL",
        "Aramex",
        "FedEx",
        "UPS"
      ]
    },
    {
      "key": "trackingBatch",
      "label": "Tracking Batch",
      "placeholder": "e.g. BATCH-DHL-182",
      "type": "text"
    }
  ],
  "progressStatuses": [
    "Waiting",
    "Verifying",
    "Verified"
  ],
  "searchPlaceholder": "Search dispatch verification..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
