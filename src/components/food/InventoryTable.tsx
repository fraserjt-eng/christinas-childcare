'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertTriangle,
  Calendar,
  Edit,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  InventoryItem,
  InventoryCategory,
  CATEGORY_LABELS,
  isLowStock,
  isExpiringSoon,
  isExpired,
  formatFoodCurrency,
} from '@/types/food';
import { getInventoryItems, deleteInventoryItem } from '@/lib/food-storage';
import { InventoryItemForm } from './InventoryItemForm';

interface InventoryTableProps {
  onRefresh?: () => void;
}

export function InventoryTable({ onRefresh }: InventoryTableProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    const data = await getInventoryItems();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteInventoryItem(id);
      loadItems();
      onRefresh?.();
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    loadItems();
    onRefresh?.();
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    // Search filter
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && item.category !== categoryFilter) {
      return false;
    }

    // Low stock filter
    if (showLowStockOnly && !isLowStock(item.quantity, item.reorder_threshold)) {
      return false;
    }

    // Expiring filter
    if (
      showExpiringOnly &&
      !isExpiringSoon(item.expiration_date) &&
      !isExpired(item.expiration_date)
    ) {
      return false;
    }

    return true;
  });

  const getStatusBadge = (item: InventoryItem) => {
    if (isExpired(item.expiration_date)) {
      return (
        <Badge variant="destructive" className="gap-1">
          <Calendar className="h-3 w-3" />
          Expired
        </Badge>
      );
    }
    if (isExpiringSoon(item.expiration_date)) {
      return (
        <Badge variant="outline" className="gap-1 text-orange-600 border-orange-300">
          <Calendar className="h-3 w-3" />
          Expiring Soon
        </Badge>
      );
    }
    if (isLowStock(item.quantity, item.reorder_threshold)) {
      return (
        <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-300">
          <AlertTriangle className="h-3 w-3" />
          Low Stock
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 text-green-600 border-green-300">
        <Package className="h-3 w-3" />
        In Stock
      </Badge>
    );
  };

  const categories = Object.keys(CATEGORY_LABELS) as InventoryCategory[];

  // Stats
  const lowStockCount = items.filter((i) =>
    isLowStock(i.quantity, i.reorder_threshold)
  ).length;
  const expiringCount = items.filter(
    (i) => isExpiringSoon(i.expiration_date) || isExpired(i.expiration_date)
  ).length;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={showLowStockOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className="gap-1"
          >
            <AlertTriangle className="h-4 w-4" />
            Low Stock ({lowStockCount})
          </Button>
          <Button
            variant={showExpiringOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowExpiringOnly(!showExpiringOnly)}
            className="gap-1"
          >
            <Calendar className="h-4 w-4" />
            Expiring ({expiringCount})
          </Button>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-center">Reorder At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  No items found
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {CATEGORY_LABELS[item.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {item.reorder_threshold} {item.unit}
                  </TableCell>
                  <TableCell>{getStatusBadge(item)}</TableCell>
                  <TableCell>
                    {item.expiration_date ? (
                      <span
                        className={
                          isExpired(item.expiration_date)
                            ? 'text-red-600'
                            : isExpiringSoon(item.expiration_date)
                            ? 'text-orange-600'
                            : ''
                        }
                      >
                        {new Date(item.expiration_date).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.cost_per_unit
                      ? formatFoodCurrency(item.cost_per_unit)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <InventoryItemForm
        open={isFormOpen}
        onClose={handleFormClose}
        editItem={editingItem}
      />
    </div>
  );
}
