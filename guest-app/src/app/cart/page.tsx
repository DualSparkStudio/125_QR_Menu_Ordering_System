'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useRestaurantStore } from '@/store/restaurantStore';
import { useOrderStore } from '@/store/orderStore';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal, tableId, restaurantId } = useCartStore();
  const { restaurant } = useRestaurantStore();
  const { setCurrentOrder } = useOrderStore();

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = getTotal();
  const tax = restaurant ? (subtotal * restaurant.taxPercentage) / 100 : 0;
  const serviceCharge = restaurant ? (subtotal * restaurant.serviceChargePercentage) / 100 : 0;
  const total = subtotal + tax + serviceCharge - couponDiscount;
  const currency = restaurant?.currency || 'INR';

  const applyCoupon = async () => {
    if (!couponCode.trim() || !restaurantId) return;
    setCouponError('');
    try {
      const result: any = await api.validateCoupon(restaurantId, couponCode, subtotal);
      setCouponDiscount(result.discount);
    } catch (e: any) {
      setCouponError(e.message);
      setCouponDiscount(0);
    }
  };

  const placeOrder = async () => {
    if (!tableId || !restaurantId) { setError('Session expired. Please scan QR again.'); return; }
    if (cart.length === 0) { setError('Your cart is empty'); return; }

    setLoading(true);
    setError('');
    try {
      const order: any = await api.createOrder(restaurantId, tableId, {
        items: cart.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          selectedVariants: item.selectedVariants,
          specialInstructions: item.specialInstructions,
        })),
        guestName: guestName || undefined,
        guestPhone: guestPhone || undefined,
        guestCount,
        specialInstructions: instructions || undefined,
        couponCode: couponCode || undefined,
      });

      setCurrentOrder(order);
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some delicious items from the menu</p>
        <Link href="/menu" className="btn-primary">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
          <Link href="/menu" className="text-gray-500 hover:text-gray-700">←</Link>
          <h1 className="font-bold text-xl text-gray-900">Your Order</h1>
          <span className="ml-auto text-sm text-gray-500">{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
        </div>

        <div className="px-4 pt-4 space-y-4">
          {/* Cart items */}
          <div className="card divide-y divide-gray-100">
            {cart.map((item) => (
              <div key={item.id} className="p-4 flex items-center gap-3">
                {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={item.isVegetarian ? 'veg-dot' : 'non-veg-dot'} />
                    <span className="font-medium text-gray-900 text-sm truncate">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{currency} {(item.basePrice * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold hover:bg-gray-200">−</button>
                  <span className="w-5 text-center font-semibold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold hover:bg-orange-600">+</button>
                </div>
              </div>
            ))}
          </div>

          {/* Guest info */}
          <div className="card p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Your Details (optional)</h3>
            <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="Phone (for order updates)" type="tel" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Guests:</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center font-bold hover:bg-gray-200">−</button>
                <span className="w-6 text-center font-semibold">{guestCount}</span>
                <button onClick={() => setGuestCount(guestCount + 1)} className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold hover:bg-orange-600">+</button>
              </div>
            </div>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Special instructions (allergies, preferences...)" rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
          </div>

          {/* Coupon */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Coupon Code</h3>
            <div className="flex gap-2">
              <input value={couponCode} onChange={(e) => { setCouponCode(e.target.value); setCouponDiscount(0); setCouponError(''); }} placeholder="Enter coupon code" className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <button onClick={applyCoupon} className="btn-secondary px-4 py-2.5 text-sm">Apply</button>
            </div>
            {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
            {couponDiscount > 0 && <p className="text-green-600 text-xs mt-1">✓ Coupon applied! Saving {currency} {couponDiscount.toFixed(2)}</p>}
          </div>

          {/* Bill summary */}
          <div className="card p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 mb-3">Bill Summary</h3>
            <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{currency} {subtotal.toFixed(2)}</span></div>
            {tax > 0 && <div className="flex justify-between text-sm text-gray-600"><span>Tax ({restaurant?.taxPercentage}%)</span><span>{currency} {tax.toFixed(2)}</span></div>}
            {serviceCharge > 0 && <div className="flex justify-between text-sm text-gray-600"><span>Service Charge</span><span>{currency} {serviceCharge.toFixed(2)}</span></div>}
            {couponDiscount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>− {currency} {couponDiscount.toFixed(2)}</span></div>}
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900"><span>Total</span><span>{currency} {total.toFixed(2)}</span></div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
        </div>
      </div>

      {/* Place order button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={placeOrder} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            {loading ? 'Placing Order...' : `Place Order · ${currency} ${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
