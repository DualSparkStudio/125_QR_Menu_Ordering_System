import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = uuidv4().substring(0, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Calculate order totals including tax and service charge
 */
export function calculateOrderTotals(
  subtotal: number,
  taxPercentage: number = 0,
  serviceChargePercentage: number = 0,
  discountAmount: number = 0
): { taxAmount: number; serviceCharge: number; totalAmount: number } {
  const taxAmount = (subtotal * taxPercentage) / 100;
  const serviceCharge = (subtotal * serviceChargePercentage) / 100;
  const totalAmount = subtotal + taxAmount + serviceCharge - discountAmount;

  return {
    taxAmount: Math.round(taxAmount * 100) / 100,
    serviceCharge: Math.round(serviceCharge * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}

/**
 * Map order status to item status
 */
export function getItemStatusFromOrderStatus(orderStatus: string): string {
  const ORDER_TO_ITEM_STATUS: Record<string, string> = {
    pending: 'pending',
    confirmed: 'pending',
    preparing: 'preparing',
    ready: 'ready',
    served: 'served',
    completed: 'served',
    cancelled: 'pending',
  };

  return ORDER_TO_ITEM_STATUS[orderStatus] || 'pending';
}
