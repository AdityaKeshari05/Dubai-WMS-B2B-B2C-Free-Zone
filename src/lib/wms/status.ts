import type {
  B2BOrderStatus,
  B2CFulfillmentStatus,
  PickingTaskStatus,
  PackageStatus,
  ShipmentStatus,
  ReturnStatus,
  CycleCountStatus,
} from '@/types';
import type { BadgeProps } from '@/components/ui/badge';

type Variant = NonNullable<BadgeProps['variant']>;

function buildEngine<T extends string>(map: Record<T, { label: string; variant: Variant; next: T[] }>) {
  return {
    label: (status: T) => map[status]?.label ?? status,
    variant: (status: T) => map[status]?.variant ?? 'secondary',
    nextStatuses: (from: T) => map[from]?.next ?? [],
  };
}

export const B2B_ORDER_STATUS = buildEngine<B2BOrderStatus>({
  draft: { label: 'Draft', variant: 'secondary', next: ['confirmed', 'cancelled'] },
  confirmed: { label: 'Confirmed', variant: 'info', next: ['allocated', 'cancelled'] },
  allocated: { label: 'Allocated', variant: 'info', next: ['picking', 'partially_fulfilled', 'backordered', 'cancelled'] },
  partially_fulfilled: { label: 'Partially Fulfilled', variant: 'warning', next: ['picking', 'backordered'] },
  backordered: { label: 'Backordered', variant: 'destructive', next: ['allocated', 'picking'] },
  picking: { label: 'Picking', variant: 'purple', next: ['packed', 'partially_fulfilled'] },
  packed: { label: 'Packed', variant: 'info', next: ['dispatched'] },
  dispatched: { label: 'Dispatched', variant: 'info', next: ['delivered'] },
  delivered: { label: 'Delivered', variant: 'success', next: [] },
  cancelled: { label: 'Cancelled', variant: 'secondary', next: [] },
});

export const B2C_ORDER_STATUS = buildEngine<B2CFulfillmentStatus>({
  new: { label: 'New', variant: 'secondary', next: ['allocated', 'cancelled'] },
  allocated: { label: 'Allocated', variant: 'info', next: ['picking', 'cancelled'] },
  picking: { label: 'Picking', variant: 'purple', next: ['packing'] },
  packing: { label: 'Packing', variant: 'purple', next: ['packed'] },
  packed: { label: 'Packed', variant: 'info', next: ['shipped'] },
  shipped: { label: 'Shipped', variant: 'info', next: ['delivered', 'rto'] },
  delivered: { label: 'Delivered', variant: 'success', next: ['returned'] },
  rto: { label: 'RTO', variant: 'destructive', next: ['returned'] },
  returned: { label: 'Returned', variant: 'warning', next: [] },
  cancelled: { label: 'Cancelled', variant: 'secondary', next: [] },
});

export const PICKING_STATUS = buildEngine<PickingTaskStatus>({
  pending: { label: 'Pending', variant: 'secondary', next: ['assigned'] },
  assigned: { label: 'Assigned', variant: 'info', next: ['in_progress'] },
  in_progress: { label: 'In Progress', variant: 'purple', next: ['picked', 'exception'] },
  picked: { label: 'Picked', variant: 'info', next: ['completed'] },
  exception: { label: 'Exception', variant: 'destructive', next: ['in_progress', 'completed'] },
  completed: { label: 'Completed', variant: 'success', next: [] },
});

export const PACKAGE_STATUS = buildEngine<PackageStatus>({
  pending: { label: 'Pending', variant: 'secondary', next: ['verifying'] },
  verifying: { label: 'Verifying', variant: 'warning', next: ['packed'] },
  packed: { label: 'Packed', variant: 'info', next: ['ready_to_ship'] },
  ready_to_ship: { label: 'Ready to Ship', variant: 'success', next: [] },
});

export const SHIPMENT_STATUS = buildEngine<ShipmentStatus>({
  label_created: { label: 'Label Created', variant: 'secondary', next: ['picked_up'] },
  picked_up: { label: 'Picked Up', variant: 'info', next: ['in_transit'] },
  in_transit: { label: 'In Transit', variant: 'purple', next: ['out_for_delivery', 'rto'] },
  out_for_delivery: { label: 'Out for Delivery', variant: 'warning', next: ['delivered', 'failed'] },
  delivered: { label: 'Delivered', variant: 'success', next: [] },
  failed: { label: 'Failed', variant: 'destructive', next: ['rto'] },
  rto: { label: 'RTO', variant: 'destructive', next: [] },
});

export const RETURN_STATUS = buildEngine<ReturnStatus>({
  requested: { label: 'Requested', variant: 'secondary', next: ['approved'] },
  approved: { label: 'Approved', variant: 'info', next: ['received'] },
  received: { label: 'Received', variant: 'purple', next: ['inspected'] },
  inspected: { label: 'Inspected', variant: 'warning', next: ['restocked', 'damaged'] },
  restocked: { label: 'Restocked', variant: 'success', next: [] },
  damaged: { label: 'Damaged', variant: 'destructive', next: [] },
});

export const CYCLE_COUNT_STATUS = buildEngine<CycleCountStatus>({
  draft: { label: 'Draft', variant: 'secondary', next: ['in_progress'] },
  in_progress: { label: 'In Progress', variant: 'info', next: ['completed'] },
  completed: { label: 'Completed', variant: 'warning', next: ['reconciled'] },
  reconciled: { label: 'Reconciled', variant: 'success', next: [] },
});

export const PRIORITY_VARIANT: Record<string, Variant> = { low: 'secondary', normal: 'info', high: 'warning', urgent: 'destructive' };
