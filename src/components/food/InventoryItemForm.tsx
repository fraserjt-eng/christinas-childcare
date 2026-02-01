'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import {
  InventoryItem,
  InventoryCategory,
  InventoryUnit,
  CATEGORY_LABELS,
} from '@/types/food';
import { createInventoryItem, updateInventoryItem } from '@/lib/food-storage';

interface InventoryItemFormProps {
  open: boolean;
  onClose: () => void;
  editItem?: InventoryItem | null;
}

const UNITS: { value: InventoryUnit; label: string }[] = [
  { value: 'units', label: 'Units' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'lbs', label: 'Pounds (lbs)' },
  { value: 'gallons', label: 'Gallons' },
  { value: 'servings', label: 'Servings' },
  { value: 'cases', label: 'Cases' },
  { value: 'loaves', label: 'Loaves' },
  { value: 'bags', label: 'Bags' },
  { value: 'boxes', label: 'Boxes' },
];

const categories = Object.keys(CATEGORY_LABELS) as InventoryCategory[];

export function InventoryItemForm({
  open,
  onClose,
  editItem,
}: InventoryItemFormProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'dairy' as InventoryCategory,
    quantity: 0,
    unit: 'units' as InventoryUnit,
    reorder_threshold: 0,
    expiration_date: '',
    cost_per_unit: '',
    supplier: '',
    storage_location: '',
    notes: '',
  });

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name,
        category: editItem.category,
        quantity: editItem.quantity,
        unit: editItem.unit,
        reorder_threshold: editItem.reorder_threshold,
        expiration_date: editItem.expiration_date || '',
        cost_per_unit: editItem.cost_per_unit?.toString() || '',
        supplier: editItem.supplier || '',
        storage_location: editItem.storage_location || '',
        notes: editItem.notes || '',
      });
    } else {
      setFormData({
        name: '',
        category: 'dairy',
        quantity: 0,
        unit: 'units',
        reorder_threshold: 0,
        expiration_date: '',
        cost_per_unit: '',
        supplier: '',
        storage_location: '',
        notes: '',
      });
    }
  }, [editItem, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        name: formData.name,
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit,
        reorder_threshold: formData.reorder_threshold,
        expiration_date: formData.expiration_date || undefined,
        cost_per_unit: formData.cost_per_unit
          ? parseFloat(formData.cost_per_unit)
          : undefined,
        supplier: formData.supplier || undefined,
        storage_location: formData.storage_location || undefined,
        notes: formData.notes || undefined,
      };

      if (editItem) {
        await updateInventoryItem(editItem.id, data);
      } else {
        await createInventoryItem(data);
      }

      onClose();
    } catch (error) {
      console.error('Error saving inventory item:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value as InventoryCategory,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) =>
                  setFormData({ ...formData, unit: value as InventoryUnit })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorder_threshold">Reorder Threshold *</Label>
              <Input
                id="reorder_threshold"
                type="number"
                min="0"
                value={formData.reorder_threshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorder_threshold: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiration_date">Expiration Date</Label>
              <Input
                id="expiration_date"
                type="date"
                value={formData.expiration_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiration_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_per_unit">Cost per Unit ($)</Label>
              <Input
                id="cost_per_unit"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost_per_unit}
                onChange={(e) =>
                  setFormData({ ...formData, cost_per_unit: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) =>
                setFormData({ ...formData, supplier: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storage_location">Storage Location</Label>
            <Input
              id="storage_location"
              value={formData.storage_location}
              onChange={(e) =>
                setFormData({ ...formData, storage_location: e.target.value })
              }
              placeholder="e.g., Walk-in cooler, Shelf A2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editItem ? 'Update' : 'Add'} Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
