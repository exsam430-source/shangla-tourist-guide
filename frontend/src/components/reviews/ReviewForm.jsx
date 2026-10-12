import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

const ReviewForm = ({ placeId, onSuccess }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/8 text-center">
        <p className="text-gray-400 mb-3">Login to write a review</p>
        <button
          onClick={() => navigate('/login')}
          className="btn-primary rounded-xl px-6 py-2.5 text-sm"
        >
          Login to Review
        </button>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 glass rounded-2xl border border-white/10 hover:border-green-500/30 hover:bg-green-500/5 text-gray-300 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 font-medium"
      >
        <Star size={16} className="text-yellow-400" />
        Write a Review
      </button>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    if (!text.trim()) { toast.error('Please write a review'); return; }
    setIsSubmitting(true);
    try {
      await api.post('/reviews', { placeId, rating, textEn: text });
      toast.success('Review submitted! ⭐');
      setRating(0);
      setText('');
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 border border-white/8">
      <h3 className="text-lg font-bold text-white mb-4">Write a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-400 mb-2">Your Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  className={`transition-colors ${star <= (hovered || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your experience at this place..."
            className="input-field resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-3 glass rounded-xl text-gray-400 hover:text-white transition-all">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;