'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, Calendar } from 'lucide-react';
import { InventoryTable } from '@/components/food/InventoryTable';
import { getInventoryAlerts, seedFoodData } from '@/lib/food-storage';
import { InventoryAlert } from '@/types/food';

export default function InventoryPage() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);

  useEffect(() => {
    async function init() {
      await seedFoodData();
      loadAlerts();
    }
    init();
  }, []);

  const loadAlerts = async () => {
    const alertList = await getInventoryAlerts();
    setAlerts(alertList);
  };

  const lowStockAlerts = alerts.filter((a) => a.alert_type === 'low_stock');
  const expiringAlerts = alerts.filter(
    (a) => a.alert_type === 'expiring_soon' || a.alert_type === 'expired'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6" />
          Inventory Management
        </h1>
        <p className="text-muted-foreground">
          Track food and supply inventory levels
        </p>
      </div>

      {/* Alerts Summary */}
      {alerts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {lowStockAlerts.length > 0 && (
            <Card className="border-yellow-300 bg-yellow-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="h-4 w-4" />
                  Low Stock Items ({lowStockAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockAlerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.item_id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{alert.item_name}</span>
                      <Badge variant="outline" className="text-yellow-700">
                        {alert.current_value} left
                      </Badge>
                    </div>
                  ))}
                  {lowStockAlerts.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{lowStockAlerts.length - 3} more items
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {expiringAlerts.length > 0 && (
            <Card className="border-orange-300 bg-orange-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
                  <Calendar className="h-4 w-4" />
                  Expiring Items ({expiringAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expiringAlerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.item_id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{alert.item_name}</span>
                      <Badge
                        variant="outline"
                        className={
                          alert.alert_type === 'expired'
                            ? 'text-red-700'
                            : 'text-orange-700'
                        }
                      >
                        {alert.alert_type === 'expired' ? 'Expired' : alert.current_value}
                      </Badge>
                    </div>
                  ))}
                  {expiringAlerts.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{expiringAlerts.length - 3} more items
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Inventory Table */}
      <InventoryTable onRefresh={loadAlerts} />
    </div>
  );
}
