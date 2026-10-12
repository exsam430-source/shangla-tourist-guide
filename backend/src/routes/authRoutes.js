const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, toggleSavePlace, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { uploadProfileImage } = require('../config/cloudinary');

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, uploadProfileImage.single('profileImage'), updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/save-place/:placeId', protect, toggleSavePlace);

module.exports = router;