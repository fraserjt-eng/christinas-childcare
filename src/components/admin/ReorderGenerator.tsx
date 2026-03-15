'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ShoppingCart,
  Copy,
  CheckCircle,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import {
  SupplyItem,
  generateReorderList,
  createOrder,
  CATEGORY_LABELS,
} from '@/lib/supply-inventory-storage';

interface ReorderEntry {
  item: Pick<SupplyItem, 'id' | 'name' | 'category' | 'current_qty' | 'min_threshold' | 'reorder_qty' | 'vendor' | 'unit_cost'>;
  shortage: number;
  estimated_cost: number;
}

interface ReorderGeneratorProps {
  onOrderCreated?: () => void;
}

export function ReorderGenerator({ onOrderCreated }: ReorderGeneratorProps) {
  const [list, setList] = useState<ReorderEntry[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadList = async () => {
    setLoading(true);
    const data = await generateReorderList();
    setList(data);
    // Select all by default
    setSelected(new Set(data.map((d) => d.item.id)));
    setLoading(false);
  };

  useEffect(() => {
    loadList();
  }, []);

  const toggleItem = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedItems = list.filter((entry) => selected.has(entry.item.id));
  const totalCost = selectedItems.reduce((sum, e) => sum + e.estimated_cost, 0);

  const handleGenerateOrder = async () => {
    if (selectedItems.length === 0) return;
    const orderItems = selectedItems.map((e) => ({
      name: e.item.name,
      qty: e.item.reorder_qty,
      unit_cost: e.item.unit_cost,
    }));
    await createOrder(orderItems);
    setOrderPlaced(true);
    onOrderCreated?.();
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  const handleCopyList = () => {
    if (selectedItems.length === 0) return;
    const lines = [
      'SUPPLY REORDER LIST',
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      ...selectedItems.map(
        (e) =>
          `${e.item.name} x${e.item.reorder_qty} — ${e.item.vendor} — $${e.estimated_cost.toFixed(2)}`
      ),
      '',
      `TOTAL ESTIMATED: $${totalCost.toFixed(2)}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C62828]" />
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
          <p className="font-medium text-lg">All items are stocked</p>
          <p className="text-sm text-muted-foreground mt-1">
            No items are currently below their minimum threshold.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <span className="font-medium">
            {list.length} item{list.length !== 1 ? 's' : ''} below minimum threshold
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyList}
            disabled={selectedItems.length === 0}
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy List
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleGenerateOrder}
            disabled={selectedItems.length === 0 || orderPlaced}
            className="bg-[#C62828] hover:bg-[#b71c1c] text-white"
          >
            {orderPlaced ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Order Created
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Generate Order ({selectedItems.length})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Item list */}
      <div className="space-y-2">
        {list.map((entry) => {
          const isSelected = selected.has(entry.item.id);
          return (
            <div
              key={entry.item.id}
              className={`flex items-center gap-4 p-3 border rounded-lg transition-colors ${
                isSelected ? 'bg-white' : 'bg-muted/30 opacity-60'
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleItem(entry.item.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{entry.item.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {CATEGORY_LABELS[entry.item.category]}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                  <span>
                    Have: <strong className="text-red-600">{entry.item.current_qty}</strong>
                    {' '}&mdash; Min: {entry.item.min_threshold}
                  </span>
                  <span>Reorder: <strong>{entry.item.reorder_qty}</strong></span>
                  <span>{entry.item.vendor}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-medium text-sm">${entry.estimated_cost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  ${entry.item.unit_cost.toFixed(2)}/unit
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      {selectedItems.length > 0 && (
        <Card className="border-[#C62828]/20 bg-[#C62828]/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#C62828]" />
                <span className="font-medium">
                  Estimated Order Total ({selectedItems.length} items)
                </span>
              </div>
              <span className="text-xl font-bold">${totalCost.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Select all / none */}
      <div className="flex gap-3 text-sm">
        <button
          onClick={() => setSelected(new Set(list.map((e) => e.item.id)))}
          className="text-[#2196F3] hover:underline"
        >
          Select all
        </button>
        <span className="text-muted-foreground">|</span>
        <button
          onClick={() => setSelected(new Set())}
          className="text-muted-foreground hover:underline"
        >
          Deselect all
        </button>
      </div>
    </div>
  );
}
