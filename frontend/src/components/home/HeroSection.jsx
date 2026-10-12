import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { MapPin, Brain, Mic, ChevronDown, Star, Users, Camera } from 'lucide-react';
import { openChat } from '@/store/slices/chatSlice';

const HeroSection = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: 'radial-gradient(circle, rgba(34,197,94,0.6), transparent)',
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5 + i * 1.5,
              repeat: Infinity,
              delay: i * 0.7,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 container-custom text-center py-32">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 glass-green rounded-full text-green-400 text-sm font-medium mb-8 border border-green-500/20"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          🏔️ AI-Powered Shangla Tourism Guide — Pakistan's First
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-none tracking-tight"
        >
          {t('hero.title')}{' '}
          <span className="gradient-text block sm:inline">
            {t('hero.titleHighlight')}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-green-400/80 font-light mb-4"
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          {t('hero.description')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link to="/places">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(34,197,94,0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl text-lg shadow-glow"
            >
              <MapPin size={22} />
              {t('hero.explorePlaces')}
            </motion.button>
          </Link>

          <motion.button
            onClick={() => dispatch(openChat())}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-8 py-4 glass text-white font-bold rounded-2xl text-lg border border-white/10 hover:bg-white/10 transition-all"
          >
            <Brain size={22} className="text-green-400" />
            {t('hero.chatWithAI')}
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16"
        >
          {[
            { icon: MapPin, value: '25+', label: 'Tourist Places', color: 'text-green-400' },
            { icon: Star, value: '4.8', label: 'Average Rating', color: 'text-yellow-400' },
            { icon: Users, value: '1000+', label: 'Happy Travelers', color: 'text-blue-400' },
            { icon: Camera, value: '500+', label: 'Photos', color: 'text-purple-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-5 border border-white/5 text-center"
            >
              <stat.icon size={22} className={`${stat.color} mx-auto mb-2`} />
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.button
          onClick={scrollDown}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-2 text-gray-500 hover:text-green-400 transition-colors mx-auto"
        >
          <span className="text-xs font-medium">{t('hero.scrollDown')}</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
};

export default HeroSection;