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
  const { cart, updateQuantity, clearCart, getTotal, tableId, restaurantId } = useCartStore();
  const { restaurant } = useRestaurantStore();
  const { setCurrentOrder } = useOrderStore();

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pay_now' | 'pay_later'>('pay_now');
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
      setCouponDiscount(result.discount); setCouponApplied(true);
    } catch (e: any) { setCouponError(e.message); setCouponDiscount(0); setCouponApplied(false); }
  };

  const createPayload = () => ({
    items: cart.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
    guestName: guestName || undefined, guestPhone: guestPhone || undefined, guestCount,
    specialInstructions: instructions || undefined,
    couponCode: couponApplied ? couponCode : undefined,
  });

  const handlePayLater = async () => {
    if (!tableId || !restaurantId) { setError('Session expired. Please scan QR again.'); return; }
    setLoading(true); setError('');
    try {
      const order: any = await api.createOrder(restaurantId, tableId, createPayload());
      setCurrentOrder(order); clearCart(); router.push(`/orders/${order.id}?new=1`);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const handleRazorpay = async () => {
    if (!tableId || !restaurantId) { setError('Session expired. Please scan QR again.'); return; }
    setLoading(true); setError('');
    try {
      const order: any = await api.createOrder(restaurantId, tableId, createPayload());
      const rzpOrder: any = await api.createRazorpayOrder(order.id);

      if (rzpOrder.isTestMode) {
        await api.verifyRazorpayPayment({ paymentId: rzpOrder.paymentId, razorpayPaymentId: `pay_test_${Date.now()}`, razorpaySignature: 'test_signature' });
        setCurrentOrder(order); clearCart(); router.push(`/orders/${order.id}?new=1&paid=1`);
        return;
      }

      const options = {
        key: rzpOrder.key, amount: Math.round(order.totalAmount * 100), currency,
        name: restaurant?.name, description: `Order #${order.orderNumber}`,
        order_id: rzpOrder.razorpayOrderId,
        prefill: { name: guestName, contact: guestPhone },
        theme: { color: '#f97316' },
        modal: { ondismiss: () => { setLoading(false); setCurrentOrder(order); clearCart(); router.push(`/orders/${order.id}?new=1`); } },
        handler: async (response: any) => {
          try {
            await api.verifyRazorpayPayment({ paymentId: rzpOrder.paymentId, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature });
            setCurrentOrder(order); clearCart(); router.push(`/orders/${order.id}?new=1&paid=1`);
          } catch { setCurrentOrder(order); clearCart(); router.push(`/orders/${order.id}?new=1`); }
        },
      };
      new window.Razorpay(options).open();
    } catch (e: any) { setError(e.message); setLoading(false); }
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

        {/* Guest details */}
        <Section title="Your Details">
          <div className="space-y-3">
            <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name (optional)" className="input-field" />
            <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="Phone for order updates (optional)" type="tel" className="input-field" />
            <div className="flex items-center gap-4">
              <span className="text-stone-400 text-sm font-medium">Guests</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="qty-btn bg-orange-50 text-orange-500 border border-orange-200">−</button>
                <span className="font-black text-stone-900 w-5 text-center">{guestCount}</span>
                <button onClick={() => setGuestCount(guestCount + 1)} className="qty-btn bg-orange-500 text-white">+</button>
              </div>
            </div>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Special instructions, allergies..." rows={2} className="input-field resize-none" />
          </div>
        </Section>

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

        {/* Payment method */}
        <Section title="Payment Method">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'pay_now', icon: '💳', label: 'Pay Now', sub: 'UPI, Card, Netbanking' },
              { key: 'pay_later', icon: '🧾', label: 'Pay at Table', sub: 'Cash or card later' },
            ].map((pm) => (
              <button key={pm.key} onClick={() => setPaymentMethod(pm.key as any)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === pm.key ? 'border-orange-500 bg-orange-50' : 'border-stone-200 bg-white hover:border-orange-300'}`}>
                <div className="text-2xl mb-2">{pm.icon}</div>
                <p className="font-bold text-stone-900 text-sm">{pm.label}</p>
                <p className="text-stone-400 text-xs mt-0.5">{pm.sub}</p>
                {pm.key === 'pay_now' && paymentMethod === 'pay_now' && (
                  <p className="text-orange-500 text-xs font-semibold mt-1.5">via Razorpay</p>
                )}
              </button>
            ))}
          </div>
        </Section>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 text-sm flex items-start gap-2"><span>⚠️</span><span>{error}</span></div>}
      </div>

      {/* Place order */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-orange-100 p-4">
        <div className="max-w-2xl mx-auto space-y-2">
          <div className="flex items-center justify-between text-sm px-1">
            <span className="text-stone-400">{cart.reduce((s, i) => s + i.quantity, 0)} items · {paymentMethod === 'pay_now' ? '💳 Pay Now' : '🧾 Pay at Table'}</span>
            <span className="text-orange-500 font-black text-lg">{currency} {total.toFixed(0)}</span>
          </div>
          <button onClick={paymentMethod === 'pay_now' ? handleRazorpay : handlePayLater} disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-3 text-lg disabled:opacity-60">
            {loading ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Processing...</span></> :
              <span>{paymentMethod === 'pay_now' ? '💳 Pay & Order' : '🍽️ Place Order'}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
