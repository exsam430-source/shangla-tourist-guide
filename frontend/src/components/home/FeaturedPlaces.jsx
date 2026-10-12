import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles } from 'lucide-react';
import PlaceCard from '@/components/places/PlaceCard';
import Loader from '@/components/common/Loader';

const FeaturedPlaces = () => {
  const { featuredPlaces, isLoading } = useSelector((state) => state.places);
  const { t } = useTranslation();

  return (
    <section className="section-padding bg-gradient-to-b from-[#0a0a0a] to-[#0d1a0f]/50">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-green rounded-full text-green-400 text-sm font-medium mb-4">
              <Sparkles size={14} />
              {t('places.featured')}
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white">
              Must-Visit{' '}
              <span className="gradient-text">Shangla</span>
            </h2>
            <p className="text-gray-400 mt-2 text-lg">
              Handpicked top destinations for an unforgettable experience
            </p>
          </div>
          <Link
            to="/places"
            className="flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold transition-colors group shrink-0"
          >
            {t('common.seeAll')}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Places Grid */}
        {isLoading ? (
          <Loader text="Loading featured places..." />
        ) : featuredPlaces.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏔️</div>
            <p className="text-gray-400">
              No featured places yet. Add places from the admin dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredPlaces.map((place, index) => (
              <PlaceCard key={place._id} place={place} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedPlaces;