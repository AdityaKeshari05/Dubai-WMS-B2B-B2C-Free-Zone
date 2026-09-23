'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Customer-Specific SKU",
  "description": "Maintain customer-specific SKU mappings",
  "featureCode": "6.2",
  "columns": [
    {
      "key": "customer",
      "label": "Customer"
    },
    {
      "key": "internalSku",
      "label": "Internal SKU"
    },
    {
      "key": "customerSku",
      "label": "Customer SKU"
    },
    {
      "key": "uom",
      "label": "UOM"
    }
  ],
  "rows": [
    {
      "id": "CSKU-001",
      "customer": "Retail Group LLC",
      "internalSku": "SKU-10021",
      "customerSku": "RG-DATE-01",
      "uom": "Case",
      "status": "Active"
    },
    {
      "id": "CSKU-002",
      "customer": "Dubai Stores PJSC",
      "internalSku": "SKU-10022",
      "uom": "Carton",
      "status": "Active"
    },
    {
      "id": "CSKU-003",
      "customer": "Spinneys",
      "internalSku": "SKU-9901",
      "customerSku": "SP-MILK-L",
      "uom": "Pallet",
      "status": "Active"
    },
    {
      "id": "CSKU-004",
      "customer": "Lulu Hypermarket",
      "internalSku": "SKU-4402",
      "customerSku": "LL-MYSTERY-BOX",
      "uom": "Unit",
      "status": "Inactive"
    }
  ],
  "statuses": [
    "Active",
    "Inactive"
  ],
  "primaryAction": "Add SKU Mapping",
  "modalTitle": "Add SKU Mapping",
  "fields": [
    {
      "key": "customer",
      "label": "Customer",
      "placeholder": "Enter customer",
      "type": "select",
      "options": [
        "Carrefour",
        "Spinneys",
        "Lulu Hypermarket",
        "Waitrose",
        "Choithrams"
      ]
    },
    {
      "key": "internalSku",
      "label": "Internal SKU",
      "placeholder": "Enter internal sku",
      "type": "select",
      "options": [
        "SKU-10021",
        "SKU-10022",
        "SKU-10023",
        "SKU-10024",
        "SKU-9901",
        "SKU-4402"
      ]
    },
    {
      "key": "customerSku",
      "label": "Customer SKU",
      "placeholder": "Enter customer sku",
      "type": "text"
    },
    {
      "key": "uom",
      "label": "UOM",
      "placeholder": "Enter uom",
      "type": "text"
    }
  ],
  "progressStatuses": [
    "Active",
    "Inactive"
  ],
  "searchPlaceholder": "Search customer-specific sku..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
