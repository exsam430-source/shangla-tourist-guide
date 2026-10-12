import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Upload, Camera, X, MapPin, Navigation, Brain } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

const ImageRecognitionPage = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      const { data } = await api.post(
        `${import.meta.env.VITE_AI_SERVER_URL || 'http://localhost:8000'}/ai/recognize-place`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setResult(data);
      toast.success('Place identified! 🎉');
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.response?.status === undefined) {
        toast.error('AI server is offline. Please start the Python AI server.');
        setResult({
          place_name: 'AI Server Offline',
          confidence: 0,
          message: 'The AI image recognition server is not running. Please start the Python FastAPI server on port 8000.',
          place_id: null,
        });
      } else {
        toast.error(err.response?.data?.message || 'Could not identify the place');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-green rounded-full text-green-400 text-sm font-medium mb-4">
            <Brain size={14} />
            AI Image Recognition
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Identify Any Place
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Upload a photo taken in Shangla and our AI will identify the exact location,
            show the route, and provide complete information.
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          {!preview ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-white/20 hover:border-green-500/50 hover:bg-green-500/5 glass'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {isDragActive ? 'Drop your image here!' : 'Upload a Shangla Photo'}
              </h3>
              <p className="text-gray-400 mb-6">
                Drag & drop or click to select • JPG, PNG, WebP • Max 10MB
              </p>
              <div className="flex items-center justify-center gap-3">
                <button className="btn-primary rounded-xl px-6 py-3">
                  <Upload size={16} />
                  Choose Image
                </button>
                <span className="text-gray-500 text-sm">or</span>
                <button className="btn-secondary rounded-xl px-6 py-3">
                  <Camera size={16} />
                  Use Camera
                </button>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden glass border border-white/10">
              <img
                src={preview}
                alt="Selected"
                className="w-full h-80 object-cover"
              />
              <button
                onClick={handleClear}
                className="absolute top-4 right-4 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-sm font-medium">{selectedImage?.name}</p>
                <p className="text-gray-400 text-xs">
                  {selectedImage ? (selectedImage.size / 1024 / 1024).toFixed(2) + ' MB' : ''}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Analyze Button */}
        {preview && !result && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-5 btn-primary rounded-2xl text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing with AI...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Brain size={20} />
                Identify This Place
              </span>
            )}
          </motion.button>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass rounded-2xl p-6 border border-white/10"
            >
              {result.place_id ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <span className="text-2xl">🏔️</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{result.place_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
                            style={{ width: `${(result.confidence || 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-green-400 text-sm font-bold">
                          {Math.round((result.confidence || 0) * 100)}% match
                        </span>
                      </div>
                    </div>
                  </div>

                  {result.details && (
                    <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                      {result.details.descriptionEn}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <Link
                      to={`/places/${result.details?.slug || result.place_id}`}
                      className="flex-1 btn-primary rounded-xl py-3 text-center text-sm"
                    >
                      <MapPin size={15} />
                      View Details
                    </Link>
                    <a
                      href={result.details?.coordinates
                        ? `https://www.google.com/maps/dir/?api=1&destination=${result.details.coordinates.lat},${result.details.coordinates.lng}`
                        : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-secondary rounded-xl py-3 text-center text-sm flex items-center justify-center gap-2"
                    >
                      <Navigation size={15} />
                      Get Directions
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">🤔</div>
                  <h3 className="text-lg font-bold text-white mb-2">{result.place_name || 'Place Not Identified'}</h3>
                  <p className="text-gray-400 text-sm">{result.message || 'Could not identify this location. Try a clearer photo of a Shangla landmark.'}</p>
                  <button onClick={handleClear} className="mt-4 btn-ghost text-sm">
                    Try Another Image
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it works */}
        {!preview && !result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-10 glass rounded-2xl p-6 border border-white/8"
          >
            <h3 className="text-lg font-bold text-white mb-4 text-center">How It Works</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { step: '1', icon: '📸', title: 'Upload Photo', desc: 'Any Shangla location photo' },
                { step: '2', icon: '🤖', title: 'AI Analyzes', desc: 'Deep learning identifies place' },
                { step: '3', icon: '🗺️', title: 'Get Info', desc: 'Full details, route & more' },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="p-4">
                  <div className="text-3xl mb-2">{icon}</div>
                  <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ImageRecognitionPage;