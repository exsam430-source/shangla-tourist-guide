import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mountain, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        <div className="text-8xl mb-6">🏔️</div>
        <h1 className="text-6xl font-black gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">Lost in the Mountains?</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist.
          Don't worry — even the best explorers get lost sometimes.
          Let us guide you back to safety.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary px-8 py-3 rounded-xl">
            <Home size={18} />
            Back to Home
          </Link>
          <Link to="/places" className="btn-secondary px-8 py-3 rounded-xl">
            <Mountain size={18} />
            Explore Places
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;