'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useRestaurantStore } from '@/store/restaurantStore';
import { useOrderStore } from '@/store/orderStore';
import { api } from '@/lib/api';
import Link from 'next/link';

declare global {
  interface Window { Razorpay: any; }
}

type PaymentMethod = 'pay_now' | 'pay_later';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pay_now');
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
      setCouponApplied(true);
    } catch (e: any) {
      setCouponError(e.message);
      setCouponDiscount(0);
      setCouponApplied(false);
    }
  };

  const createOrderPayload = () => ({
    items: cart.map((item) => ({ menuItemId: item.id, quantity: item.quantity })),
    guestName: guestName || undefined,
    guestPhone: guestPhone || undefined,
    guestCount,
    specialInstructions: instructions || undefined,
    couponCode: couponApplied ? couponCode : undefined,
  });

  const handlePayLater = async () => {
    if (!tableId || !restaurantId) { setError('Session expired. Please scan QR again.'); return; }
    setLoading(true);
    setError('');
    try {
      const order: any = await api.createOrder(restaurantId, tableId, createOrderPayload());
      setCurrentOrder(order);
      clearCart();
      router.push(`/orders/${order.id}?new=1`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpay = async () => {
    if (!tableId || !restaurantId) { setError('Session expired. Please scan QR again.'); return; }
    setLoading(true);
    setError('');

    try {
      // 1. Create order in DB
      const order: any = await api.createOrder(restaurantId, tableId, createOrderPayload());

      // 2. Create Razorpay payment order
      const rzpOrder: any = await api.createRazorpayOrder(order.id);

      // 3a. Test/dev mode — simulate payment without real Razorpay
      if (rzpOrder.isTestMode) {
        await api.verifyRazorpayPayment({
          paymentId: rzpOrder.paymentId,
          razorpayPaymentId: `pay_test_${Date.now()}`,
          razorpaySignature: 'test_signature',
        });
        setCurrentOrder(order);
        clearCart();
        router.push(`/orders/${order.id}?new=1&paid=1`);
        return;
      }

      // 3b. Live mode — open real Razorpay checkout
      const options = {
        key: rzpOrder.key,
        amount: Math.round(order.totalAmount * 100),
        currency: rzpOrder.currency || currency,
        name: restaurant?.name || 'Restaurant',
        description: `Order #${order.orderNumber}`,
        order_id: rzpOrder.razorpayOrderId,
        prefill: { name: guestName || '', contact: guestPhone || '' },
        theme: { color: '#f97316' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setCurrentOrder(order);
            clearCart();
            router.push(`/orders/${order.id}?new=1`);
          },
        },
        handler: async (response: any) => {
          try {
            await api.verifyRazorpayPayment({
              paymentId: rzpOrder.paymentId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setCurrentOrder(order);
            clearCart();
            router.push(`/orders/${order.id}?new=1&paid=1`);
          } catch {
            setCurrentOrder(order);
            clearCart();
            router.push(`/orders/${order.id}?new=1`);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'pay_now') handleRazorpay();
    else handlePayLater();
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen hero-bg flex flex-col items-center justify-center p-6">
        <div className="text-center glass rounded-3xl p-10 max-w-sm w-full">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-black text-white mb-2">Cart is empty</h2>
          <p className="text-white/40 mb-6 text-sm">Add some delicious items from the menu</p>
          <Link href="/menu" className="block w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3.5 rounded-2xl text-center">
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-44">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/menu" className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/60">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="font-black text-white text-xl">Your Order</h1>
          <span className="ml-auto text-white/30 text-sm">{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Cart items */}
        <div className="glass rounded-3xl overflow-hidden">
          {cart.map((item, idx) => (
            <div key={item.id} className={`flex items-center gap-3 p-4 ${idx < cart.length - 1 ? 'border-b border-white/5' : ''}`}>
              {item.image
                ? <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                : <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">🍽️</div>
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={item.isVegetarian ? 'veg-dot' : 'non-veg-dot'} />
                  <span className="font-semibold text-white text-sm truncate">{item.name}</span>
                </div>
                <span className="text-orange-400 font-bold text-sm">{currency} {(item.basePrice * item.quantity).toFixed(0)}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn bg-white/10 text-white">−</button>
                <span className="w-6 text-center font-black text-white text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn bg-orange-500 text-white">+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Guest details */}
        <div className="glass rounded-3xl p-5 space-y-3">
          <h3 className="font-bold text-white/50 text-xs uppercase tracking-wider">Your Details</h3>
          <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name (optional)" className="input-dark text-sm" />
          <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="Phone for updates (optional)" type="tel" className="input-dark text-sm" />
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-sm">Guests</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="qty-btn bg-white/10 text-white">−</button>
              <span className="font-black text-white w-5 text-center">{guestCount}</span>
              <button onClick={() => setGuestCount(guestCount + 1)} className="qty-btn bg-orange-500 text-white">+</button>
            </div>
          </div>
          <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Special instructions, allergies..." rows={2} className="input-dark text-sm resize-none" />
        </div>

        {/* Coupon */}
        <div className="glass rounded-3xl p-5">
          <h3 className="font-bold text-white/50 text-xs uppercase tracking-wider mb-3">Coupon Code</h3>
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponDiscount(0); setCouponApplied(false); setCouponError(''); }}
              placeholder="e.g. WELCOME20"
              className="input-dark flex-1 font-mono text-sm tracking-widest"
            />
            <button onClick={applyCoupon} className="bg-white/10 hover:bg-white/15 text-white font-bold px-5 rounded-2xl text-sm border border-white/10 transition-all">
              Apply
            </button>
          </div>
          {couponError && <p className="text-red-400 text-xs mt-2">{couponError}</p>}
          {couponApplied && (
            <div className="flex items-center gap-2 mt-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
              <span className="text-green-400 text-sm">🎉</span>
              <p className="text-green-400 text-xs font-semibold">Saving {currency} {couponDiscount.toFixed(0)}!</p>
            </div>
          )}
        </div>

        {/* Bill summary */}
        <div className="glass rounded-3xl p-5 space-y-3">
          <h3 className="font-bold text-white/50 text-xs uppercase tracking-wider">Bill Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-white/50">Subtotal</span><span className="text-white">{currency} {subtotal.toFixed(0)}</span></div>
            {tax > 0 && <div className="flex justify-between text-sm"><span className="text-white/50">Tax ({restaurant?.taxPercentage}%)</span><span className="text-white">{currency} {tax.toFixed(0)}</span></div>}
            {serviceCharge > 0 && <div className="flex justify-between text-sm"><span className="text-white/50">Service Charge</span><span className="text-white">{currency} {serviceCharge.toFixed(0)}</span></div>}
            {couponDiscount > 0 && <div className="flex justify-between text-sm"><span className="text-green-400">Discount</span><span className="text-green-400">− {currency} {couponDiscount.toFixed(0)}</span></div>}
          </div>
          <div className="border-t border-white/8 pt-3 flex justify-between items-center">
            <span className="font-bold text-white text-base">Total</span>
            <span className="font-black text-orange-400 text-2xl">{currency} {total.toFixed(0)}</span>
          </div>
        </div>

        {/* Payment method */}
        <div className="glass rounded-3xl p-5">
          <h3 className="font-bold text-white/50 text-xs uppercase tracking-wider mb-3">Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('pay_now')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'pay_now' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}
            >
              <div className="text-2xl mb-2">💳</div>
              <p className="font-bold text-white text-sm">Pay Now</p>
              <p className="text-white/40 text-xs mt-0.5">UPI, Card, Netbanking</p>
              {paymentMethod === 'pay_now' && (
                <div className="mt-2 flex items-center gap-1">
                  <img src="https://razorpay.com/favicon.ico" alt="Razorpay" className="w-3 h-3" />
                  <span className="text-orange-400 text-xs font-medium">via Razorpay</span>
                </div>
              )}
            </button>
            <button
              onClick={() => setPaymentMethod('pay_later')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'pay_later' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}
            >
              <div className="text-2xl mb-2">🧾</div>
              <p className="font-bold text-white text-sm">Pay at Table</p>
              <p className="text-white/40 text-xs mt-0.5">Cash or card on delivery</p>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Place order CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 p-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Order summary strip */}
          <div className="flex items-center justify-between text-sm px-1">
            <span className="text-white/40">{cart.reduce((s, i) => s + i.quantity, 0)} items · {paymentMethod === 'pay_now' ? '💳 Pay Now' : '🧾 Pay at Table'}</span>
            <span className="text-orange-400 font-black text-lg">{currency} {total.toFixed(0)}</span>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black py-4 rounded-2xl text-lg shadow-2xl shadow-orange-500/30 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>{paymentMethod === 'pay_now' ? 'Opening Payment...' : 'Placing Order...'}</span>
              </>
            ) : (
              <>
                <span>{paymentMethod === 'pay_now' ? '💳 Pay & Order' : '🍽️ Place Order'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
