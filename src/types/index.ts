export interface CreateOrderRequest {
  userId: string;
  displayName: string;
  tableNumber: string;
  items: Array<{
    itemId: string;
    quantity: number;
    addons?: Array<{
      itemId: string;
      quantity: number;
    }>;
  }>;
  paymentMethod?: 'paypay' | 'manual';
}

export interface OrderResponse {
  _id: string;
  orderId: string;
  userId: string;
  displayName: string;
  tableNumber: string;
  lineUserId?: string;
  paymentMethod?: 'paypay' | 'manual';
  items: Array<{
    itemId: string;
    name: string;
    quantity: number;
    price: number;
    parentItemId?: string;
  }>;
  total: number;
  status: 'Received' | 'Preparing' | 'Ready' | 'Completed';
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemResponse {
  _id: string;
  nameEn: string;
  nameJp: string;
  price: number;
  imageUrl: string;
  category: string;
  subcategory?: string | null;
  isActive: boolean;
  isAddon?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemRequest {
  nameEn: string;
  nameJp: string;
  price: number;
  imageUrl: string;
  category: string;
  subcategory?: string | null;
  isActive?: boolean;
  isAddon?: boolean;
}

export interface UpdateMenuItemRequest {
  nameEn?: string;
  nameJp?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  subcategory?: string | null;
  isActive?: boolean;
  isAddon?: boolean;
}

export interface UpdateOrderStatusRequest {
  status: 'Received' | 'Preparing' | 'Ready' | 'Completed';
}

export interface NotifyRequest {
  userId: string;
  orderId: string;
  tableNumber: string;
}
