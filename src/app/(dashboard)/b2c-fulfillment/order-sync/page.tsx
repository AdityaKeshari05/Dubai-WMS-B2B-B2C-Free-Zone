'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Order Sync",
  "description": "Automatically update order and fulfillment statuses",
  "featureCode": "7.3",
  "columns": [
    {
      "key": "channel",
      "label": "Channel"
    },
    {
      "key": "syncDirection",
      "label": "Action"
    },
    {
      "key": "dateRange",
      "label": "Range"
    },
    {
      "key": "externalOrder",
      "label": "Order"
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
      "syncDirection": "Import New Orders",
      "dateRange": "Last 1 hour",
      "externalOrder": "SH-88120",
      "lastSync": "2 mins ago",
      "changes": "Payment + address",
      "result": "Success",
      "status": "Synced"
    },
    {
      "id": "SYNC-002",
      "channel": "Amazon",
      "syncDirection": "Both (Full Sync)",
      "dateRange": "Last 24 hours",
      "externalOrder": "AMZ-77210",
      "status": "Pending"
    },
    {
      "id": "SYNC-003",
      "channel": "WooCommerce",
      "syncDirection": "Export Fulfillments",
      "dateRange": "Last 4 hours",
      "externalOrder": "WC-1002",
      "lastSync": "12 hours ago",
      "changes": "Tracking updated",
      "result": "Failed",
      "status": "Failed"
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
      "label": "External Order (Optional)",
      "placeholder": "Enter specific order ID",
      "type": "text"
    },
    {
      "key": "syncDirection",
      "label": "Sync Action",
      "type": "select",
      "options": [
        "Import New Orders",
        "Export Fulfillments",
        "Both (Full Sync)"
      ]
    },
    {
      "key": "dateRange",
      "label": "Date Range",
      "type": "select",
      "options": [
        "Last 1 hour",
        "Last 24 hours",
        "Last 7 days",
        "All pending"
      ]
    },
    {
      "key": "lastSync",
      "label": "Last Sync",
      "placeholder": "e.g. Just now",
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
