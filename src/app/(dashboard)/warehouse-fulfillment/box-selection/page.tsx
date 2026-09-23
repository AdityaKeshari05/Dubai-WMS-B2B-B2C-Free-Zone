'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Box / Carton Selection",
  "description": "Select packaging type and carton dimensions",
  "featureCode": "8.9",
  "columns": [
    {
      "key": "order",
      "label": "Order"
    },
    {
      "key": "packageType",
      "label": "Package Type"
    },
    {
      "key": "dimensions",
      "label": "Dimensions"
    },
    {
      "key": "weight",
      "label": "Weight"
    },
    {
      "key": "packages",
      "label": "Packages"
    }
  ],
  "rows": [
    {
      "id": "BOX-001",
      "order": "B2C-92018",
      "packageType": "Small Box",
      "dimensions": "30×20×12 cm",
      "weight": "1.4 kg",
      "packages": 1,
      "status": "Selected"
    },
    {
      "id": "BOX-002",
      "order": "SO-B2B-1821",
      "packageType": "Pallet + Cartons",
      "dimensions": "120×100×145 cm",
      "status": "Selected"
    },
    {
      "id": "BOX-003",
      "order": "B2C-92100",
      "packageType": "Large Box",
      "dimensions": "50x50x50 cm",
      "weight": "5 kg",
      "packages": 2,
      "status": "Verified"
    },
    {
      "id": "BOX-004",
      "order": "SO-B2B-1950",
      "packageType": "Medium Box",
      "dimensions": "20x20x20 cm",
      "weight": "0.5 kg",
      "packages": 100,
      "status": "Pending"
    }
  ],
  "statuses": [
    "Pending",
    "Selected",
    "Verified"
  ],
  "primaryAction": "Select Packaging",
  "modalTitle": "Select Packaging",
  "fields": [
    {
      "key": "order",
      "label": "Order",
      "placeholder": "e.g. B2C-92018",
      "type": "text"
    },
    {
      "key": "packageType",
      "label": "Package Type",
      "placeholder": "Enter package type",
      "type": "select",
      "options": [
        "Small Box",
        "Medium Box",
        "Large Box",
        "Pallet + Cartons"
      ]
    },
    {
      "key": "dimensions",
      "label": "Dimensions",
      "placeholder": "e.g. 30x20x12 cm",
      "type": "text"
    },
    {
      "key": "weight",
      "label": "Weight",
      "placeholder": "e.g. 1.4 kg",
      "type": "text"
    },
    {
      "key": "packages",
      "label": "Packages",
      "placeholder": "Enter packages",
      "type": "number"
    }
  ],
  "progressStatuses": [
    "Pending",
    "Selected",
    "Verified"
  ],
  "searchPlaceholder": "Search box / carton selection..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
