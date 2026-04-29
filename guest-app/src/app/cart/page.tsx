'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useRestaurantStore } from '@/store/restaurantStore';
import { useOrderStore } from '@/store/orderStore';
import { api } from '@/lib/api';
import Link from 'next/link';

declare global { interface Window { Razorpay: any; } }

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, clearCart, getTotal, tableId, restaurantId, setActiveSession } = useCartStore();
  const { restaurant } = useRestaurantStore();
  const { setCurrentOrder } = useOrderStore();

  const [instructions, setInstructions] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMergeNotice, setShowMergeNotice] = useState(false);

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
      setCouponDiscount(result.discount); setCouponApplied(true);
    } catch (e: any) { setCouponError(e.message); setCouponDiscount(0); setCouponApplied(false); }
  };

  const createPayload = () => ({
    items: cart.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
    guestCount: 1,
    specialInstructions: instructions || undefined,
    couponCode: couponApplied ? couponCode : undefined,
  });

  const handlePayLater = async () => {
    if (!tableId || !restaurantId) { setError('Session expired. Please scan QR again.'); return; }
    setLoading(true); setError('');
    try {
      // Check for existing active orders before placing
      const existingOrders = await api.getActiveOrders(tableId);
      const hasActiveOrder = existingOrders.length > 0;
      
      const order: any = await api.createOrder(restaurantId, tableId, createPayload());
      setCurrentOrder(order);
      setActiveSession(true); // Mark that user has placed an order
      clearCart();
      
      // Show merge notice if items were added to existing order
      if (hasActiveOrder) {
        setShowMergeNotice(true);
        setTimeout(() => setShowMergeNotice(false), 5000);
        
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Items Added!', {
            body: `Your items were added to existing order #${order.orderNumber}`,
            icon: '/icon.png',
          });
        }
        
        // Vibrate
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
      }
      
      router.push(`/orders/${order.id}?new=1`);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  if (cart.length === 0) return (
    <div className="min-h-screen hero-bg flex flex-col items-center justify-center p-6">
      <div className="card p-10 max-w-sm w-full text-center shadow-lg shadow-orange-100">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-black text-stone-900 mb-2">Cart is empty</h2>
        <p className="text-stone-400 mb-6 text-sm">Add some delicious items from the menu</p>
        <Link href="/menu" className="btn-primary block text-center">Browse Menu</Link>
      </div>
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card p-5 shadow-sm shadow-orange-50">
      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fff8f3] pb-44">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-orange-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/menu" className="w-9 h-9 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-center text-orange-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="font-black text-stone-900 text-xl">Your Order</h1>
          <span className="ml-auto text-stone-400 text-sm">{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Merge notice */}
        {showMergeNotice && (
          <div className="bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-2xl p-4 text-sm flex items-start gap-3 animate-bounce">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p className="font-bold mb-1">Items Added to Existing Order</p>
              <p className="text-xs text-blue-600">Your new items were added to your active order instead of creating a new one.</p>
            </div>
          </div>
        )}

        {/* Cart items */}
        <div className="card overflow-hidden shadow-sm shadow-orange-50">
          {cart.map((item, idx) => (
            <div key={item.id} className={`flex items-center gap-3 p-4 ${idx < cart.length - 1 ? 'border-b border-orange-50' : ''}`}>
              {item.image
                ? <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                : <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center text-2xl flex-shrink-0">🍽️</div>
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={item.isVegetarian ? 'veg-dot' : 'non-veg-dot'} />
                  <span className="font-semibold text-stone-900 text-sm truncate">{item.name}</span>
                </div>
                <span className="text-orange-500 font-bold text-sm">{currency} {(item.basePrice * item.quantity).toFixed(0)}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn bg-orange-50 text-orange-500 border border-orange-200 hover:bg-orange-100">−</button>
                <span className="w-6 text-center font-black text-stone-900 text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn bg-orange-500 text-white hover:bg-orange-600">+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <Section title="Coupon Code">
          <div className="flex gap-2">
            <input value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponDiscount(0); setCouponApplied(false); setCouponError(''); }}
              placeholder="e.g. WELCOME20" className="input-field flex-1 font-mono tracking-widest" />
            <button onClick={applyCoupon} className="btn-secondary px-5 font-bold">Apply</button>
          </div>
          {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
          {couponApplied && (
            <div className="flex items-center gap-2 mt-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              <span className="text-green-500">🎉</span>
              <p className="text-green-600 text-xs font-semibold">Saving {currency} {couponDiscount.toFixed(0)}!</p>
            </div>
          )}
        </Section>

        {/* Bill */}
        <Section title="Bill Summary">
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm"><span className="text-stone-500">Subtotal</span><span className="text-stone-900 font-medium">{currency} {subtotal.toFixed(0)}</span></div>
            {tax > 0 && <div className="flex justify-between text-sm"><span className="text-stone-500">Tax ({restaurant?.taxPercentage}%)</span><span className="text-stone-900 font-medium">{currency} {tax.toFixed(0)}</span></div>}
            {serviceCharge > 0 && <div className="flex justify-between text-sm"><span className="text-stone-500">Service Charge</span><span className="text-stone-900 font-medium">{currency} {serviceCharge.toFixed(0)}</span></div>}
            {couponDiscount > 0 && <div className="flex justify-between text-sm"><span className="text-green-600 font-semibold">Discount</span><span className="text-green-600 font-semibold">− {currency} {couponDiscount.toFixed(0)}</span></div>}
            <div className="border-t border-orange-100 pt-3 flex justify-between items-center">
              <span className="font-bold text-stone-900">Total</span>
              <span className="font-black text-orange-500 text-2xl">{currency} {total.toFixed(0)}</span>
            </div>
          </div>
        </Section>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 text-sm flex items-start gap-2"><span>⚠️</span><span>{error}</span></div>}
      </div>

      {/* Place order */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-orange-100 p-4">
        <div className="max-w-2xl mx-auto space-y-2">
          <div className="flex items-center justify-between text-sm px-1">
            <span className="text-stone-400">{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
            <span className="text-orange-500 font-black text-lg">{currency} {total.toFixed(0)}</span>
          </div>
          <button onClick={handlePayLater} disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-3 text-lg disabled:opacity-60">
            {loading ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Processing...</span></> :
              <span>🍽️ Place Order</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
