import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class OrderController {
  constructor(private service: OrderService) {}

  // Guest: place order
  @Post('restaurants/:restaurantId/tables/:tableId/orders')
  createOrder(
    @Param('restaurantId') restaurantId: string,
    @Param('tableId') tableId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.service.createOrder(restaurantId, tableId, dto);
  }

  // Guest: get active orders for table
  @Get('tables/:tableId/orders/active')
  getActiveOrders(@Param('tableId') tableId: string) {
    return this.service.getActiveOrdersForTable(tableId);
  }

  // Admin: get all orders
  @Get('restaurants/:restaurantId/orders')
  @UseGuards(JwtAuthGuard)
  findAll(
    @Param('restaurantId') restaurantId: string,
    @Query('status') status?: string,
    @Query('tableId') tableId?: string,
    @Query('date') date?: string,
  ) {
    return this.service.findAll(restaurantId, { status, tableId, date });
  }

  // Guest: get single order by ID (no auth — order ID is unguessable)
  @Get('orders/:id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Put('orders/:id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.service.updateStatus(id, dto);
  }
}
