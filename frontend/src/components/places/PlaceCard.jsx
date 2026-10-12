import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Star, MapPin, Clock, Mountain, ArrowRight } from 'lucide-react';
import { getDifficultyColor, getCategoryIcon, truncateText } from '@/utils/helpers';

const PlaceCard = ({ place, index = 0, listView = false }) => {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  const name = isUrdu && place.nameUr ? place.nameUr : place.nameEn;
  const description = isUrdu && place.descriptionUr ? place.descriptionUr : place.descriptionEn;
  const mainImage = place.images?.find((img) => img.isMain)?.url || place.images?.[0]?.url;

  if (listView) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Link
          to={`/places/${place.slug}`}
          className="flex gap-4 glass rounded-2xl p-4 border border-white/8 hover:border-green-500/20 transition-all duration-300 group card-hover"
        >
          {mainImage && (
            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
              <img src={mainImage} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-white font-bold group-hover:text-green-400 transition-colors truncate">{name}</h3>
              <ArrowRight size={16} className="text-gray-600 group-hover:text-green-400 transition-colors flex-shrink-0 mt-1" />
            </div>
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{truncateText(description, 100)}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              {place.averageRating > 0 && (
                <span className="flex items-center gap-1">
                  <Star size={10} className="text-yellow-400 fill-yellow-400" />
                  {place.averageRating}
                </span>
              )}
              {place.estimatedVisitTime && (
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {place.estimatedVisitTime}
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Link
        to={`/places/${place.slug}`}
        className="block glass rounded-2xl overflow-hidden border border-white/8 hover:border-green-500/20 transition-all duration-300 group shadow-card hover:shadow-card-hover"
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gray-900">
          {mainImage ? (
            <img
              src={mainImage}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-forest-800 to-forest-900">
              <span className="text-5xl">🏔️</span>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {place.category?.slice(0, 2).map((cat) => (
              <span key={cat} className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-xs text-white border border-white/10 capitalize">
                {getCategoryIcon(cat)} {cat}
              </span>
            ))}
          </div>

          {/* Featured badge */}
          {place.isFeatured && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-green-500/80 backdrop-blur-sm rounded-lg text-xs text-white font-medium">
                ⭐ Featured
              </span>
            </div>
          )}

          {/* Rating on image */}
          {place.averageRating > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
              <Star size={11} className="text-yellow-400 fill-yellow-400" />
              <span className="text-white text-xs font-bold">{place.averageRating}</span>
              <span className="text-gray-400 text-xs">({place.totalReviews})</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={`text-white font-bold text-lg leading-tight group-hover:text-green-400 transition-colors ${isUrdu ? 'font-urdu rtl' : ''}`}>
              {name}
            </h3>
            <ArrowRight size={18} className="text-gray-600 group-hover:text-green-400 transition-all group-hover:translate-x-1 flex-shrink-0 mt-0.5" />
          </div>

          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
            {truncateText(description, 100)}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              {place.altitudeMeters && (
                <span className="flex items-center gap-1">
                  <Mountain size={11} className="text-blue-400" />
                  {place.altitudeMeters}m
                </span>
              )}
              {place.estimatedVisitTime && (
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {place.estimatedVisitTime}
                </span>
              )}
            </div>
            {place.difficultyLevel && (
              <span className={`px-2 py-0.5 rounded-lg text-xs capitalize ${getDifficultyColor(place.difficultyLevel)}`}>
                {place.difficultyLevel}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PlaceCard;