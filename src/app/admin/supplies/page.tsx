'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Package, Inbox, BarChart2, ShoppingCart } from 'lucide-react';
import { InventoryList } from '@/components/admin/InventoryList';
import { RestockQueue } from '@/components/admin/RestockQueue';
import { SupplySpendChart } from '@/components/admin/SupplySpendChart';
import { ReorderGenerator } from '@/components/admin/ReorderGenerator';
import { getLowStockItems, getRequests } from '@/lib/supply-inventory-storage';

export default function SuppliesPage() {
  const [lowStockCount, setLowStockCount] = useState(0);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  useEffect(() => {
    async function loadCounts() {
      const [lowStock, pending] = await Promise.all([
        getLowStockItems(),
        getRequests({ status: 'pending' }),
      ]);
      setLowStockCount(lowStock.length);
      setPendingRequestCount(pending.length);
    }
    loadCounts();
  }, []);

  const refreshCounts = async () => {
    const [lowStock, pending] = await Promise.all([
      getLowStockItems(),
      getRequests({ status: 'pending' }),
    ]);
    setLowStockCount(lowStock.length);
    setPendingRequestCount(pending.length);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6" />
          Supply &amp; Inventory Tracker
        </h1>
        <p className="text-muted-foreground">
          Manage classroom, cleaning, and operational supplies across the center.
        </p>
      </div>

      {/* Alert banner */}
      {(lowStockCount > 0 || pendingRequestCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {lowStockCount > 0 && (
            <Card className="border-yellow-300 bg-yellow-50/50 flex-1 min-w-[200px]">
              <CardContent className="p-3 flex items-center gap-3">
                <Package className="h-5 w-5 text-yellow-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-700">
                    {lowStockCount} item{lowStockCount !== 1 ? 's' : ''} at or below minimum
                  </p>
                  <p className="text-xs text-yellow-600">Review the reorder list</p>
                </div>
              </CardContent>
            </Card>
          )}
          {pendingRequestCount > 0 && (
            <Card className="border-[#C62828]/30 bg-[#C62828]/5 flex-1 min-w-[200px]">
              <CardContent className="p-3 flex items-center gap-3">
                <Inbox className="h-5 w-5 text-[#C62828] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#C62828]">
                    {pendingRequestCount} pending supply request{pendingRequestCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-[#C62828]/70">From your staff</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Tabs defaultValue="inventory">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Staff Requests
            {pendingRequestCount > 0 && (
              <Badge className="ml-1 bg-[#C62828] text-white h-5 min-w-5 text-xs">
                {pendingRequestCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reorder" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Reorder List
            {lowStockCount > 0 && (
              <Badge className="ml-1 bg-yellow-500 text-white h-5 min-w-5 text-xs">
                {lowStockCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="spend" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Spend
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-4">
          <InventoryList onRefresh={refreshCounts} />
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <RestockQueue onRefresh={refreshCounts} />
        </TabsContent>

        <TabsContent value="reorder" className="mt-4">
          <ReorderGenerator onOrderCreated={refreshCounts} />
        </TabsContent>

        <TabsContent value="spend" className="mt-4">
          <SupplySpendChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}
