const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, languagePreference } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return errorResponse(res, 400, 'Email already registered. Please login.');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    languagePreference: languagePreference || 'en',
  });

  const token = user.generateToken();

  return successResponse(res, 201, 'Account created successfully! Welcome to Shangla Tourist 🏔️', {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      languagePreference: user.languagePreference,
      profileImage: user.profileImage,
    },
    token,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 400, 'Please provide email and password');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    return errorResponse(res, 401, 'Invalid credentials');
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return errorResponse(res, 401, 'Invalid credentials');
  }

  if (!user.isActive) {
    return errorResponse(res, 401, 'Your account has been deactivated.');
  }

  await user.updateLastLogin();
  const token = user.generateToken();

  return successResponse(res, 200, 'Login successful! Welcome back 🏔️', {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      languagePreference: user.languagePreference,
      profileImage: user.profileImage,
    },
    token,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('savedPlaces', 'nameEn nameUr slug images averageRating');

  return successResponse(res, 200, 'User profile fetched', user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, languagePreference } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (languagePreference) updateData.languagePreference = languagePreference;

  if (req.file) {
    updateData.profileImage = req.file.path;
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );

  return successResponse(res, 200, 'Profile updated successfully', user);
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return errorResponse(res, 400, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  return successResponse(res, 200, 'Password changed successfully');
});

const toggleSavePlace = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const placeId = req.params.placeId;

  const isSaved = user.savedPlaces.some((id) => id.toString() === placeId);

  if (isSaved) {
    user.savedPlaces = user.savedPlaces.filter((id) => id.toString() !== placeId);
    await user.save();
    return successResponse(res, 200, 'Place removed from wishlist', { isSaved: false });
  } else {
    user.savedPlaces.push(placeId);
    await user.save();
    return successResponse(res, 200, 'Place saved to wishlist ❤️', { isSaved: true });
  }
});

const logout = asyncHandler(async (req, res) => {
  return successResponse(res, 200, 'Logged out successfully');
});

module.exports = { register, login, getMe, updateProfile, changePassword, toggleSavePlace, logout };