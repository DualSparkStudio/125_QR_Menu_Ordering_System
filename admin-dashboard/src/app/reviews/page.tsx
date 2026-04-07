'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';

export default function ReviewsPage() {
  const { staff, token } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!staff?.restaurantId || !token) return;
    Promise.all([
      adminApi.getReviews(staff.restaurantId, token),
      adminApi.getReviewStats(staff.restaurantId, token),
    ]).then(([r, s]: any) => {
      setReviews(r);
      setStats(s);
    }).finally(() => setLoading(false));
  }, [staff, token]);

  const Stars = ({ rating }: { rating: number }) => (
    <span>{[1,2,3,4,5].map((n) => <span key={n} className={n <= rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>)}</span>
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h1>

        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="stat-card text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500 mt-1">Total Reviews</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-3xl font-bold text-yellow-500">{stats.avgFood}</p>
              <p className="text-sm text-gray-500 mt-1">Food Rating</p>
              <Stars rating={Math.round(stats.avgFood)} />
            </div>
            <div className="stat-card text-center">
              <p className="text-3xl font-bold text-blue-500">{stats.avgService}</p>
              <p className="text-sm text-gray-500 mt-1">Service Rating</p>
              <Stars rating={Math.round(stats.avgService)} />
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><div className="text-4xl mb-2">⭐</div><p>No reviews yet</p></div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{review.guestName || 'Anonymous'}</p>
                    <p className="text-xs text-gray-400">Order #{review.order?.orderNumber} · Table {review.order?.table?.tableNumber} · {new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm"><span className="text-gray-500">Food: </span><Stars rating={review.foodRating} /></div>
                    <div className="text-sm"><span className="text-gray-500">Service: </span><Stars rating={review.serviceRating} /></div>
                  </div>
                </div>
                {review.comment && <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mt-2">"{review.comment}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
