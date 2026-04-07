import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async createRazorpayOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { restaurant: true } });
    if (!order) throw new NotFoundException('Order not found');

    const razorpayKey = this.configService.get('RAZORPAY_KEY_ID');
    const razorpaySecret = this.configService.get('RAZORPAY_KEY_SECRET');

    const response = await axios.post(
      'https://api.razorpay.com/v1/orders',
      { amount: Math.round(order.totalAmount * 100), currency: order.restaurant.currency, receipt: order.orderNumber },
      { auth: { username: razorpayKey, password: razorpaySecret } },
    );

    const payment = await this.prisma.payment.create({
      data: {
        restaurantId: order.restaurantId,
        amount: order.totalAmount,
        currency: order.restaurant.currency,
        paymentMethod: 'razorpay',
        razorpayOrderId: response.data.id,
        status: 'pending',
      },
    });

    await this.prisma.order.update({ where: { id: orderId }, data: { paymentId: payment.id } });

    return { paymentId: payment.id, razorpayOrderId: response.data.id, amount: order.totalAmount, key: razorpayKey };
  }

  async verifyRazorpayPayment(paymentId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    const secret = this.configService.get('RAZORPAY_KEY_SECRET');
    const body = `${payment.razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (expectedSignature !== razorpaySignature) throw new BadRequestException('Invalid payment signature');

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'completed', razorpayPaymentId, completedAt: new Date() },
    });

    // Update order payment status
    const orders = await this.prisma.order.findMany({ where: { paymentId } });
    for (const order of orders) {
      await this.prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'completed', status: 'confirmed' } });
    }

    return updated;
  }

  async recordCashPayment(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { restaurant: true } });
    if (!order) throw new NotFoundException('Order not found');

    const payment = await this.prisma.payment.create({
      data: {
        restaurantId: order.restaurantId,
        amount: order.totalAmount,
        currency: order.restaurant.currency,
        paymentMethod: 'cash',
        status: 'completed',
        completedAt: new Date(),
      },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentId: payment.id, paymentStatus: 'completed', status: 'completed' },
    });

    return payment;
  }
}
