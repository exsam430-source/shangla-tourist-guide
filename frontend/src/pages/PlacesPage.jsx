import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Grid, List, Map, SlidersHorizontal } from 'lucide-react';
import { fetchPlaces, setFilters } from '@/store/slices/placesSlice';
import PlaceCard from '@/components/places/PlaceCard';
import Loader from '@/components/common/Loader';

const CATEGORIES = [
  'All', 'viewpoint', 'mountain', 'valley', 'waterfall',
  'lake', 'historical', 'forest', 'village', 'adventure', 'camping',
];

const DIFFICULTY_OPTIONS = ['All', 'easy', 'moderate', 'hard'];

const PlacesPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { places, isLoading, pagination, filters } = useSelector((state) => state.places);
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 12,
      sort: filters.sort,
    };
    if (filters.category && filters.category !== 'All') params.category = filters.category;
    if (filters.difficulty && filters.difficulty !== 'All') params.difficulty = filters.difficulty;
    if (filters.search) params.search = filters.search;
    dispatch(fetchPlaces(params));
  }, [dispatch, filters, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchInput }));
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat) => {
    dispatch(setFilters({ category: cat === 'All' ? '' : cat }));
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    dispatch(setFilters({ sort }));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass-green rounded-full text-green-400 text-xs font-medium mb-4">
            <Map size={12} />
            Shangla District, KPK
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('places.title')}
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            {t('places.subtitle')}
          </p>
        </motion.div>

        {/* Search & Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 mb-6 border border-white/8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('places.searchPlaceholder')}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-all"
              />
            </form>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:border-green-500/50 transition-all min-w-[160px]"
            >
              <option value="-averageRating" className="bg-gray-900">Top Rated</option>
              <option value="-viewCount" className="bg-gray-900">Most Visited</option>
              <option value="-createdAt" className="bg-gray-900">Newest</option>
              <option value="nameEn" className="bg-gray-900">A-Z</option>
            </select>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl border transition-all ${viewMode === 'grid' ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'border-white/10 text-gray-500 hover:text-white'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl border transition-all ${viewMode === 'list' ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'border-white/10 text-gray-500 hover:text-white'}`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-xl border transition-all ${showFilters ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'border-white/10 text-gray-500 hover:text-white'}`}
              >
                <SlidersHorizontal size={18} />
              </button>
            </div>
          </div>

          {/* Extra Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/5"
            >
              <div>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Difficulty</p>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTY_OPTIONS.map((diff) => (
                    <button
                      key={diff}
                      onClick={() => { dispatch(setFilters({ difficulty: diff === 'All' ? '' : diff })); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                        (filters.difficulty || 'All') === diff || (diff === 'All' && !filters.difficulty)
                          ? 'bg-green-500/20 border-green-500/30 text-green-400'
                          : 'border-white/10 text-gray-500 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                (filters.category || 'All') === cat || (cat === 'All' && !filters.category)
                  ? 'bg-green-500/20 border-green-500/30 text-green-400'
                  : 'border-white/10 text-gray-500 hover:text-white hover:border-white/20 glass'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Results count */}
        {pagination && (
          <p className="text-gray-500 text-sm mb-6">
            Showing {places.length} of {pagination.totalItems} places
          </p>
        )}

        {/* Places Grid/List */}
        {isLoading ? (
          <Loader text="Loading places..." />
        ) : places.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl">
            <p className="text-gray-400 text-lg">{t('places.noPlaces')}</p>
            <button
              onClick={() => { dispatch(setFilters({ category: '', difficulty: '', search: '' })); setSearchInput(''); }}
              className="mt-4 btn-ghost text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
            }>
              {places.map((place, index) => (
                <PlaceCard
                  key={place._id}
                  place={place}
                  index={index}
                  listView={viewMode === 'list'}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 glass rounded-xl text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        currentPage === page
                          ? 'bg-green-600 text-white'
                          : 'glass text-gray-400 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 glass rounded-xl text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlacesPage;