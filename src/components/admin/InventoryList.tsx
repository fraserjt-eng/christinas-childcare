'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronDown,
  ChevronRight,
  Package,
  Plus,
  Search,
  AlertTriangle,
  XCircle,
  Minus,
  Edit,
} from 'lucide-react';
import {
  SupplyItem,
  SupplyCategory,
  CATEGORY_LABELS,
  getItems,
  createItem,
  updateItem,
  adjustQuantity,
} from '@/lib/supply-inventory-storage';

interface InventoryListProps {
  onRefresh?: () => void;
}

function stockStatus(item: SupplyItem): 'ok' | 'low' | 'out' {
  if (item.current_qty === 0) return 'out';
  if (item.current_qty <= item.min_threshold) return 'low';
  return 'ok';
}

const EMPTY_FORM = {
  name: '',
  category: 'classroom' as SupplyCategory,
  current_qty: 0,
  min_threshold: 2,
  reorder_qty: 6,
  vendor: '',
  unit_cost: 0,
};

export function InventoryList({ onRefresh }: InventoryListProps) {
  const [items, setItems] = useState<SupplyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<SupplyItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [adjustingItem, setAdjustingItem] = useState<SupplyItem | null>(null);
  const [customDelta, setCustomDelta] = useState('');
  const [saving, setSaving] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    const data = await getItems();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (editingItem) {
      await updateItem(editingItem.id, form);
    } else {
      await createItem({ ...form, center_id: 'christinas_center' });
    }
    await loadItems();
    onRefresh?.();
    setSaving(false);
    setShowForm(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
  };

  const handleAdjust = async (delta: number) => {
    if (!adjustingItem) return;
    await adjustQuantity(adjustingItem.id, delta);
    await loadItems();
    onRefresh?.();
    setAdjustingItem(null);
    setCustomDelta('');
  };

  const handleCustomAdjust = async () => {
    const delta = parseInt(customDelta);
    if (!isNaN(delta)) await handleAdjust(delta);
  };

  const openEdit = (item: SupplyItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      current_qty: item.current_qty,
      min_threshold: item.min_threshold,
      reorder_qty: item.reorder_qty,
      vendor: item.vendor,
      unit_cost: item.unit_cost,
    });
    setShowForm(true);
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const filtered = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.vendor.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const grouped = filtered.reduce<Record<string, SupplyItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const totalItems = items.length;
  const lowStockCount = items.filter((i) => stockStatus(i) === 'low').length;
  const outOfStockCount = items.filter((i) => stockStatus(i) === 'out').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C62828]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalItems}</p>
            <p className="text-sm text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/40">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{lowStockCount}</p>
            <p className="text-sm text-yellow-600">Low Stock</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/40">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{outOfStockCount}</p>
            <p className="text-sm text-red-600">Out of Stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Add */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items or vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setEditingItem(null);
            setForm(EMPTY_FORM);
            setShowForm(true);
          }}
          className="bg-[#C62828] hover:bg-[#b71c1c] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Grouped List */}
      {Object.entries(grouped).map(([category, categoryItems]) => {
        const isCollapsed = collapsedCategories.has(category);
        const catLowCount = categoryItems.filter((i) => stockStatus(i) !== 'ok').length;
        return (
          <div key={category} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {CATEGORY_LABELS[category as SupplyCategory]}
                </span>
                <Badge variant="secondary">{categoryItems.length}</Badge>
                {catLowCount > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                    {catLowCount} need attention
                  </Badge>
                )}
              </div>
            </button>

            {!isCollapsed && (
              <div className="divide-y">
                {categoryItems.map((item) => {
                  const status = stockStatus(item);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-muted/20"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{item.name}</span>
                          {status === 'out' && (
                            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              Out of Stock
                            </Badge>
                          )}
                          {status === 'low' && (
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Low
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.vendor} &middot; ${item.unit_cost.toFixed(2)}/unit
                        </p>
                      </div>

                      <div className="text-center min-w-[80px]">
                        <p
                          className={`text-lg font-bold ${
                            status === 'out'
                              ? 'text-red-700'
                              : status === 'low'
                              ? 'text-yellow-700'
                              : 'text-green-700'
                          }`}
                        >
                          {item.current_qty}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          min {item.min_threshold}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={async () => {
                            await adjustQuantity(item.id, -1);
                            await loadItems();
                            onRefresh?.();
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={async () => {
                            await adjustQuantity(item.id, 1);
                            await loadItems();
                            onRefresh?.();
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => {
                            setAdjustingItem(item);
                            setCustomDelta('');
                          }}
                        >
                          Custom
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => openEdit(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No items match your search.
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingItem(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add Supply Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Construction Paper"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v as SupplyCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Current Qty</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.current_qty}
                  onChange={(e) => setForm({ ...form, current_qty: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Threshold</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.min_threshold}
                  onChange={(e) => setForm({ ...form, min_threshold: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Reorder Qty</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.reorder_qty}
                  onChange={(e) => setForm({ ...form, reorder_qty: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit Cost ($)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.unit_cost}
                  onChange={(e) => setForm({ ...form, unit_cost: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Input
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                placeholder="e.g. School Specialty"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={!form.name.trim() || saving}
                className="flex-1 bg-[#C62828] hover:bg-[#b71c1c] text-white"
              >
                {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Item'}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowForm(false); setEditingItem(null); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Adjust Dialog */}
      <Dialog open={!!adjustingItem} onOpenChange={(open) => { if (!open) setAdjustingItem(null); }}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Adjust Quantity</DialogTitle>
          </DialogHeader>
          {adjustingItem && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {adjustingItem.name} &mdash; currently <strong>{adjustingItem.current_qty}</strong>
              </p>
              <div className="space-y-2">
                <Label>Amount (use negative to decrease)</Label>
                <Input
                  type="number"
                  value={customDelta}
                  onChange={(e) => setCustomDelta(e.target.value)}
                  placeholder="e.g. +5 or -3"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCustomAdjust}
                  disabled={!customDelta}
                  className="flex-1 bg-[#C62828] hover:bg-[#b71c1c] text-white"
                >
                  Apply
                </Button>
                <Button variant="outline" onClick={() => setAdjustingItem(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
