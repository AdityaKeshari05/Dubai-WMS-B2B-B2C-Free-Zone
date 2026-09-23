'use client';

import { Boxes, PackageCheck, Lock, AlertTriangle, TrendingDown, Layers } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { formatNumber } from "@/lib/utils";
import { useInventoryStats } from "./useInventory";

export function InventoryStatsBar() {
  const stats = useInventoryStats();
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <StatsCard title="Total SKUs" value={formatNumber(stats.totalSkus)} icon={Layers} iconColor="text-blue-600" iconBg="bg-blue-50" />
      <StatsCard title="Total Units" value={formatNumber(stats.totalUnits)} icon={Boxes} iconColor="text-gray-600" iconBg="bg-gray-100" />
      <StatsCard title="Available" value={formatNumber(stats.available)} icon={PackageCheck} iconColor="text-green-600" iconBg="bg-green-50" />
      <StatsCard title="Reserved" value={formatNumber(stats.reserved)} icon={Lock} iconColor="text-purple-600" iconBg="bg-purple-50" />
      <StatsCard title="Damaged" value={formatNumber(stats.damaged)} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" />
      <StatsCard title="Low Stock" value={formatNumber(stats.lowStock)} icon={TrendingDown} iconColor="text-amber-600" iconBg="bg-amber-50" />
    </div>
  );
}
