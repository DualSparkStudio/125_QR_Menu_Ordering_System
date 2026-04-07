import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async createOrder(restaurantId: string, tableId: string, dto: CreateOrderDto) {
    const [table, restaurant] = await Promise.all([
      this.prisma.table.findUnique({ where: { id: tableId } }),
      this.prisma.restaurant.findUnique({ where: { id: restaurantId } }),
    ]);

    if (!table || table.restaurantId !== restaurantId) throw new NotFoundException('Table not found');
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (!restaurant.isOpen) throw new BadRequestException('Restaurant is currently closed');

    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: dto.items.map((i) => i.menuItemId) }, restaurantId, isAvailable: true },
    });

    if (menuItems.length !== dto.items.length) throw new BadRequestException('Some items are unavailable');

    let subtotal = 0;
    const orderItems = dto.items.map((item) => {
      const mi = menuItems.find((m) => m.id === item.menuItemId)!;
      subtotal += mi.basePrice * item.quantity;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: mi.basePrice,
        selectedVariants: item.selectedVariants ? JSON.stringify(item.selectedVariants) : null,
        specialInstructions: item.specialInstructions,
      };
    });

    // Apply coupon
    let discountAmount = dto.discountAmount || 0;
    let couponId: string | undefined;
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findFirst({
        where: { restaurantId, code: dto.couponCode, isActive: true },
      });
      if (coupon) {
        if (!coupon.expiresAt || coupon.expiresAt > new Date()) {
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
    }

    const taxAmount = (subtotal * restaurant.taxPercentage) / 100;
    const serviceCharge = (subtotal * restaurant.serviceChargePercentage) / 100;
    const totalAmount = subtotal + taxAmount + serviceCharge - discountAmount;
    const orderNumber = `ORD-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`;

    const order = await this.prisma.order.create({
      data: {
        restaurantId, tableId, orderNumber,
        guestName: dto.guestName, guestPhone: dto.guestPhone, guestCount: dto.guestCount || 1,
        specialInstructions: dto.specialInstructions,
        subtotal, taxAmount, serviceCharge, discountAmount, totalAmount,
        couponId, couponCode: dto.couponCode,
        items: { create: orderItems },
      },
      include: { items: { include: { menuItem: true } }, table: true },
    });

    // Update coupon usage
    if (couponId) {
      await this.prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
    }

    // Update table status
    await this.prisma.table.update({ where: { id: tableId }, data: { status: 'occupied' } });

    // Cache order
    await this.redis.set(`order:${order.id}`, JSON.stringify(order), 86400);

    // Publish event
    await this.redis.publish(`restaurant:${restaurantId}`, JSON.stringify({ event: 'order_placed', data: order }));

    return order;
  }

  async findAll(restaurantId: string, filters?: { status?: string; tableId?: string; date?: string }) {
    const where: any = { restaurantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.tableId) where.tableId = filters.tableId;
    if (filters?.date) {
      const d = new Date(filters.date);
      where.createdAt = { gte: d, lt: new Date(d.getTime() + 86400000) };
    }

    return this.prisma.order.findMany({
      where,
      include: {
        items: { include: { menuItem: { select: { id: true, name: true, image: true } } } },
        table: { select: { id: true, tableNumber: true, section: true } },
        payment: { select: { id: true, status: true, paymentMethod: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { menuItem: { include: { variants: true } } } },
        table: true,
        payment: true,
        review: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.findById(id);

    const updates: any = { status: dto.status };
    if (dto.status === 'served') updates.servedAt = new Date();
    if (dto.status === 'completed') updates.completedAt = new Date();
    if (dto.status === 'cancelled') {
      updates.cancelledAt = new Date();
      // Free up table if no other active orders
      const activeOrders = await this.prisma.order.count({
        where: { tableId: order.tableId, status: { in: ['pending', 'confirmed', 'preparing', 'ready', 'served'] } },
      });
      if (activeOrders <= 1) {
        await this.prisma.table.update({ where: { id: order.tableId }, data: { status: 'available' } });
      }
    }

    const updated = await this.prisma.order.update({ where: { id }, data: updates });

    await this.redis.publish(`restaurant:${order.restaurantId}`, JSON.stringify({ event: 'order_updated', data: updated }));

    return updated;
  }

  async getActiveOrdersForTable(tableId: string) {
    return this.prisma.order.findMany({
      where: { tableId, status: { in: ['pending', 'confirmed', 'preparing', 'ready', 'served'] } },
      include: { items: { include: { menuItem: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
