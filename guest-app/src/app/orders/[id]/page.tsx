'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'];
const STATUS_LABELS: Record<string, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
const STATUS_ICONS: Record<string, string> = {
  pending: '📋', confirmed: '✅', preparing: '👨‍🍳', ready: '🔔', served: '🍽️', completed: '⭐', cancelled: '❌',
};

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({ foodRating: 5, serviceRating: 5, comment: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data: any = await api.getOrder(id);
        setOrder(data);
      } catch {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [id]);

  const submitReview = async () => {
    if (!order) return;
    try {
      await api.submitReview(order.restaurantId, order.id, { ...review, guestName: order.guestName });
      setReviewSubmitted(true);
      setShowReview(false);
    } catch {}
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return null;

  const stepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/menu" className="text-gray-500">←</Link>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-sm text-gray-500">Table {order.table?.tableNumber}</p>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4 space-y-4">
          {/* Status */}
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{STATUS_ICONS[order.status]}</span>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{STATUS_LABELS[order.status]}</h2>
                <p className="text-sm text-gray-500">
                  {order.status === 'preparing' ? 'Your food is being prepared' :
                   order.status === 'ready' ? 'Your order is ready!' :
                   order.status === 'served' ? 'Enjoy your meal!' :
                   order.status === 'completed' ? 'Thank you for dining with us!' :
                   'We received your order'}
                </p>
              </div>
            </div>

            {order.status !== 'cancelled' && (
              <div className="flex items-center gap-1">
                {STATUS_STEPS.slice(0, -1).map((step, i) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i <= stepIndex ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {i < stepIndex ? '✓' : i + 1}
                    </div>
                    {i < STATUS_STEPS.length - 2 && <div className={`flex-1 h-1 mx-1 rounded ${i < stepIndex ? 'bg-orange-500' : 'bg-gray-200'}`} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="card divide-y divide-gray-100">
            <div className="p-4 font-semibold text-gray-900">Order Items</div>
            {order.items.map((item: any) => (
              <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">{item.menuItem?.name}</span>
                  {item.specialInstructions && <p className="text-xs text-gray-400 mt-0.5">{item.specialInstructions}</p>}
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">×{item.quantity}</span>
                  <p className="text-sm font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bill */}
          <div className="card p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 mb-2">Bill</h3>
            <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>₹{order.subtotal.toFixed(2)}</span></div>
            {order.taxAmount > 0 && <div className="flex justify-between text-sm text-gray-600"><span>Tax</span><span>₹{order.taxAmount.toFixed(2)}</span></div>}
            {order.serviceCharge > 0 && <div className="flex justify-between text-sm text-gray-600"><span>Service Charge</span><span>₹{order.serviceCharge.toFixed(2)}</span></div>}
            {order.discountAmount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>−₹{order.discountAmount.toFixed(2)}</span></div>}
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900"><span>Total</span><span>₹{order.totalAmount.toFixed(2)}</span></div>
            <div className={`text-xs px-2 py-1 rounded-full inline-block font-medium ${order.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              Payment: {order.paymentStatus}
            </div>
          </div>

          {/* Review */}
          {order.status === 'completed' && !reviewSubmitted && !order.review && (
            <div className="card p-4">
              {!showReview ? (
                <button onClick={() => setShowReview(true)} className="btn-primary w-full">⭐ Rate Your Experience</button>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">How was your experience?</h3>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Food Quality</label>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map((n) => (
                        <button key={n} onClick={() => setReview((r) => ({ ...r, foodRating: n }))} className={`text-2xl ${n <= review.foodRating ? 'opacity-100' : 'opacity-30'}`}>⭐</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Service</label>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map((n) => (
                        <button key={n} onClick={() => setReview((r) => ({ ...r, serviceRating: n }))} className={`text-2xl ${n <= review.serviceRating ? 'opacity-100' : 'opacity-30'}`}>⭐</button>
                      ))}
                    </div>
                  </div>
                  <textarea value={review.comment} onChange={(e) => setReview((r) => ({ ...r, comment: e.target.value }))} placeholder="Any comments?" rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                  <button onClick={submitReview} className="btn-primary w-full">Submit Review</button>
                </div>
              )}
            </div>
          )}

          {reviewSubmitted && (
            <div className="card p-4 text-center text-green-600 font-medium">✓ Thank you for your review!</div>
          )}

          <Link href="/menu" className="btn-secondary w-full text-center block">Order More</Link>
        </div>
      </div>
    </div>
  );
}
