import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const PlaceGallery = ({ images = [], placeName = '' }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const prev = () => setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape') setLightboxOpen(false);
  };

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-3 gap-2">
        {images.slice(0, 6).map((img, index) => (
          <div
            key={index}
            className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group"
            onClick={() => openLightbox(index)}
          >
            <img
              src={img.url}
              alt={img.caption || `${placeName} ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {index === 5 && images.length > 6 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-xl font-bold">+{images.length - 6}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 z-10 w-10 h-10 glass rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
              onClick={() => setLightboxOpen(false)}
            >
              <X size={20} />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 glass px-4 py-1.5 rounded-full text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Prev */}
            <button
              className="absolute left-4 z-10 w-10 h-10 glass rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
              onClick={(e) => { e.stopPropagation(); prev(); }}
            >
              <ChevronLeft size={20} />
            </button>

            {/* Image */}
            <motion.img
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              src={images[currentIndex]?.url}
              alt={images[currentIndex]?.caption || placeName}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next */}
            <button
              className="absolute right-4 z-10 w-10 h-10 glass rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
              onClick={(e) => { e.stopPropagation(); next(); }}
            >
              <ChevronRight size={20} />
            </button>

            {/* Caption */}
            {images[currentIndex]?.caption && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full text-white text-sm">
                {images[currentIndex].caption}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PlaceGallery;