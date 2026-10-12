import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Plus, X, Image as ImageIcon, MapPin, Upload } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Loader from '@/components/common/Loader';

const CATEGORIES = [
  'viewpoint', 'mountain', 'valley', 'waterfall', 'lake', 'historical',
  'religious', 'forest', 'village', 'scenic', 'adventure', 'camping',
  'photography', 'trekking', 'cultural',
];

const DIFFICULTIES = ['easy', 'moderate', 'hard', 'expert'];

const AdminPlaceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [form, setForm] = useState({
    nameEn: '',
    nameUr: '',
    descriptionEn: '',
    descriptionUr: '',
    category: [],
    coordinates: { lat: '', lng: '' },
    altitudeMeters: '',
    tehsil: '',
    difficultyLevel: 'easy',
    estimatedVisitTime: '',
    entryFee: 'Free',
    parkingAvailable: true,
    mobileNetwork: '',
    isFeatured: false,
    activities: '',
    suitableFor: '',
    localTips: '',
    detailedInfo: {
      history: '',
      geography: '',
      accessibilityNotes: '',
      safetyNotes: '',
      photographyTips: '',
    },
    bestTimeToVisit: {
      peakSeason: '',
      recommended: '',
      avoid: '',
    },
    weatherProfile: {
      summerTemp: '',
      winterTemp: '',
      rainfall: '',
      snowfall: '',
    },
  });

  // Fetch existing place data for edit mode
  useEffect(() => {
    if (!isEdit) return;
    const fetchPlace = async () => {
      try {
        const { data } = await api.get(`/places/${id}`);
        const place = data.data;
        setForm({
          nameEn: place.nameEn || '',
          nameUr: place.nameUr || '',
          descriptionEn: place.descriptionEn || '',
          descriptionUr: place.descriptionUr || '',
          category: place.category || [],
          coordinates: place.coordinates || { lat: '', lng: '' },
          altitudeMeters: place.altitudeMeters || '',
          tehsil: place.tehsil || '',
          difficultyLevel: place.difficultyLevel || 'easy',
          estimatedVisitTime: place.estimatedVisitTime || '',
          entryFee: place.entryFee || 'Free',
          parkingAvailable: place.parkingAvailable ?? true,
          mobileNetwork: place.mobileNetwork || '',
          isFeatured: place.isFeatured || false,
          activities: place.activities?.join(', ') || '',
          suitableFor: place.suitableFor?.join(', ') || '',
          localTips: place.localTips?.join('\n') || '',
          detailedInfo: {
            history: place.detailedInfo?.history || '',
            geography: place.detailedInfo?.geography || '',
            accessibilityNotes: place.detailedInfo?.accessibilityNotes || '',
            safetyNotes: place.detailedInfo?.safetyNotes || '',
            photographyTips: place.detailedInfo?.photographyTips || '',
          },
          bestTimeToVisit: {
            peakSeason: place.bestTimeToVisit?.peakSeason || '',
            recommended: place.bestTimeToVisit?.recommended || '',
            avoid: place.bestTimeToVisit?.avoid || '',
          },
          weatherProfile: {
            summerTemp: place.weatherProfile?.summerTemp || '',
            winterTemp: place.weatherProfile?.winterTemp || '',
            rainfall: place.weatherProfile?.rainfall || '',
            snowfall: place.weatherProfile?.snowfall || '',
          },
        });
        setExistingImages(place.images || []);
      } catch (err) {
        toast.error('Failed to load place data');
        navigate('/admin/places');
      } finally {
        setIsFetching(false);
      }
    };
    fetchPlace();
  }, [id, isEdit, navigate]);

  // Handle new image file selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate each file
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    setImageFiles((prev) => [...prev, ...validFiles]);
    const previews = validFiles.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  // Remove a new (not yet uploaded) image
  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove an existing (already uploaded) image
  const removeExistingImage = async (index) => {
    if (!confirm('Remove this image?')) return;
    if (isEdit) {
      try {
        await api.delete(`/admin/places/${id}/images/${index}`);
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
        toast.success('Image removed');
      } catch {
        toast.error('Failed to remove image');
      }
    } else {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Set an existing image as main
  const setMainImage = async (index) => {
    if (isEdit) {
      try {
        await api.put(`/admin/places/${id}/images/${index}/main`);
        setExistingImages((prev) =>
          prev.map((img, i) => ({ ...img, isMain: i === index }))
        );
        toast.success('Main image updated');
      } catch {
        toast.error('Failed to update main image');
      }
    } else {
      setExistingImages((prev) =>
        prev.map((img, i) => ({ ...img, isMain: i === index }))
      );
    }
  };

  // Toggle category selection
  const toggleCategory = (cat) => {
    setForm((prev) => ({
      ...prev,
      category: prev.category.includes(cat)
        ? prev.category.filter((c) => c !== cat)
        : [...prev.category, cat],
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.nameEn.trim()) {
      toast.error('Place name (English) is required');
      return;
    }
    if (!form.descriptionEn.trim()) {
      toast.error('Description (English) is required');
      return;
    }
    if (form.category.length === 0) {
      toast.error('Select at least one category');
      return;
    }
    if (!form.coordinates.lat || !form.coordinates.lng) {
      toast.error('Latitude and Longitude are required');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      // Basic text fields
      formData.append('nameEn', form.nameEn.trim());
      formData.append('nameUr', form.nameUr.trim());
      formData.append('descriptionEn', form.descriptionEn.trim());
      formData.append('descriptionUr', form.descriptionUr.trim());
      formData.append('tehsil', form.tehsil.trim());
      formData.append('difficultyLevel', form.difficultyLevel);
      formData.append('estimatedVisitTime', form.estimatedVisitTime.trim());
      formData.append('entryFee', form.entryFee.trim());
      formData.append('mobileNetwork', form.mobileNetwork.trim());

      // Numbers
      if (form.altitudeMeters) {
        formData.append('altitudeMeters', parseInt(form.altitudeMeters) || 0);
      }

      // Booleans
      formData.append('parkingAvailable', form.parkingAvailable);
      formData.append('isFeatured', form.isFeatured);

      // JSON fields
      formData.append('category', JSON.stringify(form.category));
      formData.append('coordinates', JSON.stringify({
        lat: parseFloat(form.coordinates.lat),
        lng: parseFloat(form.coordinates.lng),
      }));

      // Arrays from comma-separated strings
      if (form.activities.trim()) {
        formData.append('activities', JSON.stringify(
          form.activities.split(',').map((a) => a.trim()).filter(Boolean)
        ));
      }
      if (form.suitableFor.trim()) {
        formData.append('suitableFor', JSON.stringify(
          form.suitableFor.split(',').map((s) => s.trim()).filter(Boolean)
        ));
      }
      if (form.localTips.trim()) {
        formData.append('localTips', JSON.stringify(
          form.localTips.split('\n').map((t) => t.trim()).filter(Boolean)
        ));
      }

      // Nested objects
      formData.append('detailedInfo', JSON.stringify(form.detailedInfo));
      formData.append('bestTimeToVisit', JSON.stringify(form.bestTimeToVisit));
      formData.append('weatherProfile', JSON.stringify(form.weatherProfile));

      // Image files
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      if (isEdit) {
        await api.put(`/places/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Place updated successfully! 🏔️');
      } else {
        await api.post('/places', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Place created successfully! 🏔️');
      }

      navigate('/admin/places');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(
        err.response?.data?.message ||
        `Failed to ${isEdit ? 'update' : 'create'} place. Check all required fields.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <Loader text="Loading place data..." />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/places')}
          className="p-2.5 glass rounded-xl text-gray-400 hover:text-white transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Place' : 'Add New Place'}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEdit
              ? `Editing: ${form.nameEn || 'Loading...'}`
              : 'Add a new tourist place to Shangla'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">

        {/* ===== SECTION 1: Basic Info ===== */}
        <div className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <MapPin size={18} className="text-green-400" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Place Name (English) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                placeholder="e.g. Shangla Top"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Place Name (Urdu)
              </label>
              <input
                type="text"
                value={form.nameUr}
                onChange={(e) => setForm({ ...form, nameUr: e.target.value })}
                placeholder="e.g. شانگلہ ٹاپ"
                className="input-field rtl"
                dir="rtl"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1.5">
                Description (English) <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={5}
                required
                value={form.descriptionEn}
                onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                placeholder="Write a detailed description about this place. Include what makes it special, what visitors can expect, notable features, etc."
                className="input-field resize-none"
              />
              <p className="text-gray-600 text-xs mt-1">
                {form.descriptionEn.length}/5000 characters
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1.5">
                Description (Urdu)
              </label>
              <textarea
                rows={4}
                value={form.descriptionUr}
                onChange={(e) => setForm({ ...form, descriptionUr: e.target.value })}
                placeholder="اس مقام کے بارے میں اردو میں تفصیل لکھیں..."
                className="input-field resize-none rtl"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* ===== SECTION 2: Categories ===== */}
        <div className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="text-lg font-bold text-white mb-2">
            Categories <span className="text-red-400">*</span>
          </h2>
          <p className="text-gray-500 text-xs mb-4">
            Select all categories that apply to this place
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium capitalize border transition-all ${
                  form.category.includes(cat)
                    ? 'bg-green-500/20 border-green-500/40 text-green-400'
                    : 'border-white/10 text-gray-500 hover:text-white hover:border-white/20 glass'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {form.category.length > 0 && (
            <p className="text-green-400 text-xs mt-3">
              Selected: {form.category.join(', ')}
            </p>
          )}
        </div>

        {/* ===== SECTION 3: Location & Details ===== */}
        <div className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="text-lg font-bold text-white mb-5">Location & Details</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Latitude <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                value={form.coordinates.lat}
                onChange={(e) => setForm({ ...form, coordinates: { ...form.coordinates, lat: e.target.value } })}
                placeholder="34.87"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Longitude <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                value={form.coordinates.lng}
                onChange={(e) => setForm({ ...form, coordinates: { ...form.coordinates, lng: e.target.value } })}
                placeholder="72.60"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Altitude (meters)</label>
              <input
                type="number"
                value={form.altitudeMeters}
                onChange={(e) => setForm({ ...form, altitudeMeters: e.target.value })}
                placeholder="2800"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Tehsil</label>
              <input
                type="text"
                value={form.tehsil}
                onChange={(e) => setForm({ ...form, tehsil: e.target.value })}
                placeholder="Alpuri"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Difficulty Level</label>
              <select
                value={form.difficultyLevel}
                onChange={(e) => setForm({ ...form, difficultyLevel: e.target.value })}
                className="input-field"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d} className="bg-gray-900 capitalize">{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Visit Duration</label>
              <input
                type="text"
                value={form.estimatedVisitTime}
                onChange={(e) => setForm({ ...form, estimatedVisitTime: e.target.value })}
                placeholder="2-3 hours"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Entry Fee</label>
              <input
                type="text"
                value={form.entryFee}
                onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
                placeholder="Free"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Mobile Network</label>
              <input
                type="text"
                value={form.mobileNetwork}
                onChange={(e) => setForm({ ...form, mobileNetwork: e.target.value })}
                placeholder="Jazz, Telenor (good)"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Activities <span className="text-gray-600">(comma separated)</span>
              </label>
              <input
                type="text"
                value={form.activities}
                onChange={(e) => setForm({ ...form, activities: e.target.value })}
                placeholder="hiking, photography, camping, sightseeing"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Suitable For <span className="text-gray-600">(comma separated)</span>
              </label>
              <input
                type="text"
                value={form.suitableFor}
                onChange={(e) => setForm({ ...form, suitableFor: e.target.value })}
                placeholder="families, solo, couples, groups"
                className="input-field"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-400 mb-1.5">
              Local Tips <span className="text-gray-600">(one tip per line)</span>
            </label>
            <textarea
              rows={4}
              value={form.localTips}
              onChange={(e) => setForm({ ...form, localTips: e.target.value })}
              placeholder={"Carry warm clothes even in summer\nStart early morning for best views\nLocal guides available at check post\n4x4 vehicle recommended in winter"}
              className="input-field resize-none"
            />
          </div>

          <div className="flex items-center gap-6 mt-5">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.parkingAvailable}
                onChange={(e) => setForm({ ...form, parkingAvailable: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-0 bg-transparent"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                🅿️ Parking Available
              </span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-0 bg-transparent"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                ⭐ Featured Place (shown on homepage)
              </span>
            </label>
          </div>
        </div>

        {/* ===== SECTION 4: Weather & Best Time ===== */}
        <div className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="text-lg font-bold text-white mb-5">Weather & Best Time to Visit</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Summer Temp</label>
              <input
                type="text"
                value={form.weatherProfile.summerTemp}
                onChange={(e) => setForm({ ...form, weatherProfile: { ...form.weatherProfile, summerTemp: e.target.value } })}
                placeholder="15-25°C"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Winter Temp</label>
              <input
                type="text"
                value={form.weatherProfile.winterTemp}
                onChange={(e) => setForm({ ...form, weatherProfile: { ...form.weatherProfile, winterTemp: e.target.value } })}
                placeholder="-5 to 5°C"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Recommended Season</label>
              <input
                type="text"
                value={form.bestTimeToVisit.recommended}
                onChange={(e) => setForm({ ...form, bestTimeToVisit: { ...form.bestTimeToVisit, recommended: e.target.value } })}
                placeholder="May to September"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Avoid</label>
              <input
                type="text"
                value={form.bestTimeToVisit.avoid}
                onChange={(e) => setForm({ ...form, bestTimeToVisit: { ...form.bestTimeToVisit, avoid: e.target.value } })}
                placeholder="Late monsoon July-Aug"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Peak Season</label>
              <input
                type="text"
                value={form.bestTimeToVisit.peakSeason}
                onChange={(e) => setForm({ ...form, bestTimeToVisit: { ...form.bestTimeToVisit, peakSeason: e.target.value } })}
                placeholder="June to August"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Rainfall</label>
              <input
                type="text"
                value={form.weatherProfile.rainfall}
                onChange={(e) => setForm({ ...form, weatherProfile: { ...form.weatherProfile, rainfall: e.target.value } })}
                placeholder="Moderate in monsoon"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Snowfall</label>
              <input
                type="text"
                value={form.weatherProfile.snowfall}
                onChange={(e) => setForm({ ...form, weatherProfile: { ...form.weatherProfile, snowfall: e.target.value } })}
                placeholder="Dec-Feb at high altitude"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* ===== SECTION 5: Detailed Info ===== */}
        <div className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="text-lg font-bold text-white mb-5">Detailed Information</h2>
          <div className="space-y-4">
            {[
              { key: 'history', label: '📜 History', placeholder: 'Historical background and significance of this place...' },
              { key: 'geography', label: '🌍 Geography', placeholder: 'Geographic features, terrain, surroundings...' },
              { key: 'accessibilityNotes', label: '🚗 Accessibility', placeholder: 'How to access this place, road conditions, vehicle requirements...' },
              { key: 'safetyNotes', label: '🛡️ Safety Notes', placeholder: 'Safety tips, hazards to be aware of, emergency info...' },
              { key: 'photographyTips', label: '📸 Photography Tips', placeholder: 'Best angles, time of day for photos, recommended gear...' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
                <textarea
                  rows={3}
                  value={form.detailedInfo[key] || ''}
                  onChange={(e) => setForm({
                    ...form,
                    detailedInfo: { ...form.detailedInfo, [key]: e.target.value },
                  })}
                  placeholder={placeholder}
                  className="input-field resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ===== SECTION 6: Images ===== */}
        <div className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <ImageIcon size={18} className="text-green-400" />
            Place Images
          </h2>
          <p className="text-gray-500 text-xs mb-4">
            Upload high-quality images. First image becomes the main/cover image. Recommended: 1200x800px minimum.
          </p>

          {/* Existing Images (Edit mode) */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-gray-400 mb-3 font-medium">
                Current Images ({existingImages.length}) — Hover to manage
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {existingImages.map((img, i) => (
                  <div
                    key={i}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 group cursor-pointer transition-all duration-200 ${
                      img.isMain
                        ? 'border-green-500 shadow-glow-sm'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Image ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Main badge */}
                    {img.isMain && (
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-green-500 rounded-md text-[9px] text-white font-bold uppercase tracking-wider">
                        Main
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      {!img.isMain && (
                        <button
                          type="button"
                          onClick={() => setMainImage(i)}
                          className="px-2 py-1 bg-green-500/90 hover:bg-green-500 rounded-lg text-[10px] text-white font-bold transition-all"
                        >
                          Set Main
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="w-7 h-7 bg-red-500/90 hover:bg-red-500 rounded-full flex items-center justify-center transition-all"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-white/10 hover:border-green-500/40 rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer relative group">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="pointer-events-none">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-green-500/20 transition-all">
                <Upload size={24} className="text-green-400" />
              </div>
              <p className="text-white font-medium text-sm mb-1">
                Click to upload or drag images here
              </p>
              <p className="text-gray-500 text-xs">
                JPG, PNG, WebP • Max 10MB each • Multiple files allowed
              </p>
            </div>
          </div>

          {/* New Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-3 font-medium">
                New Images to Upload ({imagePreviews.length})
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {imagePreviews.map((preview, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden border-2 border-green-500/30 group"
                  >
                    <img
                      src={preview}
                      alt={`New ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-blue-500 rounded text-[9px] text-white font-bold">
                      NEW
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <X size={10} className="text-white" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-white text-[9px] truncate">
                        {imageFiles[i]?.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total images info */}
          <p className="text-gray-600 text-xs mt-3">
            Total images: {existingImages.length + imagePreviews.length}
            {existingImages.length + imagePreviews.length === 0 && (
              <span className="text-yellow-400 ml-2">
                ⚠️ Add at least one image for better visibility
              </span>
            )}
          </p>
        </div>

        {/* ===== SUBMIT BUTTONS ===== */}
        <div className="flex gap-4 pb-8">
          <button
            type="button"
            onClick={() => navigate('/admin/places')}
            className="flex-1 py-4 glass rounded-xl text-gray-400 hover:text-white transition-all font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-[2] py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 shadow-glow text-sm"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEdit ? 'Updating Place...' : 'Creating Place...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save size={16} />
                {isEdit ? 'Update Place' : 'Create Place'}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPlaceForm;