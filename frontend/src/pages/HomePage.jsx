import WeatherWidget from '@/components/home/WeatherWidget';
import AlertBanner from '@/components/home/AlertBanner';
import StatsSection from '@/components/home/StatsSection';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  MapPin, Brain, Mic, ArrowDown, Star, Mountain,
  Compass, Camera, Wind, Thermometer, Eye, TrendingUp
} from 'lucide-react';
import { fetchFeaturedPlaces } from '@/store/slices/placesSlice';
import { fetchAlerts } from '@/store/slices/alertsSlice';
import { toggleChat } from '@/store/slices/chatSlice';
import PlaceCard from '@/components/places/PlaceCard';
import Loader from '@/components/common/Loader';

const HomePage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { featuredPlaces, isLoading } = useSelector((state) => state.places);
  const { alerts } = useSelector((state) => state.alerts);

  useEffect(() => {
    dispatch(fetchFeaturedPlaces());
    dispatch(fetchAlerts());
  }, [dispatch]);

  const activeAlerts = alerts.filter((a) => a.isActive);

  const stats = [
    { icon: MapPin, label: 'Tourist Places', value: '25+', color: 'text-green-400' },
    { icon: Mountain, label: 'Mountain Peaks', value: '10+', color: 'text-blue-400' },
    { icon: Star, label: 'Avg Rating', value: '4.8', color: 'text-yellow-400' },
    { icon: TrendingUp, label: 'Happy Visitors', value: '5K+', color: 'text-purple-400' },
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Guide',
      description: 'Chat with our AI that knows everything about Shangla — places, routes, weather, and local tips.',
      color: 'from-green-500/20 to-green-600/10',
      border: 'border-green-500/20',
      iconColor: 'text-green-400',
    },
    {
      icon: Camera,
      title: 'Image Recognition',
      description: 'Upload a photo and our AI identifies the exact location in Shangla with full details.',
      color: 'from-blue-500/20 to-blue-600/10',
      border: 'border-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: Compass,
      title: 'Smart Trip Planner',
      description: 'Tell us your budget and interests — AI creates a perfect personalized Shangla itinerary.',
      color: 'from-purple-500/20 to-purple-600/10',
      border: 'border-purple-500/20',
      iconColor: 'text-purple-400',
    },
    {
      icon: Wind,
      title: 'Live Weather & Alerts',
      description: 'Real-time weather for each location and road alerts to keep your journey safe.',
      color: 'from-orange-500/20 to-orange-600/10',
      border: 'border-orange-500/20',
      iconColor: 'text-orange-400',
    },
  ];

  return (
    <div className="min-h-screen">

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 gradient-hero" />

        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-600/8 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Alert Banner */}
        {activeAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-20 left-0 right-0 z-10"
          >
            <div className="container-custom">
              <Link to="/alerts" className="flex items-center gap-3 px-4 py-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-300 text-sm hover:bg-yellow-500/30 transition-all">
                <span className="animate-pulse">⚠️</span>
                <span className="font-medium">{activeAlerts.length} active road alert{activeAlerts.length > 1 ? 's' : ''} — Click to view details</span>
                <span className="ml-auto text-yellow-400">→</span>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Hero Content */}
        <div className="relative z-10 container-custom text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 glass-green rounded-full text-green-400 text-sm font-medium mb-8 border border-green-500/20"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              AI-Powered Tourism Platform
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-none tracking-tight"
            >
              <span className="text-white">{t('hero.title')} </span>
              <span className="gradient-text">{t('hero.titleHighlight')}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-forest-300 font-light mb-4"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              {t('hero.description')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link to="/places" className="btn-primary text-base px-8 py-4 rounded-2xl shadow-glow">
                <MapPin size={18} />
                {t('hero.explorePlaces')}
              </Link>
              <button
                onClick={() => dispatch(toggleChat())}
                className="btn-secondary text-base px-8 py-4 rounded-2xl"
              >
                <Brain size={18} />
                {t('hero.chatWithAI')}
              </button>
              <button
                onClick={() => dispatch(toggleChat())}
                className="flex items-center gap-2 px-6 py-4 text-gray-400 hover:text-white transition-colors text-base"
              >
                <Mic size={18} />
                {t('hero.voiceSearch')}
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              {stats.map(({ icon: Icon, label, value, color }, i) => (
                <div key={i} className="glass rounded-2xl p-4 text-center">
                  <Icon size={20} className={`${color} mx-auto mb-2`} />
                  <div className={`text-2xl font-black ${color}`}>{value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs">{t('hero.scrollDown')}</span>
          <ArrowDown size={16} className="scroll-indicator" />
        </div>
      </section>

      {/* ===== FEATURED PLACES ===== */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 glass-green rounded-full text-green-400 text-xs font-medium mb-3">
                <Star size={12} />
                {t('places.featured')}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Top Places in Shangla
              </h2>
            </div>
            <Link to="/places" className="hidden sm:flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-colors">
              {t('common.seeAll')} →
            </Link>
          </motion.div>

          {isLoading ? (
            <Loader text="Loading places..." />
          ) : featuredPlaces.length === 0 ? (
            <div className="text-center py-16 glass rounded-2xl">
              <Mountain size={48} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No featured places yet. Add places from admin panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPlaces.slice(0, 6).map((place, index) => (
                <PlaceCard key={place._id} place={place} index={index} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link to="/places" className="btn-ghost">
              {t('common.seeAll')} →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 glass-green rounded-full text-green-400 text-xs font-medium mb-3">
              <Brain size={12} />
              AI-Powered Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              The most advanced AI-powered tourism platform ever built for a Pakistani district
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, description, color, border, iconColor }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl bg-gradient-to-br ${color} border ${border} card-hover`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} border ${border} flex items-center justify-center mb-4`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== IMAGE RECOGNITION CTA ===== */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(27,67,50,0.8), rgba(45,106,79,0.6))',
              border: '1px solid rgba(34,197,94,0.2)',
            }}
          >
            <div className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, #22c55e 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
              }}
            />
            <div className="relative z-10">
              <div className="text-5xl mb-4">📸</div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Identify Any Place in Shangla
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                Upload a photo and our AI instantly identifies the location,
                shows you the route, and provides complete information.
              </p>
              <Link to="/image-search" className="btn-primary text-base px-8 py-4 rounded-2xl">
                <Camera size={18} />
                Try Image Recognition
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== TRIP PLANNER CTA ===== */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-8 md:p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(88,28,135,0.4), rgba(124,58,237,0.2))',
              border: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="text-4xl mb-3">🧭</div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Let AI Plan Your Perfect Trip
                </h2>
                <p className="text-gray-300 max-w-lg">
                  Tell us your budget, duration, and interests.
                  Our AI creates a complete day-by-day itinerary with real local prices.
                </p>
              </div>
              <Link
                to="/trip-planner"
                className="flex-shrink-0 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
              >
                Plan My Trip →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      {/* ===== STATS SECTION ===== */}
      <StatsSection />

      {/* ===== WEATHER SECTION ===== */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 glass-green rounded-full text-green-400 text-xs font-medium mb-3">
              <Thermometer size={12} />
              Live Weather
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Current Conditions
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              Real-time weather updates for all major locations in Shangla
            </p>
          </motion.div>
          <div className="max-w-md mx-auto">
            <WeatherWidget />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;