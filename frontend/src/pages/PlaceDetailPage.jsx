import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, MapPin, Mountain, Clock, Star, Navigation,
  Thermometer, Calendar, Users, Shield, Wifi, Car,
  ChevronRight, Heart, Share2, Eye
} from 'lucide-react';
import { fetchPlaceBySlug, clearCurrentPlace } from '@/store/slices/placesSlice';
import { toggleSavePlace } from '@/store/slices/authSlice';
import { toggleChat } from '@/store/slices/chatSlice';
import { getDifficultyColor, getCategoryIcon, formatDate } from '@/utils/helpers';
import Loader from '@/components/common/Loader';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewCard from '@/components/reviews/ReviewCard';
import api from '@/utils/api';
import { useState } from 'react';
import toast from 'react-hot-toast';

const PlaceDetailPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { currentPlace, isLoading, error } = useSelector((state) => state.places);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const isUrdu = i18n.language === 'ur';

  useEffect(() => {
    dispatch(fetchPlaceBySlug(slug));
    return () => dispatch(clearCurrentPlace());
  }, [slug, dispatch]);

  useEffect(() => {
    if (currentPlace?._id) {
      loadReviews();
    }
  }, [currentPlace?._id]);

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const { data } = await api.get(`/reviews/place/${currentPlace._id}`);
      setReviews(data.data || []);
    } catch {
      // silent fail
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleStartJourney = () => {
    if (!currentPlace) return;
    const { lat, lng } = currentPlace.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      toast.error('Please login to save places');
      navigate('/login');
      return;
    }
    dispatch(toggleSavePlace(currentPlace._id));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentPlace?.nameEn,
        text: currentPlace?.descriptionEn?.substring(0, 100),
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const isSaved = user?.savedPlaces?.some(
    (p) => p === currentPlace?._id || p?._id === currentPlace?._id
  );

  if (isLoading) return <Loader fullScreen text="Loading place details..." />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <Link to="/places" className="btn-primary">← Back to Places</Link>
      </div>
    </div>
  );
  if (!currentPlace) return null;

  const name = isUrdu && currentPlace.nameUr ? currentPlace.nameUr : currentPlace.nameEn;
  const description = isUrdu && currentPlace.descriptionUr ? currentPlace.descriptionUr : currentPlace.descriptionEn;

  return (
    <div className="min-h-screen pt-20 pb-16">

      {/* Back Button */}
      <div className="container-custom pt-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          {t('common.back')}
        </button>
      </div>

      {/* Image Gallery */}
      {currentPlace.images?.length > 0 && (
        <div className="container-custom mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-[300px] md:h-[450px]">
            {/* Main Image */}
            <div className="md:col-span-2 relative overflow-hidden rounded-2xl bg-gray-900">
              <img
                src={currentPlace.images[activeImage]?.url || currentPlace.images[0]?.url}
                alt={name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            {/* Thumbnails */}
            <div className="hidden md:grid grid-rows-2 gap-3">
              {currentPlace.images.slice(1, 3).map((img, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-2xl bg-gray-900 cursor-pointer"
                  onClick={() => setActiveImage(i + 1)}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </div>

          {/* Thumbnail strip */}
          {currentPlace.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {currentPlace.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-green-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Title & Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-wrap gap-2 mb-3">
                {currentPlace.category?.map((cat) => (
                  <span key={cat} className="badge-green capitalize text-xs">
                    {getCategoryIcon(cat)} {cat}
                  </span>
                ))}
                <span className={`badge text-xs capitalize ${getDifficultyColor(currentPlace.difficultyLevel)}`}>
                  {currentPlace.difficultyLevel}
                </span>
              </div>

              <h1 className={`text-3xl md:text-4xl font-bold text-white mb-3 ${isUrdu ? 'rtl font-urdu' : ''}`}>
                {name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold">{currentPlace.averageRating || '0'}</span>
                  <span>({currentPlace.totalReviews || 0} reviews)</span>
                </div>
                {currentPlace.altitudeMeters && (
                  <div className="flex items-center gap-1.5">
                    <Mountain size={14} className="text-blue-400" />
                    <span>{currentPlace.altitudeMeters}m altitude</span>
                  </div>
                )}
                {currentPlace.estimatedVisitTime && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-purple-400" />
                    <span>{currentPlace.estimatedVisitTime}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Eye size={14} />
                  <span>{currentPlace.viewCount || 0} views</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleStartJourney}
                  className="btn-primary rounded-xl px-6 py-3"
                >
                  <Navigation size={16} />
                  {t('common.startJourney')}
                </button>
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl border font-semibold text-sm transition-all ${
                    isSaved
                      ? 'bg-red-500/20 border-red-500/30 text-red-400'
                      : 'glass border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <Heart size={16} className={isSaved ? 'fill-red-400' : ''} />
                  {isSaved ? t('common.savedPlace') : t('common.savePlace')}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-3 glass rounded-xl border border-white/10 text-gray-300 hover:text-white font-semibold text-sm transition-all"
                >
                  <Share2 size={16} />
                  {t('common.share')}
                </button>
                <button
                  onClick={() => dispatch(toggleChat())}
                  className="flex items-center gap-2 px-6 py-3 glass rounded-xl border border-green-500/20 text-green-400 font-semibold text-sm hover:bg-green-500/10 transition-all"
                >
                  🤖 Ask AI About This
                </button>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6 border border-white/8"
            >
              <h2 className="text-xl font-bold text-white mb-4">About This Place</h2>
              <p className={`text-gray-300 leading-relaxed ${isUrdu ? 'rtl font-urdu text-right' : ''}`}>
                {description}
              </p>

              {currentPlace.detailedInfo?.history && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <h3 className="text-sm font-semibold text-green-400 mb-2">History</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{currentPlace.detailedInfo.history}</p>
                </div>
              )}

              {currentPlace.localTips?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <h3 className="text-sm font-semibold text-yellow-400 mb-3">💡 Local Tips</h3>
                  <ul className="space-y-2">
                    {currentPlace.localTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="text-yellow-400 mt-0.5">→</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* Activities */}
            {currentPlace.activities?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6 border border-white/8"
              >
                <h2 className="text-xl font-bold text-white mb-4">Activities</h2>
                <div className="flex flex-wrap gap-2">
                  {currentPlace.activities.map((activity, i) => (
                    <span key={i} className="px-4 py-2 glass-green rounded-xl text-green-400 text-sm font-medium border border-green-500/20 capitalize">
                      {activity}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass rounded-2xl p-6 border border-white/8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Location</h2>
                <button
                  onClick={handleStartJourney}
                  className="flex items-center gap-1.5 text-sm text-green-400 hover:text-green-300 transition-colors"
                >
                  <Navigation size={14} />
                  Get Directions
                </button>
              </div>
              <div className="h-64 rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center border border-white/5">
                <a
                  href={`https://www.google.com/maps?q=${currentPlace.coordinates.lat},${currentPlace.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 text-gray-400 hover:text-white transition-colors p-8 text-center"
                >
                  <MapPin size={48} className="text-green-500" />
                  <div>
                    <p className="font-semibold text-white">{currentPlace.nameEn}</p>
                    <p className="text-sm text-gray-500">
                      {currentPlace.coordinates.lat.toFixed(4)}, {currentPlace.coordinates.lng.toFixed(4)}
                    </p>
                    <p className="text-xs text-green-400 mt-2">Click to open in Google Maps →</p>
                  </div>
                </a>
              </div>
            </motion.div>

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-white mb-6">{t('reviews.title')}</h2>

              {/* Review Form */}
              <ReviewForm
                placeId={currentPlace._id}
                onSuccess={() => loadReviews()}
              />

              {/* Reviews List */}
              <div className="space-y-4 mt-6">
                {reviewsLoading ? (
                  <Loader text="Loading reviews..." />
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 glass rounded-2xl">
                    <Star size={32} className="text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} onUpdate={loadReviews} />
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/8 sticky top-24"
            >
              <h3 className="text-lg font-bold text-white mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                {[
                  { icon: MapPin, label: 'Location', value: currentPlace.tehsil || currentPlace.district || 'Shangla, KPK', color: 'text-green-400' },
                  { icon: Mountain, label: 'Altitude', value: currentPlace.altitudeMeters ? `${currentPlace.altitudeMeters}m` : 'N/A', color: 'text-blue-400' },
                  { icon: Clock, label: 'Visit Duration', value: currentPlace.estimatedVisitTime || 'Flexible', color: 'text-purple-400' },
                  { icon: Shield, label: 'Entry Fee', value: currentPlace.entryFee || 'Free', color: 'text-yellow-400' },
                  { icon: Car, label: 'Parking', value: currentPlace.parkingAvailable ? 'Available' : 'Limited', color: 'text-orange-400' },
                  { icon: Wifi, label: 'Network', value: currentPlace.mobileNetwork || 'Check locally', color: 'text-pink-400' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Icon size={14} className={color} />
                      {label}
                    </div>
                    <span className="text-white font-medium text-xs text-right max-w-[140px]">{value}</span>
                  </div>
                ))}
              </div>

              {/* Best Time */}
              {currentPlace.bestTimeToVisit?.recommended && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className="text-green-400" />
                    <span className="text-sm text-gray-400">Best Time to Visit</span>
                  </div>
                  <p className="text-green-400 text-sm font-medium">{currentPlace.bestTimeToVisit.recommended}</p>
                </div>
              )}

              {/* Suitable For */}
              {currentPlace.suitableFor?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={14} className="text-purple-400" />
                    <span className="text-sm text-gray-400">Suitable For</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {currentPlace.suitableFor.map((s, i) => (
                      <span key={i} className="text-xs px-2 py-1 glass rounded-lg text-gray-300 capitalize">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Nearby Facilities */}
            {currentPlace.nearbyFacilities?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6 border border-white/8"
              >
                <h3 className="text-lg font-bold text-white mb-4">Nearby Facilities</h3>
                <div className="space-y-3">
                  {currentPlace.nearbyFacilities.slice(0, 5).map((facility, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-white font-medium">{facility.name}</p>
                        <p className="text-gray-500 text-xs capitalize">{facility.type}</p>
                      </div>
                      {facility.priceRange && (
                        <span className="text-green-400 text-xs">{facility.priceRange}</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Routes */}
            {currentPlace.routesFromCities?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="glass rounded-2xl p-6 border border-white/8"
              >
                <h3 className="text-lg font-bold text-white mb-4">Routes</h3>
                <div className="space-y-3">
                  {currentPlace.routesFromCities.map((route, i) => (
                    <div key={i} className="p-3 glass-green rounded-xl border border-green-500/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-green-400 font-semibold text-sm">From {route.city}</span>
                        <span className="text-gray-400 text-xs">{route.distanceKm}km</span>
                      </div>
                      <p className="text-gray-400 text-xs">{route.timeHours}h drive</p>
                      {route.route && (
                        <p className="text-gray-500 text-xs mt-1 leading-relaxed">{route.route}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailPage;