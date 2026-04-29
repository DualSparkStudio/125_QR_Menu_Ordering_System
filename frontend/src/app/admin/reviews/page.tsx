'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';

const Stars = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) => (
  <span className={size === 'lg' ? 'text-xl' : 'text-sm'}>
    {[1,2,3,4,5].map((n) => (
      <span key={n} className={n <= rating ? 'text-amber-400' : 'text-gray-200'}>★</span>
    ))}
  </span>
);

export default function ReviewsPage() {
  const { staff, token } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!staff?.restaurantId || !token) return;
    Promise.all([adminApi.getReviews(staff.restaurantId, token), adminApi.getReviewStats(staff.restaurantId, token)])
      .then(([r, s]: any) => { setReviews(r); setStats(s); })
      .finally(() => setLoading(false));
  }, [staff, token]);

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-black text-gray-900">Reviews</h1>
          <p className="text-gray-400 text-xs mt-0.5">{reviews.length} total reviews</p>
        </div>

        {stats && stats.total > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card p-5 text-center">
              <p className="text-4xl font-black text-gray-900 mb-1">{stats.total}</p>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Reviews</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-4xl font-black text-amber-500 mb-1">{stats.avgFood}</p>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Food Rating</p>
              <Stars rating={Math.round(stats.avgFood)} />
            </div>
            <div className="card p-5 text-center">
              <p className="text-4xl font-black text-blue-500 mb-1">{stats.avgService}</p>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Service Rating</p>
              <Stars rating={Math.round(stats.avgService)} />
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="card py-16 text-center">
            <div className="text-4xl mb-3">⭐</div>
            <p className="text-gray-400">No reviews yet</p>
            <p className="text-gray-300 text-sm mt-1">Reviews appear after customers complete their orders</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-white font-black">
                      {(review.guestName || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{review.guestName || 'Anonymous'}</p>
                      <p className="text-xs text-gray-400">
                        Order #{review.order?.orderNumber?.slice(-8)} · Table {review.order?.table?.tableNumber} · {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs text-gray-400">Food</span>
                      <Stars rating={review.foodRating} />
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs text-gray-400">Service</span>
                      <Stars rating={review.serviceRating} />
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 italic">
                    "{review.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
