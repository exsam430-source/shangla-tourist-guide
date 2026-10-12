import { useState } from 'react';
import { Star, ThumbsUp, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import api from '@/utils/api';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const ReviewCard = ({ review, onUpdate }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);

  const handleHelpful = async () => {
    if (!isAuthenticated) { toast.error('Please login'); return; }
    try {
      const { data } = await api.post(`/reviews/${review._id}/helpful`);
      setHelpfulCount(data.data.helpfulCount);
    } catch { /* silent */ }
  };

  return (
    <div className="glass rounded-2xl p-5 border border-white/8">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold flex-shrink-0">
          {review.user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold text-sm">{review.user?.name || 'Anonymous'}</p>
            {review.isVerified && (
              <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">✓ Verified</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={12} className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>
      </div>
      {review.textEn && (
        <p className="text-gray-300 text-sm leading-relaxed mb-3">{review.textEn}</p>
      )}
      {review.textUr && (
        <p className="text-gray-300 text-sm leading-relaxed mb-3 rtl font-urdu">{review.textUr}</p>
      )}
      <button
        onClick={handleHelpful}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors"
      >
        <ThumbsUp size={13} />
        Helpful ({helpfulCount})
      </button>
    </div>
  );
};

export default ReviewCard;