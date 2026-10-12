import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Check, X, Eye } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Loader from '@/components/common/Loader';
import { formatDate } from '@/utils/helpers';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPending = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/admin/reviews/pending');
      setReviews(data.data || []);
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleModerate = async (id, action) => {
    try {
      await api.put(`/admin/reviews/${id}/moderate`, { action });
      toast.success(`Review ${action}d`);
      fetchPending();
    } catch (err) {
      toast.error('Failed to moderate review');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Review Moderation</h1>
      <p className="text-gray-500 text-sm mb-6">{reviews.length} pending reviews</p>

      {isLoading ? <Loader text="Loading reviews..." /> : reviews.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <Star size={48} className="text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">All caught up!</h3>
          <p className="text-gray-400">No pending reviews to moderate</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6 border border-white/8"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-semibold">{review.user?.name || 'Anonymous'}</p>
                    <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />)}</div>
                  </div>
                  <p className="text-gray-500 text-xs">on <span className="text-green-400">{review.place?.nameEn}</span> • {formatDate(review.createdAt)}</p>
                </div>
              </div>

              {review.textEn && <p className="text-gray-300 text-sm mb-4 leading-relaxed">{review.textEn}</p>}
              {review.textUr && <p className="text-gray-300 text-sm mb-4 leading-relaxed rtl" dir="rtl">{review.textUr}</p>}

              <div className="flex gap-3">
                <button onClick={() => handleModerate(review._id, 'approve')} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-xl transition-all">
                  <Check size={14} /> Approve
                </button>
                <button onClick={() => handleModerate(review._id, 'reject')} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-xl border border-red-500/20 transition-all">
                  <X size={14} /> Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;