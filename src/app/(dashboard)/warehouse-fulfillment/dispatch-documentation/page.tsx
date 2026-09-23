'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Dispatch Documentation",
  "description": "Generate dispatch documents and handover records",
  "featureCode": "8.12",
  "columns": [
    {
      "key": "shipment",
      "label": "Shipment"
    },
    {
      "key": "carrier",
      "label": "Carrier"
    },
    {
      "key": "manifest",
      "label": "Manifest"
    },
    {
      "key": "deliveryNote",
      "label": "Delivery Note"
    },
    {
      "key": "handover",
      "label": "Handover"
    }
  ],
  "rows": [
    {
      "id": "DOC-001",
      "shipment": "SHP-00881",
      "carrier": "DHL",
      "manifest": "MAN-881",
      "deliveryNote": "DN-7711",
      "handover": "11:22",
      "status": "Generated"
    },
    {
      "id": "DOC-002",
      "shipment": "SHP-00882",
      "carrier": "Aramex",
      "manifest": "—",
      "status": "Pending"
    },
    {
      "id": "DOC-003",
      "shipment": "SHP-00900",
      "carrier": "FedEx",
      "manifest": "MAN-900",
      "deliveryNote": "DN-8800",
      "handover": "16:00",
      "status": "Dispatched"
    },
    {
      "id": "DOC-004",
      "shipment": "SHP-00901",
      "carrier": "UPS",
      "manifest": "—",
      "deliveryNote": "—",
      "handover": "—",
      "status": "Pending"
    }
  ],
  "statuses": [
    "Pending",
    "Generated",
    "Dispatched"
  ],
  "primaryAction": "Generate Documents",
  "modalTitle": "Generate Documents",
  "fields": [
    {
      "key": "shipment",
      "label": "Shipment",
      "placeholder": "e.g. SHP-00881",
      "type": "text"
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
      "key": "manifest",
      "label": "Manifest",
      "placeholder": "e.g. MAN-881",
      "type": "text"
    },
    {
      "key": "deliveryNote",
      "label": "Delivery Note",
      "placeholder": "e.g. DN-7711",
      "type": "text"
    },
    {
      "key": "handover",
      "label": "Handover",
      "placeholder": "e.g. 11:22",
      "type": "text"
    }
  ],
  "progressStatuses": [
    "Pending",
    "Generated",
    "Dispatched"
  ],
  "searchPlaceholder": "Search dispatch documentation..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
