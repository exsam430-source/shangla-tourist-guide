import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Camera, ArrowRight, Zap } from 'lucide-react';

const ImageRecognitionSection = () => {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-green rounded-3xl p-10 md:p-16 text-center border border-green-500/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(34,197,94,0.8), transparent 70%)`
            }}
          />
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-glow">
              <Camera size={36} className="text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-green-400 text-sm font-medium mb-6">
              <Zap size={14} /> AI Image Recognition
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Upload a Photo,<br />
              <span className="gradient-text">We'll Find the Place!</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              Take a photo anywhere in Shangla and our AI will instantly identify the location and show you all information about it
            </p>
            <Link to="/image-search">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-lg px-10 py-4"
              >
                <Camera size={22} />
                Try Image Recognition
                <ArrowRight size={18} />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ImageRecognitionSection;