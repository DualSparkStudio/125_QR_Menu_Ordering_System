'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

const STEPS = [
  { key: 'pending',   label: 'Order Placed',  icon: '📋', desc: 'We received your order' },
  { key: 'confirmed', label: 'Confirmed',      icon: '✅', desc: 'Kitchen is on it' },
  { key: 'preparing', label: 'Preparing',      icon: '👨‍🍳', desc: 'Being cooked fresh' },
  { key: 'ready',     label: 'Ready',          icon: '🔔', desc: 'On its way to you' },
  { key: 'served',    label: 'Served',         icon: '🍽️', desc: 'Enjoy your meal!' },
];

function Confetti() {
  const pieces = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      size: Math.random() * 6 + 4,
      color: ['#f97316','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#ef4444'][Math.floor(Math.random() * 7)],
      rotation: Math.random() * 360,
    }))
  );

  return (
    <>
      <style>{`
        @keyframes fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {pieces.current.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: '-20px',
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              animation: `fall ${1.5 + Math.random()}s ${p.delay}s ease-in forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
}

function OrderContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isNew = searchParams.get('new') === '1';
  const isPaid = searchParams.get('paid') === '1';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({ foodRating: 5, serviceRating: 5, comment: '' });
  const [reviewDone, setReviewDone] = useState(false);
  const [showCelebration, setShowCelebration] = useState(isNew);

  useEffect(() => {
    const load = async () => {
      try {
        const data: any = await api.getOrder(id);
        setOrder(data);
        if (isNew) setShowConfetti(true);
      } catch {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    load();
    // Poll for status updates every 10s
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (showConfetti) {
      const t = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(t);
    }
  }, [showConfetti]);

  useEffect(() => {
    if (showCelebration) {
      const t = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showCelebration]);

  const submitReview = async () => {
    if (!order) return;
    try {
      await api.submitReview(order.restaurantId, order.id, { ...review, guestName: order.guestName });
      setReviewDone(true);
      setShowReview(false);
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-orange-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-white/40 text-sm">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const stepIndex = STEPS.findIndex((s) => s.key === order.status);
  const currentStep = STEPS[Math.max(0, stepIndex)];
  const isCancelled = order.status === 'cancelled';
  const isCompleted = order.status === 'completed';
  const isPaidOrder = order.paymentStatus === 'completed';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {showConfetti && <Confetti />}

      {/* celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowCelebration(false)}>
          <div className="text-center bounce-in px-6">
            <div className="text-8xl mb-6 animate-bounce">🎉</div>
            <h1 className="text-4xl font-black text-white mb-3">Order Placed!</h1>
            <p className="text-white/60 text-lg mb-2">
              {isPaid ? '✅ Payment successful!' : 'Your order is confirmed'}
            </p>
            <p className="text-white/30 text-sm">Tap anywhere to continue</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/menu" className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/60">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="font-black text-white text-lg leading-tight">#{order.orderNumber}</h1>
            <p className="text-white/30 text-xs">Table {order.table?.tableNumber} · {order.table?.section}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isPaidOrder && (
              <span className="bg-green-500/15 text-green-400 text-xs font-bold px-2.5 py-1 rounded-full border border-green-500/20">✓ Paid</span>
            )}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              isCancelled ? 'bg-red-500/15 text-red-400' :
              isCompleted ? 'bg-green-500/15 text-green-400' :
              'bg-orange-500/15 text-orange-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isCancelled ? 'bg-red-400' : isCompleted ? 'bg-green-400' : 'bg-orange-400 pulse-dot'}`} />
              {order.status}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 pb-10 space-y-4">

        {/* ── Confirmation banner (new orders) ── */}
        {isNew && !isCancelled && (
          <div className="relative overflow-hidden glass rounded-3xl p-6 text-center border border-orange-500/25 slide-up">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/5" />
            <div className="relative">
              <div className="text-5xl mb-3">{isPaid ? '🎊' : '🎉'}</div>
              <h2 className="text-2xl font-black text-white mb-1">
                {isPaid ? 'Payment Successful!' : 'Order Confirmed!'}
              </h2>
              <p className="text-white/50 text-sm">
                {isPaid
                  ? `₹${order.totalAmount.toFixed(0)} paid · Your food is being prepared`
                  : 'Sit back and relax — your order is in the kitchen'}
              </p>
              {isPaid && (
                <div className="mt-3 inline-flex items-center gap-2 bg-green-500/15 border border-green-500/20 rounded-full px-4 py-1.5">
                  <span className="text-green-400 text-sm">✓</span>
                  <span className="text-green-400 text-xs font-semibold">Payment verified by Razorpay</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Live status tracker ── */}
        {!isCancelled && (
          <div className="glass rounded-3xl p-5 slide-up">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                {currentStep.icon}
              </div>
              <div>
                <h3 className="font-black text-white text-xl">{currentStep.label}</h3>
                <p className="text-white/40 text-sm">{currentStep.desc}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-white/20 text-xs">Est. time</p>
                <p className="text-orange-400 font-bold text-sm">
                  {order.status === 'pending' ? '~20 min' :
                   order.status === 'confirmed' ? '~15 min' :
                   order.status === 'preparing' ? '~10 min' :
                   order.status === 'ready' ? '~2 min' : '—'}
                </p>
              </div>
            </div>

            {/* Step progress */}
            <div className="flex items-center gap-0">
              {STEPS.map((step, i) => (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500 ${
                      i < stepIndex  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' :
                      i === stepIndex ? 'bg-orange-500 text-white ring-4 ring-orange-500/20 shadow-lg shadow-orange-500/30' :
                      'bg-white/8 text-white/20'
                    }`}>
                      {i < stepIndex ? '✓' : <span className="text-base">{step.icon}</span>}
                    </div>
                    <span className={`text-[10px] font-semibold text-center leading-tight ${i <= stepIndex ? 'text-orange-400' : 'text-white/15'}`}>
                      {step.label.split(' ')[0]}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-4 mx-1 rounded-full transition-all duration-700 ${i < stepIndex ? 'bg-orange-500' : 'bg-white/8'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="glass rounded-3xl p-6 text-center border border-red-500/20">
            <div className="text-5xl mb-3">❌</div>
            <h3 className="font-black text-white text-xl mb-1">Order Cancelled</h3>
            <p className="text-white/40 text-sm">Please contact staff for assistance</p>
          </div>
        )}

        {/* ── Order items ── */}
        <div className="glass rounded-3xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-white/50 text-xs uppercase tracking-wider">Order Items</h3>
            <span className="text-white/30 text-xs">{order.items?.length} items</span>
          </div>
          {order.items?.map((item: any, idx: number) => (
            <div key={item.id} className={`flex items-center gap-3 px-5 py-3.5 ${idx < order.items.length - 1 ? 'border-b border-white/5' : ''}`}>
              {item.menuItem?.image
                ? <img src={item.menuItem.image} alt={item.menuItem.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                : <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">🍽️</div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{item.menuItem?.name}</p>
                {item.specialInstructions && <p className="text-white/30 text-xs mt-0.5">{item.specialInstructions}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white/40 text-xs">×{item.quantity}</p>
                <p className="text-orange-400 font-bold text-sm">₹{(item.price * item.quantity).toFixed(0)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bill ── */}
        <div className="glass rounded-3xl p-5">
          <h3 className="font-bold text-white/50 text-xs uppercase tracking-wider mb-4">Bill</h3>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm"><span className="text-white/50">Subtotal</span><span className="text-white">₹{order.subtotal?.toFixed(0)}</span></div>
            {order.taxAmount > 0 && <div className="flex justify-between text-sm"><span className="text-white/50">Tax</span><span className="text-white">₹{order.taxAmount?.toFixed(0)}</span></div>}
            {order.serviceCharge > 0 && <div className="flex justify-between text-sm"><span className="text-white/50">Service Charge</span><span className="text-white">₹{order.serviceCharge?.toFixed(0)}</span></div>}
            {order.discountAmount > 0 && <div className="flex justify-between text-sm"><span className="text-green-400">Discount</span><span className="text-green-400">−₹{order.discountAmount?.toFixed(0)}</span></div>}
          </div>
          <div className="border-t border-white/8 mt-3 pt-3 flex justify-between items-center">
            <span className="font-bold text-white">Total</span>
            <span className="font-black text-orange-400 text-2xl">₹{order.totalAmount?.toFixed(0)}</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              isPaidOrder ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
            }`}>
              {isPaidOrder ? '✓ Paid via Razorpay' : '⏳ Pay at table'}
            </div>
          </div>
        </div>

        {/* ── Review ── */}
        {isCompleted && !reviewDone && !order.review && (
          <div className="glass rounded-3xl p-5 border border-amber-500/20">
            {!showReview ? (
              <div className="text-center">
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="font-black text-white text-lg mb-1">How was your meal?</h3>
                <p className="text-white/40 text-sm mb-4">Your feedback means a lot to us</p>
                <button onClick={() => setShowReview(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-8 py-3 rounded-2xl active:scale-95 transition-all">
                  Rate Your Experience
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-bold text-white text-center">Rate Your Experience</h3>
                {[['foodRating', '🍽️ Food Quality'], ['serviceRating', '🙋 Service']] .map(([key, label]) => (
                  <div key={key}>
                    <p className="text-white/50 text-sm mb-2">{label}</p>
                    <div className="flex gap-3">
                      {[1,2,3,4,5].map((n) => (
                        <button key={n} onClick={() => setReview((r) => ({ ...r, [key]: n }))}
                          className={`text-3xl transition-all active:scale-90 ${n <= (review as any)[key] ? 'opacity-100' : 'opacity-20'}`}>⭐</button>
                      ))}
                    </div>
                  </div>
                ))}
                <textarea value={review.comment} onChange={(e) => setReview((r) => ({ ...r, comment: e.target.value }))} placeholder="Any comments? (optional)" rows={2} className="input-dark text-sm resize-none" />
                <div className="flex gap-2">
                  <button onClick={() => setShowReview(false)} className="flex-1 bg-white/8 text-white/60 font-semibold py-3 rounded-2xl text-sm">Cancel</button>
                  <button onClick={submitReview} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 rounded-2xl text-sm">Submit</button>
                </div>
              </div>
            )}
          </div>
        )}

        {reviewDone && (
          <div className="glass rounded-3xl p-5 text-center border border-green-500/20 bounce-in">
            <div className="text-3xl mb-2">🙏</div>
            <p className="text-green-400 font-bold">Thank you for your review!</p>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          <Link href="/menu" className="glass border border-white/10 text-white font-bold py-4 rounded-2xl text-center text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2">
            <span>🍽️</span> Order More
          </Link>
          <Link href="/waiter" className="glass border border-white/10 text-white font-bold py-4 rounded-2xl text-center text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2">
            <span>🔔</span> Call Waiter
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen hero-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OrderContent />
    </Suspense>
  );
}
