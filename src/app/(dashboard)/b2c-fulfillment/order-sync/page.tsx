'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Order Sync",
  "description": "Synchronize order changes with connected channels",
  "featureCode": "7.3",
  "columns": [
    {
      "key": "channel",
      "label": "Channel"
    },
    {
      "key": "externalOrder",
      "label": "External Order"
    },
    {
      "key": "lastSync",
      "label": "Last Sync"
    },
    {
      "key": "changes",
      "label": "Changes"
    },
    {
      "key": "result",
      "label": "Result"
    }
  ],
  "rows": [
    {
      "id": "SYNC-001",
      "channel": "Shopify",
      "externalOrder": "SH-88120",
      "lastSync": "2 mins ago",
      "changes": "Payment + address",
      "result": "Success",
      "status": "Synced"
    },
    {
      "id": "SYNC-002",
      "channel": "Amazon",
      "externalOrder": "AMZ-77210",
      "lastSync": "7 mins ago",
      "changes": "Cancellation",
      "result": "Pending",
      "status": "Pending"
    }
  ],
  "statuses": [
    "Pending",
    "Synced",
    "Failed"
  ],
  "primaryAction": "Run Sync",
  "modalTitle": "Run Sync",
  "fields": [
    {
      "key": "channel",
      "label": "Channel",
      "placeholder": "Enter channel",
      "type": "select",
      "options": [
        "Shopify",
        "Amazon",
        "Noon",
        "WooCommerce",
        "Magento"
      ]
    },
    {
      "key": "externalOrder",
      "label": "External Order",
      "placeholder": "Enter external order",
      "type": "text"
    },
    {
      "key": "lastSync",
      "label": "Last Sync",
      "placeholder": "e.g. 2 mins ago",
      "type": "text"
    },
    {
      "key": "changes",
      "label": "Changes",
      "placeholder": "Enter changes",
      "type": "text"
    },
    {
      "key": "result",
      "label": "Result",
      "placeholder": "Enter result",
      "type": "select",
      "options": [
        "Success",
        "Pending",
        "Failed"
      ]
    }
  ],
  "progressStatuses": [
    "Pending",
    "Synced",
    "Failed"
  ],
  "searchPlaceholder": "Search order sync..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
