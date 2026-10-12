const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('./errorMiddleware');
const { errorResponse } = require('../utils/apiResponse');

// Protect routes - require authentication
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return errorResponse(res, 401, 'User not found. Token invalid.');
    }

    if (!req.user.isActive) {
      return errorResponse(res, 401, 'Your account has been deactivated.');
    }

    next();
  } catch (error) {
    return errorResponse(res, 401, 'Invalid token. Access denied.');
  }
});

// Admin only access
const adminOnly = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Access denied. Admin privileges required.');
  }
  next();
});

// Optional authentication (doesn't fail if no token)
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      req.user = null;
    }
  }

  next();
});

module.exports = { protect, adminOnly, optionalAuth };