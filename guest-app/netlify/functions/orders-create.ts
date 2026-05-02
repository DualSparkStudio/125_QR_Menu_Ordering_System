import { Handler } from '@netlify/functions';
import { prisma } from './lib/prisma';
import { success, error, handleCors } from './lib/response';
import { v4 as uuidv4 } from 'uuid';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleCors();
  }

  if (event.httpMethod !== 'POST') {
    return error('Method not allowed', 405);
  }

  const pathParts = event.path.split('/');
  const restaurantId = pathParts[pathParts.indexOf('restaurants') + 1];
  const tableId = pathParts[pathParts.indexOf('tables') + 1];

  try {
    const dto = JSON.parse(event.body || '{}');

    // Fetch all required data in parallel
    const [table, restaurant, existingOrder, menuItems] = await Promise.all([
      prisma.table.findUnique({ where: { id: tableId } }),
      prisma.restaurant.findUnique({ where: { id: restaurantId } }),
      prisma.order.findFirst({
        where: {
          tableId,
          status: { in: ['pending', 'confirmed', 'preparing', 'ready'] },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.menuItem.findMany({
        where: { 
          id: { in: dto.items.map((i: any) => i.menuItemId) }, 
          restaurantId, 
          isAvailable: true 
        },
      }),
    ]);

    if (!table || table.restaurantId !== restaurantId) {
      return error('Table not found', 404);
    }
    if (!restaurant) return error('Restaurant not found', 404);
    if (!restaurant.isOpen) return error('Restaurant is currently closed', 400);
    if (menuItems.length !== dto.items.length) {
      return error('Some items are unavailable', 400);
    }

    if (existingOrder) {
      // Add items to existing order
      let additionalSubtotal = 0;
      const newOrderItems = dto.items.map((item: any) => {
        const mi = menuItems.find((m: any) => m.id === item.menuItemId)!;
        additionalSubtotal += mi.basePrice * item.quantity;
        return {
          orderId: existingOrder.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: mi.basePrice,
          selectedVariants: item.selectedVariants ? JSON.stringify(item.selectedVariants) : null,
          specialInstructions: item.specialInstructions,
        };
      });

      await prisma.orderItem.createMany({ data: newOrderItems });

      const newSubtotal = existingOrder.subtotal + additionalSubtotal;
      const newTaxAmount = (newSubtotal * restaurant.taxPercentage) / 100;
      const newServiceCharge = (newSubtotal * restaurant.serviceChargePercentage) / 100;
      const newTotalAmount = newSubtotal + newTaxAmount + newServiceCharge - existingOrder.discountAmount;

      const updatedOrder = await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          subtotal: newSubtotal,
          taxAmount: newTaxAmount,
          serviceCharge: newServiceCharge,
          totalAmount: newTotalAmount,
        },
        include: { items: { include: { menuItem: true } }, table: true },
      });

      return success(updatedOrder);
    }

    // Create new order
    let subtotal = 0;
    const orderItems = dto.items.map((item: any) => {
      const mi = menuItems.find((m: any) => m.id === item.menuItemId)!;
      subtotal += mi.basePrice * item.quantity;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: mi.basePrice,
        selectedVariants: item.selectedVariants ? JSON.stringify(item.selectedVariants) : null,
        specialInstructions: item.specialInstructions,
      };
    });

    let discountAmount = dto.discountAmount || 0;
    let couponId: string | undefined;
    if (dto.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { restaurantId, code: dto.couponCode, isActive: true },
      });
      if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
          if (subtotal >= coupon.minOrderValue) {
            discountAmount = coupon.discountType === 'percentage'
              ? Math.min(subtotal * coupon.discountValue / 100, coupon.maxDiscount || Infinity)
              : coupon.discountValue;
            couponId = coupon.id;
          }
        }
      }
    }

    const taxAmount = (subtotal * restaurant.taxPercentage) / 100;
    const serviceCharge = (subtotal * restaurant.serviceChargePercentage) / 100;
    const totalAmount = subtotal + taxAmount + serviceCharge - discountAmount;
    const orderNumber = `ORD-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`;

    // Create order and update table/coupon in parallel
    const [order] = await Promise.all([
      prisma.order.create({
        data: {
          restaurantId, tableId, orderNumber,
          guestName: dto.guestName, guestPhone: dto.guestPhone, guestCount: dto.guestCount || 1,
          specialInstructions: dto.specialInstructions,
          subtotal, taxAmount, serviceCharge, discountAmount, totalAmount,
          couponId, couponCode: dto.couponCode,
          items: { create: orderItems },
        },
        include: { items: { include: { menuItem: true } }, table: true },
      }),
      prisma.table.update({ where: { id: tableId }, data: { status: 'occupied' } }),
      couponId ? prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } }) : Promise.resolve(),
    ]);

    return success(order, 201);
  } catch (err: any) {
    console.error('Create order error:', err);
    return error(err.message || 'Failed to create order', 500);
  }
};
