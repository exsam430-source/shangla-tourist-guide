import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { registerUser, clearError } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    languagePreference: 'en',
  });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
    return () => dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const { confirmPassword, ...userData } = form;
    dispatch(registerUser(userData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mx-auto mb-4 shadow-glow">
              <span className="text-3xl">🏔️</span>
            </div>
            <h1 className="text-3xl font-black text-white">{t('auth.registerTitle')}</h1>
            <p className="text-gray-400 mt-2">{t('auth.registerSubtitle')}</p>
          </div>

          {/* Form */}
          <div className="glass rounded-2xl p-8 border border-white/8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t('auth.name')}</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className="input-field pl-11"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t('auth.email')}</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="input-field pl-11"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t('auth.phone')} <span className="text-gray-600">(optional)</span></label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="03XX-XXXXXXX"
                    className="input-field pl-11"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t('auth.password')}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    className="input-field pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t('auth.confirmPassword')}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    className="input-field pl-11"
                  />
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Preferred Language</label>
                <div className="grid grid-cols-2 gap-3">
                  {['en', 'ur'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setForm({ ...form, languagePreference: lang })}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                        form.languagePreference === lang
                          ? 'border-green-500/50 bg-green-500/10 text-green-400'
                          : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {lang === 'en' ? '🇬🇧 English' : '🇵🇰 اردو'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 shadow-glow mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : t('auth.registerBtn')}
              </button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-6">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
                {t('auth.signIn')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;