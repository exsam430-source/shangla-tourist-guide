const crypto = require('crypto');

// Generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Format currency (PKR)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ur-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Generate random token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Paginate query
const paginate = (query, page = 1, limit = 10) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return {
    skip,
    limit: parseInt(limit),
    page: parseInt(page),
  };
};

// Sanitize user input
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

module.exports = {
  generateSlug,
  calculateDistance,
  formatCurrency,
  generateToken,
  paginate,
  sanitizeInput,
};