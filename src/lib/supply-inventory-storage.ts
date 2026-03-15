// Supply & Inventory Storage Module for Christina's Child Care Center
// Uses localStorage for persistence, designed for easy Supabase migration

// ============================================================================
// Types
// ============================================================================

export type SupplyCategory =
  | 'classroom'
  | 'cleaning'
  | 'food_kitchen'
  | 'office'
  | 'first_aid'
  | 'outdoor';

export const CATEGORY_LABELS: Record<SupplyCategory, string> = {
  classroom: 'Classroom',
  cleaning: 'Cleaning',
  food_kitchen: 'Food & Kitchen',
  office: 'Office',
  first_aid: 'First Aid',
  outdoor: 'Outdoor',
};

export interface SupplyItem {
  id: string;
  name: string;
  category: SupplyCategory;
  current_qty: number;
  min_threshold: number;
  reorder_qty: number;
  vendor: string;
  unit_cost: number;
  center_id: string;
  updated_at: string;
}

export interface SupplyRequest {
  id: string;
  item_name: string;
  requested_by: string;
  classroom: string;
  urgency: 'today' | 'this_week' | 'routine';
  status: 'pending' | 'fulfilled' | 'denied';
  notes?: string;
  created_at: string;
}

export interface SupplyOrder {
  id: string;
  items: { name: string; qty: number; unit_cost: number }[];
  total_cost: number;
  status: 'draft' | 'ordered' | 'received';
  ordered_at?: string;
  received_at?: string;
}

// ============================================================================
// Storage Keys
// ============================================================================

const KEYS = {
  items: 'christinas_supply_items',
  requests: 'christinas_supply_requests',
  orders: 'christinas_supply_orders',
};

// ============================================================================
// Generic Helpers
// ============================================================================

function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================================
// Supply Items CRUD
// ============================================================================

export async function getItems(filters?: {
  category?: SupplyCategory;
  lowStock?: boolean;
}): Promise<SupplyItem[]> {
  let items = getFromStorage<SupplyItem>(KEYS.items);

  if (items.length === 0) {
    await seedSupplyItems();
    items = getFromStorage<SupplyItem>(KEYS.items);
  }

  if (filters?.category) {
    items = items.filter((i) => i.category === filters.category);
  }
  if (filters?.lowStock) {
    items = items.filter((i) => i.current_qty <= i.min_threshold);
  }

  items.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });

  return items;
}

export async function createItem(
  data: Omit<SupplyItem, 'id' | 'updated_at'>
): Promise<SupplyItem> {
  const items = getFromStorage<SupplyItem>(KEYS.items);
  const now = new Date().toISOString();
  const item: SupplyItem = { ...data, id: generateId('sup'), updated_at: now };
  items.push(item);
  saveToStorage(KEYS.items, items);
  return item;
}

export async function updateItem(
  id: string,
  updates: Partial<Omit<SupplyItem, 'id'>>
): Promise<SupplyItem | null> {
  const items = getFromStorage<SupplyItem>(KEYS.items);
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates, id, updated_at: new Date().toISOString() };
  saveToStorage(KEYS.items, items);
  return items[index];
}

export async function deleteItem(id: string): Promise<boolean> {
  const items = getFromStorage<SupplyItem>(KEYS.items);
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return false;
  items.splice(index, 1);
  saveToStorage(KEYS.items, items);
  return true;
}

export async function adjustQuantity(id: string, delta: number): Promise<SupplyItem | null> {
  const items = getFromStorage<SupplyItem>(KEYS.items);
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return null;
  items[index] = {
    ...items[index],
    current_qty: Math.max(0, items[index].current_qty + delta),
    updated_at: new Date().toISOString(),
  };
  saveToStorage(KEYS.items, items);
  return items[index];
}

export async function getLowStockItems(): Promise<SupplyItem[]> {
  const items = await getItems();
  return items.filter((i) => i.current_qty <= i.min_threshold);
}

// ============================================================================
// Supply Requests CRUD
// ============================================================================

export async function getRequests(filters?: {
  status?: 'pending' | 'fulfilled' | 'denied';
  urgency?: 'today' | 'this_week' | 'routine';
}): Promise<SupplyRequest[]> {
  let requests = getFromStorage<SupplyRequest>(KEYS.requests);

  if (filters?.status) {
    requests = requests.filter((r) => r.status === filters.status);
  }
  if (filters?.urgency) {
    requests = requests.filter((r) => r.urgency === filters.urgency);
  }

  requests.sort((a, b) => {
    const urgencyOrder = { today: 0, this_week: 1, routine: 2 };
    if (a.status !== b.status) {
      const statusOrder = { pending: 0, fulfilled: 1, denied: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  return requests;
}

export async function createRequest(
  data: Omit<SupplyRequest, 'id' | 'status' | 'created_at'>
): Promise<SupplyRequest> {
  const requests = getFromStorage<SupplyRequest>(KEYS.requests);
  const request: SupplyRequest = {
    ...data,
    id: generateId('req'),
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  requests.push(request);
  saveToStorage(KEYS.requests, requests);
  return request;
}

export async function fulfillRequest(id: string): Promise<SupplyRequest | null> {
  const requests = getFromStorage<SupplyRequest>(KEYS.requests);
  const index = requests.findIndex((r) => r.id === id);
  if (index === -1) return null;
  requests[index] = { ...requests[index], status: 'fulfilled' };
  saveToStorage(KEYS.requests, requests);
  return requests[index];
}

export async function denyRequest(id: string): Promise<SupplyRequest | null> {
  const requests = getFromStorage<SupplyRequest>(KEYS.requests);
  const index = requests.findIndex((r) => r.id === id);
  if (index === -1) return null;
  requests[index] = { ...requests[index], status: 'denied' };
  saveToStorage(KEYS.requests, requests);
  return requests[index];
}

// ============================================================================
// Supply Orders CRUD
// ============================================================================

export async function getOrders(): Promise<SupplyOrder[]> {
  const orders = getFromStorage<SupplyOrder>(KEYS.orders);
  orders.sort((a, b) => {
    const statusOrder = { draft: 0, ordered: 1, received: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
  return orders;
}

export async function createOrder(
  items: { name: string; qty: number; unit_cost: number }[]
): Promise<SupplyOrder> {
  const orders = getFromStorage<SupplyOrder>(KEYS.orders);
  const total_cost = items.reduce((sum, i) => sum + i.qty * i.unit_cost, 0);
  const order: SupplyOrder = {
    id: generateId('ord'),
    items,
    total_cost,
    status: 'draft',
  };
  orders.push(order);
  saveToStorage(KEYS.orders, orders);
  return order;
}

// ============================================================================
// Analytics
// ============================================================================

export async function getMonthlySpend(): Promise<
  { month: string; category: SupplyCategory; amount: number }[]
> {
  // Derive estimated spend from current inventory value per category
  // In production this would pull from order history
  const items = await getItems();
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    const categoryKeys = Object.keys(CATEGORY_LABELS) as SupplyCategory[];
    for (const category of categoryKeys) {
      const categoryItems = items.filter((item) => item.category === category);
      const base = categoryItems.reduce(
        (sum, item) => sum + item.reorder_qty * item.unit_cost,
        0
      );
      // Add slight variation per month for realistic chart data
      const variance = 0.85 + Math.sin(i * 1.3 + categoryKeys.indexOf(category)) * 0.15;
      months.push({ month, category, amount: Math.round(base * variance * 100) / 100 });
    }
  }

  return months;
}

export async function generateReorderList(): Promise<
  {
    item: SupplyItem;
    shortage: number;
    estimated_cost: number;
  }[]
> {
  const items = await getItems();
  return items
    .filter((i) => i.current_qty <= i.min_threshold)
    .map((item) => ({
      item,
      shortage: item.reorder_qty,
      estimated_cost: item.reorder_qty * item.unit_cost,
    }))
    .sort((a, b) => b.estimated_cost - a.estimated_cost);
}

// ============================================================================
// Seed Data
// ============================================================================

const SEED_ITEMS: Omit<SupplyItem, 'id' | 'updated_at'>[] = [
  // Classroom
  {
    name: 'Construction Paper (Pack)',
    category: 'classroom',
    current_qty: 8,
    min_threshold: 4,
    reorder_qty: 10,
    vendor: 'School Specialty',
    unit_cost: 6.49,
    center_id: 'christinas_center',
  },
  {
    name: 'Washable Markers (Set)',
    category: 'classroom',
    current_qty: 3,
    min_threshold: 5,
    reorder_qty: 8,
    vendor: 'School Specialty',
    unit_cost: 4.99,
    center_id: 'christinas_center',
  },
  {
    name: 'Tempera Paint (Quart)',
    category: 'classroom',
    current_qty: 6,
    min_threshold: 4,
    reorder_qty: 12,
    vendor: 'Dick Blick',
    unit_cost: 3.75,
    center_id: 'christinas_center',
  },
  {
    name: 'Glue Sticks (Box of 30)',
    category: 'classroom',
    current_qty: 2,
    min_threshold: 3,
    reorder_qty: 6,
    vendor: 'School Specialty',
    unit_cost: 8.99,
    center_id: 'christinas_center',
  },
  {
    name: 'Play-Doh (24-Pack)',
    category: 'classroom',
    current_qty: 1,
    min_threshold: 2,
    reorder_qty: 4,
    vendor: 'Amazon',
    unit_cost: 18.99,
    center_id: 'christinas_center',
  },
  // Cleaning
  {
    name: 'Disinfectant Spray (Gallon)',
    category: 'cleaning',
    current_qty: 4,
    min_threshold: 3,
    reorder_qty: 6,
    vendor: 'Sysco',
    unit_cost: 12.99,
    center_id: 'christinas_center',
  },
  {
    name: 'Paper Towels (Case)',
    category: 'cleaning',
    current_qty: 2,
    min_threshold: 3,
    reorder_qty: 6,
    vendor: 'Sysco',
    unit_cost: 42.00,
    center_id: 'christinas_center',
  },
  {
    name: 'Hand Soap (Gallon Refill)',
    category: 'cleaning',
    current_qty: 5,
    min_threshold: 2,
    reorder_qty: 4,
    vendor: 'Sysco',
    unit_cost: 9.49,
    center_id: 'christinas_center',
  },
  {
    name: 'Trash Bags (Box of 100)',
    category: 'cleaning',
    current_qty: 3,
    min_threshold: 2,
    reorder_qty: 4,
    vendor: 'Sysco',
    unit_cost: 19.99,
    center_id: 'christinas_center',
  },
  // Food & Kitchen
  {
    name: 'Disposable Gloves (Box of 100)',
    category: 'food_kitchen',
    current_qty: 1,
    min_threshold: 2,
    reorder_qty: 4,
    vendor: 'Sysco',
    unit_cost: 14.99,
    center_id: 'christinas_center',
  },
  {
    name: 'Serving Spoons (Set)',
    category: 'food_kitchen',
    current_qty: 6,
    min_threshold: 4,
    reorder_qty: 4,
    vendor: 'Restaurant Depot',
    unit_cost: 3.50,
    center_id: 'christinas_center',
  },
  {
    name: 'Portion Cups (Pack of 500)',
    category: 'food_kitchen',
    current_qty: 2,
    min_threshold: 2,
    reorder_qty: 4,
    vendor: 'Sysco',
    unit_cost: 11.49,
    center_id: 'christinas_center',
  },
  // Office
  {
    name: 'Printer Paper (Ream)',
    category: 'office',
    current_qty: 3,
    min_threshold: 3,
    reorder_qty: 6,
    vendor: 'Staples',
    unit_cost: 8.99,
    center_id: 'christinas_center',
  },
  {
    name: 'Ink Cartridges (Black)',
    category: 'office',
    current_qty: 1,
    min_threshold: 2,
    reorder_qty: 4,
    vendor: 'Staples',
    unit_cost: 24.99,
    center_id: 'christinas_center',
  },
  // First Aid
  {
    name: 'Bandages (Box of 100)',
    category: 'first_aid',
    current_qty: 4,
    min_threshold: 2,
    reorder_qty: 6,
    vendor: 'Amazon',
    unit_cost: 7.49,
    center_id: 'christinas_center',
  },
  {
    name: 'Nitrile Exam Gloves (M, Box)',
    category: 'first_aid',
    current_qty: 0,
    min_threshold: 2,
    reorder_qty: 4,
    vendor: 'Amazon',
    unit_cost: 12.99,
    center_id: 'christinas_center',
  },
  {
    name: 'Cold Packs (Box of 24)',
    category: 'first_aid',
    current_qty: 2,
    min_threshold: 1,
    reorder_qty: 2,
    vendor: 'Amazon',
    unit_cost: 16.49,
    center_id: 'christinas_center',
  },
  // Outdoor
  {
    name: 'Sidewalk Chalk (Box)',
    category: 'outdoor',
    current_qty: 5,
    min_threshold: 3,
    reorder_qty: 6,
    vendor: 'Amazon',
    unit_cost: 5.99,
    center_id: 'christinas_center',
  },
  {
    name: 'Sunscreen SPF 50 (Bottle)',
    category: 'outdoor',
    current_qty: 1,
    min_threshold: 3,
    reorder_qty: 6,
    vendor: 'Costco',
    unit_cost: 8.99,
    center_id: 'christinas_center',
  },
  {
    name: 'Bug Spray (Bottle)',
    category: 'outdoor',
    current_qty: 2,
    min_threshold: 2,
    reorder_qty: 4,
    vendor: 'Costco',
    unit_cost: 6.49,
    center_id: 'christinas_center',
  },
];

const SEED_REQUESTS: Omit<SupplyRequest, 'id' | 'status' | 'created_at'>[] = [
  {
    item_name: 'Washable Markers (Set)',
    requested_by: 'Maria Chen',
    classroom: 'Butterflies (3-4yr)',
    urgency: 'today',
    notes: 'Need for afternoon art project',
  },
  {
    item_name: 'Glue Sticks',
    requested_by: 'Sandra Williams',
    classroom: 'Ladybugs (2-3yr)',
    urgency: 'this_week',
  },
  {
    item_name: 'Paper Towels',
    requested_by: 'James Okafor',
    classroom: 'Sunflowers (PreK)',
    urgency: 'today',
    notes: 'Completely out',
  },
  {
    item_name: 'Tempera Paint (Blue)',
    requested_by: 'Rachel Torres',
    classroom: 'Bumblebees (Infant)',
    urgency: 'routine',
  },
];

async function seedSupplyItems(): Promise<void> {
  const now = new Date().toISOString();
  const items: SupplyItem[] = SEED_ITEMS.map((item, i) => ({
    ...item,
    id: `sup_seed_${i + 1}`,
    updated_at: now,
  }));
  saveToStorage(KEYS.items, items);

  // Seed some requests too
  const existingRequests = getFromStorage<SupplyRequest>(KEYS.requests);
  if (existingRequests.length === 0) {
    const requests: SupplyRequest[] = SEED_REQUESTS.map((r, i) => ({
      ...r,
      id: `req_seed_${i + 1}`,
      status: i < 3 ? 'pending' : 'fulfilled',
      created_at: new Date(Date.now() - i * 4 * 60 * 60 * 1000).toISOString(),
    }));
    saveToStorage(KEYS.requests, requests);
  }
}
